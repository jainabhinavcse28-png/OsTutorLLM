import React, { useState } from 'react';
import { 
  Cpu, ShieldAlert, FileText, Play, RotateCcw, 
  CheckCircle2, XCircle, Plus, Trash2, Layers, Activity
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_PROCESSES = [
  { pid: 'P1', arrival_time: 0, burst_time: 5, priority: 2 },
  { pid: 'P2', arrival_time: 1, burst_time: 3, priority: 1 },
  { pid: 'P3', arrival_time: 2, burst_time: 4, priority: 3 }
];

export default function OSLabAssistantTab() {
  const [activeSubTab, setActiveSubTab] = useState('cpu'); // 'cpu' | 'bankers' | 'paging'

  // CPU Scheduling State
  const [cpuAlgo, setCpuAlgo] = useState('Round Robin');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES);
  const [cpuResult, setCpuResult] = useState(null);
  const [cpuLoading, setCpuLoading] = useState(false);

  // Banker's State
  const [bankersData, setBankersData] = useState({
    processes: ["P0", "P1", "P2", "P3", "P4"],
    resources: ["A", "B", "C"],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ],
    max_matrix: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ],
    available: [3, 3, 2],
    request_process: "",
    request_vector: null
  });
  const [bankersResult, setBankersResult] = useState(null);
  const [bankersLoading, setBankersLoading] = useState(false);

  // Page Replacement State
  const [pageAlgo, setPageAlgo] = useState('FIFO');
  const [framesCount, setFramesCount] = useState(3);
  const [refString, setRefString] = useState("7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2");
  const [pagingResult, setPagingResult] = useState(null);
  const [pagingLoading, setPagingLoading] = useState(false);

  // CPU Handlers
  const handleRunCpu = async () => {
    setCpuLoading(true);
    try {
      const res = await api.runCPUScheduling(cpuAlgo, processes, timeQuantum);
      setCpuResult(res);
    } catch (err) {
      alert(`CPU Simulation error: ${err.message}`);
    } finally {
      setCpuLoading(false);
    }
  };

  const handleAddProcess = () => {
    const nextNum = processes.length + 1;
    setProcesses([
      ...processes,
      { pid: `P${nextNum}`, arrival_time: 0, burst_time: 4, priority: 1 }
    ]);
  };

  const handleRemoveProcess = (idx) => {
    setProcesses(processes.filter((_, i) => i !== idx));
  };

  // Banker's Handler
  const handleRunBankers = async () => {
    setBankersLoading(true);
    try {
      const payload = { ...bankersData };
      if (!payload.request_process) {
        delete payload.request_process;
        delete payload.request_vector;
      }
      const res = await api.runBankers(payload);
      setBankersResult(res);
    } catch (err) {
      alert(`Banker's Algorithm error: ${err.message}`);
    } finally {
      setBankersLoading(false);
    }
  };

  // Paging Handler
  const handleRunPaging = async () => {
    setPagingLoading(true);
    try {
      const pagesArray = refString
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n));
      const res = await api.runPageReplacement(pageAlgo, pagesArray, framesCount);
      setPagingResult(res);
    } catch (err) {
      alert(`Page Replacement error: ${err.message}`);
    } finally {
      setPagingLoading(false);
    }
  };

  const getProcessColor = (pid) => {
    const colors = [
      'bg-indigo-500 text-white',
      'bg-emerald-500 text-white',
      'bg-amber-500 text-white',
      'bg-rose-500 text-white',
      'bg-purple-500 text-white',
      'bg-cyan-500 text-white'
    ];
    const hash = pid.charCodeAt(pid.length - 1) % colors.length;
    return colors[hash] || 'bg-indigo-500 text-white';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Tab Navigation for Lab Simulators */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('cpu')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'cpu'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          CPU Scheduling Simulator
        </button>

        <button
          onClick={() => setActiveSubTab('bankers')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'bankers'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Banker's Deadlock Avoidance
        </button>

        <button
          onClick={() => setActiveSubTab('paging')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'paging'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Page Replacement Simulator
        </button>
      </div>

      {/* 1. CPU SCHEDULING SIMULATOR */}
      {activeSubTab === 'cpu' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  CPU Scheduling Simulator
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate FCFS, SJF, SRTF, Round Robin, and Priority scheduling with interactive Gantt Chart
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setProcesses([
                      { pid: 'P1', arrival_time: 0, burst_time: 5, priority: 2 },
                      { pid: 'P2', arrival_time: 1, burst_time: 3, priority: 1 },
                      { pid: 'P3', arrival_time: 2, burst_time: 4, priority: 3 }
                    ]);
                    setCpuAlgo('Round Robin');
                    setTimeQuantum(2);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Preset: Round Robin (q=2)
                </button>
                <button
                  onClick={() => {
                    setProcesses([
                      { pid: 'P1', arrival_time: 0, burst_time: 12, priority: 1 },
                      { pid: 'P2', arrival_time: 1, burst_time: 2, priority: 2 },
                      { pid: 'P3', arrival_time: 2, burst_time: 1, priority: 3 }
                    ]);
                    setCpuAlgo('FCFS');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Preset: Convoy Effect
                </button>
              </div>
            </div>

            {/* Algorithm Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Algorithm</label>
                <select
                  value={cpuAlgo}
                  onChange={(e) => setCpuAlgo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="FCFS">First-Come First-Served (FCFS)</option>
                  <option value="SJF">Shortest Job First (Non-preemptive)</option>
                  <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
                  <option value="Round Robin">Round Robin (RR)</option>
                  <option value="Priority">Priority Scheduling</option>
                </select>
              </div>

              {cpuAlgo.includes('Round') && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Time Quantum (q)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={timeQuantum}
                    onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Process Input Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-700">Process Definitions</span>
                <button
                  onClick={handleAddProcess}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Process
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">PID</th>
                      <th className="p-2.5">Arrival Time</th>
                      <th className="p-2.5">Burst Time</th>
                      <th className="p-2.5">Priority</th>
                      <th className="p-2.5 rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processes.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-mono font-bold text-indigo-900">{p.pid}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={p.arrival_time}
                            onChange={(e) => {
                              const copy = [...processes];
                              copy[idx].arrival_time = parseInt(e.target.value) || 0;
                              setProcesses(copy);
                            }}
                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={1}
                            value={p.burst_time}
                            onChange={(e) => {
                              const copy = [...processes];
                              copy[idx].burst_time = parseInt(e.target.value) || 1;
                              setProcesses(copy);
                            }}
                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={p.priority}
                            onChange={(e) => {
                              const copy = [...processes];
                              copy[idx].priority = parseInt(e.target.value) || 0;
                              setProcesses(copy);
                            }}
                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                          />
                        </td>
                        <td className="p-2">
                          {processes.length > 1 && (
                            <button
                              onClick={() => handleRemoveProcess(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunCpu}
                disabled={cpuLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {cpuLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                RUN SIMULATION
              </button>
            </div>
          </div>

          {/* Results: Gantt Chart & Table */}
          {cpuResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Interactive Gantt Chart
                </h4>

                {/* Visual Gantt Chart Blocks */}
                <div className="w-full bg-slate-100 p-3 rounded-xl border border-slate-200 overflow-x-auto">
                  <div className="flex items-center min-w-[500px]">
                    {cpuResult.gantt_chart.map((block, bIdx) => (
                      <div
                        key={bIdx}
                        className={`h-12 flex flex-col items-center justify-center font-mono font-bold text-xs border-r border-white/40 px-2 first:rounded-l-lg last:rounded-r-lg transition-transform hover:scale-105 shadow-xs ${getProcessColor(block.pid)}`}
                        style={{ flexGrow: Math.max(block.end - block.start, 1) }}
                      >
                        <span>{block.pid}</span>
                        <span className="text-[10px] opacity-80">{block.start} - {block.end}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Execution Statistics Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">Process</th>
                      <th className="p-2.5">Arrival</th>
                      <th className="p-2.5">Burst</th>
                      <th className="p-2.5">Completion</th>
                      <th className="p-2.5">Turnaround Time (TAT)</th>
                      <th className="p-2.5 rounded-r-lg">Waiting Time (WT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cpuResult.process_table.map((row) => (
                      <tr key={row.pid} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold font-mono text-indigo-900">{row.pid}</td>
                        <td className="p-2.5 font-mono">{row.arrival_time}</td>
                        <td className="p-2.5 font-mono">{row.burst_time}</td>
                        <td className="p-2.5 font-mono font-semibold">{row.completion_time}</td>
                        <td className="p-2.5 font-mono text-emerald-700 font-semibold">{row.turnaround_time}</td>
                        <td className="p-2.5 font-mono text-indigo-700 font-semibold">{row.waiting_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Metrics Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">Average Waiting Time</p>
                  <p className="text-xl font-bold text-indigo-700 mt-1">{cpuResult.avg_waiting_time} ms</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">Average Turnaround Time</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{cpuResult.avg_turnaround_time} ms</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">CPU Utilization</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{cpuResult.cpu_utilization}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. BANKER'S ALGORITHM SIMULATOR */}
      {activeSubTab === 'bankers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Banker's Algorithm: Deadlock Avoidance
                </h3>
                <p className="text-xs text-slate-500">
                  Calculates Need Matrix ($Max - Allocation$) and checks if the system can satisfy requests without deadlock
                </p>
              </div>

              <button
                onClick={() => {
                  setBankersData({
                    processes: ["P0", "P1", "P2", "P3", "P4"],
                    resources: ["A", "B", "C"],
                    allocation: [
                      [0, 1, 0],
                      [2, 0, 0],
                      [3, 0, 2],
                      [2, 1, 1],
                      [0, 0, 2]
                    ],
                    max_matrix: [
                      [7, 5, 3],
                      [3, 2, 2],
                      [9, 0, 2],
                      [2, 2, 2],
                      [4, 3, 3]
                    ],
                    available: [3, 3, 2],
                    request_process: "",
                    request_vector: null
                  });
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Reset Standard Matrix
              </button>
            </div>

            {/* Available Vector Display */}
            <div>
              <span className="text-xs font-bold uppercase text-slate-700">Available Vector:</span>
              <div className="flex gap-4 mt-2">
                {bankersData.resources.map((resName, rIdx) => (
                  <div key={resName} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-indigo-900">Resource {resName}:</span>
                    <input
                      type="number"
                      min={0}
                      value={bankersData.available[rIdx]}
                      onChange={(e) => {
                        const copy = [...bankersData.available];
                        copy[rIdx] = parseInt(e.target.value) || 0;
                        setBankersData({ ...bankersData, available: copy });
                      }}
                      className="w-14 px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allocation Matrix */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-700">Allocation Matrix</span>
                <table className="w-full text-xs text-center font-mono">
                  <thead>
                    <tr className="text-slate-500 font-bold">
                      <th>Proc</th>
                      {bankersData.resources.map(r => <th key={r}>{r}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {bankersData.processes.map((p, pIdx) => (
                      <tr key={p}>
                        <td className="font-bold text-slate-800">{p}</td>
                        {bankersData.resources.map((_, rIdx) => (
                          <td key={rIdx} className="p-1">
                            <input
                              type="number"
                              min={0}
                              value={bankersData.allocation[pIdx][rIdx]}
                              onChange={(e) => {
                                const copy = bankersData.allocation.map(row => [...row]);
                                copy[pIdx][rIdx] = parseInt(e.target.value) || 0;
                                setBankersData({ ...bankersData, allocation: copy });
                              }}
                              className="w-12 text-center p-1 bg-white border border-slate-200 rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Max Matrix */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-700">Max Matrix</span>
                <table className="w-full text-xs text-center font-mono">
                  <thead>
                    <tr className="text-slate-500 font-bold">
                      <th>Proc</th>
                      {bankersData.resources.map(r => <th key={r}>{r}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {bankersData.processes.map((p, pIdx) => (
                      <tr key={p}>
                        <td className="font-bold text-slate-800">{p}</td>
                        {bankersData.resources.map((_, rIdx) => (
                          <td key={rIdx} className="p-1">
                            <input
                              type="number"
                              min={0}
                              value={bankersData.max_matrix[pIdx][rIdx]}
                              onChange={(e) => {
                                const copy = bankersData.max_matrix.map(row => [...row]);
                                copy[pIdx][rIdx] = parseInt(e.target.value) || 0;
                                setBankersData({ ...bankersData, max_matrix: copy });
                              }}
                              className="w-12 text-center p-1 bg-white border border-slate-200 rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunBankers}
                disabled={bankersLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {bankersLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                RUN SAFETY ALGORITHM
              </button>
            </div>
          </div>

          {/* Banker's Results */}
          {bankersResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Safety Algorithm Evaluation
                </h4>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  bankersResult.is_safe 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {bankersResult.is_safe ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {bankersResult.is_safe ? 'SYSTEM IS IN A SAFE STATE' : 'DEADLOCK DETECTED / UNSAFE'}
                </span>
              </div>

              {/* Safe Sequence Display */}
              {bankersResult.is_safe && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-900 uppercase">Safe Execution Sequence:</span>
                  <div className="flex items-center gap-2 pt-1 font-mono font-bold text-base text-emerald-800">
                    {bankersResult.safe_sequence.map((p, idx) => (
                      <React.Fragment key={p}>
                        <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-300 shadow-xs">{p}</span>
                        {idx < bankersResult.safe_sequence.length - 1 && <span className="text-emerald-500">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Trace */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-700">Execution Trace:</span>
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                  {bankersResult.trace.map((tr, i) => (
                    <div key={i}>{tr}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PAGE REPLACEMENT SIMULATOR */}
      {activeSubTab === 'paging' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Virtual Memory Page Replacement Simulator
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate FIFO, LRU, and Optimal page replacement algorithms step-by-step
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRefString("1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5");
                    setPageAlgo("FIFO");
                    setFramesCount(3);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Belady's Anomaly Test
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Algorithm</label>
                <select
                  value={pageAlgo}
                  onChange={(e) => setPageAlgo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="FIFO">First-In First-Out (FIFO)</option>
                  <option value="LRU">Least Recently Used (LRU)</option>
                  <option value="Optimal">Optimal (OPT / MIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Number of Frames</label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={framesCount}
                  onChange={(e) => setFramesCount(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Page Reference String</label>
                <input
                  type="text"
                  value={refString}
                  onChange={(e) => setRefString(e.target.value)}
                  placeholder="e.g. 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunPaging}
                disabled={pagingLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {pagingLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                SIMULATE PAGE REPLACEMENT
              </button>
            </div>
          </div>

          {/* Page Replacement Results */}
          {pagingResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Step-by-Step Frame Matrix Allocation ({pagingResult.algorithm})
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> HIT
                  </span>
                  <span className="flex items-center gap-1 font-bold text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> PAGE FAULT
                  </span>
                </div>
              </div>

              {/* Step Grid Table */}
              <div className="overflow-x-auto pb-2">
                <table className="text-xs text-center border-collapse min-w-full font-mono">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                      <th className="p-2 border-r border-slate-200 text-left">Ref</th>
                      {pagingResult.steps.map((st, i) => (
                        <th key={i} className="p-2 min-w-[36px] bg-slate-200/60 border-r border-slate-200">
                          {st.page}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Frame rows */}
                    {Array.from({ length: framesCount }).map((_, fIdx) => (
                      <tr key={fIdx} className="border-b border-slate-100">
                        <td className="p-2 font-bold text-slate-500 border-r border-slate-200 text-left">
                          Slot {fIdx + 1}
                        </td>
                        {pagingResult.steps.map((st, sIdx) => {
                          const val = st.frames[fIdx];
                          return (
                            <td key={sIdx} className="p-2 border-r border-slate-100 font-bold">
                              {val !== null && val !== undefined ? val : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Status row */}
                    <tr className="bg-slate-50/80 font-bold">
                      <td className="p-2 border-r border-slate-200 text-left">Result</td>
                      {pagingResult.steps.map((st, sIdx) => (
                        <td key={sIdx} className="p-1 border-r border-slate-100">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                            st.status === 'HIT' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {st.status === 'HIT' ? 'HIT' : 'F'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Metrics Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-semibold">Total Page Faults</p>
                  <p className="text-xl font-bold text-rose-600 mt-0.5">{pagingResult.faults}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-semibold">Total Page Hits</p>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">{pagingResult.hits}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-semibold">Hit Ratio</p>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">{pagingResult.hit_ratio}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-semibold">Fault Ratio</p>
                  <p className="text-xl font-bold text-slate-800 mt-0.5">{pagingResult.fault_ratio}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
