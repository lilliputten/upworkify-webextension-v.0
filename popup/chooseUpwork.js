/**
 * CSS to hide everything on the page,
 * except for elements that have the "upworkify-image" class.
 */
const hidePage = `body > :not(.upworkify-image) {
                    display: none;
                  }`;

/** Listen for clicks on the buttons, and send the appropriate message to the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
    /**
     * Given the name of a upwork, get the URL to the corresponding image.
     */
    function upworkNameToURL(upworkName) {
      console.log('[chooseUpwork:listenForClicks:upworkNameToURL]', {
        upworkName,
      });
      debugger;
      switch (upworkName) {
        case "Frog":
          return browser.runtime.getURL("upworks/frog.jpg");
        case "Snake":
          return browser.runtime.getURL("upworks/snake.jpg");
        case "Turtle":
          return browser.runtime.getURL("upworks/turtle.jpg");
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the upwork URL and
     * send a "upworkify" message to the content script in the active tab.
     */
    function upworkify(tabs) {
      console.log('[chooseUpwork:listenForClicks:upworkify]', {
        tabs,
      });
      debugger;
      browser.tabs.insertCSS({ code: hidePage }).then(() => {
        const url = upworkNameToURL(e.target.textContent);
        browser.tabs.sendMessage(tabs[0].id, {
          command: "upworkify",
          upworkURL: url,
        });
      });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      console.log('[chooseUpwork:listenForClicks:reset]', {
        tabs,
      });
      debugger;
      browser.tabs.removeCSS({ code: hidePage }).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not upworkify: ${error}`);
      debugger;
    }

    /**
     * Get the active tab,
     * then call "upworkify()" or "reset()" as appropriate.
     */
    if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
      // Ignore when click is not on a button within <div id="popup-content">.
      return;
    }
    if (e.target.type === "reset") {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    } else {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(upworkify)
        .catch(reportError);
    }
  });
}

/** There was an error executing the script. Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute upworkify content script: ${error.message}`);
}

/** When the popup loads, inject a content script into the active tab, and add a click handler. If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "/content_scripts/upworkify.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);

