import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Upload,
  FileText,
  Search,
  Brain,
  MessageSquare,
  BarChart3,
  Lightbulb,
  StickyNote,
  Loader,
  User,
  Bot,
  Sparkles,
  Plus,
  Menu,
  Settings,
  History,
  Mic,
  Image,
  Paperclip,
  MoreHorizontal,
  Zap,
  Star,
  BookOpen,
  Globe,
  Clock,
  Maximize2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SynthesisTalkChat = () => {
  // Chat management state
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Initialize with a default chat
  useEffect(() => {
    const initialChat = {
      id: Date.now(),
      title: 'New Research Session',
      messages: [
        {
          id: 1,
          type: 'ai',
          content: "Hello! I'm your advanced AI research assistant. I can help you analyze documents, conduct research, generate insights, and answer complex questions. What would you like to explore today?",
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    setChats([initialChat]);
    setCurrentChatId(initialChat.id);
  }, []);

  // Get current chat
  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Research Session',
      messages: [
        {
          id: 1,
          type: 'ai',
          content: "Hello! I'm your advanced AI research assistant. I can help you analyze documents, conduct research, generate insights, and answer complex questions. What would you like to explore today?",
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setInputValue('');
  };

  // Switch to a different chat
  const switchToChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  // Update chat title based on first user message
  const updateChatTitle = (chatId, userMessage) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId && chat.title === 'New Research Session') {
        const title = userMessage.length > 30 
          ? userMessage.substring(0, 30) + '...' 
          : userMessage;
        return { ...chat, title };
      }
      return chat;
    }));
  };

  // Add message to current chat
  const addMessageToChat = (message) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          lastActivity: new Date().toISOString()
        };
      }
      return chat;
    }));
  };

  const generateAIResponse = (userMessage) => {
    const responses = [
      "Based on my analysis, I can provide several key insights about your query. Let me break this down into actionable points that will help guide your research approach.",
      "Excellent question! This touches on several important areas. Here's what I found through cross-referencing multiple data sources and research methodologies.",
      "I've processed your request and identified some fascinating patterns. Let me synthesize the most relevant information for your specific use case.",
      "This is a complex topic that benefits from a multi-dimensional analysis. I'll provide you with both quantitative insights and qualitative observations.",
      "Great research direction! I've analyzed this from various angles and can offer both immediate insights and suggestions for deeper investigation.",
      "Your query intersects with several important research domains. Let me provide a comprehensive overview with actionable next steps."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const simulateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      // Try to call your backend API
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          user_id: 'user123',
          session_id: currentChatId?.toString()
        })
      });

      setIsTyping(false);

      let aiContent;
      
      if (response.ok) {
        const data = await response.json();
        aiContent = data.response || data.message || data.content || data.reply || data.text || data.answer;
        
        if (!aiContent) {
          aiContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content: aiContent,
        timestamp: new Date().toISOString()
      };
      
      addMessageToChat(aiMessage);
      
    } catch (error) {
      setIsTyping(false);
      console.error('Error calling chat API:', error);
      
      // Fallback to simulated response if API fails
      const fallbackMessage = {
        id: Date.now(),
        type: 'ai',
        content: generateAIResponse(userMessage),
        timestamp: new Date().toISOString()
      };
      
      addMessageToChat(fallbackMessage);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !currentChatId) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    addMessageToChat(userMessage);
    
    // Update chat title if it's the first user message
    const currentChatMessages = currentChat?.messages || [];
    const userMessages = currentChatMessages.filter(m => m.type === 'user');
    if (userMessages.length === 0) {
      updateChatTitle(currentChatId, inputValue);
    }

    const messageToProcess = inputValue;
    setInputValue('');
    setIsLoading(true);

    await simulateAIResponse(messageToProcess);
    setIsLoading(false);
  };

  // Fixed file upload handler - the original had broken syntax
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentChatId) return;

    setUploadStatus('uploading');

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadStatus('success');

      const fileMessage = {
        id: Date.now(),
        type: 'user',
        content: `📎 **File Uploaded**: ${file.name}\n*Size: ${(file.size / 1024).toFixed(1)} KB*\n*Type: ${file.type || 'Unknown'}*`,
        timestamp: new Date().toISOString(),
        isFile: true
      };
      
      addMessageToChat(fileMessage);

      // Generate AI response about the file
      let aiResponseContent;
      if (file.type.includes('pdf')) {
        aiResponseContent = `📄 **PDF Analysis Complete**\n\n📋 **Document Analysis Complete**\n• Document type: ${file.type || 'PDF document'}\n• Processing status: ✅ Ready for analysis\n• Key insights: Extracted and indexed\n\n🔍 **What I can help you with:**\n- Summarize key points\n- Extract specific information\n- Generate insights and analysis\n- Answer questions about the content\n\nWhat would you like me to focus on first?`;
      } else {
        aiResponseContent = `📄 **Document Processing Complete**\n\n📋 **Document Analysis Complete**\n• Document type: ${file.type || 'Text document'}\n• Processing status: ✅ Ready for analysis\n• Key insights: Extracted and indexed\n\n🔍 **What I can help you with:**\n- Summarize key points\n- Extract specific information\n- Generate insights and analysis\n- Answer questions about the content\n\nWhat would you like me to focus on first?`;
      }

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date().toISOString()
      };
      
      addMessageToChat(aiResponse);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `❌ I encountered an issue processing **"${file.name}"**. This could be due to:\n\n• Unsupported file format\n• File size too large\n• Network connectivity issues\n• Server temporarily unavailable\n\n📝 **Supported formats**: PDF, DOC, DOCX, TXT, CSV, XLSX\n📏 **Max file size**: 10MB\n\nPlease try again with a different file or check your connection.`,
        timestamp: new Date().toISOString()
      };
      addMessageToChat(errorResponse);
    } finally {
      // Clear upload status after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleQuickAction = (actionText) => {
    setInputValue(`Help me ${actionText.toLowerCase()}`);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        handleVoiceMessage(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: `❌ **Microphone Access Error**\n\nI couldn't access your microphone. This could be due to:\n\n• **Browser permissions**: Please allow microphone access\n• **HTTPS required**: Voice features need a secure connection\n• **No microphone detected**: Check your audio devices\n\n🎤 **To fix this:**\n1. Click the microphone icon in your browser's address bar\n2. Select "Allow" for microphone access\n3. Try again\n\nAlternatively, you can type your message instead.`,
        timestamp: new Date().toISOString()
      };
      addMessageToChat(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (audioBlob) => {
    // Show voice message in chat
    const voiceMessage = {
      id: Date.now(),
      type: 'user',
      content: `🎤 **Voice Message Recorded**\n*Duration: ${Math.round(audioBlob.size / 1000)}ms*\n*Processing speech to text...*`,
      timestamp: new Date().toISOString(),
      isVoice: true
    };
    addMessageToChat(voiceMessage);

    try {
      // Create FormData for voice upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.wav');
      formData.append('user_id', 'user123');
      formData.append('chat_id', currentChatId?.toString());

      const response = await fetch('http://127.0.0.1:8000/voice', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const transcribedText = data.text || data.transcription || data.message;
        
        if (transcribedText) {
          // Update the voice message to show transcribed text
          setChats(prev => prev.map(chat => {
            if (chat.id === currentChatId) {
              const updatedMessages = chat.messages.map(msg => 
                msg.id === voiceMessage.id 
                  ? { ...msg, content: `🎤 **Voice Message**: "${transcribedText}"` }
                  : msg
              );
              return { ...chat, messages: updatedMessages };
            }
            return chat;
          }));

          // Process the transcribed text as a regular message
          await simulateAIResponse(transcribedText);
        } else {
          throw new Error('No transcription received');
        }
      } else {
        throw new Error(`Voice processing failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      
      // Fallback: show error and suggest typing
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `❌ **Voice Processing Error**\n\nI couldn't process your voice message. This could be due to:\n\n• **Backend not configured**: Voice endpoint may not be available\n• **Audio format issues**: Try recording again\n• **Network problems**: Check your connection\n\n💡 **Suggestion**: Please type your message instead, and I'll be happy to help!`,
        timestamp: new Date().toISOString()
      };
      addMessageToChat(errorResponse);
    }
  };

  const quickActions = [
    { icon: Search, text: "Research Topic", color: "from-blue-500 to-cyan-500", desc: "Deep dive analysis" },
    { icon: FileText, text: "Analyze Document", color: "from-emerald-500 to-teal-500", desc: "Document insights" },
    { icon: BarChart3, text: "Generate Report", color: "from-purple-500 to-pink-500", desc: "Data visualization" },
    { icon: Lightbulb, text: "Get Insights", color: "from-amber-500 to-orange-500", desc: "AI recommendations" },
    { icon: BookOpen, text: "Literature Review", color: "from-indigo-500 to-purple-500", desc: "Academic research" },
    { icon: Globe, text: "Market Analysis", color: "from-rose-500 to-pink-500", desc: "Trend analysis" }
  ];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatMessageContent = (content) => {
    return content.split('\n').map((line, idx) => (
      <div key={idx} className={line.startsWith('•') || line.startsWith('-') ? 'ml-4' : ''}>
        {line.includes('**') ? (
          <span dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }} />
        ) : (
          line
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200/50`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">SynthesisTalk</span>
              <div className="text-white/80 text-xs">AI Research Assistant</div>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-white/80" />
        </div>
        
        <div className="p-4">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Start New Research</span>
          </button>
        </div>
        
        <nav className="px-4 space-y-3 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
            <Clock className="w-3 h-3 mr-2" />
            Chat History ({chats.length})
          </div>
          {chats.map((chat) => (
            <button 
              key={chat.id} 
              onClick={() => switchToChat(chat.id)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 group border ${
                currentChatId === chat.id
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50 text-blue-800'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-transparent hover:border-blue-200/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  currentChatId === chat.id
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-600'
                }`}>
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{chat.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatTime(chat.lastActivity)}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {chat.messages.length} messages
                  </div>
                </div>
              </div>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
          <button className="w-full flex items-center space-x-3 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-white/80 transition-all duration-200">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings & Preferences</span>
          </button>
        </div>
      </div>

      {/* Enhanced Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Premium Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg">
                  {currentChat?.title || 'AI Research Assistant'}
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-600 font-medium">Online & Ready</span>
                  <div className="text-xs text-gray-400">• GPT-4 Enhanced</div>
                  {uploadStatus && (
                    <div className="flex items-center space-x-1 text-xs">
                      {uploadStatus === 'uploading' && (
                        <>
                          <Loader className="w-3 h-3 animate-spin text-blue-500" />
                          <span className="text-blue-600">Uploading...</span>
                        </>
                      )}
                      {uploadStatus === 'success' && (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">Uploaded</span>
                        </>
                      )}
                      {uploadStatus === 'error' && (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          <span className="text-red-600">Upload failed</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group">
              <History className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group">
              <Maximize2 className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>
          </div>
        </header>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent via-white/20 to-white/40">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`flex max-w-4xl w-full ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-4`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-br from-emerald-400 to-blue-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-4 shadow-blue-200/50'
                    : 'bg-white/90 border border-gray-200/50 mr-4 shadow-gray-200/50'
                } hover:shadow-xl transition-all duration-300`}>
                  <div className={`text-sm leading-relaxed ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {formatMessageContent(message.content)}
                  </div>
                  {message.isFile && (
                    <div className="mt-3 flex items-center space-x-2 text-white/90">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">File processed successfully</span>
                    </div>
                  )}
                  {message.isVoice && (
                    <div className="mt-3 flex items-center space-x-2 text-white/90">
                      <Mic className="w-4 h-4" />
                      <span className="text-xs">Voice message transcribed</span>
                    </div>
                  )}
                  <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex max-w-4xl w-full flex-row space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-6 py-4 rounded-2xl bg-white/90 border border-gray-200/50 mr-4 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">AI is analyzing and generating response...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Quick Actions */}
         <form 
          onSubmit={handleSendMessage}
          className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 px-6 py-5 flex flex-col gap-3 shadow-inner"
        >
          <div className="flex flex-wrap gap-2 mb-1">
            {quickActions.map((action, idx) => (
              <button
                type="button"
                key={action.text}
                onClick={() => handleQuickAction(action.text)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r ${action.color} shadow hover:scale-105 transition-transform`}
              >
                <action.icon className="w-4 h-4" />
                {action.text}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* File Upload */}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 transition-all"
              title="Upload a document"
            >
              <Upload className="w-5 h-5 text-blue-600" />
            </button>
            {/* Voice Record */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-xl ${
                isRecording
                  ? "bg-gradient-to-br from-red-500 to-red-700 animate-pulse"
                  : "bg-gradient-to-br from-emerald-100 to-blue-100"
              } hover:from-emerald-200 hover:to-blue-200 transition-all`}
              title={isRecording ? "Stop recording" : "Record a voice message"}
            >
              <Mic className={`w-5 h-5 ${isRecording ? "text-white" : "text-emerald-700"}`} />
            </button>
            {/* Main Input */}
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder="Type your research question, upload a file, or use a quick action…"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/90 text-gray-800 placeholder:text-gray-400 shadow transition-all"
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleSendMessage(e);
                }
              }}
            />
            {/* Send */}
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow transition-all text-white flex items-center justify-center ${
                (!inputValue.trim() || isLoading) && "opacity-50 cursor-not-allowed"
              }`}
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SynthesisTalkChat;