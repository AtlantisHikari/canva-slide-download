'use client'

export default function DebugPage() {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)', 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: 'white', 
        fontSize: '2rem',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        marginBottom: '2rem'
      }}>
        🔍 瀏覽器診斷頁面
      </h1>
      
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        padding: '2rem',
        borderRadius: '10px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>請回答以下問題：</h2>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '5px' }}>
          <strong>1. 您能看到這個頁面的紅綠藍漸層背景嗎？</strong>
          <br />
          <span style={{ color: '#666' }}>如果看到的是白底，表示瀏覽器強制覆蓋了樣式</span>
        </div>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e0e0ff', borderRadius: '5px' }}>
          <strong>2. 這個藍色背景區塊正常顯示嗎？</strong>
          <br />
          <span style={{ color: '#333' }}>如果顯示為白色，可能是系統高對比模式</span>
        </div>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#ffe0e0', borderRadius: '5px' }}>
          <strong>3. 這個粉紅色背景區塊呢？</strong>
          <br />
          <span style={{ color: '#333' }}>如果都顯示白色，可能是瀏覽器安全設定</span>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#333' }}>瀏覽器資訊：</h3>
          <div style={{ fontFamily: 'monospace', background: '#f8f8f8', padding: '1rem', borderRadius: '5px' }}>
            <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : '載入中...'}</div>
            <div>螢幕解析度: {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '載入中...'}</div>
            <div>瀏覽器視窗: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '載入中...'}</div>
          </div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
          padding: '2rem',
          borderRadius: '10px',
          textAlign: 'center',
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}>
          如果您能看到這個彩色區塊，
          <br />
          表示彩色功能正常，主頁面問題可以修復！
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a 
            href="/"
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              display: 'inline-block',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            返回主頁面
          </a>
        </div>
      </div>
    </div>
  )
}