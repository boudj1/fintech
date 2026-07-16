/* ===== FinFlow Real API Service ===== */

const BASE     = '/api';
const CHAT_URL = '/chatbot/api/chatbot';

const token    = ()  => localStorage.getItem('accessToken');
const authHdr  = ()  => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` });
const handle   = async (r) => { if (!r.ok) throw await r.json().catch(() => ({ message: r.statusText })); return r.json(); };

/* ── Mapping helpers ─────────────────────────────────────────── */
const STATUS_MAP  = { OPEN:'pending', IN_PROGRESS:'pending', RESOLVED:'completed', ESCALATED:'failed', CLOSED:'completed' };
const CHANNEL_ICN = { WEB:'fa-globe', EMAIL:'fa-envelope', PHONE:'fa-phone', CHAT:'fa-comment', WEB_CHAT:'fa-comments' };
const pseudo = (id) => parseFloat(((id * 137.43 % 9800) + 50).toFixed(2));

function toTransaction(c) {
  return {
    id:          `TXN-${String(c.id).padStart(5,'0')}`,
    type:        c.status === 'RESOLVED' ? 'income' : 'transfer',
    description: c.subject || 'Support Request',
    recipient:   c.assignedAgentName || c.customerName || 'Support Team',
    amount:      c.status === 'RESOLVED' ? pseudo(c.id) : -pseudo(c.id),
    status:      STATUS_MAP[c.status] || 'pending',
    date:        new Date(c.createdAt),
    icon:        CHANNEL_ICN[c.channel] || 'fa-file-alt',
    raw:         c
  };
}

/* ── Auth ────────────────────────────────────────────────────── */
const API = {
  currentUser: null,

  async login(username, password) {
    const d = await handle(await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }));
    localStorage.setItem('accessToken',  d.accessToken);
    localStorage.setItem('refreshToken', d.refreshToken);
    localStorage.setItem('user', JSON.stringify(d.user));
    API.currentUser = d.user;
    return d;
  },

  async register(data) {
    const d = await handle(await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }));
    localStorage.setItem('accessToken',  d.accessToken);
    localStorage.setItem('refreshToken', d.refreshToken);
    localStorage.setItem('user', JSON.stringify(d.user));
    API.currentUser = d.user;
    return d;
  },

  async logout() {
    try { await fetch(`${BASE}/auth/logout`, { method:'POST', headers: authHdr() }); } catch {}
    localStorage.clear();
    API.currentUser = null;
  },

  loadUser() {
    try { API.currentUser = JSON.parse(localStorage.getItem('user')); } catch {}
    return API.currentUser;
  },

  isLoggedIn: () => !!token(),

  /* ── Stats → Balance ──────────────────────────────────────── */
  async getBalance() {
    const s = await handle(await fetch(`${BASE}/conversations/stats`, { headers: authHdr() }));
    return {
      total:     parseFloat((s.total   * 1024.55 + 5280.00).toFixed(2)),
      available: parseFloat((s.resolved * 1024.55 + 3200.00).toFixed(2)),
      pending:   parseFloat((s.open    * 512.00  +  780.00).toFixed(2)),
      monthly:   parseFloat((s.inProgress * 256.00 + 1200.00).toFixed(2)),
      stats:     s
    };
  },

  /* ── Conversations → Transactions ─────────────────────────── */
  async getTransactions(page = 0, size = 20) {
    const d = await handle(await fetch(`${BASE}/conversations?page=${page}&size=${size}`, { headers: authHdr() }));
    return (d.content || []).map(toTransaction);
  },

  async searchTransactions(query) {
    const all = await API.getTransactions(0, 100);
    const q   = query.toLowerCase();
    return all.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.recipient.toLowerCase().includes(q)
    );
  },

  /* ── Create Conversation → "Send Money" ───────────────────── */
  async initiateTransfer({ recipient, amount, description }) {
    const d = await handle(await fetch(`${BASE}/conversations`, {
      method:  'POST',
      headers: authHdr(),
      body:    JSON.stringify({
        subject:        description || `Transfer of $${amount}`,
        channel:        'WEB',
        initialMessage: `Transfer request to ${recipient} for $${amount}`
      })
    }));
    return { success: true, transferId: `TR-${d.id}`, conversation: d };
  },

  /* ── Notifications ────────────────────────────────────────── */
  async getNotifications() {
    const txns = await API.getTransactions(0, 10);
    return txns.map((t, i) => ({
      id:        i + 1,
      type:      t.status === 'completed' ? 'success' : t.status === 'failed' ? 'error' : 'info',
      title:     t.status === 'completed' ? 'Request Resolved' : t.status === 'pending' ? 'Request Pending' : 'Request Update',
      message:   `${t.description} — ${t.status}`,
      timestamp: t.date,
      read:      t.status === 'completed'
    }));
  },

  /* ── User Profile ─────────────────────────────────────────── */
  async getUserProfile() {
    return API.currentUser || JSON.parse(localStorage.getItem('user') || '{}');
  },

  async changePassword(currentPassword, newPassword) {
    return handle(await fetch(`${BASE}/auth/change-password`, {
      method:  'POST',
      headers: authHdr(),
      body:    JSON.stringify({ currentPassword, newPassword })
    }));
  },

  /* ── AI Chatbot ───────────────────────────────────────────── */
  _chatSession: null,
  async sendChatMessage(message) {
    const body = { message };
    if (API._chatSession) body.session_id = API._chatSession;
    const d = await handle(await fetch(`${CHAT_URL}/message`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    }));
    API._chatSession = d.session_id;
    return d;
  }
};
