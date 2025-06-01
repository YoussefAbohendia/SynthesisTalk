import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Upload,
  FileText,
  Search,
  Brain,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Loader,
  User,
  Bot,
  Plus,
  Menu,
  Settings,
  History,
  BookOpen,
  Globe,
  Clock,
  Paperclip,
  Mic,
  Star,
  Zap,
} from 'lucide-react';

const quickActions = [
  { icon: Search, text: "Research Topic", color: "bg-blue-500", desc: "Deep dive analysis" },
  { icon: FileText, text: "Analyze Document", color: "bg-emerald-500", desc: "Document insights" },
  { icon: BarChart3, text: "Generate Report", color: "bg-purple-500", desc: "Data visualization" },
  { icon: Lightbulb, text: "Get Insights", color: "bg-yellow-500", desc: "AI recommendations" },
  { icon: BookOpen, text: "Literature Review", color: "bg-indigo-500", desc: "Academic research" },
  { icon: Globe, text: "Market Analysis", color: "bg-pink-500", desc: "Trend analysis" }
];

const recentChats = [
  { title: "AI Ethics Research", time: "2 hours ago", preview: "Exploring ethical frameworks..." },
  { title: "Climate Data Analysis", time: "Yesterday", preview: "Statistical modeling of climate..." },
  { title: "Market Trends Report", time: "3 days ago", preview: "Q4 market performance..." },
  { title: "Literature Review", time: "1 week ago", preview: "Academic paper synthesis..." }
];

const SynthesisTalkChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your advanced AI research assistant. I can help you analyze documents, conduct research, generate insights, and answer complex questions. What would you like to explore today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAIResponse = async (userMessage) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1200));
    const responses = [
      "Based on my analysis of current research and data patterns, I can provide you with comprehensive insights. Here are the key findings that directly address your inquiry.",
      "Excellent question! I've processed multiple sources and synthesized the information. Here's what stands out.",
      "This is a fascinating area of research! Let me break down the complex landscape for you.",
      "Great question! I've analyzed this from multiple perspectives. Here's a comprehensive overview."
    ];
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'ai',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString()
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }]);
    setInputValue('');
    setIsLoading(true);
    await simulateAIResponse(inputValue);
    setIsLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'user',
        content: `📄 Uploaded: ${file.name}`,
        timestamp: new Date().toISOString(),
        isFile: true
      }]);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'ai',
          content: `I've processed your document "${file.name}". What would you like me to analyze?`,
          timestamp: new Date().toISOString()
        }]);
      }, 1800);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static z-20 w-72 bg-white border-r border-gray-200 flex flex-col h-full transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <Brain className="w-7 h-7 text-blue-600" />
          <span className="font-bold text-lg text-gray-800">SynthesisTalk</span>
        </div>
        <button className="m-4 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded hover:opacity-90">
          <Plus className="w-5 h-5" />
          <span>Start New Research</span>
        </button>
        <div className="px-4 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Recent Conversations
        </div>
        <nav className="flex-1 px-2 overflow-y-auto space-y-2">
          {recentChats.map((chat, idx) => (
            <button key={idx} className="w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 rounded transition-colors duration-150 flex gap-2 items-start">
              <MessageSquare className="w-4 h-4 text-blue-500 mt-1" />
              <span>
                <span className="font-medium">{chat.title}</span>
                <div className="text-xs text-gray-400">{chat.time}</div>
                <div className="text-xs text-gray-400">{chat.preview}</div>
              </span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-2 text-gray-600 hover:text-blue-700 px-2 py-2 rounded hover:bg-blue-50 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings & Preferences</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(s => !s)} className="lg:hidden p-2 rounded hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-xl text-gray-800">AI Research Assistant</h1>
            <span className="flex items-center text-xs text-green-600 ml-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded">
              <History className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-2xl ${msg.type === 'user' ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.type === 'user' ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-blue-100"}`}>
                  {msg.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-600" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${msg.type === 'user' ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-white border border-gray-100"}`}>
                  <div className="text-sm whitespace-pre-line">{msg.content}</div>
                  {msg.isFile && (
                    <div className="mt-1 flex items-center text-xs gap-1">
                      <FileText className="w-4 h-4" />
                      <span>File processed</span>
                    </div>
                  )}
                  <div className={`text-xs mt-2 ${msg.type === 'user' ? "text-white/70" : "text-gray-400"}`}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                  <Loader className="animate-spin w-4 h-4" />
                  AI is typing...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-6 py-4 bg-white border-t border-gray-100">
            <div className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Quick Actions
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(action.text.toLowerCase())}
                  className={`flex items-center gap-2 px-3 py-2 ${action.color} text-white rounded-lg hover:opacity-90 transition text-sm`}
                >
                  <action.icon className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">{action.text}</div>
                    <div className="text-xs opacity-80">{action.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-100 bg-white px-6 py-4 flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask me anything about research, analysis, or document insights..."
              className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 text-gray-800"
              rows={1}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <label className="absolute right-10 top-3 cursor-pointer p-1 hover:bg-gray-100 rounded transition-colors">
              <Upload className="w-5 h-5 text-gray-500" />
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-full transition ${
              inputValue.trim() && !isLoading
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <div className="text-xs text-gray-400 py-2 text-center flex items-center justify-center gap-1">
          <Star className="w-3 h-3" />
          <span>SynthesisTalk AI - Powered by advanced language models. Always verify critical information.</span>
        </div>
      </main>
       
    </div>
  );
 

};

export default SynthesisTalkChat;
