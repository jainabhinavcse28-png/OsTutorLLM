import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, FileCheck2, 
  GraduationCap, Cpu, BookOpen, Users, Sparkles, Database, User
} from 'lucide-react';
import { api } from './services/api';
import DashboardTab from './components/DashboardTab';
import AskOSTab from './components/AskOSTab';
import ExamModeTab from './components/ExamModeTab';
import AIVivaTab from './components/AIVivaTab';
import OSLabAssistantTab from './components/OSLabAssistantTab';
import KnowledgeBaseTab from './components/KnowledgeBaseTab';
import UsersTab from './components/UsersTab';
import './App.css';

const NAVIGATION_ITEMS = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Ask OS', label: 'Ask OS', icon: MessageSquare },
  { id: 'Exam Mode', label: 'Exam Mode', icon: FileCheck2 },
  { id: 'AI Viva', label: 'AI Viva', icon: GraduationCap },
  { id: 'OS Lab Assistant', label: 'OS Labs', icon: Cpu },
  { id: 'Knowledge Base', label: 'Course Notes', icon: BookOpen },
  { id: 'Students', label: 'Students & DB', icon: Users },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem('ostutor_current_user_id');
    return saved ? Number(saved) : 1;
  });
  const [selectedTopic, setSelectedTopic] = useState('Memory Management');
  const [dashboardData, setDashboardData] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);

  const fetchDashboard = (userId = currentUserId) => {
    api.getDashboard(userId)
      .then(data => {
        setDashboardData(data);
        setBackendOnline(true);
      })
      .catch(err => {
        console.warn('Backend not responding yet:', err);
        setBackendOnline(false);
      });
  };

  const handleSwitchUser = (newId) => {
    setCurrentUserId(newId);
    localStorage.setItem('ostutor_current_user_id', newId.toString());
    fetchDashboard(newId);
  };

  useEffect(() => {
    fetchDashboard(currentUserId);
  }, [currentUserId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-white flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base shadow-md">
              OS
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                OSTutorLLM
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </h1>
              <p className="text-[10px] font-mono text-indigo-300/80 uppercase tracking-wider">
                AI · RAG · Labs · Viva
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Learning Core
            </p>
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Database & Active Student Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 text-xs">
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Database className="w-3 h-3 text-indigo-400" /> Database Status
              </span>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            </div>
            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <div className="truncate pr-1">
                <p className="text-[10px] text-slate-400">Active Profile:</p>
                <p className="text-xs font-bold text-indigo-300 truncate">
                  {dashboardData?.user_name || 'Loading...'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('Students')}
                className="text-[10px] font-semibold text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors cursor-pointer flex-shrink-0"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'Dashboard' && 'Student Performance & Adaptive Dashboard'}
              {activeTab === 'Ask OS' && 'Ask OS — RAG-Powered Knowledge Retrieval'}
              {activeTab === 'Exam Mode' && 'Exam Mode — Conceptual Practice & Assessments'}
              {activeTab === 'AI Viva' && 'AI Viva — Interactive Oral Examiner'}
              {activeTab === 'OS Lab Assistant' && 'OS Lab Assistant — Algorithmic Simulators'}
              {activeTab === 'Knowledge Base' && 'Knowledge Base — Course Lectures & Materials'}
              {activeTab === 'Students' && 'PostgreSQL Student Records & Switcher'}
            </h2>
            <p className="text-xs text-slate-500">
              Syllabus-aware AI tutor grounded in Operating Systems courseware
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Student Pill in Header */}
            <button
              onClick={() => setActiveTab('Students')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-800 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Click to switch student profile"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student: <strong className="font-bold text-slate-900">{dashboardData?.user_name || '...'}</strong></span>
              <span className="text-[10px] text-slate-400 font-mono">(ID: #{currentUserId})</span>
            </button>

            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200/60 hidden sm:inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              v1.0 Production Ready
            </span>
          </div>
        </header>

        {/* Tab Content Body */}
        <div className="p-6 md:p-8 flex-1">
          {activeTab === 'Dashboard' && (
            <DashboardTab
              dashboard={dashboardData}
              onNavigate={(tabName) => setActiveTab(tabName)}
              onSelectTopic={(topicName) => setSelectedTopic(topicName)}
            />
          )}

          {activeTab === 'Ask OS' && (
            <AskOSTab userId={currentUserId} />
          )}

          {activeTab === 'Exam Mode' && (
            <ExamModeTab
              initialTopic={selectedTopic}
              userId={currentUserId}
              onUpdateProgress={() => fetchDashboard(currentUserId)}
            />
          )}

          {activeTab === 'AI Viva' && (
            <AIVivaTab
              initialTopic={selectedTopic}
              userId={currentUserId}
              onUpdateProgress={() => fetchDashboard(currentUserId)}
            />
          )}

          {activeTab === 'OS Lab Assistant' && (
            <OSLabAssistantTab />
          )}

          {activeTab === 'Knowledge Base' && (
            <KnowledgeBaseTab />
          )}

          {activeTab === 'Students' && (
            <UsersTab
              currentUserId={currentUserId}
              onSwitchUser={handleSwitchUser}
              onNavigate={(tabName) => setActiveTab(tabName)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
