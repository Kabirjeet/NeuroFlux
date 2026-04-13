import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  MessageCircle, 
  Bot, 
  User, 
  FileText, 
  Clock,
  Copy,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

import documentService from '../../../services/documentService';
import aiService from '../../../services/aiService';
import Spinner from '../../../components/common/Spinner';
import Button from '../../../components/common/Button';

const DocumentChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchDocument = async () => {
    try {
      const response = await documentService.getDocumentById(id);
      setDocument(response.data || response);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    }
  };

  const fetchChatHistory = async () => {
    try {
      const history = await aiService.getChatHistory(id);
      setMessages(history || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchDocument();
    fetchChatHistory();
  }, [id]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const question = inputMessage.trim();
    const newMessages = [
      ...messages,
      { role: 'user', content: question, timestamp: new Date(), relevantChunks: [] }
    ];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
    const chatResponse = await aiService.chat(id, question);
      const answerMessage = {
        role: 'assistant',
        content: chatResponse.answer,
        timestamp: new Date(),
        relevantChunks: chatResponse.relevantChunks || []
      };
      setMessages([...newMessages, answerMessage]);
    } catch (error) {
      toast.error(error.message || 'Failed to get response');
      setMessages(messages); // Restore previous messages
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  if (isLoadingHistory) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-dark-900 to-gray-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] opacity-20 pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="glass-card p-6 border-b border-dark-700 sticky top-0 z-10 backdrop-blur-xl bg-dark-900/80">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(`/documents/${id}`)} size="icon" className="h-10 w-10 p-0">
              <ArrowLeft className="w-10 h-10" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-dark-100 truncate">Chat with {document?.title}</h1>
              <p className="text-sm text-dark-400 truncate">{document?.fileName}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <MessageCircle className="w-4 h-4" />
              {messages.length} messages
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-dark-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">No conversations yet</h3>
              <p className="text-dark-400 max-w-md mb-8">
                Ask me anything about this document. I'll find relevant sections and answer based on its content.
              </p>
              <div className="flex items-center gap-2 text-sm text-dark-500 bg-dark-800/50 px-4 py-2 rounded-xl">
                <FileText className="w-4 h-4" />
                Context-aware answers from {document?.title}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-sm' 
                    : 'glass-card rounded-bl-sm'
                }`}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-white/20' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                      {message.relevantChunks?.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                          📖 Referenced {message.relevantChunks.length} sections from document
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <Clock className="w-3 h-3" />
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyMessage(message.content)}
                      className="h-5 px-1 -ml-1 text-xs"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={async () => {
                        setMessages(messages.filter((_, i) => i !== index));
                      }}
                      className="h-5 px-1 text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass-card p-4 border-t border-dark-700 sticky bottom-0 backdrop-blur-xl bg-dark-900/80 z-20">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about this document..."
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none bg-dark-800 border border-dark-600 rounded-xl p-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none placeholder-dark-500 text-dark-100 min-h-[44px] max-h-24"
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <Button 
              size="icon" 
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="h-12 w-12 p-0 rounded-2xl shadow-lg hover:shadow-emerald-500/25 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 group-disabled:opacity-50" />
              )}
            </Button>
          </div>
          {isLoading && (
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              AI is thinking...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentChatPage;
