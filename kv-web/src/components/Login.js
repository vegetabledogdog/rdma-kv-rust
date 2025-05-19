import React, { useState } from 'react';

function Login({ onLogin }) {
  const [serverIP, setServerIP] = useState('10.31.17.1');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(serverIP);
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: "100px auto",
      padding: "32px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }}>
      <h2 style={{
        color: "#2d3748",
        marginBottom: "24px",
        fontSize: "28px",
        textAlign: "center",
      }}>RDMA KV Store</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            color: "#4a5568",
            fontSize: "16px",
          }}>
            Server Address
          </label>
          <input
            type="text"
            value={serverIP}
            onChange={(e) => setServerIP(e.target.value)}
            placeholder="Enter server IP:port"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "#4299e1",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          Connect
        </button>
      </form>
    </div>
  );
}

export default Login; 