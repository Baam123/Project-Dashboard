const TOOLS_CONFIG = [
    {
        id: 'tool1',
        name: 'One Time Reward Wheel',
        icon: 'bi-arrow-repeat',
        url: 'https://baam123.github.io/Wheel-One-Time/'
    },
    {
        id: 'tool2',
        name: 'Infinite Lucky Wheel',
        icon: 'bi-arrow-repeat',
        url: 'https://baam123.github.io/Random-Wheel-No-Form/'
    },
    {
        id: 'tool3',
        name: 'Card Flip Memory Helper',
        icon: 'bi-controller',
        url: 'https://baam123.github.io/Card-Flip-Memory-Helper/'
    },
    {
        id: 'tool4',
        name: 'QR Generator',
        icon: 'bi-qr-code-scan',
        url: 'https://baam123.github.io/QR-Generator/'
    },
    {
        id: 'tool5',
        name: 'Food List',
        icon: 'bi-fork-knife',
        url: 'https://baam123.github.io/Food-List/'
    },
];

let currentFilter = 'all';

const hideLoader = (iframe) => {
    const loader = iframe.previousElementSibling;
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
};

const getStorage = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function renderDashboard() {
    const grid = document.getElementById('toolsGrid');
    const searchTerm = document.getElementById('toolSearch').value.toLowerCase();
    const favorites = getStorage('favorites');
    const recent = getStorage('recentTools');

    let filteredData = TOOLS_CONFIG.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm);
        let matchesFilter = true;

        if (currentFilter === 'favorites') matchesFilter = favorites.includes(tool.id);
        if (currentFilter === 'recent') matchesFilter = recent.includes(tool.id);

        return matchesSearch && matchesFilter;
    });

    if (currentFilter === 'recent') {
        filteredData.sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
    }

    document.getElementById('noResults').style.display = filteredData.length ? 'none' : 'block';

    grid.innerHTML = filteredData.map(tool => {
        const isFav = favorites.includes(tool.id);
        return `
            <div class="card-box" data-id="${tool.id}">
                <div class="card-header-custom justify-content-center">
                    <div class="tool-title">
                        <i class="bi ${tool.icon}"></i>
                        <span>${tool.name}</span>
                    </div>
                </div>
                <div class="card-body-custom">
                    <div class="loader-container">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                    <iframe src="${tool.url}" class="tool-frame" loading="lazy" 
                            onload="hideLoader(this)"></iframe>
                </div>
                <div class="card-footer-custom">
                    <div class="btn-group-custom">
                        <button class="btn-tool btn-favorite ${isFav ? 'text-warning' : ''}" data-id="${tool.id}">
                            <i class="bi ${isFav ? 'bi-star-fill' : 'bi-star'}"></i>
                        </button>
                        <button class="btn-tool btn-fullscreen">
                            <i class="bi bi-arrows-fullscreen"></i>
                        </button>
                        <a href="${tool.url}" target="_blank" class="btn-tool btn-external">
                            <i class="bi bi-box-arrow-up-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    updateStats();
}

function initEvents() {
    // Theme toggle
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeBtn.querySelector('i').className = newTheme === 'light' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
    });

    document.getElementById('toolSearch').addEventListener('input', renderDashboard);

    document.querySelectorAll('.stat-clickable').forEach(card => {
        card.addEventListener('click', function () {
            document.querySelectorAll('.stat-clickable').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderDashboard();
        });
    });

    document.getElementById('toolsGrid').addEventListener('click', (e) => {
        const btnFav = e.target.closest('.btn-favorite');
        const btnFull = e.target.closest('.btn-fullscreen');
        const btnExt = e.target.closest('.btn-external');
        const card = e.target.closest('.card-box');

        if (!card) return;
        const toolId = card.dataset.id;

        if (btnFav) {
            let favs = getStorage('favorites');
            let msg = "";
            if (favs.includes(toolId)) {
                favs = favs.filter(id => id !== toolId);
                msg = "Đã xóa khỏi yêu thích";
            } else {
                favs.push(toolId);
                msg = "Đã thêm vào yêu thích!";
            }
            setStorage('favorites', favs);
            renderDashboard();
            showToast(msg); 
        }

        if (btnFull) {
            showToast("Đang mở toàn màn hình..."); 
            markRecent(toolId);
            const iframe = card.querySelector('iframe');
            if (iframe.requestFullscreen) iframe.requestFullscreen();
            else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
        }

        if (btnExt) markRecent(toolId);
    });
}

function markRecent(toolId) {
    let recent = getStorage('recentTools');
    recent = [toolId, ...recent.filter(id => id !== toolId)].slice(0, 10);
    setStorage('recentTools', recent);
    updateStats();
}

function updateStats() {
    document.getElementById('totalTools').textContent = TOOLS_CONFIG.length;
    document.getElementById('totalFavorites').textContent = getStorage('favorites').length;
    document.getElementById('totalRecent').textContent = getStorage('recentTools').length;
}

document.addEventListener('DOMContentLoaded', () => {
    // Set theme ban đầu
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    document.getElementById('themeBtn').querySelector('i').className =
        savedTheme === 'light' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';

    initEvents();
    renderDashboard();
});

function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> ${message}`;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}