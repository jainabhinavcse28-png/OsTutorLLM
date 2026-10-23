import React from 'react';
import { 
  TrendingUp, Award, AlertTriangle, BookOpen, 
  Sparkles, CheckCircle2, ArrowRight, Brain, Clock, Rocket
} from 'lucide-react';

export default function DashboardTab({ dashboard, onNavigate, onSelectTopic }) {
  if (!dashboard) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        Loading student learning analytics...
      </div>
    );
  }

  const {
    user_name,
    overall_progress,
    total_questions_attempted,
    total_vivas_conducted,
    weakest_topic,
    topics_progress = [],
    recommendations = [],
    recent_activity = []
  } = dashboard;

  const hasWeakTopic = weakest_topic && !weakest_topic.toLowerCase().includes('none');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-7 text-white shadow-xl border border-indigo-700/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Learning Engine Active
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user_name} 👋
          </h1>
          <p className="mt-2 text-indigo-100/90 text-sm leading-relaxed">
            {total_questions_attempted > 0 
              ? `Your personalized OS mastery is tracked across syllabus modules. Review your performance breakdown below and practice with targeted questions and AI viva sessions.`
              : `Welcome to your OS learning workspace! You haven't attempted any questions yet. Start by taking a quick diagnostic test in Exam Mode or trying an AI viva session.`}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('Exam Mode')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Start Exam Practice
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('AI Viva')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all border border-white/20 active:scale-95 cursor-pointer"
            >
              Take AI Viva
            </button>
            <button
              onClick={() => onNavigate('OS Lab Assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-sm font-semibold transition-all border border-emerald-400/30 active:scale-95 cursor-pointer"
            >
              Open OS Labs
            </button>
          </div>
        </div>

        {/* Big Overall Progress Pill */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 w-44">
          <span className="text-xs font-medium text-indigo-200 tracking-wider uppercase">Mastery Index</span>
          <span className="text-4xl font-black text-white mt-1">{overall_progress}%</span>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-400 h-2 rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(overall_progress, 100)}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-indigo-200 mt-2">
            {total_questions_attempted > 0 ? 'Syllabus Grounded' : 'Not Started'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Progress</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{overall_progress}%</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Questions Attempted</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{total_questions_attempted}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Viva Sessions</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{total_vivas_conducted}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weakest Area</p>
            <h3 className="text-sm font-bold text-rose-700 mt-1 truncate" title={weakest_topic}>
              {weakest_topic || 'None'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Topic Performance + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topic Performance Progress Bars (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Topic-by-Topic Performance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated from real exam question attempts and viva responses for {user_name}
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
              Syllabus v1.0
            </span>
          </div>

          <div className="space-y-5">
            {topics_progress.map((topic) => {
              const hasAttempts = topic.attempts_count > 0;
              const isWeak = topic.is_weak;
              const barColor = !hasAttempts
                ? 'bg-slate-300'
                : topic.accuracy >= 80 
                  ? 'bg-emerald-500' 
                  : topic.accuracy >= 60 
                    ? 'bg-indigo-500' 
                    : 'bg-rose-500';

              return (
                <div key={topic.topic_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{topic.topic_name}</span>
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {topic.module}
                      </span>
                      {isWeak && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Needs Attention
                        </span>
                      )}
                      {!hasAttempts && (
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                          Unattempted
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-800 font-mono">
                      {hasAttempts ? `${topic.accuracy}%` : '—'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-700 ${barColor}`} 
                      style={{ width: `${Math.min(topic.accuracy, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{topic.attempts_count} practice attempts logged</span>
                    <button
                      onClick={() => {
                        if (onSelectTopic) onSelectTopic(topic.topic_name);
                        onNavigate('Exam Mode');
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                    >
                      Practice Questions →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Weak Topic Alert & Personalized Adaptive Recommendations */}
        <div className="space-y-6">
          {/* Weak Topic Alert Box OR New Student Getting Started Box */}
          {hasWeakTopic ? (
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Weak Topic Detected</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {weakest_topic}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your performance shows lower accuracy in this module. The adaptive engine suggests reviewing core concepts, running simulators, and taking an AI viva session.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (onSelectTopic) onSelectTopic(weakest_topic);
                    onNavigate('Exam Mode');
                  }}
                  className="w-full text-center px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Attempt 5 MCQs on {weakest_topic}
                </button>
                <button
                  onClick={() => {
                    if (onSelectTopic) onSelectTopic(weakest_topic);
                    onNavigate('AI Viva');
                  }}
                  className="w-full text-center px-3 py-2 bg-white hover:bg-slate-50 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Launch AI Viva Session
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Rocket className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Ready to Learn</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Start Your OS Learning Journey
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete a short 5-question test in Exam Mode or chat with Ask OS to begin generating your personalized mastery profile.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => onNavigate('Exam Mode')}
                  className="w-full text-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Take Baseline Exam
                </button>
              </div>
            </div>
          )}

          {/* Recommended Practice Steps */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Adaptive Study Recommendations
            </h3>

            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/40 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">{rec.action}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      rec.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Recent Activity for {user_name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recent_activity.map((act, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{act.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-600">{act.time}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                    {act.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
