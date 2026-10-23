const API_BASE = 'http://127.0.0.1:8000/api/v1';

async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    let detail = `Error ${res.status}: ${res.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      detail = parsed.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  // Users
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/users`);
    return handleResponse(res);
  },
  createUser: async (name, email) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    return handleResponse(res);
  },

  // Dashboard
  getDashboard: async (userId = 1) => {
    const res = await fetch(`${API_BASE}/dashboard/${userId}`);
    return handleResponse(res);
  },

  // Ask OS (RAG Chat)
  askQuestion: async (question, userId = 1) => {
    const res = await fetch(`${API_BASE}/chat/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, user_id: userId }),
    });
    return handleResponse(res);
  },
  getChatHistory: async (userId = 1) => {
    const res = await fetch(`${API_BASE}/chat/history?user_id=${userId}`);
    return handleResponse(res);
  },

  // Exam Mode
  getQuizTopics: async () => {
    const res = await fetch(`${API_BASE}/quiz/topics`);
    return handleResponse(res);
  },
  generateQuiz: async (topic, difficulty = 'Medium', num_questions = 5) => {
    const res = await fetch(`${API_BASE}/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty, num_questions }),
    });
    return handleResponse(res);
  },
  submitQuiz: async (topic, answers, userId = 1) => {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, answers, user_id: userId }),
    });
    return handleResponse(res);
  },

  // AI Viva
  startViva: async (topic, userId = 1) => {
    const res = await fetch(`${API_BASE}/viva/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, user_id: userId }),
    });
    return handleResponse(res);
  },
  respondViva: async (sessionId, topic, studentAnswer, conversationHistory, userId = 1) => {
    const res = await fetch(`${API_BASE}/viva/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        topic,
        student_answer: studentAnswer,
        conversation_history: conversationHistory,
        user_id: userId,
      }),
    });
    return handleResponse(res);
  },

  // Lab Simulators
  runCPUScheduling: async (algorithm, processes, timeQuantum = 2) => {
    const res = await fetch(`${API_BASE}/lab/cpu-scheduling`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        algorithm,
        processes,
        time_quantum: timeQuantum,
      }),
    });
    return handleResponse(res);
  },
  runBankers: async (data) => {
    const res = await fetch(`${API_BASE}/lab/bankers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  runPageReplacement: async (algorithm, referenceString, framesCount = 3) => {
    const res = await fetch(`${API_BASE}/lab/page-replacement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        algorithm,
        reference_string: referenceString,
        frames_count: framesCount,
      }),
    });
    return handleResponse(res);
  },

  // Knowledge Base Documents
  getDocuments: async () => {
    const res = await fetch(`${API_BASE}/documents`);
    return handleResponse(res);
  },
};
