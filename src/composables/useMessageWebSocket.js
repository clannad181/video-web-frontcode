import { ref, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'

let ws = null
let reconnectTimer = null
let heartbeatTimer = null
const isConnected = ref(false)
const lastMessage = ref(null)
const messageCallbacks = []

export function useMessageWebSocket() {
  const authStore = useAuthStore()

  const getWsUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const token = authStore.token
    console.log('[WebSocket] 使用的 token:', token)
    return `${protocol}//localhost:8899/api/ws/message?token=${token}`
  }

  const connect = () => {
    if (!authStore.isLoggedIn) return
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      const url = getWsUrl()
      ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('[WebSocket] 连接成功')
        isConnected.value = true
        startHeartbeat()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('[WebSocket] 收到消息:', data)
          lastMessage.value = data
          messageCallbacks.forEach(cb => cb(data))
        } catch (e) {
          console.error('[WebSocket] 消息解析失败:', e)
        }
      }

      ws.onclose = (event) => {
        console.log('[WebSocket] 连接关闭:', event.code, event.reason)
        isConnected.value = false
        stopHeartbeat()
        
        if (authStore.isLoggedIn && event.code !== 1000) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error)
        isConnected.value = false
      }
    } catch (e) {
      console.error('[WebSocket] 创建连接失败:', e)
      scheduleReconnect()
    }
  }

  const disconnect = () => {
    stopHeartbeat()
    clearTimeout(reconnectTimer)
    reconnectTimer = null
    
    if (ws) {
      ws.onclose = null
      ws.close(1000, '用户主动断开')
      ws = null
    }
    isConnected.value = false
  }

  const scheduleReconnect = () => {
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      if (authStore.isLoggedIn) {
        console.log('[WebSocket] 尝试重连...')
        connect()
      }
    }, 3000)
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('ping')
      }
    }, 30000)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  const onMessage = (callback) => {
    messageCallbacks.push(callback)
    return () => {
      const index = messageCallbacks.indexOf(callback)
      if (index > -1) {
        messageCallbacks.splice(index, 1)
      }
    }
  }

  const sendMessage = (data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    onMessage,
    sendMessage
  }
}
