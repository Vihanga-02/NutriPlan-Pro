import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Languages } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m your AI nutrition doctor. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = language === 'si'
      ? 'හෙලෝ! මම ඔබේ AI පෝෂණ වෛද්යවරයා. මට ඔබට අද උදව් කරන්න පුළුවන්ද?'
      : 'Hello! I\'m your AI nutrition doctor. How can I help you today?';

    setMessages([{
      id: 1,
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
    }]);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'si' : 'en');
  };


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      const conversationHistory = messages
        .filter(msg => msg.sender !== 'system')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const response = await fetch(`${apiUrl}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: conversationHistory.slice(-10),
          language: language
        }),
      });

      const data = await response.json();
      
      let botResponse = '';
      
      if (response.ok) {
        // Check if response has success field or just message
        if (data.success !== false && data.message) {
          botResponse = data.message;
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error(data.message || 'Invalid response from server');
        }
      } else {
        throw new Error(data.message || data.error || `API request failed with status ${response.status}`);
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);

      // Show proper error message instead of dummy data
      const errorMessage = language === 'si'
        ? 'කණගාටුයි, මට දැනට ප්‍රතිචාර දැක්වීමට නොහැකි විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.'
        : 'Sorry, I\'m having trouble responding right now. Please try again later.';

      const botMessage = {
        id: messages.length + 2,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-yellow-400 text-black p-4 rounded-full shadow-2xl hover:bg-yellow-500 transition-all hover:scale-110 z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-4 border-yellow-400">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold">{language === 'si' ? 'AI පෝෂණ වෛද්යවරයා' : 'AI Nutrition Doctor'}</h3>
                <p className="text-xs">{language === 'si' ? 'ඉංග්‍රීසි සහ සිංහල සහාය' : 'English & Sinhala Support'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleLanguage}
                className="hover:bg-yellow-600 p-2 rounded-lg transition flex items-center space-x-1"
                title={language === 'si' ? 'Switch to English' : 'සිංහලට මාරු වන්න'}
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs font-semibold">{language === 'si' ? 'EN' : 'සි'}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-yellow-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-gray-800 border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && <Bot className="w-5 h-5 flex-shrink-0 mt-1" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && <User className="w-5 h-5 flex-shrink-0 mt-1" />}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-gray-200 p-3 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t-2 border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'si' ? 'පෝෂණය ගැන විමසන්න...' : 'Ask about nutrition...'}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-yellow-400 text-black p-2 rounded-xl hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
