const REPORTS_BASE = '/review-reports';
const STORAGE_PREFIX = 'draft-review:';
const PREFS_KEY = 'draft-review:prefs';
const SCHEMA_VERSION = 2;
const DEFAULT_FILTER = 'open';
const DEFAULT_VIEW_MODE = 'list';
const SAVE_API = '/api/draft/save';

const THEME_LABELS = {
  clarity: 'Clarity',
  logic: 'Logic',
  fairness: 'Fairness',
  flow: 'Flow',
};

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

function storageKey(reportId) {
  return `${STORAGE_PREFIX}${reportId}`;
}

function loadStatus(reportId) {
  try {
    const raw = localStorage.getItem(storageKey(reportId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStatus(reportId, status) {
  localStorage.setItem(storageKey(reportId), JSON.stringify(status));
}

function clearStatus(reportId) {
  localStorage.removeItem(storageKey(reportId));
}

function isValidReport(report) {
  return report && report.schemaVersion === SCHEMA_VERSION;
}

function getItemStatus(statusMap, itemId) {
  return statusMap[itemId] || 'open';
}

function getReviewRound(report) {
  return report?.reviewRound || 1;
}

function getAiStatus(item) {
  return item?.aiStatus || 'open';
}

function getCheckableItems(report) {
  return report?.items || [];
}

function getProgress(report, statusMap) {
  const items = getCheckableItems(report);
  let actionableOpen = 0;
  let userOpen = 0;

  for (const item of items) {
    const userStatus = getItemStatus(statusMap, item.id);
    if (userStatus === 'open') {
      userOpen += 1;
      if (getAiStatus(item) === 'open') actionableOpen += 1;
    }
  }

  return { total: items.length, actionableOpen, userOpen };
}

function renderProgress(progress) {
  if (progress.total === 0) {
    return `<p class="progress-simple">No suggestions</p>`;
  }

  const label =
    progress.actionableOpen === 0
      ? 'Nothing open to address'
      : `${progress.actionableOpen} open`;

  return `<p class="progress-simple">${escapeHtml(label)}</p>`;
}

function itemMatchesFilter(status, filter) {
  if (filter === 'all') return true;
  return status === filter;
}

function itemVisible(item, statusMap, userFilter, showAddressed) {
  const userStatus = getItemStatus(statusMap, item.id);
  if (!itemMatchesFilter(userStatus, userFilter)) return false;
  if (!showAddressed && getAiStatus(item) === 'addressed') return false;
  return true;
}

function renderThemeBadge(theme) {
  if (!theme) return '';
  const label = THEME_LABELS[theme] || theme;
  return `<span class="theme-badge">${escapeHtml(label)}</span>`;
}

function renderAiLine(item) {
  const aiStatus = getAiStatus(item);
  const note = item.aiNote ? `: ${item.aiNote}` : '';
  return `<p class="ai-line"><span class="ai-badge ai-badge-${escapeHtml(aiStatus)}">${escapeHtml(aiStatus)}</span>${escapeHtml(note)}</p>`;
}

function renderItemFields(item) {
  return `
    <blockquote class="item-quote">${escapeHtml(item.quote || '')}</blockquote>
    ${renderField('Issue', item.issue)}
    <div class="example-block">
      <span class="field-label">Try this</span>
      <p class="example-value">${escapeHtml(item.example || '')}</p>
    </div>
    ${renderAiLine(item)}
  `;
}

function renderField(label, value) {
  if (!value) return '';
  return `
    <div class="field">
      <span class="field-label">${escapeHtml(label)}</span>
      <p class="field-value">${escapeHtml(value)}</p>
    </div>
  `;
}

function renderItemActions(reportId, itemId, status, inline = false) {
  const inlineClass = inline ? ' item-actions--inline' : '';
  return `
    <div class="item-actions${inlineClass}" data-report-id="${escapeHtml(reportId)}" data-item-id="${escapeHtml(itemId)}">
      <button type="button" class="btn btn-done${status === 'done' ? ' is-active' : ''}" data-action="done">Done</button>
      <button type="button" class="btn btn-discard${status === 'discarded' ? ' is-active' : ''}" data-action="discarded">Discard</button>
      ${status !== 'open' ? '<button type="button" class="btn" data-action="open">Reset</button>' : ''}
    </div>
  `;
}

function renderItemCard(reportId, report, item, statusMap, userFilter, showAddressed, options = {}) {
  const { forceVisible = false, actionsInHeader = false } = options;
  const userStatus = getItemStatus(statusMap, item.id);
  const hidden = !forceVisible && !itemVisible(item, statusMap, userFilter, showAddressed) ? ' is-hidden' : '';
  const stateClass = userStatus === 'open' ? '' : ` is-${userStatus}`;
  const actionsHtml = renderItemActions(reportId, item.id, userStatus, actionsInHeader);
  const headerExtra = renderThemeBadge(item.theme);

  const headerEnd = actionsInHeader
    ? `
      <div class="item-header-end">
        ${actionsHtml}
      </div>
    `
    : '';

  return `
    <article class="item${stateClass}${hidden}${actionsInHeader ? ' item--header-actions' : ''}" data-item-id="${escapeHtml(item.id)}">
      <div class="item-header">
        ${headerExtra}
        ${headerEnd}
      </div>
      ${renderItemFields(item)}
      ${actionsInHeader ? '' : actionsHtml}
    </article>
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

function renderSuggestionsList(id, report, statusMap, userFilter, showAddressed) {
  const items = getCheckableItems(report);
  const itemsHtml = items
    .map((item) => renderItemCard(id, report, item, statusMap, userFilter, showAddressed))
    .join('');

  const emptyHtml =
    items.length === 0
      ? '<p class="section-empty">No suggestions in this report.</p>'
      : '<p class="section-empty is-hidden" id="filter-empty">No suggestions match the current filters.</p>';

  return `
    <section class="suggestions-section">
      <h3 class="section-heading">Suggestions</h3>
      ${itemsHtml}
      ${emptyHtml}
    </section>
  `;
}

function getVisibleFocusItems(report, statusMap, userFilter, showAddressed) {
  return getCheckableItems(report)
    .filter((item) => itemVisible(item, statusMap, userFilter, showAddressed))
    .map((item) => ({ item, theme: item.theme }));
}

function clampFocusIndex(index, total) {
  if (total === 0) return 0;
  return Math.max(0, Math.min(index, total - 1));
}

function renderFilterToolbar(userFilter, showAddressed, viewMode) {
  const userFilters = [
    { id: 'open', label: 'Open' },
    { id: 'done', label: 'Done' },
    { id: 'discarded', label: 'Discarded' },
    { id: 'all', label: 'All' },
  ];

  const viewModes = [
    { id: 'list', label: 'List' },
    { id: 'focus', label: 'Focus' },
  ];

  const renderOptions = (options, selected) =>
    options
      .map(
        (option) =>
          `<option value="${escapeHtml(option.id)}"${option.id === selected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`
      )
      .join('');

  return `
    <div class="filter-bar">
      <label class="filter-field">
        <span class="filter-label">Show</span>
        <select id="filter-user-status" class="filter-select" aria-label="Filter by your status">
          ${renderOptions(userFilters, userFilter)}
        </select>
      </label>
      <label class="filter-field filter-checkbox">
        <input type="checkbox" id="filter-show-addressed" ${showAddressed ? 'checked' : ''} />
        <span>Show addressed</span>
      </label>
      <label class="filter-field">
        <span class="filter-label">View</span>
        <select id="filter-view-mode" class="filter-select" aria-label="Suggestion view">
          ${renderOptions(viewModes, viewMode)}
        </select>
      </label>
    </div>
  `;
}

function renderFocusTopBar(counterText, themeLabel, prevDisabled, nextDisabled) {
  const toggleLabel = focusMetaExpanded ? 'Hide info' : 'Info & filters';
  return `
    <div class="focus-top">
      <a class="back-link focus-back-link" href="#/">← Reports</a>
      <div class="focus-nav">
        <button type="button" class="btn focus-nav-btn" id="focus-prev"${prevDisabled} aria-label="Previous suggestion">←</button>
        <div class="focus-nav-meta">
          <span class="focus-counter">${escapeHtml(counterText)}</span>
          ${themeLabel ? `<span class="focus-section-label">${escapeHtml(themeLabel)}</span>` : ''}
        </div>
        <button type="button" class="btn focus-nav-btn" id="focus-next"${nextDisabled} aria-label="Next suggestion">→</button>
      </div>
      <button type="button" class="btn focus-meta-toggle" id="focus-meta-toggle" aria-expanded="${focusMetaExpanded}">
        ${escapeHtml(toggleLabel)}
      </button>
    </div>
  `;
}

function renderFocusPanel(id, report, statusMap, userFilter, showAddressed) {
  const visibleItems = getVisibleFocusItems(report, statusMap, userFilter, showAddressed);
  const index = clampFocusIndex(focusIndex, visibleItems.length);
  focusIndex = index;

  if (visibleItems.length === 0) {
    return `
      <div class="focus-panel">
        ${renderFocusTopBar('No suggestions', '', ' disabled', ' disabled')}
        <p class="section-empty">No suggestions match the current filters.</p>
      </div>
    `;
  }

  const { item, theme } = visibleItems[index];
  const themeLabel = theme ? THEME_LABELS[theme] || theme : '';
  const cardHtml = renderItemCard(id, report, item, statusMap, userFilter, showAddressed, {
    forceVisible: true,
    actionsInHeader: true,
  });

  const prevDisabled = index === 0 ? ' disabled' : '';
  const nextDisabled = index >= visibleItems.length - 1 ? ' disabled' : '';
  const counterText = `${index + 1} / ${visibleItems.length}`;

  return `
    <div class="focus-panel">
      ${renderFocusTopBar(counterText, themeLabel, prevDisabled, nextDisabled)}
      ${cardHtml}
    </div>
  `;
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
  unbindFocusShortcut();
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

        const statusMap = loadStatus(id);
        const progress = getProgress(report, statusMap);

        return `
          <li>
            <a class="report-card" href="#/report/${encodeURIComponent(id)}">
              <h2 class="report-card-title">${escapeHtml(report.title || id)}</h2>
              <p class="report-card-meta">${escapeHtml(report.draftPath || '')} · ${escapeHtml(formatDate(report.createdAt))}</p>
              ${renderProgress(progress)}
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
let currentFilter = DEFAULT_FILTER;
let showAddressed = false;
let currentViewMode = DEFAULT_VIEW_MODE;
let focusIndex = 0;
let focusMetaExpanded = false;
let editorState = {
  reportId: null,
  draftPath: null,
  savedContent: '',
  dirty: false,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const prefs = JSON.parse(raw);
    if (prefs.userFilter) currentFilter = prefs.userFilter;
    if (typeof prefs.showAddressed === 'boolean') showAddressed = prefs.showAddressed;
    if (prefs.viewMode) currentViewMode = prefs.viewMode;
    if (typeof prefs.focusMetaExpanded === 'boolean') focusMetaExpanded = prefs.focusMetaExpanded;
  } catch {
    // ignore invalid prefs
  }
}

function savePrefs() {
  localStorage.setItem(
    PREFS_KEY,
    JSON.stringify({
      userFilter: currentFilter,
      showAddressed,
      viewMode: currentViewMode,
      focusMetaExpanded,
    })
  );
}

function setBodyLayout(hasEditor) {
  document.body.classList.toggle('has-editor-layout', hasEditor);
  if (!hasEditor) {
    document.body.classList.remove('is-focus-view');
  }
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

function isEditableTarget(target) {
  if (!target) return false;
  if (target.id === 'draft-editor') return true;
  const tag = target.tagName;
  if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function bindFocusShortcut() {
  document.addEventListener('keydown', onFocusKeydown);
}

function unbindFocusShortcut() {
  document.removeEventListener('keydown', onFocusKeydown);
}

function onFocusKeydown(event) {
  if (currentViewMode !== 'focus') return;
  if (isEditableTarget(event.target)) return;

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    moveFocusPrev(currentDetail?.id);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    moveFocusNext(currentDetail?.id);
  }
}

function moveFocusPrev(id) {
  if (!id || !currentDetail?.report) return;
  const visible = getVisibleFocusItems(currentDetail.report, loadStatus(id), currentFilter, showAddressed);
  if (focusIndex > 0) {
    focusIndex -= 1;
    refreshReviewPanel(id);
  }
}

function moveFocusNext(id) {
  if (!id || !currentDetail?.report) return;
  const visible = getVisibleFocusItems(currentDetail.report, loadStatus(id), currentFilter, showAddressed);
  if (focusIndex < visible.length - 1) {
    focusIndex += 1;
    refreshReviewPanel(id);
  }
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

function buildReviewHeader(id, report, statusMap) {
  const progress = getProgress(report, statusMap);
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
      <div class="detail-actions">
        ${renderProgress(progress)}
        <button type="button" class="btn btn-danger" id="clear-progress">Clear my progress</button>
      </div>
    </div>
    ${renderFilterToolbar(currentFilter, showAddressed, currentViewMode)}
  `;
}

function buildListBody(id, report, statusMap, userFilter, showAddressedFlag) {
  return `${renderSummary(report.summary)}${renderSuggestionsList(id, report, statusMap, userFilter, showAddressedFlag)}`;
}

function buildReviewPanelContent(id, report, statusMap, userFilter, showAddressedFlag) {
  if (currentViewMode === 'focus') return '';
  return buildListBody(id, report, statusMap, userFilter, showAddressedFlag);
}

function buildHeaderBar(id, report, statusMap) {
  return buildReviewHeader(id, report, statusMap);
}

function updateFilterEmptyState() {
  const items = document.querySelectorAll('.item');
  const filterEmpty = document.getElementById('filter-empty');
  if (!filterEmpty) return;

  const anyVisible = [...items].some((el) => !el.classList.contains('is-hidden'));
  filterEmpty.classList.toggle('is-hidden', anyVisible || items.length === 0);
}

function updateDetailLayoutMode() {
  const layout = document.querySelector('.detail-layout');
  const focusStack = document.getElementById('focus-stack');
  const reviewPanel = document.getElementById('review-panel');
  const headerBar = document.getElementById('detail-header-bar');
  if (!layout) return;

  const isFocus = currentViewMode === 'focus';
  layout.classList.toggle('detail-layout--focus', isFocus);
  layout.classList.toggle('detail-layout--focus-meta-collapsed', isFocus && !focusMetaExpanded);
  document.body.classList.toggle('is-focus-view', isFocus);

  if (focusStack) {
    focusStack.hidden = !isFocus;
  }

  if (headerBar) {
    headerBar.hidden = isFocus && !focusMetaExpanded;
  }

  if (reviewPanel) {
    reviewPanel.hidden = isFocus;
  }

  const toggle = document.getElementById('focus-meta-toggle');
  if (toggle) {
    const label = focusMetaExpanded ? 'Hide info' : 'Info & filters';
    toggle.textContent = label;
    toggle.setAttribute('aria-expanded', String(focusMetaExpanded));
  }
}

function bindReviewEvents(id) {
  document.getElementById('filter-user-status')?.addEventListener('change', (event) => {
    currentFilter = event.target.value;
    savePrefs();
    refreshReviewPanel(id);
  });

  document.getElementById('filter-show-addressed')?.addEventListener('change', (event) => {
    showAddressed = event.target.checked;
    savePrefs();
    refreshReviewPanel(id);
  });

  document.getElementById('filter-view-mode')?.addEventListener('change', (event) => {
    currentViewMode = event.target.value;
    savePrefs();
    refreshReviewPanel(id);
  });

  document.getElementById('clear-progress')?.addEventListener('click', () => {
    clearStatus(id);
    refreshReviewPanel(id);
  });

  document.getElementById('focus-meta-toggle')?.addEventListener('click', () => {
    focusMetaExpanded = !focusMetaExpanded;
    savePrefs();
    updateDetailLayoutMode();
  });

  document.getElementById('focus-prev')?.addEventListener('click', () => {
    moveFocusPrev(id);
  });

  document.getElementById('focus-next')?.addEventListener('click', () => {
    moveFocusNext(id);
  });

  app.querySelectorAll('.item-actions').forEach((actions) => {
    actions.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const reportId = actions.dataset.reportId;
        const itemId = actions.dataset.itemId;
        const action = btn.dataset.action;
        const status = loadStatus(reportId);

        if (action === 'open') {
          delete status[itemId];
        } else {
          status[itemId] = action;
        }

        saveStatus(reportId, status);
        refreshReviewPanel(reportId);
      });
    });
  });
}

async function refreshReviewPanel(id) {
  const report = await loadReport(id);
  if (!isValidReport(report)) return;

  currentDetail = { id, report };
  const statusMap = loadStatus(id);

  if (currentViewMode === 'focus') {
    const visible = getVisibleFocusItems(report, statusMap, currentFilter, showAddressed);
    focusIndex = clampFocusIndex(focusIndex, visible.length);
  }

  const panel = document.getElementById('review-panel');
  const headerBar = document.getElementById('detail-header-bar');
  if (!panel) return;

  if (headerBar) {
    headerBar.innerHTML = buildHeaderBar(id, report, statusMap);
  }
  panel.innerHTML = buildReviewPanelContent(id, report, statusMap, currentFilter, showAddressed);

  const focusStack = document.getElementById('focus-stack');
  if (focusStack) {
    focusStack.innerHTML =
      currentViewMode === 'focus'
        ? renderFocusPanel(id, report, statusMap, currentFilter, showAddressed)
        : '';
  }

  updateDetailLayoutMode();
  updateFilterEmptyState();
  bindReviewEvents(id);
}

async function renderDetail(id) {
  const preserveEditor = editorState.reportId === id && document.querySelector('.detail-layout');
  const preservedContent = preserveEditor ? getEditorContent() : null;

  if (!preserveEditor) {
    app.innerHTML = '<p class="empty-state">Loading report…</p>';
    setBodyLayout(false);
    unbindEditorShortcut();
    unbindFocusShortcut();
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
    unbindFocusShortcut();
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
    unbindFocusShortcut();
    app.innerHTML = renderSchemaError(id, 'This report file is not valid for the current tracker.');
    return;
  }

  currentDetail = { id, report };
  setBodyLayout(true);
  bindEditorShortcut();
  bindFocusShortcut();

  if (preserveEditor) {
    await refreshReviewPanel(id);
    return;
  }

  app.innerHTML = `
    <div class="detail-layout">
      <div class="detail-header-bar" id="detail-header-bar"></div>
      <div class="review-panel" id="review-panel"></div>
      <div class="editor-stack" id="editor-stack">
        <div class="focus-stack" id="focus-stack" hidden></div>
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
    </div>
  `;

  const headerBar = document.getElementById('detail-header-bar');
  if (headerBar) {
    headerBar.innerHTML = buildHeaderBar(id, report, loadStatus(id));
  }

  document.getElementById('review-panel').innerHTML = buildReviewPanelContent(
    id,
    report,
    loadStatus(id),
    currentFilter,
    showAddressed
  );

  const focusStack = document.getElementById('focus-stack');
  if (focusStack && currentViewMode === 'focus') {
    focusStack.innerHTML = renderFocusPanel(id, report, loadStatus(id), currentFilter, showAddressed);
  }
  updateDetailLayoutMode();
  updateFilterEmptyState();

  bindReviewEvents(id);
  bindEditorEvents();
  await initEditor(report, preservedContent);
}

async function render() {
  const route = getRoute();
  if (route.view === 'detail' && route.id) {
    await renderDetail(route.id);
  } else {
    currentDetail = null;
    focusIndex = 0;
    await renderList();
  }
}

window.addEventListener('hashchange', () => {
  const route = getRoute();
  if (route.view === 'detail') {
    if (!currentDetail || currentDetail.id !== route.id) {
      focusIndex = 0;
    }
  }
  render();
});

loadPrefs();
render();
