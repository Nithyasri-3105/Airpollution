'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { ChatMessage } from '@/lib/types';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Trash2,
  HelpCircle,
  Clock,
  Compass,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export default function ChatbotPage() {
  const { user, selectedCity } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your **AIRSense AI Environmental Assistant**.\n\nI am currently synchronized with live telemetry for **${selectedCity}**. Ask me anything about current AQI levels, 24-hour predictions, jogging safety, green zones, or health precautions for your profile.`,
      timestamp: 'Just now',
      suggestedFollowUps: [
        'What is my current AQI?',
        'Is it safe to go jogging today?',
        'Why is AQI high today?',
        'When is the safest time to go outside?'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          cityId: selectedCity
        })
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || "I've reviewed the sensor telemetry, but encountered a momentary processing gap. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: data.suggestedFollowUps || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I was unable to establish connection to the atmospheric telemetry engine. Please check your internet connection.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `clear-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Live telemetry for **${selectedCity}** is ready. How can I assist your environmental planning today?`,
        timestamp: 'Just now',
        suggestedFollowUps: [
          'What is my current AQI?',
          'When is the safest time to go outside?',
          'Where are the greenest parks in this city?'
        ]
      }
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">AIRSense AI Assistant</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Telemetry-Grounded
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Synchronized with <strong className="text-gray-200">{selectedCity}</strong> active atmospheric sensors
              </p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-gray-400 hover:text-white border border-white/5 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto glass-panel rounded-3xl p-4 sm:p-6 border border-white/10 space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 text-xs sm:text-sm ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 border border-cyan-500/30 text-cyan-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 relative group ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-white shadow-sm'
                    : 'bg-slate-900/90 border border-white/5 text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {msg.sender === 'user' ? 'You' : 'AirSense AI'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-gray-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed space-y-2 prose-invert text-xs sm:text-sm">
                  {msg.text}
                </div>

                {/* Suggested follow-ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                      Suggested Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 transition text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-2 text-cyan-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>AirSense AI is consulting live telemetry & models...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="glass-panel p-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-2xl shrink-0"
        >
          <input
            type="text"
            placeholder={`Ask AirSense AI about ${selectedCity} air quality, predictions, or health guidance...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold hover:opacity-90 disabled:opacity-40 transition shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
