const REPORTS_BASE = '/review-reports';
const STORAGE_PREFIX = 'draft-review:';
const DEFAULT_FILTER = 'open';

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

  return `
    <section class="section">
      <h2 class="section-title">${escapeHtml(SECTION_LABELS.unclear_phrasing)}</h2>
      ${itemsHtml || '<p class="section-empty">No unclear phrasing items.</p>'}
      ${tipsHtml ? `<h3 class="item-label" style="margin-top:1rem">Tips for your writing</h3>${tipsHtml}` : ''}
    </section>
  `;
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

  return `
    <section class="section">
      <h2 class="section-title">${escapeHtml(SECTION_LABELS.other_perspectives)}</h2>
      ${itemsHtml || '<p class="section-empty">No perspective items.</p>'}
    </section>
  `;
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

  return `
    <section class="section">
      <h2 class="section-title">${escapeHtml(SECTION_LABELS.clarity)}</h2>
      ${itemsHtml || '<p class="section-empty">No clarity items.</p>'}
    </section>
  `;
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

  return `
    <section class="section">
      <h2 class="section-title">${escapeHtml(label)}</h2>
      ${itemsHtml || '<p class="section-empty">No items in this section.</p>'}
    </section>
  `;
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

function renderExecutiveSummary(summary) {
  if (!summary) return '';

  const assumptions =
    summary.assumptions && summary.assumptions.length
      ? `<ul class="assumptions">${summary.assumptions.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
      : '';

  return `
    <section class="section">
      <h2 class="section-title">Executive summary</h2>
      <div class="summary-block">
        <p>${escapeHtml(summary.paragraph || '')}</p>
        ${assumptions}
      </div>
    </section>
  `;
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

async function renderDetail(id) {
  app.innerHTML = '<p class="empty-state">Loading report…</p>';

  let report;
  try {
    report = await loadReport(id);
  } catch (error) {
    app.innerHTML = `
      <div class="error-state">
        <p><a class="back-link" href="#/">← All reports</a></p>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
    return;
  }

  currentDetail = { id, report };
  const statusMap = loadStatus(id);
  const progress = getProgress(report, statusMap);

  const sectionsHtml = (report.sections || [])
    .map((section) => renderSection(section, id, statusMap, currentFilter))
    .join('');

  app.innerHTML = `
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
    ${renderFilterToolbar(currentFilter)}
    ${renderExecutiveSummary(report.executiveSummary)}
    ${sectionsHtml}
  `;

  document.getElementById('clear-progress')?.addEventListener('click', () => {
    if (window.confirm('Clear all progress for this report? This cannot be undone.')) {
      clearStatus(id);
      renderDetail(id);
    }
  });

  app.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      renderDetail(id);
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
        renderDetail(reportId);
      });
    });
  });
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
    currentFilter = DEFAULT_FILTER;
  }
  render();
});

render();
