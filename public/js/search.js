// Sanique Cosmetics - Premium Smart Search suggestions logic

document.addEventListener('DOMContentLoaded', () => {
  initSmartSearch();
});

function initSmartSearch() {
  const searchContainer = document.querySelector('.nav-search-container');
  const searchInput = document.getElementById('navbar-search-input');
  const searchBtn = document.getElementById('navbar-search-btn');
  const suggestionsPanel = document.getElementById('search-suggestions-panel');
  const recentList = document.getElementById('recent-searches-list');

  const getRecentSearches = () => {
    return JSON.parse(localStorage.getItem('sanique_recent_searches')) || [];
  };

  const saveRecentSearch = (query) => {
    if (!query) return;
    let searches = getRecentSearches();
    searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    searches.unshift(query);
    localStorage.setItem('sanique_recent_searches', JSON.stringify(searches.slice(0, 5)));
  };

  const renderRecentSearches = () => {
    if (!recentList) return;
    const searches = getRecentSearches();
    if (searches.length === 0) {
      recentList.innerHTML = '<span style="font-size:0.75rem; color:var(--grey);">No recent searches</span>';
      return;
    }
    recentList.innerHTML = searches.map(s => `
      <div class="recent-search-item" onclick="triggerSuggestedSearch('${s.replace(/'/g, "\\'")}')">
        <span>${s}</span>
        <i class="fas fa-times" onclick="event.stopPropagation(); removeRecentSearch('${s.replace(/'/g, "\\'")}')" title="Delete"></i>
      </div>
    `).join('');
  };

  window.removeRecentSearch = (query) => {
    let searches = getRecentSearches();
    searches = searches.filter(s => s !== query);
    localStorage.setItem('sanique_recent_searches', JSON.stringify(searches));
    renderRecentSearches();
  };

  window.triggerSuggestedSearch = (query) => {
    saveRecentSearch(query);
    window.location.href = `/shop.html?search=${encodeURIComponent(query)}`;
  };

  if (searchInput && searchBtn && searchContainer) {
    // Show recent searches when search input is focused
    searchInput.addEventListener('focus', () => {
      renderRecentSearches();
      if (suggestionsPanel) suggestionsPanel.classList.add('active');
    });

    searchBtn.addEventListener('click', (e) => {
      if (!searchContainer.classList.contains('active')) {
        e.preventDefault();
        searchContainer.classList.add('active');
        searchInput.focus();
      } else {
        const query = searchInput.value.trim();
        if (query) {
          triggerSuggestedSearch(query);
        } else {
          e.preventDefault();
          searchContainer.classList.remove('active');
          if (suggestionsPanel) suggestionsPanel.classList.remove('active');
        }
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          triggerSuggestedSearch(query);
        }
      }
    });

    // Close panel when clicked outside the search element
    document.addEventListener('click', (e) => {
      if (searchContainer.classList.contains('active') && !searchContainer.contains(e.target)) {
        searchContainer.classList.remove('active');
        if (suggestionsPanel) suggestionsPanel.classList.remove('active');
      }
    });
  }
}
