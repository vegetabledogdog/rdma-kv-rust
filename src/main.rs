use std::{thread::sleep, time::Duration};

use clap::Parser;
mod cli;
mod context;
mod gid;
use cli::{KeyValueOpt, RdmaOpt};
use context::RdmaContext;
use rdma_sys::ibv_wr_opcode;

fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::TRACE)
        .init();
    let config = RdmaOpt::parse();
    println!("Current Config: {:?}", config);
    let mut rdma_context = RdmaContext::create(&config).unwrap();

    rdma_context.connect_qp(&config).unwrap();

    if config.server.is_some() {
        loop {
            if let Ok(kv_opt) = cli::client_opt() {
                let mut send_str = serde_json::to_vec(&kv_opt).unwrap();
                rdma_context.set_bytes_to_buf(&mut send_str);
                rdma_context
                    .post_send(ibv_wr_opcode::IBV_WR_RDMA_WRITE)
                    .unwrap();
                rdma_context.poll_completion().unwrap();

                sleep(Duration::from_secs(1));
                if let KeyValueOpt::Get { key: _ } = kv_opt {
                    rdma_context
                        .post_send(ibv_wr_opcode::IBV_WR_RDMA_READ)
                        .unwrap();
                    rdma_context.poll_completion().unwrap();
                    let value = rdma_context.read_the_buf();
                    tracing::info!("get value: {}", value);
                }
            }
        }
    } else {
        rdma_context.process_kv_opt();
    }
}
