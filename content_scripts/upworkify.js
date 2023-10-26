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

  /**
   * Given a URL to a upwork image, remove all existing upworks, then
   * create and style an IMG node pointing to
   * that image, then insert the node into the document.
   */
  function insertUpwork(upworkURL) {
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

  /**
   * Listen for messages from the background script.
   * Call "insertUpwork()" or "removeExistingUpworks()".
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "upworkify") {
      insertUpwork(message.upworkURL);
    } else if (message.command === "reset") {
      removeExistingUpworks();
    }
  });
})();

