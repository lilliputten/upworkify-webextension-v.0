// @ts-check
/* globals browser */
/* eslint-disable no-console */
/*!
 * @changed 2023.11.07, 17:35
 * @desc Main client code -- works inside target page.
 */

(() => {
  // Current changed tag
  const changedTag = getChangeTag();

  const acceptableCountries = [
    'United States',
    'Australia',
    'New Zealand',
    'Cyprus',
    'Canada',

    // 'Russia',
    'Germany',
    'United Kingdom',
    'France',
    'Italy',
    'Spain',
    // 'Ukraine',
    'Poland',
    'Romania',
    'Netherlands',
    'Belgium',
    'Czechia',
    'Greece',
    'Portugal',
    'Sweden',
    'Hungary',
    // 'Belarus',
    'Austria',
    'Serbia',
    'Switzerland',
    'Bulgaria',
    'Denmark',
    'Finland',
    'Slovakia',
    'Norway',
    'Ireland',
    // 'Croatia',
    // 'Moldova',
    // 'Bosnia and Herzegovina',
    // 'Albania',
    'Lithuania',
    'North Macedonia',
    'Slovenia',
    // 'Latvia',
    'Kosovo',
    'Estonia',
    'Montenegro',
    'Luxembourg',
    'Malta',
    'Iceland',
    'Andorra',
    'Monaco',
    'Liechtenstein',
    'San Marino',
    'Holy See',
  ];

  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.__upworkifyChangedTag && window.__upworkifyChangedTag === changedTag) {
    return;
  }

  console.log('Started upworkify:page/client', changedTag, {
    __upworkifyChangedTag: window.__upworkifyChangedTag,
    changedTag,
    browser,
  });

  // Store changed tag
  window.__upworkifyChangedTag = changedTag;

  function getChangeTag() {
    const tag = `@changed 2023.11.07, 17:35
    `.trim();
    return tag;
  }

  /* // UNUSED: Original samples
   * [>*
   *  * Given a URL to a upwork image, remove all existing upworks, then
   *  * create and style an IMG node pointing to
   *  * that image, then insert the node into the document.
   *  <]
   * function __debug_insertUpwork(upworkURL) {
   *   console.log('[client:__debug_insertUpwork]', {
   *     upworkURL,
   *   });
   *   __debug_removeExistingUpworks();
   *   const upworkImage = document.createElement('img');
   *   upworkImage.setAttribute('src', upworkURL);
   *   upworkImage.style.height = '100vh';
   *   upworkImage.className = 'upworkify-image';
   *   document.body.appendChild(upworkImage);
   * }
   * [>*
   *  * Remove every upwork from the page.
   *  <]
   * function __debug_removeExistingUpworks() {
   *   const existingUpworks = document.querySelectorAll('.upworkify-image');
   *   for (const upwork of existingUpworks) {
   *     upwork.remove();
   *   }
   * }
   */

  function getJobsListNode() {
    const node = document.body.querySelector('[data-test="job-tile-list"]');
    return node;
  }

  function getJobListItems() {
    const jobsListNode = getJobsListNode();
    const jobItems = jobsListNode?.querySelectorAll('.up-card-section');
    return jobItems;
  }

  /** Highlight suitable countries
   * @param {Element} item
   * @return {boolean}
   */
  function processItemCountry(item) {
    // acceptableCountries
    const { filters } = window;
    const {
      // prettier-ignore
      showCountries,
    } = filters;
    const countryNode = item.querySelector('[data-test="client-country"]');
    console.log('[client:processItemCountry] start', {
      countryNode,
      showCountries,
      filters,
      item,
    });
    if (!countryNode) {
      // ???
      console.warn('[client:processItemCountry] can not find country node', {
        item,
      });
      return false;
    }
    let setShow = false;
    if (showCountries) {
      const countryTextNode = countryNode.querySelector('strong');
      const countryText = countryTextNode.innerText;
      if (acceptableCountries.includes(countryText)) {
        setShow = true;
      }
      console.log('[client:processItemCountry] set?', {
        setShow,
        countryTextNode,
        countryText,
        acceptableCountries,
        showCountries,
        filters,
        item,
      });
    }
    countryNode.classList.toggle('hilite', setShow);
    console.log('[client:processItemCountry] finished', {
      setShow,
      countryNode,
      showCountries,
      filters,
      item,
    });
    return true;
  }

  /** Get days count for upwork 'posted' dates.
   * Dates examples:
   * - 1 minute ago
   * - 20 minutes ago
   * - 1 hour ago
   * - 8 hours ago
   * - yesterday (?)
   * - 1 day ago
   * - 8 days ago
   * - Oct 8, 2023
   * @param {string} agoText
   * @return {number} - Hours number
   */
  function getRecentDaysCount(agoText) {
    agoText = agoText.trim().toLowerCase();
    const isAgo = agoText.endsWith(' ago');
    if (isAgo) {
      // Try to parse smth like '[in ]N {minute|hour|day}[s] ago' text...
      const found = agoText.match(/^(?:in )*(\d+)\s+(\S+)/);
      if (!found) {
        // eslint-disable-next-line no-console
        console.warn('[client:getRecentDaysCount] can not parse ago text', {
          agoText,
        });
        // eslint-disable-next-line no-debugger
        debugger;
      }
      const count = Number(found[1]);
      const units = found[2];
      if (units.startsWith('minute') || units.startsWith('second')) {
        // Less than a hour...
        return 0;
      } else if (units.startsWith('hour')) {
        // A number of hours...
        return count;
      } else if (units.startsWith('day')) {
        // A few days ago...
        return count * 24;
      }
      // ???
      else {
        // eslint-disable-next-line no-console
        console.warn('[client:getRecentDaysCount] unknown ago units', units, {
          units,
          count,
          found,
          agoText,
        });
        // eslint-disable-next-line no-debugger
        debugger;
      }
    } else if (agoText.includes('yesterday')) {
      // 1 day ago...
      return 24;
    } else {
      // eslint-disable-next-line no-console
      console.warn('[client:getRecentDaysCount] unknown ago mode', {
        agoText,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
  }

  /** Highlight recent time items
   * @param {Element} item
   * @return {boolean}
   */
  function processItemRecent(item) {
    // acceptableRecents
    const { filters } = window;
    const {
      // Hours count for recent items...
      showRecents,
    } = filters;
    const recentNode = /** @type {HTMLElement} */ (item.querySelector('[data-test="posted-on"]'));
    const agoText = recentNode?.innerText;
    console.log('[client:processItemRecent] start', {
      agoText,
      recentNode,
      showRecents,
      filters,
      item,
    });
    if (!recentNode) {
      // ???
      console.warn('[client:processItemRecent] can not find recent node', {
        item,
      });
      return false;
    }
    let setShow = false;
    if (showRecents) {
      const hours = getRecentDaysCount(agoText);
      if (hours <= showRecents) {
        setShow = true;
      }
      console.log('[client:processItemRecent] set?', {
        setShow,
        hours,
        agoText,
        showRecents,
        filters,
        item,
      });
    }
    recentNode.classList.toggle('hilite', setShow);
    console.log('[client:processItemRecent] finished', {
      setShow,
      recentNode,
      showRecents,
      filters,
      item,
    });
    return true;
  }

  /**
   * @param {Element} item
   * @return {boolean}
   */
  function processItem(item) {
    const { filters } = window;
    const jobTitleLink = /** @type {HTMLAnchorElement} */ (
      item.querySelector('.job-tile-title > a')
    );
    if (!jobTitleLink) {
      // prettier-ignore
      console.warn('[client:processItem] Not found item title link (not initialized?)', {
        item,
      });
      item.classList.toggle('processed', false);
      return false;
    }
    const jobLink = jobTitleLink?.getAttribute('href');
    const jobTitle = jobTitleLink?.innerText;
    console.group('[client:processItem] item ' + jobLink + jobTitle);
    console.log('[client:processItem] start', jobLink, jobTitle, {
      jobLink,
      jobTitle,
      filters,
      item,
    });
    const results = [
      // prettier-ignore
      processItemCountry(item),
      processItemRecent(item),
    ];
    const failedList = results.filter((res) => res !== true);
    const hasErrors = !!failedList.length;
    const hasSuccess = !hasErrors;
    console.log('[client:processItem] finish', jobLink, jobTitle, {
      results,
      hasErrors,
      failedList,
      jobLink,
      jobTitle,
      filters,
      item,
    });
    console.groupEnd();
    item.classList.toggle('processed', hasSuccess);
    return true;
  }

  /** @param {TFilters} [filters] */
  function applyFilters(filters) {
    // Save filters...
    if (filters) {
      // ...If passed...
      window.filters = filters;
    } else {
      // ...Or get previously saved...
      filters = window.filters;
    }
    try {
      // const jobsListNode = getJobsListNode();
      const jobItems = getJobListItems(); // jobsListNode?.querySelectorAll('.up-card-section');
      console.log('[client:applyFilters] start', {
        // jobsListNode,
        jobItems,
        filters,
      });
      if (jobItems && jobItems.length) {
        const results = Array.from(jobItems).map(processItem);
        const failed = results.filter((res) => res !== true);
        const hasErrors = !!failed.length;
        console.log('[client:applyFilters] finish', {
          results,
          failed,
          hasErrors,
          // jobsListNode,
          jobItems,
          filters,
        });
      }
      document.body.classList.toggle('upworkify-filters-applied', true);
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error('[client:applyFilters]', error.message, {
        error,
      });
      // eslint-disable-next-line no-debugger
      debugger;
    }
    // TODO: Catch errors?
  }

  function resetFilters() {
    console.log('[client:resetFilters');
    // TODO? To clear smth else?
    document.body.classList.toggle('upworkify-filters-applied', false);
  }

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message, arg) => {
    const { command } = message;
    console.log('[client:onMessage listener]', command, {
      message,
      arg,
    });
    /*
     * if (command === 'upworkify') {
     *   __debug_insertUpwork(message.upworkURL);
     * } else if (command === 'reset') {
     *   __debug_removeExistingUpworks();
     * }
     */
    if (command === 'applyFilters') {
      applyFilters(message.filters);
    } else if (command === 'resetFilters') {
      resetFilters();
    }
  });
})();
