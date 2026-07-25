const REPORTS_BASE = '/review-reports';
const STORAGE_PREFIX = 'draft-review:';
const EXPAND_PREFIX = 'draft-review-expand:';
const DEFAULT_FILTER = 'open';
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

function getSectionStats(section, statusMap) {
  const items = getSectionCheckableItems(section);
  let open = 0;

  for (const item of items) {
    if (getItemStatus(statusMap, item.id) === 'open') {
      open += 1;
    }
  }

  return { total: items.length, open };
}

function renderSectionMeta(section, statusMap) {
  if (!section) return '';

  const stats = getSectionStats(section, statusMap);
  if (stats.total === 0) return '';

  if (stats.open === 0) {
    return `<span class="section-meta">${stats.total} addressed</span>`;
  }

  return `<span class="section-meta">${stats.open} open</span>`;
}

function renderCollapsibleSection(reportId, sectionId, title, bodyHtml, section, statusMap) {
  const expanded = isSectionExpanded(reportId, sectionId);
  const meta = renderSectionMeta(section, statusMap);

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

function renderItemActions(reportId, itemId, status) {
  return `
    <div class="item-actions" data-report-id="${escapeHtml(reportId)}" data-item-id="${escapeHtml(itemId)}">
      <button type="button" class="btn btn-done${status === 'done' ? ' is-active' : ''}" data-action="done">Done</button>
      <button type="button" class="btn btn-discard${status === 'discarded' ? ' is-active' : ''}" data-action="discarded">Discard</button>
      ${status !== 'open' ? '<button type="button" class="btn" data-action="open">Reset</button>' : ''}
    </div>
  `;
}

function renderUnclearPhrasingSection(section, reportId, statusMap, filter) {
  const itemsHtml = (section.items || [])
    .map((item) => {
      const status = getItemStatus(statusMap, item.id);
      const hidden = !itemMatchesFilter(status, filter) ? ' is-hidden' : '';
      const stateClass = status === 'open' ? '' : ` is-${status}`;

      return `
        <article class="item${stateClass}${hidden}" data-item-id="${escapeHtml(item.id)}">
          <div class="item-header">
            ${renderSeverity(item.severity)}
          </div>
          ${renderField('Original', item.original)}
          ${renderField('Why', item.why)}
          ${renderItemActions(reportId, item.id, status)}
        </article>
      `;
    })
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
    statusMap
  );
}

function renderOtherPerspectivesSection(section, reportId, statusMap, filter) {
  const itemsHtml = (section.items || [])
    .map((item) => {
      const status = getItemStatus(statusMap, item.id);
      const hidden = !itemMatchesFilter(status, filter) ? ' is-hidden' : '';
      const stateClass = status === 'open' ? '' : ` is-${status}`;

      return `
        <article class="item${stateClass}${hidden}" data-item-id="${escapeHtml(item.id)}">
          <div class="item-header">${renderSeverity(item.severity)}</div>
          ${renderField('What I wrote', item.whatIWrote)}
          ${renderField('Who might disagree', item.whoMightDisagree)}
          ${renderField('How to improve', item.howToImprove)}
          ${renderItemActions(reportId, item.id, status)}
        </article>
      `;
    })
    .join('');

  return renderCollapsibleSection(
    reportId,
    'other_perspectives',
    SECTION_LABELS.other_perspectives,
    itemsHtml || '<p class="section-empty">No perspective items.</p>',
    section,
    statusMap
  );
}

function renderClaritySection(section, reportId, statusMap, filter) {
  const itemsHtml = (section.items || [])
    .map((item) => {
      const status = getItemStatus(statusMap, item.id);
      const hidden = !itemMatchesFilter(status, filter) ? ' is-hidden' : '';
      const stateClass = status === 'open' ? '' : ` is-${status}`;

      return `
        <article class="item${stateClass}${hidden}" data-item-id="${escapeHtml(item.id)}">
          <div class="item-header">${renderSeverity(item.severity)}</div>
          ${renderField('Issue', item.issue)}
          ${renderField('Suggested fix', item.suggestedFix)}
          ${renderItemActions(reportId, item.id, status)}
        </article>
      `;
    })
    .join('');

  return renderCollapsibleSection(
    reportId,
    'clarity',
    SECTION_LABELS.clarity,
    itemsHtml || '<p class="section-empty">No clarity items.</p>',
    section,
    statusMap
  );
}

function renderSubsectionSection(section, reportId, statusMap, filter) {
  const label = SECTION_LABELS[section.type] || section.type;
  const itemsHtml = (section.items || [])
    .filter((item) => item.content)
    .map((item) => {
      const status = getItemStatus(statusMap, item.id);
      const hidden = !itemMatchesFilter(status, filter) ? ' is-hidden' : '';
      const stateClass = status === 'open' ? '' : ` is-${status}`;

      return `
        <article class="item${stateClass}${hidden}" data-item-id="${escapeHtml(item.id)}">
          <div class="item-header">
            <span class="item-label">${escapeHtml(item.label || item.id)}</span>
          </div>
          <p class="field-value">${escapeHtml(item.content)}</p>
          ${renderItemActions(reportId, item.id, status)}
        </article>
      `;
    })
    .join('');

  return renderCollapsibleSection(
    reportId,
    section.type,
    label,
    itemsHtml || '<p class="section-empty">No items in this section.</p>',
    section,
    statusMap
  );
}

function renderSection(section, reportId, statusMap, filter) {
  switch (section.type) {
    case 'unclear_phrasing':
      return renderUnclearPhrasingSection(section, reportId, statusMap, filter);
    case 'other_perspectives':
      return renderOtherPerspectivesSection(section, reportId, statusMap, filter);
    case 'clarity':
      return renderClaritySection(section, reportId, statusMap, filter);
    case 'organization_and_logic':
    case 'emotional_impact':
      return renderSubsectionSection(section, reportId, statusMap, filter);
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

function renderFilterToolbar(activeFilter) {
  const filters = [
    { id: 'open', label: 'Open' },
    { id: 'done', label: 'Done' },
    { id: 'discarded', label: 'Discarded' },
    { id: 'all', label: 'All' },
  ];

  const buttons = filters
    .map(
      (f) =>
        `<button type="button" class="filter-btn${f.id === activeFilter ? ' is-active' : ''}" data-filter="${f.id}">${f.label}</button>`
    )
    .join('');

  return `
    <div class="toolbar">
      <span class="toolbar-label">Show</span>
      <div class="filter-group" role="group" aria-label="Filter items">${buttons}</div>
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

function buildReviewContent(id, report, statusMap, filter) {
  const progress = getProgress(report, statusMap);
  const sectionsHtml = (report.sections || [])
    .map((section) => renderSection(section, id, statusMap, filter))
    .join('');

  return `
    <div class="detail-header">
      <a class="back-link" href="#/">← All reports</a>
      <h2 class="detail-title">${escapeHtml(report.title || id)}</h2>
      <p class="detail-meta">
        <span>${escapeHtml(report.draftPath || '')}</span>
        · <span>${escapeHtml(formatDate(report.createdAt))}</span>
      </p>
      ${renderProgress(progress)}
      <div class="detail-actions">
        <button type="button" class="btn btn-danger" id="clear-progress">Clear progress</button>
      </div>
    </div>
    ${renderFilterToolbar(filter)}
    ${renderExecutiveSummary(report.executiveSummary, id)}
    ${sectionsHtml}
  `;
}

function bindReviewEvents(id) {
  document.getElementById('clear-progress')?.addEventListener('click', () => {
    if (window.confirm('Clear all progress for this report? This cannot be undone.')) {
      clearStatus(id);
      refreshReviewPanel(id);
    }
  });

  app.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      refreshReviewPanel(id);
    });
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
  const panel = document.getElementById('review-panel');
  if (!panel) return;
  panel.innerHTML = buildReviewContent(id, report, loadStatus(id), currentFilter);
  bindReviewEvents(id);
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

  currentDetail = { id, report };
  setBodyLayout(true);
  bindEditorShortcut();

  if (preserveEditor) {
    await refreshReviewPanel(id);
    return;
  }

  app.innerHTML = `
    <div class="detail-layout">
      <div class="review-panel" id="review-panel"></div>
      <aside class="editor-panel" aria-label="Draft editor">
        <div class="editor-toolbar">
          <div class="editor-toolbar-main">
            <span class="editor-label">Draft</span>
            <span class="editor-path" id="editor-path"></span>
          </div>
          <div class="editor-toolbar-actions">
            <span class="editor-status" id="editor-status"></span>
            <button type="button" class="btn btn-primary" id="save-draft">Save</button>
          </div>
        </div>
        <textarea id="draft-editor" class="draft-editor" spellcheck="true" aria-label="Draft text"></textarea>
        <p class="editor-hint">Ctrl+S to save</p>
      </aside>
    </div>
  `;

  document.getElementById('review-panel').innerHTML = buildReviewContent(
    id,
    report,
    loadStatus(id),
    currentFilter
  );

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
    currentFilter = DEFAULT_FILTER;
    await renderList();
  }
}

window.addEventListener('hashchange', () => {
  const route = getRoute();
  if (route.view === 'detail') {
    if (!currentDetail || currentDetail.id !== route.id) {
      currentFilter = DEFAULT_FILTER;
    }
  }
  render();
});

render();
