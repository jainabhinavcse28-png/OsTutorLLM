import React, { useState, useEffect } from 'react';
import { 
  Send, Sparkles, BookOpen, Layers, ChevronDown, 
  ChevronUp, History, Check, CornerDownRight, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_QUESTIONS = [
  "What is virtual memory and how does paging work?",
  "Explain the difference between process and thread.",
  "What are the 4 Coffman conditions for a deadlock?",
  "Why does FIFO suffer from Belady's Anomaly?",
  "How does Banker's Algorithm ensure a safe state?",
  "Explain the Producer-Consumer problem using semaphores."
];

export default function AskOSTab({ userId = 1 }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am **OSTutorLLM**, your syllabus-aware Operating Systems AI tutor.\n\nAsk me anything about CPU scheduling, process synchronization, deadlocks, memory management, or file systems. I retrieve relevant chunks from course lecture notes, textbooks, and lab manuals, provide structured explanations, and cite exact sources.",
      sources: []
    }
  ]);
  const [expandedSources, setExpandedSources] = useState({});

  const handleAsk = async (queryText) => {
    const q = queryText || question;
    if (!q.trim() || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const data = await api.askQuestion(q, userId);
      const aiMsg = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        topic: data.topic
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `❌ Could not retrieve answer from backend: ${err.message}. Please verify the FastAPI server is running.`,
          sources: [] 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (idx) => {
    setExpandedSources(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          RAG-Powered Intelligent Tutor
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Ask Anything About Operating Systems
        </h2>
        <p className="text-sm text-slate-600">
          Answers are grounded in university lecture notes, lab manuals, and Silberschatz reference materials with exact document citations.
        </p>

        {/* Suggested Chips */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-slate-600 mb-2">Popular Questions to Try:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(sq);
                  handleAsk(sq);
                }}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4 min-h-[400px]">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div 
                className={`max-w-3xl rounded-2xl p-5 shadow-sm text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2 border-b border-slate-100 pb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    OSTutorLLM Response
                    {msg.topic && (
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono ml-auto">
                        {msg.topic}
                      </span>
                    )}
                  </div>
                )}

                {/* Render Answer Text */}
                <div className="prose prose-sm max-w-none space-y-2 whitespace-pre-line text-slate-800">
                  {msg.content}
                </div>

                {/* Citations Box (Matching User Prompt Specification!) */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span>📚 Verified Course Sources ({msg.sources.length})</span>
                      </div>
                      <button
                        onClick={() => toggleSource(idx)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {expandedSources[idx] ? (
                          <>Hide Snippets <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Show Context <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} className="text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-indigo-900">• {src.module}</span>
                            <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                              {src.document}
                            </span>
                          </div>
                          <div className="text-slate-600 text-[11px] mt-0.5 font-medium">
                            Section: {src.section}
                          </div>
                          {expandedSources[idx] && (
                            <p className="mt-2 text-slate-600 text-[11px] bg-slate-50 p-2 rounded border border-slate-100 font-mono leading-normal">
                              "{src.snippet}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 max-w-md animate-pulse">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800">Retrieving syllabus chunks...</p>
              <p className="text-[11px] text-slate-600">Searching vector index & synthesizing grounded answer</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-300 shadow-lg">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about Operating Systems (e.g. What is virtual memory? Explain Convoy effect...)"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Ask OS</span>
          </button>
        </form>
      </div>
    </div>
  );
}
