import React, { useState } from 'react';

function Login({ onLogin }) {
  const [serverIP, setServerIP] = useState('10.31.17.1');
  const [tcpPort, setTcpPort] = useState('18515');
  const [ibPort, setIbPort] = useState('1');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(serverIP, tcpPort, ibPort);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        padding: "40px",
        margin: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: "translateY(0)",
        ':hover': {
          transform: "translateY(-5px)",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)",
        }
      }}>
        <h2 style={{
          color: "#1a365d",
          marginBottom: "32px",
          fontSize: "32px",
          textAlign: "center",
          fontWeight: "600",
          letterSpacing: "-0.5px",
        }}>RDMA KV Store</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#2d3748",
              fontSize: "16px",
              fontWeight: "500",
            }}>
              Server Address
            </label>
            <input
              type="text"
              value={serverIP}
              onChange={(e) => setServerIP(e.target.value)}
              placeholder="Enter server IP"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.2s ease",
                backgroundColor: "#f8fafc",
                ':focus': {
                  borderColor: "#4299e1",
                  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.15)",
                }
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#2d3748",
              fontSize: "16px",
              fontWeight: "500",
            }}>
              TCP Port
            </label>
            <input
              type="text"
              value={tcpPort}
              onChange={(e) => setTcpPort(e.target.value)}
              placeholder="Enter TCP port"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.2s ease",
                backgroundColor: "#f8fafc",
                ':focus': {
                  borderColor: "#4299e1",
                  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.15)",
                }
              }}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#2d3748",
              fontSize: "16px",
              fontWeight: "500",
            }}>
              IB Port
            </label>
            <input
              type="text"
              value={ibPort}
              onChange={(e) => setIbPort(e.target.value)}
              placeholder="Enter IB port"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.2s ease",
                backgroundColor: "#f8fafc",
                ':focus': {
                  borderColor: "#4299e1",
                  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.15)",
                }
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
              color: "white",
              padding: "14px 24px",
              borderRadius: "12px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 6px rgba(66, 153, 225, 0.2)",
              ':hover': {
                transform: "translateY(-1px)",
                boxShadow: "0 6px 8px rgba(66, 153, 225, 0.3)",
              },
              ':active': {
                transform: "translateY(0)",
                boxShadow: "0 2px 4px rgba(66, 153, 225, 0.2)",
              }
            }}
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 