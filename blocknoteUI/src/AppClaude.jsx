import React, { useState, useRef, useEffect, useMemo } from 'react'
import '@blocknote/core/style.css'
import { BlockNoteEditor } from '@blocknote/core'
import { BlockNoteView } from '@blocknote/react'
import { ClaudeProxy } from './services/ClaudeProxy'
import { Cloud, Sun, Zap, Send, Bot, User, FileText, Brain } from 'lucide-react'

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
  const messagesEndRef = useRef(null)
  const claudeProxy = new ClaudeProxy()

  // Initialize BlockNote editor properly
  const editor = useMemo(() => 
    BlockNoteEditor.create({
      initialContent: [
        {
          type: 'heading',
          props: { level: 1 },
          content: '🌤️ Weather AI Assistant'
        },
        {
          type: 'paragraph',
          content: 'Welcome! I\'m your intelligent weather assistant powered by Claude AI. Ask me anything about the weather and I\'ll provide detailed, formatted reports right here.'
        },
        {
          type: 'heading',
          props: { level: 2 },
          content: '💡 What you can ask:'
        },
        {
          type: 'bulletListItem',
          content: 'Current weather: "What\'s the weather in New York?"'
        },
        {
          type: 'bulletListItem',
          content: 'Forecasts: "Give me a 5-day forecast for London"'
        },
        {
          type: 'bulletListItem',
          content: 'Comparisons: "Compare weather in Miami vs Seattle"'
        },
        {
          type: 'bulletListItem',
          content: 'Specific locations: "How\'s the weather in 10001?"'
        },
        {
          type: 'paragraph',
          content: 'Start by typing your weather question in the chat on the left, and I\'ll create a beautiful, detailed weather report here!'
        }
      ]
    }), 
  [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Format response for BlockNote editor
  const formatResponseForEditor = (response) => {
    // Split response into lines and create blocks
    const lines = response.split('\n').filter(line => line.trim())
    const blocks = lines.map(line => {
      const trimmed = line.trim()
      // Check if it's a heading (starts with # or is all caps)
      if (trimmed.startsWith('#') || (trimmed.length > 0 && trimmed === trimmed.toUpperCase() && trimmed.length < 50)) {
        return {
          type: 'heading',
          props: { level: trimmed.startsWith('##') ? 2 : 1 },
          content: trimmed.replace(/^#+\s*/, '')
        }
      }
      // Check if it's a bullet point
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return {
          type: 'bulletListItem',
          content: trimmed.replace(/^[•\-*]\s*/, '')
        }
      }
      // Regular paragraph
      return {
        type: 'paragraph',
        content: trimmed
      }
    })
    
    // Update BlockNote editor if available
    if (editor) {
      try {
        editor.replaceBlocks(editor.document, blocks)
      } catch (error) {
        console.log('BlockNote editor not ready yet:', error)
      }
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
      formatResponseForEditor(response)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Cloud className="h-10 w-10 text-blue-400" />
                <Sun className="h-8 w-8 text-yellow-400" />
                <Zap className="h-8 w-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Weather AI</h1>
                <p className="text-blue-200">Ask me anything about the weather</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-blue-200">
              <Brain className="h-4 w-4" />
              <span>Powered by Claude AI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Chat Interface */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Chat with Claude</h2>
                  <p className="text-blue-200 text-sm">Ask me about weather anywhere</p>
                </div>
              </div>
              
              {/* Messages */}
              <div className="h-96 overflow-y-auto space-y-4 mb-6 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          : 'bg-white/20 text-white backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm break-words">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 text-white px-4 py-3 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="animate-pulse text-sm">Claude is thinking...</div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="What's the weather like in New York?"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-blue-200 text-center">
                  Try: "Compare weather in Miami vs Seattle" or "5-day forecast for London"
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Weather Report */}
          <div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Weather Report</h2>
                  <p className="text-green-200 text-sm">Detailed weather analysis and insights</p>
                </div>
              </div>
              
              <div className="h-[600px] border border-white/20 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                {editor ? (
                  <BlockNoteView
                    editor={editor}
                    className="h-full"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                      <p className="text-blue-200">Loading weather editor...</p>
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
