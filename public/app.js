let allContacts = [];
let currentCategory = 'all';

const cityFilter = document.getElementById('cityFilter');
const searchBar = document.getElementById('searchBar');
const contactsList = document.getElementById('contactsList');
const tabs = document.querySelectorAll('.tab');

async function loadCities() {
  try {
    const response = await fetch('/api/cities');
    if (!response.ok) throw new Error('Failed to load cities');
    const cities = await response.json();
    if (Array.isArray(cities)) {
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading cities:', error);
  }
}

async function loadContacts() {
  try {
    const city = cityFilter.value;
    let url = '/api/numbers';
    
    if (city && city !== 'all') {
      url = `/api/numbers?city=${city}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load contacts');
    const data = await response.json();
    allContacts = Array.isArray(data) ? data : [];
    filterAndDisplay();
  } catch (error) {
    console.error('Error loading contacts:', error);
    contactsList.innerHTML = '<div class="empty-state">Error loading contacts. Please refresh.</div>';
  }
}

function filterAndDisplay() {
  const searchTerm = searchBar.value.toLowerCase();
  
  let filtered = allContacts.filter(contact => {
    const matchesCategory = currentCategory === 'all' || contact.category === currentCategory;
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.city.toLowerCase().includes(searchTerm) ||
      contact.description?.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  displayContacts(filtered);
}

function displayContacts(contacts) {
  if (contacts.length === 0) {
    contactsList.innerHTML = '<div class="empty-state">No contacts found. Try adjusting your filters.</div>';
    return;
  }

  contactsList.innerHTML = contacts.map(contact => `
    <div class="contact-card">
      <div class="contact-header">
        <div class="contact-name">${escapeHtml(contact.name)}</div>
        <span class="contact-category category-${contact.category.replace(/\s+/g, '.')}">${contact.category}</span>
      </div>
      <div class="contact-info">
        <div class="contact-city">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:4px">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          ${escapeHtml(contact.city)}
        </div>
        ${contact.description ? `<div class="contact-description">${escapeHtml(contact.description)}</div>` : ''}
      </div>
      <a href="tel:${contact.phone}" class="call-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
        </svg>
        Call ${contact.phone}
      </a>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.category;
    filterAndDisplay();
  });
});

cityFilter.addEventListener('change', loadContacts);
searchBar.addEventListener('input', filterAndDisplay);

loadCities();
loadContacts();
