/* ===== FinFlow Application ===== */

class FinFlowApp {
  constructor() {
    this.page          = 'dashboard';
    this.isDark        = localStorage.getItem('ff-theme') === 'dark';
    this.transactions  = [];
    this.notifications = [];
    this.balance       = null;
    this.chatMessages  = [];
    this.chatOpen      = false;
    this.chatSession   = null;
    this.unreadNotif   = 0;
    this.transfer      = { step: 1 };
    this.authMode      = 'login';   // 'login' | 'register'
    this.authError     = '';
    this.authLoading   = false;
  }

  /* ── Bootstrap ─────────────────────────────────────────────── */
  async init() {
    API.loadUser();
    this.applyTheme();
    if (!API.isLoggedIn()) { this.renderAuth(); return; }
    this.render();
    await this.loadData();
  }

  async loadData() {
    try {
      const [bal, txns, notifs] = await Promise.all([
        API.getBalance(),
        API.getTransactions(0, 20),
        API.getNotifications()
      ]);
      this.balance       = bal;
      this.transactions  = txns;
      this.notifications = notifs;
      this.unreadNotif   = notifs.filter(n => !n.read).length;
      this.render();
    } catch (e) {
      if (e.status === 401) { API.logout(); this.renderAuth(); }
    }
  }

  /* ── Theme ─────────────────────────────────────────────────── */
  applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDark);
    localStorage.setItem('ff-theme', this.isDark ? 'dark' : 'light');
  }
  toggleTheme() { this.isDark = !this.isDark; this.applyTheme(); this.render(); }

  /* ── Auth Screens ──────────────────────────────────────────── */
  renderAuth() {
    document.getElementById('app').innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-brand">
            <i class="fas fa-wallet"></i>
            <span>FinFlow</span>
          </div>
          ${this.authMode === 'login' ? this.getLoginForm() : this.getRegisterForm()}
        </div>
      </div>`;
    this.bindAuth();
  }

  getLoginForm() {
    return `
      <h2>Welcome back</h2>
      <p class="auth-sub">Sign in to your account</p>
      ${this.authError ? `<div class="auth-alert"><i class="fas fa-exclamation-circle"></i> ${this.authError}</div>` : ''}
      <form id="auth-form">
        <div class="form-group">
          <label>Username</label>
          <div class="input-icon-wrap">
            <i class="fas fa-user"></i>
            <input id="auth-username" type="text" placeholder="Enter username" required>
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-icon-wrap">
            <i class="fas fa-lock"></i>
            <input id="auth-password" type="password" placeholder="Enter password" required>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block btn-lg ${this.authLoading?'loading':''}">
          ${this.authLoading ? '<i class="fas fa-spinner fa-spin"></i> Signing in…' : '<i class="fas fa-sign-in-alt"></i> Sign In'}
        </button>
      </form>
      <p class="auth-footer">Don't have an account? <a href="#" id="auth-switch">Create one</a></p>`;
  }

  getRegisterForm() {
    return `
      <h2>Create account</h2>
      <p class="auth-sub">Join FinFlow today</p>
      ${this.authError ? `<div class="auth-alert"><i class="fas fa-exclamation-circle"></i> ${this.authError}</div>` : ''}
      <form id="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input id="reg-fn" type="text" placeholder="John" required>
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input id="reg-ln" type="text" placeholder="Doe" required>
          </div>
        </div>
        <div class="form-group">
          <label>Username</label>
          <div class="input-icon-wrap">
            <i class="fas fa-user"></i>
            <input id="reg-username" type="text" placeholder="johndoe" required>
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <div class="input-icon-wrap">
            <i class="fas fa-envelope"></i>
            <input id="reg-email" type="email" placeholder="john@example.com" required>
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-icon-wrap">
            <i class="fas fa-lock"></i>
            <input id="reg-password" type="password" placeholder="Min. 8 characters" minlength="8" required>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block btn-lg ${this.authLoading?'loading':''}">
          ${this.authLoading ? '<i class="fas fa-spinner fa-spin"></i> Creating…' : '<i class="fas fa-user-plus"></i> Create Account'}
        </button>
      </form>
      <p class="auth-footer">Already have an account? <a href="#" id="auth-switch">Sign in</a></p>`;
  }

  bindAuth() {
    document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.authError = ''; this.authLoading = true; this.renderAuth();
      try {
        if (this.authMode === 'login') {
          await API.login(
            document.getElementById('auth-username')?.value,
            document.getElementById('auth-password')?.value
          );
        } else {
          await API.register({
            firstName: document.getElementById('reg-fn')?.value,
            lastName:  document.getElementById('reg-ln')?.value,
            username:  document.getElementById('reg-username')?.value,
            email:     document.getElementById('reg-email')?.value,
            password:  document.getElementById('reg-password')?.value
          });
        }
        this.authLoading = false;
        this.render();
        await this.loadData();
      } catch (err) {
        this.authLoading = false;
        this.authError   = err.message || 'Authentication failed. Please try again.';
        this.renderAuth();
      }
    });
    document.getElementById('auth-switch')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.authMode = this.authMode === 'login' ? 'register' : 'login';
      this.authError = '';
      this.renderAuth();
    });
  }

  /* ── Main SPA Render ───────────────────────────────────────── */
  render() {
    if (!API.isLoggedIn()) { this.renderAuth(); return; }
    const app = document.getElementById('app');
    app.innerHTML = this.getNavbar() + `<div class="main-content">${this.getPage()}</div>` + this.getChatbot();
    this.bindEvents();
  }

  getNavbar() {
    const a = (p) => `nav-link ${this.page === p ? 'active' : ''}`;
    const u = API.currentUser;
    const initials = u ? `${u.firstName?.[0]||''}${u.lastName?.[0]||''}`.toUpperCase() || u.username?.[0]?.toUpperCase() : 'U';
    return `
      <nav class="navbar">
        <div class="navbar-brand"><i class="fas fa-wallet"></i> FinFlow</div>
        <div class="navbar-center">
          <span class="${a('dashboard')}"  data-page="dashboard"><i class="fas fa-home"></i> Dashboard</span>
          <span class="${a('transfer')}"   data-page="transfer"><i class="fas fa-paper-plane"></i> Send Money</span>
          <span class="${a('transactions')}" data-page="transactions"><i class="fas fa-history"></i> Transactions</span>
          <span class="${a('notifications')}" data-page="notifications">
            <i class="fas fa-bell"></i> Notifications
            ${this.unreadNotif > 0 ? `<span class="badge-count">${this.unreadNotif}</span>` : ''}
          </span>
        </div>
        <div class="navbar-end">
          <button class="theme-toggle" title="Toggle theme"><i class="fas fa-${this.isDark?'sun':'moon'}"></i></button>
          <div class="chatbot-icon" title="AI Assistant"><i class="fas fa-robot"></i></div>
          <div class="user-menu" data-page="profile">
            <div class="user-avatar">${initials}</div>
            <span>${u?.firstName || u?.username || 'User'}</span>
          </div>
          <button class="logout-btn" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </nav>`;
  }

  getPage() {
    switch (this.page) {
      case 'dashboard':    return this.getDashboard();
      case 'transfer':     return this.getTransferPage();
      case 'transactions': return this.getTransactionsPage();
      case 'notifications':return this.getNotificationsPage();
      case 'profile':      return this.getProfilePage();
      case 'settings':     return this.getSettingsPage();
      default:             return this.getDashboard();
    }
  }

  /* ── Dashboard ─────────────────────────────────────────────── */
  getDashboard() {
    const b = this.balance;
    const stats = b?.stats;
    return `
      <div class="dashboard">
        <div class="balance-card">
          <div class="balance-header">
            <h3>Total Balance</h3>
            <span class="balance-trend"><i class="fas fa-arrow-up"></i> +2.4% this month</span>
          </div>
          <div class="balance-amount">
            $${b ? b.total.toLocaleString('en',{minimumFractionDigits:2}) : '···'}
          </div>
          <div class="balance-info">
            <div class="balance-info-item">
              <span>Available</span>
              <strong>$${b ? b.available.toLocaleString('en',{minimumFractionDigits:2}) : '···'}</strong>
            </div>
            <div class="balance-info-item">
              <span>Pending</span>
              <strong>$${b ? b.pending.toLocaleString('en',{minimumFractionDigits:2}) : '···'}</strong>
            </div>
            <div class="balance-info-item">
              <span>This Month</span>
              <strong>+$${b ? b.monthly.toLocaleString('en',{minimumFractionDigits:2}) : '···'}</strong>
            </div>
          </div>
        </div>

        ${stats ? `
        <div class="stats-row">
          <div class="stat-tile open"><i class="fas fa-folder-open"></i><div><div class="sv">${stats.open}</div><div class="sl">Open</div></div></div>
          <div class="stat-tile prog"><i class="fas fa-spinner"></i><div><div class="sv">${stats.inProgress}</div><div class="sl">In Progress</div></div></div>
          <div class="stat-tile done"><i class="fas fa-check-circle"></i><div><div class="sv">${stats.resolved}</div><div class="sl">Resolved</div></div></div>
          <div class="stat-tile esc"><i class="fas fa-exclamation-triangle"></i><div><div class="sv">${stats.escalated}</div><div class="sl">Escalated</div></div></div>
        </div>` : ''}

        <div>
          <h3 style="margin-bottom:1.25rem">Quick Actions</h3>
          <div class="quick-actions">
            <div class="action-btn" data-page="transfer"><i class="fas fa-paper-plane"></i><span>Send Money</span></div>
            <div class="action-btn"><i class="fas fa-arrow-down"></i><span>Receive Money</span></div>
            <div class="action-btn"><i class="fas fa-exchange-alt"></i><span>Transfer Funds</span></div>
            <div class="action-btn" data-page="transactions"><i class="fas fa-history"></i><span>History</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Recent Transactions</h3>
            <button class="card-header-action" data-page="transactions">View All</button>
          </div>
          ${this.renderTransactionList(this.transactions.slice(0,5))}
        </div>
      </div>`;
  }

  renderTransactionList(txns) {
    if (!txns.length) return '<p class="empty-msg">No transactions yet.</p>';
    return txns.map(t => `
      <div class="transaction-item">
        <div class="transaction-left">
          <div class="transaction-icon"><i class="fas ${t.icon}"></i></div>
          <div class="transaction-details">
            <h4>${t.description}</h4>
            <p>${t.recipient} · ${this.fmtDate(t.date)}</p>
          </div>
        </div>
        <div class="transaction-right">
          <div class="transaction-amount ${t.amount>0?'positive':'negative'}">
            ${t.amount>0?'+':''}$${Math.abs(t.amount).toFixed(2)}
          </div>
          <span class="transaction-status ${t.status}">${t.status}</span>
        </div>
      </div>`).join('');
  }

  /* ── Transfer Page ─────────────────────────────────────────── */
  getTransferPage() {
    if (this.transfer.step === 2) return this.getTransferConfirm();
    if (this.transfer.step === 3) return this.getTransferSuccess();
    return `
      <div class="card" style="max-width:580px;margin:0 auto">
        <div class="card-header"><h2>Send Money</h2></div>
        <form id="transfer-form">
          <div class="form-group">
            <label>Recipient Type</label>
            <select id="rec-type">
              <option value="email">Email Address</option>
              <option value="phone">Phone Number</option>
              <option value="account">Account Number</option>
            </select>
          </div>
          <div class="form-group">
            <label>Recipient</label>
            <input type="text" id="rec-input" placeholder="Enter email, phone or account number" required>
          </div>
          <div class="form-group">
            <label>Amount ($)</label>
            <input type="number" id="amount-input" placeholder="0.00" step="0.01" min="1" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="desc-input" placeholder="Add a note (optional)" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">
            <i class="fas fa-arrow-right"></i> Continue
          </button>
        </form>
      </div>`;
  }

  getTransferConfirm() {
    const t = this.transfer;
    return `
      <div class="card" style="max-width:480px;margin:0 auto">
        <div class="card-header"><h2>Confirm Transfer</h2></div>
        <div class="confirm-details">
          <div class="confirm-row"><span>Recipient</span><strong>${t.recipient}</strong></div>
          <div class="confirm-row"><span>Amount</span><strong class="amount-big">$${parseFloat(t.amount).toFixed(2)}</strong></div>
          ${t.description ? `<div class="confirm-row"><span>Description</span><strong>${t.description}</strong></div>` : ''}
          <div class="confirm-warn"><i class="fas fa-info-circle"></i> Please verify recipient details before proceeding.</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-secondary" id="btn-cancel-transfer">Cancel</button>
          <button class="btn btn-primary" id="btn-confirm-transfer">
            <i class="fas fa-check"></i> Confirm
          </button>
        </div>
      </div>`;
  }

  getTransferSuccess() {
    return `
      <div class="card success-card" style="max-width:480px;margin:0 auto;text-align:center">
        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
        <h2>Transfer Initiated!</h2>
        <p>Your transfer of <strong>$${parseFloat(this.transfer.amount).toFixed(2)}</strong> to <strong>${this.transfer.recipient}</strong> has been submitted.</p>
        <p style="margin-top:.5rem;color:var(--text-secondary);font-size:.88rem">Reference: <code>${this.transfer.ref || 'N/A'}</code></p>
        <div class="btn-row" style="justify-content:center;margin-top:1.5rem">
          <button class="btn btn-primary" data-page="dashboard">Back to Dashboard</button>
          <button class="btn btn-secondary" data-page="transactions">View Transactions</button>
        </div>
      </div>`;
  }

  /* ── Transactions Page ─────────────────────────────────────── */
  getTransactionsPage() {
    return `
      <div>
        <h2>Transaction History</h2>
        <div class="search-bar">
          <div class="search-input">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search transactions…" id="search-input">
          </div>
          <div class="filter-group">
            <select id="filter-status">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button class="btn btn-secondary" id="btn-export">
              <i class="fas fa-download"></i> Export CSV
            </button>
          </div>
        </div>
        <div class="card">
          <div id="txn-list">${this.renderTransactionList(this.transactions)}</div>
        </div>
      </div>`;
  }

  /* ── Notifications Page ────────────────────────────────────── */
  getNotificationsPage() {
    const icons = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-circle', info:'fa-info-circle' };
    const notifs = this.notifications.map(n => `
      <div class="notification ${n.type} ${n.read?'':'unread'}">
        <div class="notification-icon"><i class="fas ${icons[n.type]||'fa-bell'}"></i></div>
        <div class="notification-content">
          <h4>${n.title}</h4>
          <p>${n.message}</p>
        </div>
        <span class="notif-time">${this.fmtTime(n.timestamp)}</span>
      </div>`).join('');
    return `
      <div>
        <h2>Notifications</h2>
        <div id="notif-container">
          ${notifs || '<p class="empty-msg">No notifications yet.</p>'}
        </div>
      </div>`;
  }

  /* ── Profile Page ──────────────────────────────────────────── */
  getProfilePage() {
    const u = API.currentUser || {};
    const initials = `${u.firstName?.[0]||''}${u.lastName?.[0]||''}`.toUpperCase() || u.username?.[0]?.toUpperCase() || 'U';
    return `
      <div style="max-width:600px;margin:0 auto">
        <h2>Profile Settings</h2>
        <div class="card">
          <div style="text-align:center;margin-bottom:2rem">
            <div class="user-avatar" style="width:72px;height:72px;font-size:1.7rem;margin:0 auto 1rem">${initials}</div>
            <h3>${u.firstName} ${u.lastName}</h3>
            <p>${u.email || ''}</p>
            <span class="role-pill">${u.role || 'AGENT'}</span>
          </div>
          <form id="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input type="text" value="${u.firstName||''}" id="pf-fn">
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" value="${u.lastName||''}" id="pf-ln">
              </div>
            </div>
            <div class="form-group">
              <label>Username</label>
              <input type="text" value="${u.username||''}" disabled>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" value="${u.email||''}" disabled>
            </div>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </form>
        </div>
        <div class="card" style="margin-top:1.25rem">
          <div class="card-header"><h3>Change Password</h3></div>
          <form id="pwd-form">
            <div class="form-group"><label>Current Password</label><input type="password" id="pwd-cur" placeholder="Current password"></div>
            <div class="form-group"><label>New Password</label><input type="password" id="pwd-new" placeholder="Min. 8 characters" minlength="8"></div>
            <div class="form-group"><label>Confirm New</label><input type="password" id="pwd-cf" placeholder="Repeat new password"></div>
            <div id="pwd-msg" style="display:none" class="auth-alert"></div>
            <button type="submit" class="btn btn-secondary"><i class="fas fa-key"></i> Change Password</button>
          </form>
        </div>
      </div>`;
  }

  /* ── Settings Page ─────────────────────────────────────────── */
  getSettingsPage() {
    return `
      <div style="max-width:600px;margin:0 auto">
        <h2>Settings</h2>
        <div class="card">
          <div class="card-header"><h3>Preferences</h3></div>
          <div class="setting-row">
            <label>Dark Mode</label>
            <button class="btn btn-secondary btn-sm theme-toggle">
              <i class="fas fa-${this.isDark?'sun':'moon'}"></i> ${this.isDark?'Light':'Dark'}
            </button>
          </div>
          <div class="setting-row">
            <label>Email Notifications</label>
            <input type="checkbox" checked class="toggle-cb">
          </div>
          <div class="setting-row">
            <label>Push Notifications</label>
            <input type="checkbox" checked class="toggle-cb">
          </div>
        </div>
        <div class="card" style="margin-top:1.25rem">
          <div class="card-header"><h3>About</h3></div>
          <div style="padding:.5rem 0">
            <p><strong>FinFlow v2.0.0</strong></p>
            <p style="margin-top:.5rem">Enterprise Digital Wallet — Powered by AI</p>
            <button class="btn btn-danger btn-block" style="margin-top:1.25rem" id="btn-logout">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ── Chatbot (Aria) ────────────────────────────────────────── */
  getChatbot() {
    if (!this.chatOpen) return `
      <div class="chatbot-launcher">
        <button class="chatbot-fab" id="btn-chat-open">
          <i class="fas fa-comments"></i>
          <span class="chatbot-badge">1</span>
        </button>
      </div>`;

    const msgs = this.chatMessages.length
      ? this.chatMessages.map(m => `
          <div class="message ${m.role}">
            <div class="message-bubble">${m.text.replace(/\n/g,'<br>')}</div>
            <span class="msg-time">${m.time}</span>
          </div>`).join('')
      : `<div class="message bot"><div class="message-bubble">Hi! I'm Aria, your FinFlow AI assistant. 👋<br>How can I help you today?</div></div>`;

    return `
      <div class="chatbot-launcher">
        <div class="chatbot-window">
          <div class="chatbot-header">
            <div class="chatbot-header-info">
              <div class="chatbot-avatar">A</div>
              <div class="chatbot-header-text"><h3>Aria</h3><p>AI Banking Assistant · Online</p></div>
            </div>
            <button class="chatbot-close" id="btn-chat-close"><i class="fas fa-chevron-down"></i></button>
          </div>
          <div class="chatbot-messages" id="chat-msgs">${msgs}</div>
          <div class="quick-replies" id="chat-quick">
            <button class="quick-reply-btn">Check my balance</button>
            <button class="quick-reply-btn">Recent transactions</button>
            <button class="quick-reply-btn">Send money</button>
            <button class="quick-reply-btn">Help</button>
          </div>
          <div class="chatbot-input">
            <input type="text" id="chat-input" placeholder="Message Aria…" autocomplete="off">
            <button id="btn-chat-send"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>`;
  }

  scrollChat() {
    const el = document.getElementById('chat-msgs');
    if (el) el.scrollTop = el.scrollHeight;
  }

  async sendChatMsg(text) {
    if (!text?.trim()) return;
    const time = new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    this.chatMessages.push({ role:'user', text: text.trim(), time });
    this.render();
    this.scrollChat();
    try {
      const r = await API.sendChatMessage(text.trim());
      this.chatMessages.push({ role:'bot', text: r.response, time: new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) });
    } catch {
      this.chatMessages.push({ role:'bot', text: "I'm having trouble connecting. Please try again shortly.", time });
    }
    this.render();
    this.scrollChat();
  }

  /* ── Event Binding ─────────────────────────────────────────── */
  bindEvents() {
    // Nav
    document.querySelectorAll('[data-page]').forEach(el =>
      el.addEventListener('click', () => { this.page = el.dataset.page; this.render(); }));

    // Theme
    document.querySelectorAll('.theme-toggle').forEach(el =>
      el.addEventListener('click', () => this.toggleTheme()));

    // Logout
    document.querySelectorAll('.logout-btn, #btn-logout').forEach(el =>
      el.addEventListener('click', async () => { await API.logout(); this.page='dashboard'; this.renderAuth(); }));

    // Chat open/close
    document.getElementById('btn-chat-open')?.addEventListener('click', () => { this.chatOpen = true; this.render(); this.scrollChat(); });
    document.getElementById('btn-chat-close')?.addEventListener('click', () => { this.chatOpen = false; this.render(); });
    document.getElementById('btn-chat-send')?.addEventListener('click', () => {
      const el = document.getElementById('chat-input');
      if (el) { this.sendChatMsg(el.value); el.value = ''; }
    });
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { this.sendChatMsg(e.target.value); e.target.value = ''; }
    });
    document.querySelectorAll('.quick-reply-btn').forEach(b =>
      b.addEventListener('click', () => this.sendChatMsg(b.textContent)));

    // Transfer form
    document.getElementById('transfer-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.transfer = {
        step: 2,
        recipient:   document.getElementById('rec-input')?.value,
        amount:      document.getElementById('amount-input')?.value,
        description: document.getElementById('desc-input')?.value
      };
      this.render();
    });
    document.getElementById('btn-cancel-transfer')?.addEventListener('click', () => {
      this.transfer = { step: 1 }; this.render();
    });
    document.getElementById('btn-confirm-transfer')?.addEventListener('click', async () => {
      try {
        const r = await API.initiateTransfer(this.transfer);
        this.transfer.step = 3;
        this.transfer.ref  = r.transferId;
        this.render();
      } catch { alert('Transfer failed. Please try again.'); }
    });

    // Search/filter transactions
    document.getElementById('search-input')?.addEventListener('input', (e) => this.filterTxns(e.target.value));
    document.getElementById('filter-status')?.addEventListener('change', (e) => this.filterTxns('', e.target.value));
    document.getElementById('btn-export')?.addEventListener('click', () => this.exportCsv());

    // Profile
    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault(); alert('Profile saved!');
    });
    document.getElementById('pwd-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cur = document.getElementById('pwd-cur')?.value;
      const nw  = document.getElementById('pwd-new')?.value;
      const cf  = document.getElementById('pwd-cf')?.value;
      const msg = document.getElementById('pwd-msg');
      if (nw !== cf) { if(msg){msg.style.display='block'; msg.textContent='Passwords do not match.';} return; }
      try {
        await API.changePassword(cur, nw);
        if(msg){msg.style.display='block'; msg.textContent='Password changed successfully!'; msg.className='auth-alert success';}
      } catch {
        if(msg){msg.style.display='block'; msg.textContent='Current password is incorrect.'; msg.className='auth-alert';}
      }
    });
  }

  filterTxns(query = '', status = '') {
    const q = query.toLowerCase();
    const filtered = this.transactions.filter(t =>
      (!q || t.description.toLowerCase().includes(q) || t.recipient.toLowerCase().includes(q)) &&
      (!status || t.status === status)
    );
    const el = document.getElementById('txn-list');
    if (el) el.innerHTML = this.renderTransactionList(filtered);
  }

  exportCsv() {
    let csv = 'ID,Date,Description,Recipient,Amount,Status\n';
    this.transactions.forEach(t =>
      csv += `"${t.id}","${this.fmtDate(t.date)}","${t.description}","${t.recipient}","${t.amount}","${t.status}"\n`
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
    a.download = 'finflow-transactions.csv'; a.click();
  }

  /* ── Utilities ─────────────────────────────────────────────── */
  fmtDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  }
  fmtTime(d) {
    const diff = Date.now() - new Date(d);
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), day = Math.floor(diff/86400000);
    if (m<1) return 'Just now';
    if (m<60) return `${m}m ago`;
    if (h<24) return `${h}h ago`;
    if (day<7) return `${day}d ago`;
    return this.fmtDate(d);
  }
}

/* ── Bootstrap ─────────────────────────────────────────────────── */
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new FinFlowApp();
  app.init();
});
