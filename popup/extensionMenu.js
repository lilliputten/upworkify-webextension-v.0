// @ts-check

/* globals browser */
/* eslint-disable no-console */
/*!
 * @changed 2023.10.29, 23:18
 */

function getChangeTag() {
  const tag = `@changed 2023.10.29, 23:18
  `.trim();
  return tag;
}

const changedTag = getChangeTag();

// @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
const usedStorage = browser.storage.local;
const storagePrefix = 'upworkify:';
const storageFiltersKey = storagePrefix + 'filters';

console.log('Started extensionMenu', changedTag, {
  __upworkifyChangedTag: window.__upworkifyChangedTag,
  changedTag,
  browser,
});
window.__upworkifyChangedTag = changedTag;

// Filters...
/** Default filters
 * @type {TFilters}
 */
const defaultFilters = {
  showCountries: false,
  showRecents: '',
  __changed: changedTag,
};
window.filters = { ...defaultFilters };

// usedStorage.set({ filters });
usedStorage.get('filters').then(({ filters }) => {
  console.log('[extensionMenu:check filters]', filters, {
    filters,
  });
});

/**
 * CSS to hide everything on the page,
 * except for elements that have the "upworkify-image" class.
 */
const pageStyles = `
--body {
  /* DEBUG */
  border: 2px solid gray;
}
--body.upworkify-filters-applied {
  /* DEBUG */
  border: 2px solid red;
}
body.upworkify-filters-applied [data-test="job-tile-list"] .up-card-section [data-test="client-country"] {
  /* Always show country block! */
  display: inline-flex !important;
}
body.upworkify-filters-applied .row.app-frame > .col-12.col-lg-9 {
  /* Make main column full-width */
  flex: 1;
  max-width: none;
}
body.upworkify-filters-applied .row.app-frame > .col-12.col-lg-9 > .announcements {
  /* Hide banner */
  display: none !important;
}
body.upworkify-filters-applied .row.app-frame > aside {
  /* Hide right column */
  display: none !important;
}
--body.upworkify-filters-applied [data-test="job-tile-list"] {
  border: 1px solid purple; /* DEBUG */
}
--body.upworkify-filters-applied [data-test="job-tile-list"] .up-card-section {
  border: 1px solid orange; /* DEBUG */
}
body.upworkify-filters-applied [data-test="job-tile-list"] .up-card-section {
  /* Dim unprocessed items */
  opacity: .7;
}
body.upworkify-filters-applied [data-test="job-tile-list"] .up-card-section.processed {
  /* Dim unprocessed items */
  opacity: 1;
  border: 2px solid rgba(100,100,100,.2); /* DEBUG */
  border-radius: 8px;
  margin: 10px auto;
}
body.upworkify-filters-applied .hilite {
  background-color: rgba(0,128,0,.4);
  color: #000 !important;
  font-weight: normal;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
}
`;

/* // NOTE: External styles with `file` doesn't work.
 * const pageStyle = { file: 'styles.css' };
 */
const pageStyle = { code: pageStyles };

/** @return Promise */
function getCurrentTabPromise() {
  return browser.tabs.query({ active: true, currentWindow: true });
}

async function saveFilters() {
  /* console.log('[extensionMenu:saveFilters]', {
   *   filters: window.filters,
   *   storageFiltersKey,
   *   usedStorage,
   * });
   */
  const obj = { filters: window.filters };
  await usedStorage.set(obj);
  // console.log('[extensionMenu:saveFilters] done');
}

async function loadFilters() {
  /*
   * console.log('[extensionMenu:loadFilters]', {
   *   storageFiltersKey,
   * });
   */
  /** @type {{ filters: TFilters }} */
  const { filters } = await usedStorage.get('filters');
  /* console.log('[extensionMenu:loadFilters] done', {
   *   filters,
   *   storageFiltersKey,
   * });
   */
  window.filters = filters ? { ...filters } : { ...defaultFilters };
}

/** @return {Promise} */
function applyFiltersInTarget() {
  const { filters } = window;
  console.log('[extensionMenu:applyFiltersInTarget]', {
    filters,
  });
  return getCurrentTabPromise()
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        command: 'applyFilters',
        filters,
      });
    })
    .catch(reportError);
}

/** @return {Promise} */
function resetFiltersInTaget() {
  const { filters } = window;
  console.log('[extensionMenu:resetFiltersInTaget]', {
    filters,
  });
  return getCurrentTabPromise()
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        command: 'resetFilters',
      });
    })
    .catch(reportError);
}

function handleResetFilters() {
  // Reset filters data and interface...
  window.filters = { ...defaultFilters };
  // Update popup state (is it required? -- it'll be refreshed on the next opening)...
  updatePopupContent();
  // Reset filters in the target page...
  resetFiltersInTaget();
}

function getShowCountriesCheckbox() {
  return /** @type {HTMLInputElement} */ (document.getElementById('showCountries'));
}
function getShowRecentsInput() {
  return /** @type {HTMLInputElement} */ (document.getElementById('showRecents'));
}
function getApplyButton() {
  return /** @type {HTMLButtonElement} */ (document.getElementById('apply'));
}
function getResetButton() {
  return /** @type {HTMLButtonElement} */ (document.getElementById('reset'));
}

/**
 * Just log the error to the console.
 * @param {Error} error
 */
function reportError(error) {
  // eslint-disable-next-line no-console
  console.error('[extensionMenu:reportError]', error.message, {
    error,
  });
  // eslint-disable-next-line no-debugger
  debugger;
}

function updatePopupContent() {
  const { filters } = window;
  /* console.log('[extensionMenu:updatePopupContent]', {
   *   filters,
   * });
   */
  // Update controls...
  const showCountriesCheckbox = getShowCountriesCheckbox();
  showCountriesCheckbox.checked = filters.showCountries;
  const showRecentsInput = getShowRecentsInput();
  showRecentsInput.value = String(Number(filters.showRecents) || '');
}

/** @param {Event} ev
 */
function handleShowCountriesUpdate(ev) {
  const { filters } = window;
  const input = /** @type {HTMLInputElement} */ (ev.currentTarget);
  const { checked } = input;
  /* console.log('[extensionMenu:showCountries:onChange]', {
   *   checked,
   *   ev,
   * });
   */
  filters.showCountries = checked;
  saveFilters();
}

/** @param {Event} ev
 */
function handleShowRecentsUpdate(ev) {
  const { filters } = window;
  const input = /** @type {HTMLInputElement} */ (ev.currentTarget);
  const { value } = input;
  /* console.log('[extensionMenu:showRecents:onChange]', {
   *   checked,
   *   ev,
   * });
   */
  filters.showRecents = (!isNaN(Number(value)) && Number(value)) || '';
  saveFilters();
}

function userActions() {
  const showCountriesCheckbox = getShowCountriesCheckbox();
  const showRecentsInput = getShowRecentsInput();
  const applyButton = getApplyButton();
  const resetButton = getResetButton();
  /* console.log('[extensionMenu:userActions]', {
   *   showCountriesCheckbox,
   *   applyButton,
   *   resetButton,
   * });
   */
  showCountriesCheckbox?.addEventListener('change', handleShowCountriesUpdate);
  showRecentsInput?.addEventListener('change', handleShowRecentsUpdate);
  applyButton?.addEventListener('click', applyFiltersInTarget);
  resetButton?.addEventListener('click', handleResetFilters);
}

/** There was an error executing the script. Display the popup's error message, and hide the normal UI.
 * @param {Error} error
 */
function reportExecuteScriptError(error) {
  document.querySelector('#popup-content').classList.add('hidden');
  document.querySelector('#error-content').classList.remove('hidden');
  // eslint-disable-next-line no-console
  console.error('[extensionMenu:reportExecuteScriptError]', error.message, {
    error,
  });
  // eslint-disable-next-line no-debugger
  debugger;
}

// @see https://github.com/mdn/webextensions-examples/blob/main/favourite-colour/options.js

async function init() {
  await loadFilters();
  updatePopupContent();
  const tabs = await getCurrentTabPromise();
  const tabId = tabs[0].id;
  browser.tabs.insertCSS(tabId, pageStyle);
  /** When the popup loads, inject a content script into the active tab, and add a click handler. If we couldn't inject the script, handle the error.
   */
  browser.tabs
    .executeScript(tabId, { file: '/page/client.js' })
    // .then(listenForClicks)
    .then(userActions)
    .catch(reportExecuteScriptError);
}

init();
