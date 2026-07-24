import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import {
  CHATBOT_QA_DATABASE,
  findAnswerByIntent,
  getAllCategories,
  getQAByCategory,
  searchQA,
  getFollowUpSuggestions,
  ChatbotQA
} from '../chatbot-knowledge-base';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  qaId?: string; // Link to the QA database
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQA, setCurrentQA] = useState<ChatbotQA | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chatbot with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: '0',
        type: 'bot',
        content: `👋 Welcome to PolarGuard Insurance! I'm here to help with any questions about our coverage, pricing, process, claims, or eligibility.

What can I help you with today? Feel free to ask about:
• Getting a quote
• Our coverage options
• Pricing & discounts
• How the process works
• Claims & accidents
• Your eligibility
• Or anything else!`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Simulate response delay for natural feel
    setTimeout(() => {
      let botResponse: Message;

      // Try to find matching answer
      const match = findAnswerByIntent(userMessage);

      if (match) {
        setCurrentQA(match);
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: match.answer,
          timestamp: new Date(),
          qaId: match.id,
        };
      } else {
        // Fallback response
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `I'm not entirely sure about that. Let me help you find an answer:

Would you like to know about:
• **Getting a quote** - Our quick 5-minute process
• **Coverage options** - Liability, Collision, Comprehensive
• **Pricing & discounts** - What affects your rate
• **The process** - From quote to activation
• **Claims** - What to do after an accident
• **Your eligibility** - Who can get coverage
• **Contact us** - Reach our broker directly

Or you can:
📞 Call us: 587-875-8875
📧 Email: support@polarguard.ca

Try asking in a different way, or pick one of the topics above!`,
          timestamp: new Date(),
        };
      }

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 500);
  };

  // "Get a quote" is a call-to-action, not a question — send the visitor straight
  // to the real "Build your prepaid quote" section (id="quote") instead of just
  // explaining the process in text.
  const scrollToQuoteSection = () => {
    setIsOpen(false);
    setTimeout(() => {
      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleFollowUp = (followUpQuestion: string) => {
    if (followUpQuestion.trim().toLowerCase() === 'get a quote') {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: followUpQuestion,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      scrollToQuoteSection();
      return;
    }
    handleSendMessage(followUpQuestion);
  };

  const handleCategorySelect = (category: string) => {
    const qaList = getQAByCategory(category);
    if (qaList.length > 0) {
      // Send first QA from category as example
      const qa = qaList[0];
      setCurrentQA(qa);

      const botMsg: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Here are some common questions about **${category}**:\n\n${qa.question}\n\n${qa.answer}`,
        timestamp: new Date(),
        qaId: qa.id,
      };

      setMessages(prev => [...prev, botMsg]);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-40 bg-[#168A5A] hover:bg-[#1FA36A] text-white font-inter text-[14px] font-semibold px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          aria-label="Open chat"
        >
          <MessageCircle size={18} strokeWidth={2} />
          Ask PolarGuard
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#168A5A] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <div>
                <h3 className="font-semibold text-[14px]">PolarGuard Support</h3>
                <p className="text-[12px] opacity-90">Always here to help</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="hover:bg-[#1FA36A] p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-[14px]">Start a conversation...</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-[14px] ${
                      msg.type === 'user'
                        ? 'bg-[#168A5A] text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Follow-up Suggestions */}
                    {msg.type === 'bot' && msg.qaId && currentQA && (
                      <div className="mt-3 space-y-2">
                        {currentQA.followUp && currentQA.followUp.length > 0 && (
                          <>
                            <p className="text-[12px] font-semibold opacity-70 mt-2">
                              Related questions:
                            </p>
                            {currentQA.followUp.slice(0, 2).map((followUp: string, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => handleFollowUp(followUp)}
                                className="block w-full text-left text-[12px] bg-[#168A5A]/10 hover:bg-[#168A5A]/20 text-[#168A5A] px-2 py-1 rounded transition-colors"
                              >
                                → {followUp}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 rounded-lg rounded-bl-none p-3">
                  <div className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-[14px]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (shown when no messages) */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <p className="text-[12px] font-semibold text-gray-700 mb-2">
                Quick topics:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['About PolarGuard', 'Pricing & Quotes', 'Coverage', 'Process'].map(
                  category => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="text-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded transition-colors"
                    >
                      {category}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#168A5A]/20 focus:border-[#168A5A]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-[#168A5A] hover:bg-[#1FA36A] disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-[11px] text-gray-500 mt-2">
              💬 Powered by PolarGuard Knowledge Base (No AI API needed)
            </p>
          </div>
        </div>
      )}
    </>
  );
}
