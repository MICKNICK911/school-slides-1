// js/main.js
import { loadFromLocal, setUpperCase, getUpperCase, saveToLocal } from './storage.js';
import { showNotification, renderResults, renderTopicsPanel } from './ui.js';
import { initBuilder } from './builder.js';
import { initSlideshow } from './slideshow.js';

export function initApp() {
    // Load saved data if exists
    if (loadFromLocal()) {
        showNotification("Custom notes loaded", "✅");
    }

    // Elements
    const searchBtn   = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const themeToggle = document.getElementById('themeToggle');
    const caseToggle  = document.getElementById('caseToggle');
    const loadToggle  = document.getElementById('loadToggle');
    const exportToggle = document.getElementById('exportToggle');
    const topicsToggle = document.getElementById('topicsToggle');
    const historyToggle = document.getElementById('historyToggle');
    const helpToggle   = document.getElementById('helpToggle');
    const fileInput    = document.getElementById('dictionaryFileInput');

    // Event listeners
    searchBtn.addEventListener('click', () => {
        const term = searchInput.value.trim();
        if (term) renderResults(term);
    });

    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') searchBtn.click();
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    });

    caseToggle.addEventListener('click', () => {
        setUpperCase(!getUpperCase());
        caseToggle.classList.toggle('active', getUpperCase());
        // Re-render current result if any
        const current = searchInput.value.trim();
        if (current && getLessons()[current]) renderResults(current);
    });

    loadToggle.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                setLessons(data);
                saveToLocal();
                showNotification("Dictionary loaded successfully", "✅");
                renderTopicsPanel();
            } catch (err) {
                showNotification("Invalid JSON file", "❌", true);
            }
        };
        reader.readAsText(file);
    });

    exportToggle.addEventListener('click', () => {
        document.getElementById('builderContainer').classList.add('active');
    });

    topicsToggle.addEventListener('click', () => {
        document.getElementById('topicsPanel').classList.add('active');
        document.getElementById('overlay').classList.add('active');
        renderTopicsPanel();
    });

    historyToggle.addEventListener('click', () => {
        document.getElementById('historyPanel').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    });

    helpToggle.addEventListener('click', () => {
        document.getElementById('instructionsModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    });

    // Close panels on overlay click
    document.getElementById('overlay').addEventListener('click', () => {
        document.querySelectorAll('.history-panel, .topics-panel, .instructions-modal, .instruction-modal')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('overlay').classList.remove('active');
    });

    // Initialize sub-modules
    initBuilder();
    initSlideshow();

    // Initial home screen
    document.getElementById('resultsContainer').innerHTML = `
        <div class="no-results">
            <span>📖</span>
            <h2>Welcome to Enhanced Notes</h2>
            <p>Search or browse topics above</p>
        </div>
    `;
}