const REPORTS_BASE = '/review-reports';
const EXPAND_PREFIX = 'draft-review-expand:';
const SCHEMA_VERSION = 3;
const SAVE_API = '/api/draft/save';

const FEEDBACK_ORDER = ['title', 'clarity', 'logic', 'voice', 'emotional'];

const app = document.getElementById('app');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function sectionExpandKey(reportId) {
  return `${EXPAND_PREFIX}${reportId}`;
}

function loadSectionExpandedMap(reportId) {
  try {
    const raw = localStorage.getItem(sectionExpandKey(reportId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSectionExpanded(reportId, sectionId, expanded) {
  const map = loadSectionExpandedMap(reportId);
  map[sectionId] = expanded;
  localStorage.setItem(sectionExpandKey(reportId), JSON.stringify(map));
}

function isSectionExpanded(reportId, sectionId) {
  const map = loadSectionExpandedMap(reportId);
  if (Object.prototype.hasOwnProperty.call(map, sectionId)) {
    return map[sectionId];
  }
  return true;
}

function isValidReport(report) {
  return report && report.schemaVersion === SCHEMA_VERSION;
}

function getReviewRound(report) {
  return report?.reviewRound || 1;
}

function getFeedbacks(report) {
  const feedbacks = report?.feedbacks || [];
  const byId = new Map(feedbacks.map((fb) => [fb.id, fb]));
  return FEEDBACK_ORDER.map((id) => byId.get(id)).filter(Boolean);
}

function splitParagraphs(text) {
  if (!text) return [];
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

function renderParagraphs(text) {
  const paragraphs = splitParagraphs(text);
  if (!paragraphs.length) {
    return '<p class="feedback-empty">No feedback for this section.</p>';
  }
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
}

function renderFeedbackSection(reportId, feedback) {
  const expanded = isSectionExpanded(reportId, feedback.id);
  const stage = feedback.stage ? `<span class="feedback-stage">${escapeHtml(feedback.stage)}</span>` : '';

  return `
    <section class="section collapsible-section feedback-section${expanded ? ' is-expanded' : ''}" data-section-id="${escapeHtml(feedback.id)}">
      <button type="button" class="section-toggle" aria-expanded="${expanded}">
        <span class="section-chevron" aria-hidden="true"></span>
        <span class="section-title-wrap">
          <span class="section-title-text">${escapeHtml(feedback.label || feedback.id)}</span>
          ${stage}
        </span>
      </button>
      <div class="section-body">
        <div class="feedback-body">
          ${renderParagraphs(feedback.body)}
        </div>
      </div>
    </section>
  `;
}

function renderSummary(summary) {
  if (!summary) return '';
  return `
    <section class="summary-section">
      <h3 class="section-heading">Summary</h3>
      <div class="summary-block">
        <p>${escapeHtml(summary)}</p>
      </div>
    </section>
  `;
}

function renderFeedbacks(reportId, report) {
  const feedbacks = getFeedbacks(report);
  if (!feedbacks.length) {
    return '<p class="section-empty">No feedback sections in this report.</p>';
  }
  return feedbacks.map((fb) => renderFeedbackSection(reportId, fb)).join('');
}

function renderSchemaError(id, message) {
  return `
    <div class="error-state">
      <p><a class="back-link" href="#/">← All reports</a></p>
      <p>${escapeHtml(message)}</p>
      <p>Delete <code>review-reports/${escapeHtml(id)}.json</code> and re-run <code>review-draft-report</code> on the draft.</p>
    </div>
  `;
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path} (${response.status})`);
  }
  return response.json();
}

async function loadReportList() {
  try {
    return await fetchJson(`${REPORTS_BASE}/index.json`);
  } catch {
    return [];
  }
}

async function loadReport(id) {
  return fetchJson(`${REPORTS_BASE}/${encodeURIComponent(id)}.json`);
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { view: 'list' };
  if (hash.startsWith('report/')) {
    return { view: 'detail', id: decodeURIComponent(hash.slice('report/'.length)) };
  }
  return { view: 'list' };
}

async function renderList() {
  setBodyLayout(false);
  unbindEditorShortcut();
  editorState = {
    reportId: null,
    draftPath: null,
    savedContent: '',
    dirty: false,
  };

  app.innerHTML = '<p class="empty-state">Loading reports…</p>';

  const ids = await loadReportList();

  if (!ids.length) {
    app.innerHTML = `
      <div class="empty-state">
        <p>No review reports found.</p>
        <p>Run <code>review-draft-report</code> on a draft to create <code>review-reports/{slug}.json</code>, then refresh this page.</p>
      </div>
    `;
    return;
  }

  const cards = await Promise.all(
    ids.map(async (id) => {
      try {
        const report = await loadReport(id);
        if (!isValidReport(report)) {
          return `
            <li>
              <div class="error-state">
                Report <strong>${escapeHtml(id)}</strong> could not be loaded. Delete <code>review-reports/${escapeHtml(id)}.json</code> and re-run review.
              </div>
            </li>
          `;
        }

        const round = getReviewRound(report);

        return `
          <li>
            <a class="report-card" href="#/report/${encodeURIComponent(id)}">
              <h2 class="report-card-title">${escapeHtml(report.title || id)}</h2>
              <p class="report-card-meta">${escapeHtml(report.draftPath || '')} · Round ${round} · ${escapeHtml(formatDate(report.lastReviewedAt || report.createdAt))}</p>
            </a>
          </li>
        `;
      } catch {
        return `
          <li>
            <div class="error-state">
              Could not load report <strong>${escapeHtml(id)}</strong>. Check that <code>review-reports/${escapeHtml(id)}.json</code> exists and is valid JSON.
            </div>
          </li>
        `;
      }
    })
  );

  app.innerHTML = `<ul class="report-list">${cards.join('')}</ul>`;
}

let currentDetail = null;
let editorState = {
  reportId: null,
  draftPath: null,
  savedContent: '',
  dirty: false,
};

function setBodyLayout(hasEditor) {
  document.body.classList.toggle('has-editor-layout', hasEditor);
}

function getEditorTextarea() {
  return document.getElementById('draft-editor');
}

function getEditorContent() {
  const textarea = getEditorTextarea();
  return textarea ? textarea.value : '';
}

function setEditorStatus(message, type = '') {
  const statusEl = document.getElementById('editor-status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `editor-status${type ? ` is-${type}` : ''}`;
}

function updateEditorStatus() {
  if (editorState.dirty) {
    setEditorStatus('Unsaved changes');
    return;
  }
  setEditorStatus('Saved');
}

async function loadDraftText(draftPath) {
  const response = await fetch(`/${draftPath}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${draftPath}`);
  }
  return response.text();
}

async function saveDraft() {
  const textarea = getEditorTextarea();
  if (!textarea || !editorState.draftPath) return;

  const content = textarea.value;
  setEditorStatus('Saving…');

  try {
    const response = await fetch(SAVE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: editorState.draftPath, content }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Save failed. Use npm run draft-review to start the server with save support.');
    }

    editorState.savedContent = content;
    editorState.dirty = false;
    setEditorStatus('Saved', 'success');
  } catch (error) {
    setEditorStatus(error.message, 'error');
  }
}

function bindEditorEvents() {
  const textarea = getEditorTextarea();
  const saveBtn = document.getElementById('save-draft');

  saveBtn?.addEventListener('click', () => {
    saveDraft();
  });

  textarea?.addEventListener('input', () => {
    editorState.dirty = textarea.value !== editorState.savedContent;
    updateEditorStatus();
  });
}

function bindEditorShortcut() {
  document.addEventListener('keydown', onEditorKeydown);
}

function unbindEditorShortcut() {
  document.removeEventListener('keydown', onEditorKeydown);
}

function onEditorKeydown(event) {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return;
  if (!getEditorTextarea()) return;
  event.preventDefault();
  saveDraft();
}

async function initEditor(report, preservedContent = null) {
  const textarea = getEditorTextarea();
  const pathEl = document.getElementById('editor-path');
  if (!textarea || !pathEl) return;

  pathEl.textContent = report.draftPath || '';
  editorState.reportId = report.id;
  editorState.draftPath = report.draftPath || '';

  if (preservedContent !== null) {
    textarea.value = preservedContent;
    editorState.dirty = preservedContent !== editorState.savedContent;
    updateEditorStatus();
    return;
  }

  if (!report.draftPath) {
    textarea.value = '';
    editorState.savedContent = '';
    editorState.dirty = false;
    setEditorStatus('No draft path in report', 'error');
    return;
  }

  try {
    const content = await loadDraftText(report.draftPath);
    textarea.value = content;
    editorState.savedContent = content;
    editorState.dirty = false;
    setEditorStatus('Saved', 'success');
  } catch (error) {
    textarea.value = '';
    editorState.savedContent = '';
    editorState.dirty = false;
    setEditorStatus(error.message, 'error');
  }
}

function buildReviewHeader(id, report) {
  const reviewRound = getReviewRound(report);
  const roundMeta = report.lastReviewedAt
    ? `Round ${reviewRound} · ${formatDate(report.lastReviewedAt)}`
    : `Round ${reviewRound}`;

  return `
    <div class="detail-header">
      <a class="back-link" href="#/">← All reports</a>
      <h2 class="detail-title">${escapeHtml(report.title || id)}</h2>
      <p class="detail-meta">
        <span>${escapeHtml(report.draftPath || '')}</span>
        · <span>${escapeHtml(formatDate(report.createdAt))}</span>
        · <span>${escapeHtml(roundMeta)}</span>
      </p>
    </div>
  `;
}

function buildReviewBody(id, report) {
  return `${renderSummary(report.summary)}<div class="feedbacks-list">${renderFeedbacks(id, report)}</div>`;
}

function bindSectionToggleEvents(id) {
  app.querySelectorAll('.section-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const section = toggle.closest('.collapsible-section');
      const sectionId = section?.dataset.sectionId;
      if (!sectionId) return;

      const expanded = section.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      saveSectionExpanded(id, sectionId, expanded);
    });
  });
}

async function renderDetail(id) {
  const preserveEditor = editorState.reportId === id && document.querySelector('.detail-layout');
  const preservedContent = preserveEditor ? getEditorContent() : null;

  if (!preserveEditor) {
    app.innerHTML = '<p class="empty-state">Loading report…</p>';
    setBodyLayout(false);
    unbindEditorShortcut();
    editorState = {
      reportId: null,
      draftPath: null,
      savedContent: '',
      dirty: false,
    };
  }

  let report;
  try {
    report = await loadReport(id);
  } catch (error) {
    setBodyLayout(false);
    unbindEditorShortcut();
    app.innerHTML = `
      <div class="error-state">
        <p><a class="back-link" href="#/">← All reports</a></p>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
    return;
  }

  if (!isValidReport(report)) {
    setBodyLayout(false);
    unbindEditorShortcut();
    app.innerHTML = renderSchemaError(id, 'This report file is not valid for the current tracker.');
    return;
  }

  currentDetail = { id, report };
  setBodyLayout(true);
  bindEditorShortcut();

  if (preserveEditor) {
    const headerBar = document.getElementById('detail-header-bar');
    const panel = document.getElementById('review-panel');
    if (headerBar) headerBar.innerHTML = buildReviewHeader(id, report);
    if (panel) {
      panel.innerHTML = buildReviewBody(id, report);
      bindSectionToggleEvents(id);
    }
    return;
  }

  app.innerHTML = `
    <div class="detail-layout">
      <div class="detail-header-bar" id="detail-header-bar"></div>
      <div class="review-panel" id="review-panel"></div>
      <aside class="editor-panel" aria-label="Draft editor">
        <div class="editor-toolbar">
          <span class="editor-path" id="editor-path"></span>
          <div class="editor-toolbar-actions">
            <span class="editor-status" id="editor-status"></span>
            <button type="button" class="btn btn-primary" id="save-draft">Save</button>
          </div>
        </div>
        <textarea id="draft-editor" class="draft-editor" spellcheck="true" aria-label="Draft text"></textarea>
      </aside>
    </div>
  `;

  document.getElementById('detail-header-bar').innerHTML = buildReviewHeader(id, report);
  document.getElementById('review-panel').innerHTML = buildReviewBody(id, report);

  bindSectionToggleEvents(id);
  bindEditorEvents();
  await initEditor(report, preservedContent);
}

async function render() {
  const route = getRoute();
  if (route.view === 'detail' && route.id) {
    await renderDetail(route.id);
  } else {
    currentDetail = null;
    await renderList();
  }
}

window.addEventListener('hashchange', () => {
  render();
});

render();
