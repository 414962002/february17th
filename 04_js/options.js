// Load and display all domains
let allDomains = [];
let frozenDomains = [];

function loadDomains() {
  browser.runtime.sendMessage({ action: "getDomains" }).then(response => {
    allDomains = response.domains || [];
    frozenDomains = response.frozenDomains || [];
    updateStats();
    displayDomains(allDomains);
  });
}

function updateStats() {
  const total = allDomains.length;
  const frozen = frozenDomains.length;
  const active = total - frozen;
  
  document.getElementById('totalDomains').textContent = total;
  document.getElementById('activeDomains').textContent = active;
  document.getElementById('frozenDomains').textContent = frozen;
}

function displayDomains(domains) {
  // Separate active and frozen domains
  const activeDomains = domains.filter(d => !frozenDomains.includes(d));
  const frozenDomainsFiltered = domains.filter(d => frozenDomains.includes(d));
  
  // Sort both alphabetically
  activeDomains.sort((a, b) => a.localeCompare(b));
  frozenDomainsFiltered.sort((a, b) => a.localeCompare(b));
  
  // Update counts
  document.getElementById('activeDomainsCount').textContent = activeDomains.length;
  document.getElementById('frozenDomainsCount').textContent = frozenDomainsFiltered.length;
  
  // Render active domains
  const activeListEl = document.getElementById('activeList');
  if (activeDomains.length === 0) {
    activeListEl.innerHTML = '<div class="empty-state">No active domains</div>';
  } else {
    activeListEl.innerHTML = '';
    activeDomains.forEach(domain => {
      activeListEl.appendChild(createDomainItem(domain, false));
    });
  }
  
  // Render frozen domains
  const frozenListEl = document.getElementById('frozenList');
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
  
  const buttons = document.createElement('div');
  buttons.className = 'buttons';
  
  const freezeBtn = document.createElement('button');
  freezeBtn.className = 'freeze-btn' + (isFrozen ? ' active' : '');
  freezeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/></svg>';
  freezeBtn.title = isFrozen ? 'Unfreeze' : 'Freeze';
  freezeBtn.onclick = () => toggleFreeze(domain);
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
  removeBtn.title = 'Remove';
  removeBtn.onclick = () => removeDomain(domain);
  
  buttons.appendChild(freezeBtn);
  buttons.appendChild(removeBtn);
  
  item.appendChild(name);
  item.appendChild(buttons);
  
  return item;
}

function showStatus(message, isError = false, clearInput = null) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = isError ? 'status error' : 'status success';
  
  setTimeout(() => {
    statusEl.className = 'status';
    if (clearInput) clearInput.value = '';
  }, 3000);
}

// Add domain manually
document.getElementById('addDomainBtn').addEventListener('click', () => {
  const input = document.getElementById('domainInput');
  const domain = input.value.trim().toLowerCase();
  
  if (!domain) {
    showStatus('Please enter a domain', true, input);
    return;
  }
  
  // Basic validation
  if (!domain.includes('.')) {
    showStatus('Invalid domain format', true, input);
    return;
  }
  
  browser.runtime.sendMessage({
    action: "addDomain",
    domain: domain
  }).then(response => {
    if (response.success) {
      showStatus(response.message);
      input.value = '';
      loadDomains();
    } else {
      showStatus(response.error, true);
    }
  }).catch(err => {
    showStatus("Error: " + err.message, true);
  });
});

// Enter key to add domain
document.getElementById('domainInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('addDomainBtn').click();
  }
});

// Toggle freeze
function toggleFreeze(domain) {
  browser.runtime.sendMessage({
    action: "toggleFreeze",
    domain: domain
  }).then(response => {
    if (response && response.success) {
      loadDomains();
    } else {
      showStatus(response ? response.error : "Unknown error", true);
    }
  }).catch(err => {
    console.error("Toggle freeze error:", err);
    showStatus("Error: " + err.message, true);
  });
}

// Remove domain
function removeDomain(domain) {
  if (!confirm(`Remove ${domain}?`)) return;
  
  browser.runtime.sendMessage({
    action: "removeDomain",
    domain: domain
  }).then(response => {
    if (response.success) {
      showStatus(response.message);
      loadDomains();
    } else {
      showStatus(response.error, true);
    }
  }).catch(err => {
    showStatus("Error: " + err.message, true);
  });
}

// Search/filter domains
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  if (!searchTerm) {
    displayDomains(allDomains);
    return;
  }
  
  const filtered = allDomains.filter(domain => 
    domain.toLowerCase().includes(searchTerm)
  );
  
  displayDomains(filtered);
});

// Export domains
document.getElementById('exportBtn').addEventListener('click', () => {
  if (allDomains.length === 0) {
    showStatus("No domains to export", true);
    return;
  }
  
  // Sort alphabetically before export
  const sortedDomains = [...allDomains].sort((a, b) => a.localeCompare(b));
  const content = sortedDomains.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Generate filename with date
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const filename = `february17th-domains-${dateStr}.txt`;
  
  // Create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
  showStatus(`Exported ${allDomains.length} domains`);
});

// Import domains
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target.result;
    const domains = content.split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);
    
    if (domains.length === 0) {
      showStatus("No valid domains found in file", true);
      return;
    }
    
    // Import domains
    browser.runtime.sendMessage({
      action: "importDomains",
      domains: domains
    }).then(response => {
      if (response.success) {
        showStatus(`Imported ${response.added} domains (${response.skipped} duplicates)`);
        loadDomains();
      } else {
        showStatus(response.error, true);
      }
    }).catch(err => {
      showStatus("Error: " + err.message, true);
    });
  };
  
  reader.readAsText(file);
  e.target.value = ''; // Reset file input
});

// Initial load
loadDomains();


// Real-time sync: Listen for storage changes from popup or other tabs
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    // Reload domains when storage changes
    loadDomains();
  }
});
