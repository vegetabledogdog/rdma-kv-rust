import React, { useState, useEffect } from "react";
import Login from "./components/Login";

function App() {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");
  const [serverIP, setServerIP] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localStorage, setLocalStorage] = useState({});
  const [history, setHistory] = useState([]);

  // 使用 serverIP 作为存储前缀
  const getStorageKey = () => `kv_store_${serverIP}`;

  // 从 localStorage 加载数据
  const loadFromStorage = () => {
    const storedData = window.localStorage.getItem(getStorageKey());
    if (storedData) {
      setLocalStorage(JSON.parse(storedData));
    }
  };

  // 保存数据到 localStorage
  const saveToStorage = (data) => {
    window.localStorage.setItem(getStorageKey(), JSON.stringify(data));
  };

  // 添加操作历史
  const addToHistory = (operation, key, value, result) => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory(prev => [{
      timestamp,
      operation,
      key,
      value,
      result
    }, ...prev].slice(0, 10)); // 只保留最近10条记录
  };

  // 监听其他标签页的存储变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === getStorageKey()) {
        setLocalStorage(JSON.parse(e.newValue || '{}'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [serverIP]);

  const handleLogin = (ip) => {
    setServerIP(ip);
    setIsLoggedIn(true);
    loadFromStorage();
    setHistory([]); // 清空历史记录
  };

  const handleDisconnect = () => {
    setServerIP("");
    setIsLoggedIn(false);
    setKey("");
    setValue("");
    setResult("");
    setLocalStorage({});
    setHistory([]); // 清空历史记录
  };

  const handleSet = () => {
    try {
      if (!key) {
        setResult("Error: Key cannot be empty");
        return;
      }
      const newStorage = { ...localStorage, [key]: value };
      setLocalStorage(newStorage);
      saveToStorage(newStorage);
      const resultMsg = `Successfully set key "${key}" with value "${value}"`;
      setResult(resultMsg);
      addToHistory("SET", key, value, resultMsg);
    } catch (error) {
      const errorMsg = `Error: ${error.message}`;
      setResult(errorMsg);
      addToHistory("SET", key, value, errorMsg);
    }
  };

  const handleGet = () => {
    try {
      if (!key) {
        setResult("Error: Key cannot be empty");
        return;
      }
      const value = localStorage[key];
      let resultMsg;
      if (value === undefined) {
        resultMsg = `Error: Key "${key}" not found`;
      } else {
        resultMsg = `Value for key "${key}": "${value}"`;
      }
      setResult(resultMsg);
      addToHistory("GET", key, null, resultMsg);
    } catch (error) {
      const errorMsg = `Error: ${error.message}`;
      setResult(errorMsg);
      addToHistory("GET", key, null, errorMsg);
    }
  };

  const handleDelete = () => {
    try {
      if (!key) {
        setResult("Error: Key cannot be empty");
        return;
      }
      if (localStorage[key] === undefined) {
        const errorMsg = `Error: Key "${key}" not found`;
        setResult(errorMsg);
        addToHistory("DELETE", key, null, errorMsg);
        return;
      }
      const newStorage = { ...localStorage };
      delete newStorage[key];
      setLocalStorage(newStorage);
      saveToStorage(newStorage);
      const resultMsg = `Successfully deleted key "${key}"`;
      setResult(resultMsg);
      addToHistory("DELETE", key, null, resultMsg);
    } catch (error) {
      const errorMsg = `Error: ${error.message}`;
      setResult(errorMsg);
      addToHistory("DELETE", key, null, errorMsg);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{
      maxWidth: 600,
      margin: "60px auto",
      padding: "32px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}>
        <h2 style={{
          color: "#2d3748",
          fontSize: "28px",
          margin: 0,
        }}>KV Store Web</h2>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
          <div style={{
            color: "#4a5568",
            fontSize: "14px",
          }}>
            Connected to: {serverIP}
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              backgroundColor: "#e53e3e",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="Key"
          value={key}
          onChange={e => setKey(e.target.value)}
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

      <div style={{ marginBottom: "24px" }}>
        <input
          placeholder="Value (for set operation)"
          value={value}
          onChange={e => setValue(e.target.value)}
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

      <div style={{ 
        display: "flex",
        gap: "12px",
        justifyContent: "center",
      }}>
        <button
          onClick={handleSet}
          style={{
            backgroundColor: "#4299e1",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            flex: 1,
          }}
        >
          Set Value
        </button>
        <button
          onClick={handleGet}
          style={{
            backgroundColor: "#48bb78",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            flex: 1,
          }}
        >
          Get Value
        </button>
        <button
          onClick={handleDelete}
          style={{
            backgroundColor: "#ed8936",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            flex: 1,
          }}
        >
          Delete Value
        </button>
      </div>

      <div style={{
        marginTop: "32px",
        padding: "16px",
        backgroundColor: "#f7fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0"
      }}>
        <b style={{ color: "#2d3748" }}>Result:</b>
        <pre style={{
          marginTop: "8px",
          padding: "12px",
          backgroundColor: "#ffffff",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
          overflow: "auto",
          fontSize: "14px",
          color: "#4a5568"
        }}>{result}</pre>
      </div>

      <div style={{
        marginTop: "32px",
        padding: "16px",
        backgroundColor: "#f7fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0"
      }}>
        <b style={{ color: "#2d3748" }}>Operation History:</b>
        <div style={{
          marginTop: "8px",
          maxHeight: "300px",
          overflowY: "auto",
        }}>
          {history.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "12px",
                backgroundColor: "#ffffff",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              <div style={{ color: "#4a5568", marginBottom: "4px" }}>
                <span style={{ color: "#2d3748", fontWeight: "bold" }}>{item.timestamp}</span>
                {" - "}
                <span style={{
                  color: item.operation === "SET" ? "#4299e1" :
                         item.operation === "GET" ? "#48bb78" : "#ed8936",
                  fontWeight: "bold"
                }}>
                  {item.operation}
                </span>
              </div>
              <div style={{ color: "#4a5568" }}>
                Key: {item.key}
                {item.value !== null && `, Value: ${item.value}`}
              </div>
              <div style={{
                color: item.result.startsWith("Error") ? "#e53e3e" : "#2d3748",
                marginTop: "4px",
                fontSize: "13px",
              }}>
                {item.result}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div style={{
              padding: "12px",
              backgroundColor: "#ffffff",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              color: "#a0aec0",
              textAlign: "center",
            }}>
              No operations yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
