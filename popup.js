const DEFAULT_CONFIG = {
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



document.addEventListener('DOMContentLoaded', function() {
  const baseDomainInput = document.getElementById('base-domain');
  const browsableDomainsTextarea = document.getElementById('browsable-domains');
  const inactivityTimeoutInput = document.getElementById('inactivity-timeout');
  const confirmationTimeoutInput = document.getElementById('confirmation-timeout');
  const redirectWarningInput = document.getElementById('redirect-warning');
  const isActive = document.getElementById('is-active');
  const saveButton = document.getElementById('save-button');

  // Load current configuration
  chrome.storage.sync.get('config', function(data) {
    if (data.config) {
      baseDomainInput.value = data.config.BASE_DOMAIN || DEFAULT_CONFIG.BASE_DOMAIN

      if (data.config.BROWSABLE_DOMAINS && Array.isArray(data.config.BROWSABLE_DOMAINS)) {
        browsableDomainsTextarea.value = data.config.BROWSABLE_DOMAINS.join('\n');
      } else {
        browsableDomainsTextarea.value = DEFAULT_CONFIG.BROWSABLE_DOMAINS.join('\n');

      }

      isActive.checked = (data.config.ACTIVE ?? DEFAULT_CONFIG.ACTIVE); // Convert ms to seconds
      inactivityTimeoutInput.value = (data.config.INACTIVITY_TIMEOUT || DEFAULT_CONFIG.INACTIVITY_TIMEOUT) / 1000; // Convert ms to seconds
      confirmationTimeoutInput.value = (data.config.CONFIRMATION_TIMEOUT || DEFAULT_CONFIG.CONFIRMATION_TIMEOUT) / 1000; // Convert ms to seconds
      redirectWarningInput.value = (data.config.BROWSABLE_REDIRECT || DEFAULT_CONFIG.BROWSABLE_REDIRECT) / 1000; // Convert ms to minutes
    }
  });

  // Save configuration
  saveButton.addEventListener('click', function() {
    const browsableDomains = browsableDomainsTextarea.value
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain !== '');

    const config = {
      BASE_DOMAIN: baseDomainInput.value,
      BROWSABLE_DOMAINS: browsableDomains,
      INACTIVITY_TIMEOUT: inactivityTimeoutInput.value * 1000, // Convert minutes to ms
      CONFIRMATION_TIMEOUT: confirmationTimeoutInput.value * 1000, // Convert seconds to ms
      BROWSABLE_REDIRECT: redirectWarningInput.value * 1000, // Convert minutes to ms
      ACTIVE: isActive.checked
    };

    chrome.storage.sync.set({ config }, function() {
      // Visual feedback of save
      saveButton.textContent = 'Saved!';
      setTimeout(() => {
        saveButton.textContent = 'Save Configuration';
      }, 2000);

      // Notify background script about configuration update
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { action: "configUpdated", config }))
      });
    });
  });
});