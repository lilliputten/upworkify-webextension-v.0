/*!
 * @changed 2023.10.28, 22:03
 */

function getChangeTag() {
  const tag = `@changed 2023.10.28, 22:03
  `.trim();
  return tag;
}

var hasInstalled = false;

console.log('Started upworkify:page/client', getChangeTag(), {
  hasInstalled,
  // 'window.hasInstalled': window.hasInstalled,
  'window.hasRun': window.hasRun,
});


(() => {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;
  hasInstalled = true;

  /**
   * Given a URL to a upwork image, remove all existing upworks, then
   * create and style an IMG node pointing to
   * that image, then insert the node into the document.
   */
  function insertUpwork(upworkURL) {
    console.log('[upworkify:page/client:insertUpwork]', {
      upworkURL,
    });
    debugger;
    removeExistingUpworks();
    const upworkImage = document.createElement("img");
    upworkImage.setAttribute("src", upworkURL);
    upworkImage.style.height = "100vh";
    upworkImage.className = "upworkify-image";
    document.body.appendChild(upworkImage);
  }

  /**
   * Remove every upwork from the page.
   */
  function removeExistingUpworks() {
    const existingUpworks = document.querySelectorAll(".upworkify-image");
    for (const upwork of existingUpworks) {
      upwork.remove();
    }
  }

  function applyFilters(filters) {
    const {
      showCountries,
      showRecents,
    } = filters;
    console.log('[upworkify:page/client:applyFilters', {
      showCountries,
      showRecents,
      filters,
    });
    debugger;
    document.body.classList.toggle('upworkify-filters-applied', true);
  }

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message, arg) => {
    const { command } = message;
    console.log('[upworkify:page/client:listener', command, {
      message,
      arg,
    });
    if (command === 'upworkify') {
      debugger;
      insertUpwork(message.upworkURL);
    } else if (command === 'applyFilters') {
      applyFilters(message.filters);
    } else if (command === 'reset') {
      removeExistingUpworks();
    }
  });
})();

