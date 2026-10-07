/**
 * chatbot.js — Mehran AI Portfolio Assistant Widget (V0)
 * Self-contained, lightweight vanilla JS chat widget matching portfolio theme.
 * Includes built-in Markdown rendering for structured, recruiter-ready answers.
 */

(function () {
  'use strict';

  // Configurable backend URL
  // In local dev (localhost/127.0.0.1), connects to http://localhost:8000
  // In production (GitHub Pages), connects to your deployed backend URL
  const PRODUCTION_BACKEND_URL = window.MEHRAN_AI_BACKEND_URL || "https://mehran-ai-backend.onrender.com";
  const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BACKEND_URL = IS_LOCAL ? "http://localhost:8000" : PRODUCTION_BACKEND_URL;

  // 4 Suggested Questions for recruiters & visitors
  const SUGGESTED_QUESTIONS = [
    "What does Mehran know about SOC?",
    "Tell me about his Wazuh project.",
    "What tools does he use?",
    "What is his career goal?"
  ];

  // Built-in Markdown Formatter
  function renderMarkdown(rawText) {
    if (!rawText) return '';

    // If marked.js is loaded on page, use it
    if (typeof window.marked !== 'undefined' && typeof window.marked.parse === 'function') {
      try {
        return window.marked.parse(rawText);
      } catch (e) {
        console.warn('[Mehran AI] marked.js error, falling back to internal parser:', e);
      }
    }

    // Built-in lightweight Markdown parser
    const lines = rawText.split('\n');
    const html = [];
    let inList = false;
    let inOrderedList = false;
    let inCodeBlock = false;
    let codeBuffer = [];

    function formatInline(str) {
      // Escape HTML entities
      let out = str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Inline code `code`
      out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

      // Bold **text**
      out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Italic *text*
      out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Markdown links [text](url)
      out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      return out;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks ```
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          html.push('<pre><code>' + formatInline(codeBuffer.join('\n')) + '</code></pre>');
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          if (inList) { html.push('</ul>'); inList = false; }
          if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      const trimmed = line.trim();

      // Empty line closes lists
      if (!trimmed) {
        if (inList) { html.push('</ul>'); inList = false; }
        if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        if (inList) { html.push('</ul>'); inList = false; }
        if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
        html.push('<h4 class="ai-heading">' + formatInline(trimmed.slice(4)) + '</h4>');
        continue;
      }
      if (trimmed.startsWith('## ')) {
        if (inList) { html.push('</ul>'); inList = false; }
        if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
        html.push('<h3 class="ai-heading">' + formatInline(trimmed.slice(3)) + '</h3>');
        continue;
      }
      if (trimmed.startsWith('# ')) {
        if (inList) { html.push('</ul>'); inList = false; }
        if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
        html.push('<h3 class="ai-heading">' + formatInline(trimmed.slice(2)) + '</h3>');
        continue;
      }

      // Unordered List - or *
      const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
      if (bulletMatch) {
        if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
        if (!inList) { html.push('<ul>'); inList = true; }
        html.push('<li>' + formatInline(bulletMatch[1]) + '</li>');
        continue;
      }

      // Ordered List 1. 2.
      const numMatch = line.match(/^\s*\d+\.\s+(.*)$/);
      if (numMatch) {
        if (inList) { html.push('</ul>'); inList = false; }
        if (!inOrderedList) { html.push('<ol>'); inOrderedList = true; }
        html.push('<li>' + formatInline(numMatch[1]) + '</li>');
        continue;
      }

      // Regular paragraph
      if (inList) { html.push('</ul>'); inList = false; }
      if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
      html.push('<p>' + formatInline(trimmed) + '</p>');
    }

    if (inList) html.push('</ul>');
    if (inOrderedList) html.push('</ol>');
    if (inCodeBlock) html.push('<pre><code>' + formatInline(codeBuffer.join('\n')) + '</code></pre>');

    return html.join('');
  }

  // Inject widget CSS styles
  const styles = `
    /* Widget Container */
    #mehran-ai-widget {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      --ai-bg: #0B0B0F;
      --ai-surface: #14141A;
      --ai-elevated: #1C1C24;
      --ai-text-primary: #EDEDEB;
      --ai-text-secondary: #9B9B9B;
      --ai-text-muted: #7C7C7C;
      --ai-accent: #A8C66C;
      --ai-accent-hover: #BDDA84;
      --ai-border: #252530;
      --ai-danger: #E55B5B;
      --ai-radius: 6px;
    }

    /* Floating Launcher Button */
    .mehran-ai-launcher {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--ai-surface);
      color: var(--ai-text-primary);
      border: 1px solid var(--ai-border);
      border-radius: 9999px;
      padding: 0.65rem 1.15rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      transition: all 0.2s ease;
      outline: none;
    }
    .mehran-ai-launcher:hover {
      border-color: var(--ai-accent);
      color: var(--ai-accent);
      transform: translateY(-2px);
    }
    .mehran-ai-sparkle {
      color: var(--ai-accent);
      font-size: 0.95rem;
      line-height: 1;
    }

    /* Chat Panel Window */
    .mehran-ai-panel {
      display: none;
      flex-direction: column;
      position: absolute;
      bottom: 3.5rem;
      right: 0;
      width: 400px;
      max-width: calc(100vw - 2rem);
      height: 560px;
      max-height: calc(100vh - 6rem);
      background: var(--ai-surface);
      border: 1px solid var(--ai-border);
      border-radius: 8px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      animation: mehranFadeIn 0.2s ease-out;
    }
    .mehran-ai-panel.open {
      display: flex;
    }

    @keyframes mehranFadeIn {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Panel Header */
    .mehran-ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      background: var(--ai-elevated);
      border-bottom: 1px solid var(--ai-border);
    }
    .mehran-ai-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .mehran-ai-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ai-text-primary);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .mehran-ai-subtitle {
      font-size: 0.75rem;
      color: var(--ai-text-muted);
      font-family: ui-monospace, monospace;
    }
    .mehran-ai-close {
      background: transparent;
      border: none;
      color: var(--ai-text-muted);
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      padding: 0.25rem 0.5rem;
      border-radius: var(--ai-radius);
      transition: color 0.15s ease;
    }
    .mehran-ai-close:hover {
      color: var(--ai-text-primary);
    }

    /* Messages Area */
    .mehran-ai-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      background: var(--ai-bg);
      font-size: 0.875rem;
      line-height: 1.6;
    }
    .mehran-ai-messages::-webkit-scrollbar {
      width: 5px;
    }
    .mehran-ai-messages::-webkit-scrollbar-thumb {
      background: var(--ai-border);
      border-radius: 4px;
    }

    /* Message Bubbles */
    .mehran-msg {
      max-width: 90%;
      padding: 0.75rem 0.95rem;
      border-radius: var(--ai-radius);
      word-break: break-word;
    }
    .mehran-msg-bot {
      align-self: flex-start;
      background: var(--ai-surface);
      border: 1px solid var(--ai-border);
      color: var(--ai-text-primary);
    }

    /* Structured formatting inside Bot Responses */
    .mehran-msg-bot p {
      margin: 0 0 0.55rem 0;
    }
    .mehran-msg-bot p:last-child {
      margin-bottom: 0;
    }
    .mehran-msg-bot h3, .mehran-msg-bot .ai-heading {
      font-size: 0.93rem;
      font-weight: 600;
      color: var(--ai-accent);
      margin: 0.75rem 0 0.35rem 0;
      border-bottom: 1px solid var(--ai-border);
      padding-bottom: 0.2rem;
    }
    .mehran-msg-bot h3:first-child, .mehran-msg-bot h4:first-child {
      margin-top: 0;
    }
    .mehran-msg-bot h4 {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--ai-accent);
      margin: 0.6rem 0 0.25rem 0;
    }
    .mehran-msg-bot ul, .mehran-msg-bot ol {
      margin: 0.35rem 0 0.6rem 1.15rem;
      padding: 0;
    }
    .mehran-msg-bot li {
      margin-bottom: 0.3rem;
      color: var(--ai-text-secondary);
      line-height: 1.5;
    }
    .mehran-msg-bot strong {
      color: var(--ai-text-primary);
      font-weight: 600;
    }
    .mehran-msg-bot a {
      color: var(--ai-accent);
      text-decoration: underline;
      text-underline-offset: 2px;
      word-break: break-all;
    }
    .mehran-msg-bot a:hover {
      color: var(--ai-accent-hover);
    }
    .mehran-msg-bot code {
      font-family: ui-monospace, monospace;
      font-size: 0.82em;
      background: var(--ai-elevated);
      padding: 0.15rem 0.35rem;
      border-radius: 3px;
      border: 1px solid var(--ai-border);
      color: var(--ai-accent);
    }
    .mehran-msg-bot pre {
      background: var(--ai-bg);
      border: 1px solid var(--ai-border);
      border-radius: 4px;
      padding: 0.5rem;
      overflow-x: auto;
      margin: 0.4rem 0;
    }

    .mehran-msg-user {
      align-self: flex-end;
      background: var(--ai-elevated);
      border: 1px solid rgba(168, 198, 108, 0.3);
      color: var(--ai-accent);
    }
    .mehran-msg-error {
      align-self: center;
      background: rgba(229, 91, 91, 0.1);
      border: 1px solid rgba(229, 91, 91, 0.3);
      color: var(--ai-danger);
      font-size: 0.8125rem;
      text-align: center;
      width: 90%;
    }

    /* Suggested Chips */
    .mehran-ai-suggestions {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.65rem;
    }
    .mehran-ai-chip {
      text-align: left;
      font-size: 0.78rem;
      padding: 0.45rem 0.65rem;
      background: var(--ai-surface);
      border: 1px solid var(--ai-border);
      border-radius: var(--ai-radius);
      color: var(--ai-text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: ui-monospace, monospace;
    }
    .mehran-ai-chip:hover {
      border-color: var(--ai-accent);
      color: var(--ai-accent);
      background: var(--ai-elevated);
    }

    /* Animated Typing Dots */
    .mehran-typing {
      display: inline-flex;
      gap: 0.3rem;
      align-items: center;
      padding: 0.6rem 0.85rem;
    }
    .mehran-dot {
      width: 6px;
      height: 6px;
      background: var(--ai-accent);
      border-radius: 50%;
      animation: mehranPulse 1.2s infinite ease-in-out;
    }
    .mehran-dot:nth-child(2) { animation-delay: 0.2s; }
    .mehran-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes mehranPulse {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.1); }
    }

    /* Footer Input Area */
    .mehran-ai-footer {
      padding: 0.75rem 1rem;
      background: var(--ai-surface);
      border-top: 1px solid var(--ai-border);
    }
    .mehran-ai-input-form {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .mehran-ai-input {
      flex: 1;
      background: var(--ai-bg);
      border: 1px solid var(--ai-border);
      color: var(--ai-text-primary);
      padding: 0.6rem 0.75rem;
      font-size: 0.875rem;
      border-radius: var(--ai-radius);
      outline: none;
      transition: border-color 0.15s ease;
    }
    .mehran-ai-input:focus {
      border-color: var(--ai-accent);
    }
    .mehran-ai-input::placeholder {
      color: var(--ai-text-muted);
    }
    .mehran-ai-send {
      background: var(--ai-accent);
      color: var(--ai-bg);
      border: none;
      padding: 0.6rem 0.85rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--ai-radius);
      cursor: pointer;
      transition: background 0.15s ease, opacity 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mehran-ai-send:hover:not(:disabled) {
      background: var(--ai-accent-hover);
    }
    .mehran-ai-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      #mehran-ai-widget {
        bottom: 1rem;
        right: 1rem;
      }
      .mehran-ai-panel {
        width: calc(100vw - 2rem);
        height: calc(100vh - 5rem);
        bottom: 3.25rem;
      }
    }
  `;

  // Inject Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Build DOM Structure
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'mehran-ai-widget';

  widgetContainer.innerHTML = `
    <!-- Floating Launcher -->
    <button class="mehran-ai-launcher" id="mehran-ai-toggle" aria-label="Open Mehran AI assistant">
      <span class="mehran-ai-sparkle">✦</span>
      <span>Ask Mehran AI</span>
    </button>

    <!-- Chat Panel -->
    <div class="mehran-ai-panel" id="mehran-ai-panel" role="dialog" aria-modal="true" aria-label="Mehran AI Chat">
      <!-- Header -->
      <div class="mehran-ai-header">
        <div class="mehran-ai-title-wrap">
          <span class="mehran-ai-title"><span class="mehran-ai-sparkle">✦</span> Mehran AI</span>
          <span class="mehran-ai-subtitle">Portfolio Assistant</span>
        </div>
        <button class="mehran-ai-close" id="mehran-ai-close" aria-label="Close chat">×</button>
      </div>

      <!-- Messages Stream -->
      <div class="mehran-ai-messages" id="mehran-ai-messages">
        <!-- Initial Greeting -->
        <div class="mehran-msg mehran-msg-bot">
          <p>Hi! I'm Mehran's portfolio assistant.</p>
          <p>Ask me about his SOC skills, homelab, detection rules, or career goals:</p>
          <div class="mehran-ai-suggestions" id="mehran-ai-suggestions"></div>
        </div>
      </div>

      <!-- Input Form -->
      <div class="mehran-ai-footer">
        <form class="mehran-ai-input-form" id="mehran-ai-form">
          <input 
            type="text" 
            class="mehran-ai-input" 
            id="mehran-ai-input" 
            placeholder="Ask a question..." 
            autocomplete="off" 
            maxlength="500"
            required
          />
          <button type="submit" class="mehran-ai-send" id="mehran-ai-send" aria-label="Send question">
            ➤
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(widgetContainer);

  // References
  const toggleBtn = document.getElementById('mehran-ai-toggle');
  const panel = document.getElementById('mehran-ai-panel');
  const closeBtn = document.getElementById('mehran-ai-close');
  const messagesEl = document.getElementById('mehran-ai-messages');
  const form = document.getElementById('mehran-ai-form');
  const inputEl = document.getElementById('mehran-ai-input');
  const sendBtn = document.getElementById('mehran-ai-send');
  const suggestionsBox = document.getElementById('mehran-ai-suggestions');

  let isOpen = false;
  let isLoading = false;

  // Render Suggested Chips
  SUGGESTED_QUESTIONS.forEach(q => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'mehran-ai-chip';
    chip.textContent = q;
    chip.addEventListener('click', () => {
      inputEl.value = q;
      handleSend(q);
    });
    suggestionsBox.appendChild(chip);
  });

  // Toggle Panel
  function togglePanel(open) {
    isOpen = typeof open === 'boolean' ? open : !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      inputEl.focus();
    } else {
      panel.classList.remove('open');
    }
  }

  toggleBtn.addEventListener('click', () => togglePanel());
  closeBtn.addEventListener('click', () => togglePanel(false));

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      togglePanel(false);
    }
  });

  // Scroll messages to bottom
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Append a message bubble
  function appendMessage(content, type) {
    const msg = document.createElement('div');
    msg.className = `mehran-msg mehran-msg-${type}`;
    if (type === 'bot') {
      msg.innerHTML = renderMarkdown(content);
    } else {
      msg.textContent = content;
    }
    messagesEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  let wakeupTimer = null;

  // Show typing indicator
  function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.id = 'mehran-typing-indicator';
    typing.className = 'mehran-msg mehran-msg-bot mehran-typing';
    typing.innerHTML = `
      <span class="mehran-dot"></span>
      <span class="mehran-dot"></span>
      <span class="mehran-dot"></span>
      <span class="mehran-typing-status" id="mehran-typing-status" style="margin-left: 0.5rem; font-size: 0.78rem; color: var(--ai-text-muted);"></span>
    `;
    messagesEl.appendChild(typing);
    scrollToBottom();

    // If waiting more than 4.5 seconds (Hugging Face cold start wake-up), display notice
    wakeupTimer = setTimeout(() => {
      const statusEl = document.getElementById('mehran-typing-status');
      if (statusEl) {
        statusEl.textContent = 'Waking up server...';
      }
    }, 4500);
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    if (wakeupTimer) {
      clearTimeout(wakeupTimer);
      wakeupTimer = null;
    }
    const indicator = document.getElementById('mehran-typing-indicator');
    if (indicator) indicator.remove();
  }

  // Send Question to FastAPI Backend
  async function handleSend(userQuestion) {
    const query = (userQuestion || inputEl.value).trim();
    if (!query || isLoading) return;

    // Reset input
    inputEl.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    // Append user message
    appendMessage(query, 'user');

    // Show loading dots
    showTypingIndicator();

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 70000); // 70s (longer than backend 60s)

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: query }),
        signal: controller.signal
      });

      clearTimeout(timeoutTimer);
      removeTypingIndicator();

      if (response.ok) {
        const data = await response.json();
        appendMessage(data.answer || "I received an empty answer.", 'bot');
      } else if (response.status === 429) {
        appendMessage("Rate limit exceeded. Please wait a minute before asking another question.", 'error');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail || `Server returned error ${response.status}.`;
        appendMessage(`Error: ${detail}`, 'error');
      }
    } catch (err) {
      clearTimeout(timeoutTimer);
      removeTypingIndicator();
      console.error("[Mehran AI]", err);
      if (err.name === 'AbortError') {
        appendMessage("Request timed out after 70 seconds. The service took too long to respond.", 'error');
      } else {
        appendMessage("Unable to connect to Mehran AI. Make sure the backend server is running.", 'error');
      }
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // Submit form handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend();
  });

})();
