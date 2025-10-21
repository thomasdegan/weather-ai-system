export class ClaudeProxy {
  constructor() {
    this.proxyUrl = import.meta.env.VITE_CLAUDE_PROXY_URL || 'http://localhost:3003'
  }

  async processWeatherRequest(userMessage) {
    try {
      const response = await fetch(`${this.proxyUrl}/api/claude/weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage
        })
      })

      if (!response.ok) {
        throw new Error(`Proxy server error: ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Claude proxy error:', error)
      throw new Error(`Claude proxy error: ${error.message}`)
    }
  }
}
