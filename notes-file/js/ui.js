// js/ui.js
import { getLessons, setLessons, getUpperCase, setUpperCase, saveToLocal } from './storage.js';
import { formatMarkdown, applyCase } from './utils.js';

export function showNotification(msg, icon = '✅', isError = false) {
    const el = document.getElementById('dictionaryNotification');
    document.getElementById('notificationIcon').textContent = icon;
    document.getElementById('notificationText').textContent = msg;
    if (isError) el.classList.add('error');
    else el.classList.remove('error');
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 3000);
}

export function renderResults(term) {
    const container = document.getElementById('resultsContainer');
    const topic = getLessons()[term];

    if (!topic) {
        container.innerHTML = `<div class="no-results">Topic "${term}" not found</div>`;
        return;
    }

    let desc = formatMarkdown(topic.desc);
    if (getUpperCase()) {
        desc = applyCase(desc, true);
    }

    container.innerHTML = `
        <div class="entry-card">
            <div class="entry-header">
                <h1>${applyCase(term, getUpperCase())}</h1>
            </div>
            <div class="entry-desc">${desc}</div>
            <h3>Examples:</h3>
            <div class="examples-grid">
                ${topic.ex.map(ex => `
                    <div class="example-item">${applyCase(ex, getUpperCase())}</div>
                `).join('')}
            </div>
        </div>
    `;
}

export function renderTopicsPanel() {
    const list = document.getElementById('topicsList');
    list.innerHTML = '';
    Object.keys(getLessons()).sort().forEach(key => {
        const div = document.createElement('div');
        div.className = 'topic-item';
        div.innerHTML = `<span>📄</span><div>${key}</div>`;
        div.addEventListener('click', () => {
            document.getElementById('searchInput').value = key;
            document.getElementById('searchBtn').click();
        });
        list.appendChild(div);
    });
}