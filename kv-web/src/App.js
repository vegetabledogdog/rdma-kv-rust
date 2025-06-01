import React, { useState, useEffect, useCallback } from "react";
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
  const getStorageKey = useCallback(() => `kv_store_${serverIP}`, [serverIP]);

  // 从 localStorage 加载数据
  const loadFromStorage = useCallback(() => {
    const storedData = window.localStorage.getItem(getStorageKey());
    if (storedData) {
      setLocalStorage(JSON.parse(storedData));
    }
  }, [getStorageKey]);

  // 保存数据到 localStorage
  const saveToStorage = useCallback((data) => {
    window.localStorage.setItem(getStorageKey(), JSON.stringify(data));
  }, [getStorageKey]);

  // 添加操作历史
  const addToHistory = useCallback((operation, key, value, result) => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory(prev => [{
      timestamp,
      operation,
      key,
      value,
      result
    }, ...prev].slice(0, 10)); // 只保留最近10条记录
  }, []);

  // 监听其他标签页的存储变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === getStorageKey()) {
        const newData = JSON.parse(e.newValue || '{}');
        setLocalStorage(newData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // 初始加载数据
    loadFromStorage();
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getStorageKey, loadFromStorage]);

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
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 600,
        width: '100%',
        margin: "20px",
        padding: "40px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}>
          <h2 style={{
            color: "#1a365d",
            fontSize: "32px",
            margin: 0,
            fontWeight: "600",
            letterSpacing: "-0.5px",
          }}>KV Store Web</h2>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}>
            <div style={{
              color: "#2d3748",
              fontSize: "14px",
              fontWeight: "500",
            }}>
              Connected to: {serverIP}
            </div>
            <button
              onClick={handleDisconnect}
              style={{
                background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "12px",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 6px rgba(229, 62, 62, 0.2)",
                ':hover': {
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 8px rgba(229, 62, 62, 0.3)",
                },
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
          <input
            placeholder="Value (for set operation)"
            value={value}
            onChange={e => setValue(e.target.value)}
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

        <div style={{ 
          display: "flex",
          gap: "12px",
          justifyContent: "center",
        }}>
          <button
            onClick={handleSet}
            style={{
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
              flex: 1,
              ':hover': {
                transform: "translateY(-1px)",
                boxShadow: "0 6px 8px rgba(66, 153, 225, 0.3)",
              },
            }}
          >
            Set Value
          </button>
          <button
            onClick={handleGet}
            style={{
              background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              color: "white",
              padding: "14px 24px",
              borderRadius: "12px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 6px rgba(72, 187, 120, 0.2)",
              flex: 1,
              ':hover': {
                transform: "translateY(-1px)",
                boxShadow: "0 6px 8px rgba(72, 187, 120, 0.3)",
              },
            }}
          >
            Get Value
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
              color: "white",
              padding: "14px 24px",
              borderRadius: "12px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 6px rgba(237, 137, 54, 0.2)",
              flex: 1,
              ':hover': {
                transform: "translateY(-1px)",
                boxShadow: "0 6px 8px rgba(237, 137, 54, 0.3)",
              },
            }}
          >
            Delete Value
          </button>
        </div>

        <div style={{
          marginTop: "32px",
          padding: "20px",
          backgroundColor: "rgba(247, 250, 252, 0.8)",
          borderRadius: "12px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          backdropFilter: "blur(8px)",
        }}>
          <b style={{ color: "#1a365d", fontSize: "16px" }}>Result:</b>
          <pre style={{
            marginTop: "12px",
            padding: "14px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            overflow: "auto",
            fontSize: "14px",
            color: "#2d3748"
          }}>{result}</pre>
        </div>

        <div style={{
          marginTop: "32px",
          padding: "20px",
          backgroundColor: "rgba(247, 250, 252, 0.8)",
          borderRadius: "12px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          backdropFilter: "blur(8px)",
        }}>
          <b style={{ color: "#1a365d", fontSize: "16px" }}>Operation History:</b>
          <div style={{
            marginTop: "12px",
            maxHeight: "300px",
            overflowY: "auto",
          }}>
            {history.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "8px",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                <div style={{ color: "#2d3748", marginBottom: "4px" }}>
                  <span style={{ color: "#1a365d", fontWeight: "600" }}>{item.timestamp}</span>
                  {" - "}
                  <span style={{
                    color: item.operation === "SET" ? "#3182ce" :
                           item.operation === "GET" ? "#38a169" : "#dd6b20",
                    fontWeight: "600"
                  }}>
                    {item.operation}
                  </span>
                </div>
                <div style={{ color: "#2d3748" }}>
                  Key: {item.key}
                  {item.value !== null && `, Value: ${item.value}`}
                </div>
                <div style={{
                  color: item.result.startsWith("Error") ? "#e53e3e" : "#1a365d",
                  marginTop: "4px",
                  fontSize: "13px",
                }}>
                  {item.result}
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div style={{
                padding: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                color: "#718096",
                textAlign: "center",
              }}>
                No operations yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
