import React, { useState } from 'react';
import { 
  GraduationCap, Send, Sparkles, CheckCircle2, 
  AlertCircle, RefreshCw, Award, MessageSquare, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

const VIVA_TOPICS = [
  "Process Management & CPU Scheduling",
  "Process Synchronization",
  "Deadlocks",
  "Memory Management"
];

export default function AIVivaTab({ initialTopic = "Process Management & CPU Scheduling", userId = 1, onUpdateProgress }) {
  const [topic, setTopic] = useState(initialTopic);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversation, setConversation] = useState([]); // [{speaker: 'examiner'|'student', message: ''}]
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestEval, setLatestEval] = useState(null);
  const [error, setError] = useState('');

  const handleStartViva = async () => {
    setLoading(true);
    setError('');
    setConversation([]);
    setLatestEval(null);
    try {
      const res = await api.startViva(topic, userId);
      setSessionId(res.session_id);
      setConversation([
        { speaker: 'examiner', message: res.initial_question }
      ]);
      setSessionActive(true);
    } catch (err) {
      setError(err.message || 'Failed to start viva session');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!currentAnswer.trim() || loading) return;

    const studentTurn = { speaker: 'student', message: currentAnswer };
    const updatedHistory = [...conversation, studentTurn];
    setConversation(updatedHistory);
    setCurrentAnswer('');
    setLoading(true);

    try {
      const evalRes = await api.respondViva(
        sessionId,
        topic,
        studentTurn.message,
        updatedHistory,
        userId
      );
      setLatestEval(evalRes);

      if (evalRes.next_question) {
        setConversation(prev => [
          ...prev,
          { speaker: 'examiner', message: evalRes.next_question }
        ]);
      }

      if (onUpdateProgress) {
        onUpdateProgress();
      }
    } catch (err) {
      setError(err.message || 'Failed to evaluate answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          Interactive AI Viva Examiner
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          OS Oral Examination & Viva Voce
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The AI behaves like a university examiner. State your definitions, explain the inner mechanics, and answer adaptive follow-up questions. Your responses are scored with identified strengths and missing points.
        </p>

        {/* Topic Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={sessionActive && conversation.length > 1}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {VIVA_TOPICS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            onClick={handleStartViva}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
            {sessionActive ? 'Restart Viva' : 'Start AI Viva'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Live Conversation Trail */}
      {sessionActive && (
        <div className="space-y-5">
          {conversation.map((turn, idx) => {
            const isExaminer = turn.speaker === 'examiner';
            return (
              <div 
                key={idx}
                className={`flex gap-3 ${isExaminer ? 'items-start' : 'items-end justify-end'}`}
              >
                {isExaminer && (
                  <div className="w-10 h-10 rounded-xl bg-indigo-900 text-indigo-200 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                    AI Prof
                  </div>
                )}

                <div 
                  className={`max-w-2xl rounded-2xl p-5 shadow-sm text-sm leading-relaxed ${
                    isExaminer 
                      ? 'bg-white border border-slate-200 text-slate-800' 
                      : 'bg-indigo-600 text-white rounded-br-none'
                  }`}
                >
                  <p className="font-semibold text-xs mb-1 opacity-75">
                    {isExaminer ? 'Examiner Question' : 'Your Answer'}
                  </p>
                  <p className="whitespace-pre-line">{turn.message}</p>
                </div>
              </div>
            );
          })}

          {/* Evaluation Card (Prompt Specification: Strengths, Missing Points, Score) */}
          {latestEval && (
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Examiner Feedback & Scorecard
                  </h3>
                </div>
                <div className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-lg">
                  Score: {latestEval.score} / 10
                </div>
              </div>

              <p className="text-xs text-slate-600 italic">
                "{latestEval.feedback_summary}"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Strengths */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Correct Points Identified
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {latestEval.strengths.map((str, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Points */}
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Missing Concepts / Opportunities
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {latestEval.missing_points.map((mis, mIdx) => (
                      <li key={mIdx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{mis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {latestEval.next_question && (
                <div className="p-3 bg-indigo-100/60 rounded-xl text-xs text-indigo-950 font-medium flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-700 flex-shrink-0" />
                  <span>The examiner has posed a follow-up question above to evaluate your depth!</span>
                </div>
              )}
            </div>
          )}

          {/* Student Response Input Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Your Answer to the Examiner
            </label>
            <textarea
              rows={4}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Explain the concepts, data structures, and trade-offs clearly..."
              disabled={loading}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSendResponse}
                disabled={loading || !currentAnswer.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
