// js/slideshow.js
import { getLessons, getUpperCase } from './storage.js';

let currentTopic = null;
let currentIndex = 0;
let selectedWords = {};

export function initSlideshow() {
    const slideToggle     = document.getElementById('slideToggle');
    const slideshowClose  = document.getElementById('slideshowClose');
    const slideshowTop    = document.getElementById('slideshowTop');
    const slideshowBottom = document.getElementById('slideshowBottom');
    const closeInstruction = document.getElementById('closeInstruction');

    slideToggle.addEventListener('click', startSlideshow);
    slideshowClose.addEventListener('click', closeSlideshow);
    slideshowTop.addEventListener('click', nextSlide);
    slideshowBottom.addEventListener('click', prevSlide);
    closeInstruction.addEventListener('click', () => {
        document.getElementById('instructionModal').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('slideshowOverlay').classList.add('active');
        updateSlide();
    });

    document.addEventListener('keydown', e => {
        if (!document.getElementById('slideshowOverlay').classList.contains('active')) return;
        if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') closeSlideshow();
    });
}

function startSlideshow() {
    const term = document.getElementById('searchInput').value.trim();
    if (!term || !getLessons()[term]) {
        alert("Search for a topic first");
        return;
    }

    currentTopic = term;
    currentIndex = 0;
    selectedWords = {};

    document.getElementById('instructionModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function updateSlide() {
    const examples = getLessons()[currentTopic].ex;
    if (!examples || examples.length === 0) return;

    const content = document.getElementById('slideshowContent');
    content.innerHTML = '';

    const text = examples[currentIndex];
    const words = text.split(/\s+/);

    words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'slideshow-word';
        span.textContent = getUpperCase() ? word.toUpperCase() : word;
        if (selectedWords[currentIndex]?.[i]) {
            span.classList.add('selected');
        }
        span.addEventListener('click', e => {
            e.stopPropagation();
            if (!selectedWords[currentIndex]) selectedWords[currentIndex] = {};
            selectedWords[currentIndex][i] = !selectedWords[currentIndex][i];
            span.classList.toggle('selected');
        });
        content.appendChild(span);
        if (i < words.length - 1) content.appendChild(document.createTextNode(' '));
    });

    document.getElementById('slideshowIndicator').textContent = 
        `${currentIndex + 1} / ${examples.length}`;
}

function nextSlide() {
    const len = getLessons()[currentTopic].ex.length;
    currentIndex = (currentIndex + 1) % len;
    updateSlide();
}

function prevSlide() {
    const len = getLessons()[currentTopic].ex.length;
    currentIndex = (currentIndex - 1 + len) % len;
    updateSlide();
}

function closeSlideshow() {
    document.getElementById('slideshowOverlay').classList.remove('active');
}