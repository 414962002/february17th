// Get current tab domain
let currentDomain = "";

// Get current tab
browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
  if (tabs[0] && tabs[0].url) {
    try {
      const url = new URL(tabs[0].url);
      currentDomain = url.hostname;
      
      // Remove www. prefix if present
      if (currentDomain.startsWith('www.')) {
        currentDomain = currentDomain.substring(4);
      }
      
      document.getElementById('currentDomain').value = currentDomain;
      document.getElementById('addBtn').disabled = false;
    } catch (e) {
      console.error("Error parsing URL:", e);
      document.getElementById('currentDomain').placeholder = "Enter domain manually";
      document.getElementById('addBtn').disabled = false;
    }
  } else {
    console.error("No active tab found");
    document.getElementById('currentDomain').placeholder = "Enter domain manually";
    document.getElementById('addBtn').disabled = false;
  }
}).catch(err => {
  console.error("Error getting tab:", err);
  document.getElementById('currentDomain').placeholder = "Enter domain manually";
  document.getElementById('addBtn').disabled = false;
});

// Load domains list
function loadDomains() {
  browser.runtime.sendMessage({ action: "getDomains" }).then(response => {
    const domains = response.domains || [];
    const frozenDomains = response.frozenDomains || [];
    displayDomains(domains, frozenDomains);
    updateStatistics(domains, frozenDomains);
  });
}

// Update statistics
function updateStatistics(domains, frozenDomains) {
  const total = domains.length;
  const frozen = frozenDomains.length;
  const active = total - frozen;
  
  document.getElementById('totalCount').textContent = total;
  document.getElementById('activeCount').textContent = active;
  document.getElementById('frozenCount').textContent = frozen;
}

// Display domains
function displayDomains(domains, frozenDomains) {
  // Separate active and frozen domains
  const activeDomains = domains.filter(d => !frozenDomains.includes(d));
  const frozenDomainsFiltered = domains.filter(d => frozenDomains.includes(d));
  
  // Sort both alphabetically
  activeDomains.sort((a, b) => a.localeCompare(b));
  frozenDomainsFiltered.sort((a, b) => a.localeCompare(b));
  
  // Update counts
  document.getElementById('activeCountPopup').textContent = activeDomains.length;
  document.getElementById('frozenCountPopup').textContent = frozenDomainsFiltered.length;
  
  // Render active domains
  const activeListEl = document.getElementById('activeListPopup');
  if (activeDomains.length === 0) {
    activeListEl.innerHTML = '<div class="empty-state">No active domains</div>';
  } else {
    activeListEl.innerHTML = '';
    activeDomains.forEach(domain => {
      activeListEl.appendChild(createDomainItem(domain, false));
    });
  }
  
  // Render frozen domains
  const frozenListEl = document.getElementById('frozenListPopup');
  if (frozenDomainsFiltered.length === 0) {
    frozenListEl.innerHTML = '<div class="empty-state">No frozen domains</div>';
  } else {
    frozenListEl.innerHTML = '';
    frozenDomainsFiltered.forEach(domain => {
      frozenListEl.appendChild(createDomainItem(domain, true));
    });
  }
}

function createDomainItem(domain, isFrozen) {
  const item = document.createElement('div');
  item.className = 'domain-item' + (isFrozen ? ' frozen' : '');
  
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = domain;
  
  const freezeBtn = document.createElement('button');
  freezeBtn.className = 'freeze-btn' + (isFrozen ? ' active' : '');
  freezeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/></svg>';
  freezeBtn.title = isFrozen ? 'Unfreeze' : 'Freeze';
  freezeBtn.onclick = () => toggleFreeze(domain);
  
  item.appendChild(name);
  item.appendChild(freezeBtn);
  
  return item;
}

// Show status message
function showStatus(message, isError = false, clearInput = null) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = isError ? 'status error' : 'status success';
  
  setTimeout(() => {
    statusEl.className = 'status';
    if (clearInput) clearInput.value = '';
  }, 3000);
}

// Add domain
document.getElementById('addBtn').addEventListener('click', () => {
  const input = document.getElementById('currentDomain');
  const domain = input.value.trim();
  
  if (!domain) {
    showStatus("Please enter a domain", true, input);
    return;
  }
  
  document.getElementById('addBtn').disabled = true;
  
  browser.runtime.sendMessage({
    action: "addDomain",
    domain: domain
  }).then(response => {
    if (response.success) {
      showStatus(response.message);
      loadDomains();
    } else {
      showStatus(response.error, true, input);
    }
    document.getElementById('addBtn').disabled = false;
  }).catch(err => {
    showStatus("Error: " + err.message, true, input);
    document.getElementById('addBtn').disabled = false;
  });
});

// Enter key to add domain
document.getElementById('currentDomain').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('addBtn').click();
  }
});

// Toggle freeze
function toggleFreeze(domain) {
  browser.runtime.sendMessage({
    action: "toggleFreeze",
    domain: domain
  }).then(response => {
    if (response.success) {
      loadDomains();
    } else {
      showStatus(response.error, true);
    }
  }).catch(err => {
    showStatus("Error: " + err.message, true);
  });
}

// Settings button
document.getElementById('settingsBtn').addEventListener('click', () => {
  browser.runtime.openOptionsPage();
});

// Initial load
loadDomains();
