/**
 * MAIN SCRIPT UNTUK GITHUB PAGES
 * Lokasi: assets/js/main.js
 */

// ===== KONFIGURASI =====
const CONFIG = {
  githubUsername: 'mdrpulsa', // Ganti dengan username GitHub Anda
  projects: [
    {
      id: 'store',
      title: 'Toko Online',
      description: 'Demo toko online dengan katalog produk interaktif',
      tags: ['HTML', 'CSS', 'JavaScript'],
      lastUpdated: '2024-06-15',
      imageUrl: 'assets/images/store-preview.jpg'
    },
    {
      id: 'kasir',
      title: 'Mesin Kasir',
      description: 'Sistem kasir sederhana dengan keranjang belanja',
      tags: ['JavaScript', 'LocalStorage'],
      lastUpdated: '2024-06-10',
      imageUrl: 'assets/images/kasir-preview.jpg'
    },
    {
      id: 'alquran',
      title: 'Al-Quran Digital',
      description: 'Baca Al-Quran dengan terjemahan per ayat',
      tags: ['API', 'JavaScript'],
      lastUpdated: '2024-06-05',
      imageUrl: 'assets/images/quran-preview.jpg'
    }
  ]
};

// ===== ELEMEN DOM =====
const DOM = {
  projectGrid: document.getElementById('project-grid'),
  themeToggle: document.getElementById('theme-toggle'),
  lastUpdated: document.getElementById('last-updated'),
  year: document.getElementById('year')
};

// ===== INISIALISASI =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderProjects();
  setFooterDate();
  setupEventListeners();
});

// ===== FUNGSI TEMA =====
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (DOM.themeToggle) {
    DOM.themeToggle.checked = savedTheme === 'dark';
  }
}

function toggleTheme(e) {
  const theme = e.target.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// ===== FUNGSI PROYEK =====
function renderProjects() {
  if (!DOM.projectGrid) return;

  DOM.projectGrid.innerHTML = CONFIG.projects.map(project => `
    <div class="project-card" data-project="${project.id}">
      <div class="project-image" style="background-image: url('${project.imageUrl}')"></div>
      <div class="project-content">
        <h3><a href="projects/${project.id}/">${project.title}</a></h3>
        <p>${project.description}</p>
        <div class="tech-tags">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <a href="projects/${project.id}/" class="visit-btn">Lihat Proyek</a>
        <div class="project-meta">
          <small>Diperbarui: ${formatDate(project.lastUpdated)}</small>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== FUNGSI UTILITAS =====
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

function setFooterDate() {
  if (DOM.year) {
    DOM.year.textContent = new Date().getFullYear();
  }
  if (DOM.lastUpdated) {
    DOM.lastUpdated.textContent = formatDate(new Date());
  }
}

function setupEventListeners() {
  // Toggle tema
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('change', toggleTheme);
  }

  // Animasi hover card
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== EKSPOR UNTUK PENGUJIAN =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initTheme,
    renderProjects,
    formatDate
  };
}
