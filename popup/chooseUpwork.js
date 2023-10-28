/*!
 * @changed 2023.10.29, 00:07
 */

var hasInstalled = false;

function getChangeTag() {
  const tag = `@changed 2023.10.29, 00:07
  `.trim();
  return tag;
}

// @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
const usedStorage = browser.storage.local;
const storagePrefix = 'upworkify:';
const storageFiltersKey = storagePrefix + 'filters';

console.log('Started chooseUpwork', getChangeTag(), {
  hasInstalled,
  'window.hasInstalled': window.hasInstalled,
  sessionStorage,
  storage: browser.storage.local,
  'window.filters': window.filters,
});

// Filters...
const defaultFilters = {
  showCountries: false,
  showRecents: false,
  __changed: getChangeTag(),
};
window.filters = { ...defaultFilters };

// usedStorage.set({ filters });
usedStorage.get('filters').then(({ filters }) => {
  console.log('[chooseUpwork:check filters]', filters, {
    filters,
  });
});

/**
 * CSS to hide everything on the page,
 * except for elements that have the "upworkify-image" class.
 */
const pageStyles = `
body > :not(.upworkify-image) {
  display: none !important;
}
body.upworkify-filters-applied {
  border: 4px solid green;
}
`;

// // NOTE: External styles with `file` doesn't work.
// const pageStyle = { file: 'styles.css' };
const pageStyle = { code: pageStyles };

function getCurrentTabPromise() {
  return browser.tabs.query({ active: true, currentWindow: true });
}

async function saveFilters() {
  // const json = JSON.stringify(filters);
  console.log('[chooseUpwork:saveFilters]', {
    filters: window.filters,
    // json,
    storageFiltersKey,
    usedStorage,
  });
  // sessionStorage?.setItem(storageFiltersKey, json);
  // window.filters = filters;
  await usedStorage.set({ filters: window.filters });
  console.log('[chooseUpwork:saveFilters] done');
}

async function loadFilters() {
  // const json = sessionStorage?.getItem(storageFiltersKey);
  // filters = json ? JSON.parse(json) : { ...defaultFilters };
  console.log('[chooseUpwork:loadFilters]', {
    // filters,
    // json,
    storageFiltersKey,
    // 'window.filters': window.filters,
  });
  const { filters } = await usedStorage.get('filters');
  console.log('[chooseUpwork:loadFilters] done', {
    filters,
    storageFiltersKey,
  });
  window.filters = filters ? { ...filters } : { ...defaultFilters };
}

function applyFilters() {
  const { filters } = window;
  console.log('[chooseUpwork:applyFilters]', {
    filters,
  });
  // Save filters in storage...
  getCurrentTabPromise()
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        command: 'applyFilters',
        filters,
      });
    })
    .catch(reportError);
}

function resetFilters() {
  const { filters } = window;
  console.log('[chooseUpwork:resetFilters]', {
    filters,
  });
  // Reset filters data and interface...
  window.filters = { ...defaultFilters };
  getCurrentTabPromise()
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        command: 'resetFilters',
      });
    })
    .catch(reportError);
}

function getShowCountriesCheckbox() {
  return document.getElementById('showCountries');
}
function getApplyButton() {
  return document.getElementById('apply');
}
function getResetButton() {
  return document.getElementById('reset');
}

function resetFilterControls() {
  const showCountriesCheckbox = getShowCountriesCheckbox();
  showCountriesCheckbox.checked = false;
}

/* function __debugClick (e) {
 *   [>*
 *    * Given the name of a upwork, get the URL to the corresponding image.
 *    <]
 *   function upworkNameToURL(upworkName) {
 *     console.log('[chooseUpwork:listenForClicks:upworkNameToURL]', {
 *       upworkName,
 *     });
 *     switch (upworkName) {
 *       case "Frog":
 *         return browser.runtime.getURL("upworks/frog.jpg");
 *       case "Snake":
 *         return browser.runtime.getURL("upworks/snake.jpg");
 *       case "Turtle":
 *         return browser.runtime.getURL("upworks/turtle.jpg");
 *     }
 *   }
 *   [>*
 *    * Insert the page-hiding CSS into the active tab,
 *    * then get the upwork URL and
 *    * send a "upworkify" message to the content script in the active tab.
 *    <]
 *   function doUpworkify(tabs) {
 *     console.log('[chooseUpwork:listenForClicks:doUpworkify]', {
 *       hasInstalled,
 *       'window.hasInstalled': window.hasInstalled,
 *       tabs,
 *       textContent: e.target.textContent,
 *     });
 *     hasInstalled = true;
 *     window.hasInstalled = true;
 *     browser.tabs
 *       .insertCSS(pageStyle)
 *       .then(() => {
 *         const url = upworkNameToURL(e.target.textContent);
 *         browser.tabs.sendMessage(tabs[0].id, {
 *           command: "upworkify",
 *           upworkURL: url,
 *         });
 *       })
 *     ;
 *   }
 *   [>*
 *    * Remove the page-hiding CSS from the active tab,
 *    * send a "reset" message to the content script in the active tab.
 *    <]
 *   function doReset(tabs) {
 *     console.log('[chooseUpwork:listenForClicks:doReset]', {
 *       hasInstalled,
 *       'window.hasInstalled': window.hasInstalled,
 *       tabs,
 *     });
 *     hasInstalled = false;
 *     window.hasInstalled = false;
 *     browser.tabs
 *       .removeCSS(pageStyle)
 *       .then(() => {
 *         browser.tabs.sendMessage(tabs[0].id, {
 *           command: "reset",
 *         });
 *       })
 *     ;
 *   }
 *   [>*
 *    * Just log the error to the console.
 *    <]
 *   function reportError(error) {
 *     console.error('[chooseUpwork:reportError]', error.message, {
 *       error,
 *     });
 *     debugger;
 *   }
 *   [>*
 *    * Get the active tab,
 *    * then call "doUpworkify()" or "doReset()" as appropriate.
 *    <]
 *   if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
 *     // Ignore when click is not on a button within <div id="popup-content">.
 *     return;
 *   }
 *   if (e.target.type === "reset") {
 *     getCurrentTabPromise()
 *       .then(doReset)
 *       .catch(reportError);
 *   } else {
 *     getCurrentTabPromise()
 *       .then(doUpworkify)
 *       .catch(reportError);
 *   }
 * }
 */
/** Listen for clicks on the buttons, and send the appropriate message to the content script in the page.
 */
/* function listenForClicks() {
 *   document.addEventListener("click", __debugClick);
 * }
 */

function updatePopupContent() {
  const { filters } = window;
  const {
    showCountries,
    showRecents,
  } = filters;
  console.log('[chooseUpwork:updatePopupContent]', {
    showCountries,
    showRecents,
    filters,
  });
  const showCountriesCheckbox = getShowCountriesCheckbox();
  showCountriesCheckbox.checked = filters.showCountries;
}

function userActions() {
  const { filters } = window;
  const showCountriesCheckbox = getShowCountriesCheckbox();
  const applyButton = getApplyButton();
  const resetButton = getResetButton();
  console.log('[chooseUpwork:userActions]', {
    showCountriesCheckbox,
    applyButton,
    resetButton,
  });
  showCountriesCheckbox?.addEventListener('change', (ev) => {
    const { currentTarget } = ev;
    const { checked } = currentTarget;
    /* console.log('[chooseUpwork:showCountries:onChange]', {
     *   checked,
     *   ev,
     * });
     */
    filters.showCountries = checked;
    saveFilters();
  });
  applyButton?.addEventListener('click', applyFilters);
  resetButton?.addEventListener('click', resetFilters);
}

/** There was an error executing the script. Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error('[chooseUpwork:reportExecuteScriptError]', error.message, {
    error,
  });
  debugger;
}

// @see https://github.com/mdn/webextensions-examples/blob/main/favourite-colour/options.js

async function init() {
  await loadFilters();
  updatePopupContent();
}

init();

/** When the popup loads, inject a content script into the active tab, and add a click handler. If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "/page/client.js" })
  // .then(listenForClicks)
  .then(userActions)
  .catch(reportExecuteScriptError);

