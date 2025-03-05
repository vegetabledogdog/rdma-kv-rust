use clap::Parser;
use serde::{Deserialize, Serialize};
use std::io::Write;

#[derive(Parser, Debug, Default)]
pub struct RdmaOpt {
    /// Optional server host. if it is none, the pingpong binary run as server
    pub server: Option<String>,
    /// listen on/connect to port <port> (default 18515)
    #[clap(short = 'p', long, default_value_t = 18515)]
    pub tcp_port: usize,
    /// use IB device <dev> (default first device found)
    #[clap(short = 'd', long)]
    pub ib_devname: Option<String>,
    /// local port gid index
    #[clap(short = 'g', long, default_value_t = 0)]
    pub gidx: i32,
    /// use port <port> of IB device (default 1)
    #[clap(short = 'i', long, default_value_t = 1)]
    pub ib_port: u8,
}

#[derive(Debug, Parser, Serialize, Deserialize)]
pub enum KeyValueOpt {
    /// get key value
    Get { key: String },
    /// set key value
    Set { key: String, value: String },
    /// delete key value
    Delete { key: String },
}

pub fn client_opt() -> Result<KeyValueOpt, String> {
    loop {
        write!(std::io::stdout(), "$ ").map_err(|e| e.to_string())?;
        std::io::stdout().flush().map_err(|e| e.to_string())?;
        let mut buffer = String::new();
        std::io::stdin()
            .read_line(&mut buffer)
            .map_err(|e| e.to_string())?;
        let line = buffer.trim();
        if line.is_empty() {
            continue;
        }
        let line = &format!("{} {}", env!("CARGO_PKG_NAME"), line);

        let args = shlex::split(line).ok_or("error: Invalid quoting")?;
        match KeyValueOpt::try_parse_from(args.iter()).map_err(|e| e.to_string()) {
            Ok(cli) => {
                return Ok(cli);
            }
            Err(e) => println!("{}", e),
        }
    }
}
