import React from 'react';

function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '20px', fontSize: '2.5rem' }}>🏪 Store Rating App</h1>
        <p style={{ marginBottom: '30px', opacity: 0.8 }}>Frontend is working! ✅</p>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Server Status:</h3>
          <p>✅ Frontend: Running on port 5173</p>
          <p>✅ Backend: Running on port 4000</p>
        </div>
        
        <div>
          <button style={{
            background: '#00ff88',
            color: '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: '5px'
          }} onClick={() => window.location.href = '/login'}>
            Go to Login
          </button>
          
          <button style={{
            background: '#ff006e',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: '5px'
          }} onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestApp;
