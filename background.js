
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    config: {
      BASE_DOMAIN: "finsexy.com",
      BROWSABLE_DOMAINS: [
        'chrome-extension',
        'chrome://extensions',
        "steviep.xyz",
        'fastcashmoneyplus.biz',
        'friendworld.social',
        'ronamerch.co',
        'fakebullshit.news',
        'x.com/steviepxyz',
        '0ms.co',
        'dopaminemachines.website',
        'subway.church',
        'moneymakingopportunity.eth',
        'terminallyonline.eth',
        'amazon.com/hz/wishlist/ls/1THBQMMLZZ7YC',
        'reddit.com/r/paypigsupportgroup'
      ],
      INACTIVITY_TIMEOUT: 20 * 60 * 1000, // 20 minutes in milliseconds
      CONFIRMATION_TIMEOUT: 20 * 1000,    // 20 seconds in milliseconds
      BROWSABLE_REDIRECT_WARNING: 3 * 60 * 1000, // 3 minutes in milliseconds
      ACTIVE: true
    }
  });
});


let config
chrome.storage.sync.get('config', (data) => {
  if (data.config) {
    config = data.config
  }
});


// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('tab update')
  if (changeInfo.url) {
    handleUrlChange(tabId, changeInfo.url);
  }
});

// Handle when user switches tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      handleUrlChange(tab.id, tab.url);
    }
  });
});

let startedBrowse, browseRedirectTimeout

function handleUrlChange(tabId, url) {
  chrome.storage.sync.get('config', (data) => {
    if (data.config) {
      config = data.config
    }
    console.log('url change')
    if (!config || !config.ACTIVE) return
    else if (url.includes(config.BASE_DOMAIN)) {
      startedBrowse = null
      return
    }
    else if (config.BROWSABLE_DOMAINS.some(d => url.includes(d))) {
      if (!startedBrowse && !browseRedirectTimeout) {
        startedBrowse = Date.now()
        browseRedirectTimeout = setTimeout(() => browseRedirect(tabId, config.BROWSABLE_REDIRECT))
      }
    }
    else {
      browseRedirect(tabId)
    }
  });
}



function browseRedirect(tabId) {
  startedBrowse = null
  chrome.tabs.update(tabId, { url: `https://${config.BASE_DOMAIN}` })
}
