const REPORTS_BASE = '/review-reports';
const STORAGE_PREFIX = 'draft-review:';
const EXPAND_PREFIX = 'draft-review-expand:';
const PREFS_KEY = 'draft-review:prefs';
const DEFAULT_FILTER = 'open';
const DEFAULT_AI_FILTER = 'all';
const DEFAULT_VIEW_MODE = 'list';
const SAVE_API = '/api/draft/save';

const SECTION_LABELS = {
  unclear_phrasing: 'Unclear phrasing',
  other_perspectives: 'Other perspectives',
  clarity: 'Clarity analysis',
  organization_and_logic: 'Text organization and logic',
  emotional_impact: 'Emotional impact and attention',
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

function getSectionCheckableItems(section) {
  if (!section?.items) return [];
  if (section.type === 'organization_and_logic' || section.type === 'emotional_impact') {
    return section.items.filter((item) => item.content);
  }
  return section.items;
}

function getReviewRound(report) {
  return report?.reviewRound || 1;
}

function getAiStatus(item) {
  return item?.aiStatus || 'open';
}

function isItemNew(item, report) {
  return item.addedInRound === getReviewRound(report);
}

function isMismatch(userStatus, item) {
  return userStatus === 'done' && getAiStatus(item) === 'open';
}

function itemMatchesAiFilter(item, report, statusMap, aiFilter) {
  if (aiFilter === 'all') return true;

  const aiStatus = getAiStatus(item);
  const userStatus = getItemStatus(statusMap, item.id);

  switch (aiFilter) {
    case 'flags':
      return aiStatus === 'open';
    case 'addressed':
      return aiStatus === 'addressed' || aiStatus === 'superseded';
    case 'outdated':
      return aiStatus === 'outdated';
    case 'new':
      return isItemNew(item, report);
    case 'mismatch':
      return isMismatch(userStatus, item);
    default:
      return true;
  }
}

function itemVisible(item, report, statusMap, userFilter, aiFilter) {
  const userStatus = getItemStatus(statusMap, item.id);
  if (!itemMatchesFilter(userStatus, userFilter)) return false;
  return itemMatchesAiFilter(item, report, statusMap, aiFilter);
}

function getSectionStats(section, statusMap, report) {
  const items = getSectionCheckableItems(section);
  let userOpen = 0;
  let newCount = 0;
  let aiAddressed = 0;
  let aiOutdated = 0;

  for (const item of items) {
    if (getItemStatus(statusMap, item.id) === 'open') userOpen += 1;
    if (isItemNew(item, report)) newCount += 1;
    const aiStatus = getAiStatus(item);
    if (aiStatus === 'addressed' || aiStatus === 'superseded') aiAddressed += 1;
    if (aiStatus === 'outdated') aiOutdated += 1;
  }

  return { total: items.length, userOpen, newCount, aiAddressed, aiOutdated };
}

function renderSectionMeta(section, statusMap, report) {
  if (!section) return '';

  const stats = getSectionStats(section, statusMap, report);
  if (stats.total === 0) return '';

  const parts = [];
  if (stats.userOpen > 0) parts.push(`${stats.userOpen} open`);
  if (stats.newCount > 0) parts.push(`${stats.newCount} new`);
  if (stats.aiAddressed > 0) parts.push(`${stats.aiAddressed} AI addressed`);
  if (stats.aiOutdated > 0) parts.push(`${stats.aiOutdated} outdated`);

  if (!parts.length) {
    return `<span class="section-meta">${stats.total} addressed</span>`;
  }

  return `<span class="section-meta">${parts.join(' · ')}</span>`;
}

function renderCollapsibleSection(reportId, sectionId, title, bodyHtml, section, statusMap, report) {
  const expanded = isSectionExpanded(reportId, sectionId);
  const meta = renderSectionMeta(section, statusMap, report);

  return `
    <section class="section collapsible-section${expanded ? ' is-expanded' : ''}" data-section-id="${escapeHtml(sectionId)}">
      <button type="button" class="section-toggle" aria-expanded="${expanded}">
        <span class="section-chevron" aria-hidden="true"></span>
        <span class="section-title-text">${escapeHtml(title)}</span>
        ${meta}
      </button>
      <div class="section-body">
        ${bodyHtml}
      </div>
    </section>
  `;
}

function getItemStatus(statusMap, itemId) {
  return statusMap[itemId] || 'open';
}

function getCheckableItems(report) {
  const items = [];
  for (const section of report.sections || []) {
    if (section.type === 'unclear_phrasing') {
      for (const item of section.items || []) items.push(item);
    } else if (section.items) {
      for (const item of section.items) items.push(item);
    }
  }
  return items;
}

function getProgress(report, statusMap) {
  const checkable = getCheckableItems(report);
  const total = checkable.length;
  let done = 0;
  let discarded = 0;
  let open = 0;

  for (const item of checkable) {
    const status = getItemStatus(statusMap, item.id);
    if (status === 'done') done += 1;
    else if (status === 'discarded') discarded += 1;
    else open += 1;
  }

  const addressed = done + discarded;
  const percent = total === 0 ? 100 : Math.round((addressed / total) * 100);

  return { total, done, discarded, open, addressed, percent };
}

function renderProgress(progress, compact = false) {
  const label = compact
    ? `${progress.percent}% addressed`
    : `${progress.addressed} of ${progress.total} addressed (${progress.open} open)`;

  return `
    <div class="progress-wrap">
      <div class="progress-label">
        <span>${escapeHtml(label)}</span>
        <span>${progress.done} done · ${progress.discarded} discarded</span>
      </div>
      <div class="progress-bar" role="progressbar" aria-valuenow="${progress.percent}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-fill" style="width: ${progress.percent}%"></div>
      </div>
    </div>
  `;
}

function renderSeverity(severity) {
  if (!severity) return '';
  const cls = `severity severity-${escapeHtml(severity)}`;
  return `<span class="${cls}">${escapeHtml(severity)}</span>`;
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

function itemMatchesFilter(status, filter) {
  if (filter === 'all') return true;
  return status === filter;
}

function renderItemBadges(item, report, userStatus) {
  const aiStatus = getAiStatus(item);
  const badges = [`<span class="ai-badge ai-badge-${escapeHtml(aiStatus)}">AI: ${escapeHtml(aiStatus)}</span>`];

  if (isItemNew(item, report)) {
    badges.push('<span class="item-badge badge-new">New</span>');
  }

  if (isMismatch(userStatus, item)) {
    badges.push('<span class="item-badge badge-mismatch">AI still flags</span>');
  }

  return badges.join('');
}

function getVisibleFocusItems(report, statusMap, userFilter, aiFilter) {
  const entries = [];
  for (const section of report.sections || []) {
    const items = getSectionCheckableItems(section);
    for (const item of items) {
      if (itemVisible(item, report, statusMap, userFilter, aiFilter)) {
        entries.push({ item, sectionType: section.type });
      }
    }
  }
  return entries;
}

function clampFocusIndex(index, total) {
  if (total === 0) return 0;
  return Math.max(0, Math.min(index, total - 1));
}

function renderItemFields(sectionType, item) {
  switch (sectionType) {
    case 'unclear_phrasing':
      return `${renderField('Original', item.original)}${renderField('Why', item.why)}`;
    case 'other_perspectives':
      return `${renderField('What I wrote', item.whatIWrote)}${renderField('Who might disagree', item.whoMightDisagree)}${renderField('How to improve', item.howToImprove)}`;
    case 'clarity':
      return `${renderField('Issue', item.issue)}${renderField('Suggested fix', item.suggestedFix)}`;
    case 'organization_and_logic':
    case 'emotional_impact':
      return `<p class="field-value">${escapeHtml(item.content)}</p>`;
    default:
      return '';
  }
}

function renderItemHeaderExtra(sectionType, item) {
  switch (sectionType) {
    case 'unclear_phrasing':
    case 'other_perspectives':
    case 'clarity':
      return renderSeverity(item.severity);
    case 'organization_and_logic':
    case 'emotional_impact':
      return `<span class="item-label">${escapeHtml(item.label || item.id)}</span>`;
    default:
      return '';
  }
}

function renderItemCard(reportId, report, item, statusMap, userFilter, aiFilter, innerHtml, headerExtra = '', options = {}) {
  const { forceVisible = false, actionsInHeader = false } = options;
  const userStatus = getItemStatus(statusMap, item.id);
  const hidden = !forceVisible && !itemVisible(item, report, statusMap, userFilter, aiFilter) ? ' is-hidden' : '';
  const stateClass = userStatus === 'open' ? '' : ` is-${userStatus}`;
  const mismatchClass = isMismatch(userStatus, item) ? ' is-mismatch' : '';
  const actionsHtml = renderItemActions(reportId, item.id, userStatus, actionsInHeader);

  const headerEnd = actionsInHeader
    ? `
      <div class="item-header-end">
        ${actionsHtml}
        <div class="item-badges">${renderItemBadges(item, report, userStatus)}</div>
      </div>
    `
    : `<div class="item-badges">${renderItemBadges(item, report, userStatus)}</div>`;

  return `
    <article class="item${stateClass}${hidden}${mismatchClass}${actionsInHeader ? ' item--header-actions' : ''}" data-item-id="${escapeHtml(item.id)}">
      <div class="item-header">
        ${headerExtra}
        ${headerEnd}
      </div>
      ${innerHtml}
      ${actionsInHeader ? '' : actionsHtml}
    </article>
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

function renderUnclearPhrasingSection(section, reportId, report, statusMap, userFilter, aiFilter) {
  const itemsHtml = (section.items || [])
    .map((item) =>
      renderItemCard(
        reportId,
        report,
        item,
        statusMap,
        userFilter,
        aiFilter,
        renderItemFields('unclear_phrasing', item),
        renderItemHeaderExtra('unclear_phrasing', item)
      )
    )
    .join('');

  const tipsHtml =
    section.tips && section.tips.length
      ? `<ol class="tips-list">${section.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ol>`
      : '';

  return renderCollapsibleSection(
    reportId,
    'unclear_phrasing',
    SECTION_LABELS.unclear_phrasing,
    `
      ${itemsHtml || '<p class="section-empty">No unclear phrasing items.</p>'}
      ${tipsHtml ? `<h3 class="item-label" style="margin-top:1rem">Tips for your writing</h3>${tipsHtml}` : ''}
    `,
    section,
    statusMap,
    report
  );
}

function renderOtherPerspectivesSection(section, reportId, report, statusMap, userFilter, aiFilter) {
  const itemsHtml = (section.items || [])
    .map((item) =>
      renderItemCard(
        reportId,
        report,
        item,
        statusMap,
        userFilter,
        aiFilter,
        renderItemFields('other_perspectives', item),
        renderItemHeaderExtra('other_perspectives', item)
      )
    )
    .join('');

  return renderCollapsibleSection(
    reportId,
    'other_perspectives',
    SECTION_LABELS.other_perspectives,
    itemsHtml || '<p class="section-empty">No perspective items.</p>',
    section,
    statusMap,
    report
  );
}

function renderClaritySection(section, reportId, report, statusMap, userFilter, aiFilter) {
  const itemsHtml = (section.items || [])
    .map((item) =>
      renderItemCard(
        reportId,
        report,
        item,
        statusMap,
        userFilter,
        aiFilter,
        renderItemFields('clarity', item),
        renderItemHeaderExtra('clarity', item)
      )
    )
    .join('');

  return renderCollapsibleSection(
    reportId,
    'clarity',
    SECTION_LABELS.clarity,
    itemsHtml || '<p class="section-empty">No clarity items.</p>',
    section,
    statusMap,
    report
  );
}

function renderSubsectionSection(section, reportId, report, statusMap, userFilter, aiFilter) {
  const label = SECTION_LABELS[section.type] || section.type;
  const itemsHtml = (section.items || [])
    .filter((item) => item.content)
    .map((item) =>
      renderItemCard(
        reportId,
        report,
        item,
        statusMap,
        userFilter,
        aiFilter,
        renderItemFields(section.type, item),
        renderItemHeaderExtra(section.type, item)
      )
    )
    .join('');

  return renderCollapsibleSection(
    reportId,
    section.type,
    label,
    itemsHtml || '<p class="section-empty">No items in this section.</p>',
    section,
    statusMap,
    report
  );
}

function renderSection(section, reportId, report, statusMap, userFilter, aiFilter) {
  switch (section.type) {
    case 'unclear_phrasing':
      return renderUnclearPhrasingSection(section, reportId, report, statusMap, userFilter, aiFilter);
    case 'other_perspectives':
      return renderOtherPerspectivesSection(section, reportId, report, statusMap, userFilter, aiFilter);
    case 'clarity':
      return renderClaritySection(section, reportId, report, statusMap, userFilter, aiFilter);
    case 'organization_and_logic':
    case 'emotional_impact':
      return renderSubsectionSection(section, reportId, report, statusMap, userFilter, aiFilter);
    default:
      return '';
  }
}

function renderExecutiveSummary(summary, reportId) {
  if (!summary) return '';

  const assumptions =
    summary.assumptions && summary.assumptions.length
      ? `<ul class="assumptions">${summary.assumptions.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
      : '';

  return renderCollapsibleSection(
    reportId,
    'executive-summary',
    'Executive summary',
    `
      <div class="summary-block">
        <p>${escapeHtml(summary.paragraph || '')}</p>
        ${assumptions}
      </div>
    `,
    null,
    {}
  );
}

function renderFilterToolbar(userFilter, aiFilter, viewMode) {
  const userFilters = [
    { id: 'open', label: 'Open' },
    { id: 'done', label: 'Done' },
    { id: 'discarded', label: 'Discarded' },
    { id: 'all', label: 'All' },
  ];

  const aiFilters = [
    { id: 'all', label: 'All' },
    { id: 'flags', label: 'Flags' },
    { id: 'addressed', label: 'Addressed' },
    { id: 'outdated', label: 'Outdated' },
    { id: 'new', label: 'New' },
    { id: 'mismatch', label: 'Mismatch' },
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
        <span class="filter-label">Your status</span>
        <select id="filter-user-status" class="filter-select" aria-label="Filter by your status">
          ${renderOptions(userFilters, userFilter)}
        </select>
      </label>
      <label class="filter-field">
        <span class="filter-label">AI status</span>
        <select id="filter-ai-status" class="filter-select" aria-label="Filter by AI status">
          ${renderOptions(aiFilters, aiFilter)}
        </select>
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

function renderFocusTopBar(counterText, sectionLabel, prevDisabled, nextDisabled) {
  const toggleLabel = focusMetaExpanded ? 'Hide info' : 'Info & filters';
  return `
    <div class="focus-top">
      <a class="back-link focus-back-link" href="#/">← Reports</a>
      <div class="focus-nav">
        <button type="button" class="btn focus-nav-btn" id="focus-prev"${prevDisabled} aria-label="Previous suggestion">←</button>
        <div class="focus-nav-meta">
          <span class="focus-counter">${escapeHtml(counterText)}</span>
          ${sectionLabel ? `<span class="focus-section-label">${escapeHtml(sectionLabel)}</span>` : ''}
        </div>
        <button type="button" class="btn focus-nav-btn" id="focus-next"${nextDisabled} aria-label="Next suggestion">→</button>
      </div>
      <button type="button" class="btn focus-meta-toggle" id="focus-meta-toggle" aria-expanded="${focusMetaExpanded}">
        ${escapeHtml(toggleLabel)}
      </button>
    </div>
  `;
}

function renderFocusPanel(id, report, statusMap, userFilter, aiFilter) {
  const visibleItems = getVisibleFocusItems(report, statusMap, userFilter, aiFilter);
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

  const { item, sectionType } = visibleItems[index];
  const sectionLabel = SECTION_LABELS[sectionType] || sectionType;
  const cardHtml = renderItemCard(
    id,
    report,
    item,
    statusMap,
    userFilter,
    aiFilter,
    renderItemFields(sectionType, item),
    renderItemHeaderExtra(sectionType, item),
    { forceVisible: true, actionsInHeader: true }
  );

  const prevDisabled = index === 0 ? ' disabled' : '';
  const nextDisabled = index >= visibleItems.length - 1 ? ' disabled' : '';
  const counterText = `${index + 1} / ${visibleItems.length}`;

  return `
    <div class="focus-panel">
      ${renderFocusTopBar(counterText, sectionLabel, prevDisabled, nextDisabled)}
      ${cardHtml}
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

function navigateToList() {
  window.location.hash = '#/';
}

function navigateToReport(id) {
  window.location.hash = `#/report/${encodeURIComponent(id)}`;
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
let currentAiFilter = DEFAULT_AI_FILTER;
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
    if (prefs.aiFilter) currentAiFilter = prefs.aiFilter;
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
      aiFilter: currentAiFilter,
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
  const visible = getVisibleFocusItems(currentDetail.report, loadStatus(id), currentFilter, currentAiFilter);
  if (focusIndex > 0) {
    focusIndex -= 1;
    refreshReviewPanel(id);
  }
}

function moveFocusNext(id) {
  if (!id || !currentDetail?.report) return;
  const visible = getVisibleFocusItems(currentDetail.report, loadStatus(id), currentFilter, currentAiFilter);
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
    ? `Review round ${reviewRound} · last reviewed ${formatDate(report.lastReviewedAt)}`
    : `Review round ${reviewRound}`;

  return `
    <div class="detail-header">
      <a class="back-link" href="#/">← All reports</a>
      <h2 class="detail-title">${escapeHtml(report.title || id)}</h2>
      <p class="detail-meta">
        <span>${escapeHtml(report.draftPath || '')}</span>
        · <span>${escapeHtml(formatDate(report.createdAt))}</span>
        · <span>${escapeHtml(roundMeta)}</span>
      </p>
      ${renderProgress(progress)}
    </div>
    ${renderFilterToolbar(currentFilter, currentAiFilter, currentViewMode)}
  `;
}

function buildListBody(id, report, statusMap, userFilter, aiFilter) {
  const sectionsHtml = (report.sections || [])
    .map((section) => renderSection(section, id, report, statusMap, userFilter, aiFilter))
    .join('');

  return `${renderExecutiveSummary(report.executiveSummary, id)}${sectionsHtml}`;
}

function buildReviewContent(id, report, statusMap, userFilter, aiFilter) {
  const header = buildReviewHeader(id, report, statusMap);

  if (currentViewMode === 'focus') {
    return header;
  }

  return `${header}${buildListBody(id, report, statusMap, userFilter, aiFilter)}`;
}

function updateDetailLayoutMode() {
  const layout = document.querySelector('.detail-layout');
  const focusStack = document.getElementById('focus-stack');
  const reviewPanel = document.getElementById('review-panel');
  if (!layout) return;

  const isFocus = currentViewMode === 'focus';
  layout.classList.toggle('detail-layout--focus', isFocus);
  layout.classList.toggle('detail-layout--focus-meta-collapsed', isFocus && !focusMetaExpanded);
  document.body.classList.toggle('is-focus-view', isFocus);

  if (focusStack) {
    focusStack.hidden = !isFocus;
  }

  if (reviewPanel) {
    reviewPanel.hidden = isFocus && !focusMetaExpanded;
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

  document.getElementById('filter-ai-status')?.addEventListener('change', (event) => {
    currentAiFilter = event.target.value;
    savePrefs();
    refreshReviewPanel(id);
  });

  document.getElementById('filter-view-mode')?.addEventListener('change', (event) => {
    currentViewMode = event.target.value;
    savePrefs();
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

  app.querySelectorAll('.section-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.closest('.collapsible-section');
      if (!section) return;

      const sectionId = section.dataset.sectionId;
      const expanded = !section.classList.contains('is-expanded');

      section.classList.toggle('is-expanded', expanded);
      btn.setAttribute('aria-expanded', String(expanded));
      saveSectionExpanded(id, sectionId, expanded);
    });
  });
}

async function refreshReviewPanel(id) {
  const report = await loadReport(id);
  currentDetail = { id, report };
  const statusMap = loadStatus(id);

  if (currentViewMode === 'focus') {
    const visible = getVisibleFocusItems(report, statusMap, currentFilter, currentAiFilter);
    focusIndex = clampFocusIndex(focusIndex, visible.length);
  }

  const panel = document.getElementById('review-panel');
  if (!panel) return;
  panel.innerHTML = buildReviewContent(id, report, statusMap, currentFilter, currentAiFilter);

  const focusStack = document.getElementById('focus-stack');
  if (focusStack) {
    focusStack.innerHTML =
      currentViewMode === 'focus'
        ? renderFocusPanel(id, report, statusMap, currentFilter, currentAiFilter)
        : '';
  }

  updateDetailLayoutMode();
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

  document.getElementById('review-panel').innerHTML = buildReviewContent(
    id,
    report,
    loadStatus(id),
    currentFilter,
    currentAiFilter
  );

  const focusStack = document.getElementById('focus-stack');
  if (focusStack && currentViewMode === 'focus') {
    focusStack.innerHTML = renderFocusPanel(id, report, loadStatus(id), currentFilter, currentAiFilter);
  }
  updateDetailLayoutMode();

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
