import React, { useState, useRef, useEffect } from 'react'
import { BlockNoteView } from '@blocknote/react'
import { ClaudeProxy } from './services/ClaudeProxy'
import { Cloud, Sun, Zap, Send, Bot, User, FileText, Brain } from 'lucide-react'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('BlockNote Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col bg-gray-50 border border-gray-200 rounded">
          <div className="p-3 bg-yellow-50 border-b border-yellow-200">
            <div className="text-yellow-700 text-sm font-medium">📝 Text Editor (BlockNote Fallback)</div>
            <p className="text-xs text-yellow-600 mt-1">
              Using simple text editor due to BlockNote compatibility issues
            </p>
          </div>
          <textarea
            className="flex-1 p-4 border-0 resize-none focus:outline-none bg-white"
            placeholder="Weather reports and notes will appear here..."
            style={{ minHeight: '400px' }}
            value={this.props.content || ''}
            onChange={(e) => this.props.onChange?.(e.target.value)}
          />
        </div>
      )
    }

    return this.props.children
  }
}

function AppClaude() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m Claude, your AI weather assistant. I can help you get current weather conditions and forecasts for any location. Ask me things like:\n\n• "What\'s the weather in New York?"\n• "Give me a 5-day forecast for London"\n• "How\'s the weather in 10001?"\n• "Current conditions in Paris, France"',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [formattedReport, setFormattedReport] = useState('Welcome to Claude Weather Assistant! 🤖🌤️\n\nI\'m powered by Claude AI and can help you with:\n• Current weather conditions\n• Multi-day forecasts\n• Weather analysis and insights\n• Natural language weather queries\n\nJust ask me about weather in any location!')
  const [blockNoteEditor, setBlockNoteEditor] = useState(null)
  const [showBlockNote, setShowBlockNote] = useState(false)
  const [fallbackContent, setFallbackContent] = useState('Welcome to Claude Weather Assistant! 🤖🌤️\n\nI\'m powered by Claude AI and can help you with:\n• Current weather conditions\n• Multi-day forecasts\n• Weather analysis and insights\n• Natural language weather queries\n\nJust ask me about weather in any location!')
  const messagesEndRef = useRef(null)
  const claudeProxy = new ClaudeProxy()

  // Delay BlockNote rendering to avoid initialization issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBlockNote(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Format response for BlockNote editor
  const formatResponseForEditor = (response) => {
    // Split response into lines and create blocks
    const lines = response.split('\n').filter(line => line.trim())
    const blocks = lines.map(line => ({
      type: 'paragraph',
      content: line.trim()
    }))
    
    // Update BlockNote editor if available
    if (blockNoteEditor) {
      blockNoteEditor.replaceBlocks(blockNoteEditor.document, blocks)
    } else {
      // Fallback to text editor
      setFallbackContent(response)
    }
    
    return blocks
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Use Claude AI to process the request
      const response = await claudeProxy.processWeatherRequest(inputValue)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Update the formatted report
      setFormattedReport(response)
      
      // Update the BlockNote editor with formatted response
      if (blockNoteEditor) {
        const formattedContent = formatResponseForEditor(response)
        blockNoteEditor.replaceBlocks(blockNoteEditor.document, formattedContent)
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I'm sorry, I encountered an error: ${error.message}. Please make sure your weather API server is running and try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-weather-blue via-weather-sky to-weather-ocean">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-white" />
              <Sun className="h-6 w-6 text-yellow-300" />
              <Zap className="h-6 w-6 text-yellow-400" />
              <Brain className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Claude Weather Assistant</h1>
              <p className="text-white/80">Powered by Claude AI with weather MCP integration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Chat Interface */}
          <div className="space-y-6">
            <div className="weather-card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Bot className="h-6 w-6 text-weather-blue mr-2" />
                Chat with Claude AI
              </h2>
              
              {/* Messages */}
              <div className="h-96 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-weather-blue text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="animate-pulse">Claude is thinking...</div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Claude about weather... (e.g., 'What's the weather in Washington, DC?')"
                  className="flex-1 weather-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="weather-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - BlockNote Editor */}
          <div className="space-y-6">
            <div className="weather-card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-weather-blue mr-2" />
                Weather Report Editor
              </h2>
              <div className="min-h-[500px] max-h-[600px] border rounded-lg overflow-hidden">
                {showBlockNote ? (
                  <div className="h-full">
                    <ErrorBoundary 
                      content={fallbackContent}
                      onChange={setFallbackContent}
                    >
                      <BlockNoteView
                        onChange={(editor) => setBlockNoteEditor(editor)}
                        className="h-full"
                      />
                    </ErrorBoundary>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weather-blue mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading BlockNote Editor...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppClaude
