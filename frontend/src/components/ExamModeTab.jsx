import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, CheckCircle2, XCircle, AlertTriangle, 
  ArrowRight, ArrowLeft, RefreshCw, Award, BookOpen, Target, Sparkles
} from 'lucide-react';
import { api } from '../services/api';

const TOPIC_OPTIONS = [
  "Memory Management",
  "CPU Scheduling",
  "Process Synchronization",
  "Deadlocks",
  "File Systems & I/O",
  "All Topics"
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"];

export default function ExamModeTab({ initialTopic = "Memory Management", userId = 1, onUpdateProgress }) {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);

  const [gameState, setGameState] = useState('config'); // 'config' | 'taking' | 'results'
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qId]: 'A' | 'B' | ... }
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const handleStartExam = async () => {
    setLoading(true);
    setError('');
    try {
      const qList = await api.generateQuiz(topic, difficulty, numQuestions);
      if (!qList || qList.length === 0) {
        throw new Error('No questions found for the selected topic and difficulty.');
      }
      setQuestions(qList);
      setSelectedAnswers({});
      setCurrentIdx(0);
      setGameState('taking');
    } catch (err) {
      setError(err.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (letter) => {
    const qId = questions[currentIdx].id;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: letter
    }));
  };

  const handleSubmitExam = async () => {
    setLoading(true);
    setError('');
    try {
      const answersPayload = questions.map(q => ({
        question_id: q.id,
        selected_option: selectedAnswers[q.id] || "A" // default if unanswered
      }));

      const res = await api.submitQuiz(topic, answersPayload, userId);
      setResults(res);
      setGameState('results');
      if (onUpdateProgress) {
        onUpdateProgress();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIdx];
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Configuration Screen */}
      {gameState === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
              <Target className="w-3.5 h-3.5" />
              Syllabus Assessment Engine
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Exam Mode Assessment
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select topic and difficulty to test your conceptual clarity. Your results will automatically update your adaptive learning progress and pinpoint strong and weak areas.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TOPIC_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DIFFICULTY_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3}>3 Questions (Quick Test)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Full Assessment)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartExam}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  START TEST
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Taking Screen */}
      {gameState === 'taking' && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm space-y-6">
          {/* Header Progress */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                {currentQ.topic}
              </span>
              {currentQ.subconcept && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
                  {currentQ.subconcept}
                </span>
              )}
            </div>

            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              currentQ.difficulty === 'Hard' ? 'bg-rose-100 text-rose-700' :
              currentQ.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {currentQ.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              Q{currentIdx + 1}. {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((optText, optIdx) => {
              const letter = optionLetters[optIdx];
              const isSelected = selectedAnswers[currentQ.id] === letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleSelectOption(letter)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-2 ring-indigo-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {letter}
                  </span>
                  <span className="text-sm mt-0.5">{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(prev - 1, 0))}
              disabled={currentIdx === 0}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(prev + 1, questions.length - 1))}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Post-Assessment Report (Matching Prompt Specification!) */}
      {gameState === 'results' && results && (
        <div className="space-y-6">
          {/* Score Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Assessment Results
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black text-indigo-600">
                {results.score} / {results.total}
              </span>
              <span className="text-lg font-bold text-slate-400">
                ({results.percentage}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your score has been logged to your PostgreSQL progress record and your topic mastery has been updated.
            </p>

            {/* Concept Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-4 max-w-2xl mx-auto">
              {/* Strong Concepts */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Strong Concepts
                </div>
                {results.strong_topics.length > 0 ? (
                  <ul className="text-xs text-emerald-900 space-y-1">
                    {results.strong_topics.map((st, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-700 italic">Continue practicing to establish mastery</p>
                )}
              </div>

              {/* Weak Concepts */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Weak Concepts
                </div>
                {results.weak_topics.length > 0 ? (
                  <ul className="text-xs text-rose-900 space-y-1">
                    {results.weak_topics.map((wt, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-rose-500 font-bold">⚠</span>
                        <span>{wt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-rose-700 italic">No weak concepts flagged in this attempt!</p>
                )}
              </div>
            </div>

            {/* Actionable Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-2xl mx-auto text-left space-y-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Recommended Next Steps:
                </p>
                <div className="space-y-1">
                  {results.recommendations.map((rec, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">→</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setGameState('config')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Attempt Another Topic
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Question-by-Question Review
            </h3>

            <div className="space-y-4">
              {results.results.map((resItem, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border text-sm space-y-2 ${
                    resItem.is_correct 
                      ? 'border-emerald-200 bg-emerald-50/30' 
                      : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900">
                      Q{i + 1}. {resItem.question}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                      resItem.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {resItem.is_correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {resItem.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="flex gap-4 text-xs">
                    <span className="text-slate-600">
                      Your Answer: <strong className="font-mono">{resItem.selected_option}</strong>
                    </span>
                    <span className="text-slate-600">
                      Correct Answer: <strong className="font-mono text-emerald-700">{resItem.correct_answer}</strong>
                    </span>
                  </div>

                  {resItem.explanation && (
                    <div className="text-xs bg-white/80 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                      <strong>Explanation:</strong> {resItem.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
