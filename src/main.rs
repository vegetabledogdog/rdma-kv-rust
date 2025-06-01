use clap::Parser;
mod cli;
mod context;
mod gid;
use axum::{extract::State, routing::post, Json, Router};
use cli::{KeyValueOpt, RdmaOpt};
use context::RdmaContext;
use rdma_sys::ibv_wr_opcode;
use std::{sync::{Arc, Mutex}, time::Instant};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::TRACE)
        .init();
    let config = RdmaOpt::parse();
    println!("Current Config: {:?}", config);
    let mut rdma_context = RdmaContext::create(&config).unwrap();

    rdma_context.connect_qp(&config).unwrap();

    if config.server.is_some() {
        // client
        loop {
            if let Ok(kv_opt) = cli::client_opt() {
                if let KeyValueOpt::Get { key: _ } = kv_opt {
                    rdma_context.post_receive(0).unwrap();
                }

                let mut send_str = serde_json::to_vec(&kv_opt).unwrap();
                rdma_context.set_bytes_to_buf(&mut send_str, 0);
                println!("time: {:?}", Instant::now());
                rdma_context
                    .post_send(ibv_wr_opcode::IBV_WR_RDMA_WRITE, 0)
                    .unwrap();
                rdma_context.poll_completion().unwrap();

                if let KeyValueOpt::Get { key: _ } = kv_opt {
                    rdma_context.poll_completion().unwrap();
                    let value = rdma_context.read_the_buf(0);
                    tracing::info!("get value: {}", value);
                }
            }
        }
    } else {
        rdma_context.process_kv_opt();
    }

    let app = Router::new()
        .route("/login", post(login))
        .route("/opt", post(kv_opt))
        .with_state(Arc::new(Mutex::new(rdma_context)));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();


}


#[derive(serde::Deserialize)]
struct LoginRequest {
    server_ip: String,
}

#[derive(serde::Serialize)]
struct LoginResponse {
    success: bool,
    message: String,
}

async fn login(
    State(rdma_context): State<Arc<Mutex<RdmaContext>>>,
    Json(payload): Json<LoginRequest>,
) -> Json<LoginResponse> {
    let mut config = RdmaOpt::default();
    config.server = Some(payload.server_ip);
    let mut ctx = rdma_context.lock().unwrap();
    match ctx.connect_qp(&config) {
        Ok(_) => Json(LoginResponse {
            success: true,
            message: "Successfully connected to RDMA server".to_string(),
        }),
        Err(e) => Json(LoginResponse {
            success: false,
            message: format!("Failed to connect: {}", e),
        }),
    }
}


#[derive(serde::Deserialize)]
struct KvOptRequest {
    operation: KeyValueOpt,
}

#[derive(serde::Serialize)]
struct KvOptResponse {
    success: bool,
    result: String,
}

async fn kv_opt(
    State(rdma_context): State<Arc<Mutex<RdmaContext>>>,
    Json(payload): Json<KvOptRequest>,
) -> Json<KvOptResponse> {

    let mut ctx = rdma_context.lock().unwrap();
    
    // 将操作序列化并发送到RDMA缓冲区
    let mut send_str = serde_json::to_vec(&payload.operation).unwrap();
    ctx.set_bytes_to_buf(&mut send_str, 0);
    
    // 发送RDMA写请求
    match ctx.post_send(ibv_wr_opcode::IBV_WR_RDMA_WRITE, 0) {
        Ok(_) => {
            // 等待完成
            match ctx.poll_completion() {
                Ok(_) => {
                    // 如果是Get操作，需要接收响应
                    if let KeyValueOpt::Get { key: _ } = payload.operation {
                        ctx.post_receive(0).unwrap();
                        ctx.poll_completion().unwrap();
                        let value = ctx.read_the_buf(0);
                        Json(KvOptResponse {
                            success: true,
                            result: value,
                        })
                    } else {
                        Json(KvOptResponse {
                            success: true,
                            result: "Operation completed successfully".to_string(),
                        })
                    }
                }
                Err(e) => Json(KvOptResponse {
                    success: false,
                    result: format!("Operation failed: {}", e),
                }),
            }
        }
        Err(e) => Json(KvOptResponse {
            success: false,
            result: format!("Failed to send operation: {}", e),
        }),
    }
}
