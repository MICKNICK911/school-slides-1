class SlideshowManager {
    constructor() {
        // DOM Elements
        this.slideToggle = document.getElementById('slideToggle');
        this.slideshowOverlay = document.getElementById('slideshowOverlay');
        this.slideshowContent = document.getElementById('slideshowContent');
        this.slideshowTop = document.getElementById('slideshowTop');
        this.slideshowBottom = document.getElementById('slideshowBottom');
        this.slideshowClose = document.getElementById('slideshowClose');
        this.slideshowIndicator = document.getElementById('slideshowIndicator');
        this.instructionModal = document.getElementById('instructionModal');
        this.closeInstruction = document.getElementById('closeInstruction');
        this.overlay = document.getElementById('overlay');
        
        // State
        this.currentSlideshow = null;
        this.currentSlideIndex = 0;
        this.selectedWords = {};
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.slideToggle.addEventListener('click', () => this.startSlideshow());
        this.slideshowClose.addEventListener('click', () => this.closeSlideshow());
        this.slideshowTop.addEventListener('click', () => this.nextSlide());
        this.slideshowBottom.addEventListener('click', () => this.prevSlide());
        this.closeInstruction.addEventListener('click', () => this.beginSlideshow());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.slideshowOverlay.classList.contains('active')) return;
            
            if (e.key === 'ArrowRight' || e.key === ' ') {
                this.nextSlide();
            } else if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'Escape') {
                this.closeSlideshow();
            }
        });
    }
    
    startSlideshow() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        const lessons = window.uiManager ? window.uiManager.lessons : window.utils.DEFAULT_LESSONS;
        
        if (!searchTerm || !lessons[searchTerm]) {
            alert("Please search for a valid topic first");
            return;
        }
        
        const topic = lessons[searchTerm];
        if (topic.ex.length === 0) {
            alert("No examples available for this topic");
            return;
        }
        
        this.currentSlideshow = searchTerm;
        this.currentSlideIndex = 0;
        this.selectedWords = {};
        
        // Show instruction modal
        this.instructionModal.classList.add('active');
        this.overlay.classList.add('active');
    }
    
    beginSlideshow() {
        // Hide header and show slideshow
        document.querySelector('header').style.display = 'none';
        this.slideshowOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.updateSlideshow();
    }
    
    updateSlideshow() {
        const lessons = window.uiManager ? window.uiManager.lessons : window.utils.DEFAULT_LESSONS;
        const examples = lessons[this.currentSlideshow].ex;
        const currentExample = examples[this.currentSlideIndex];
        this.slideshowContent.innerHTML = '';
        
        // Create a word element for each word in the example
        const words = currentExample.split(/\s+/).filter(word => word.length > 0);
        
        // Initialize selected words for this slide if needed
        if (!this.selectedWords[this.currentSlideIndex]) {
            this.selectedWords[this.currentSlideIndex] = {};
        }
        
        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'slideshow-word';
            wordSpan.textContent = word;
            
            // Check if this word is selected
            if (this.selectedWords[this.currentSlideIndex][index]) {
                wordSpan.classList.add('selected');
            }
            
            // Add click event to toggle selection
            wordSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Toggle selection state
                this.selectedWords[this.currentSlideIndex][index] = !this.selectedWords[this.currentSlideIndex][index];
                
                // Toggle visual selection
                wordSpan.classList.toggle('selected');
            });
            
            this.slideshowContent.appendChild(wordSpan);
            
            // Add space between words
            if (index < words.length - 1) {
                this.slideshowContent.appendChild(document.createTextNode(' '));
            }
        });
        
        this.slideshowIndicator.textContent = `${this.currentSlideIndex + 1}/${examples.length}`;
    }
    
    nextSlide() {
        const lessons = window.uiManager ? window.uiManager.lessons : window.utils.DEFAULT_LESSONS;
        const examples = lessons[this.currentSlideshow].ex;
        this.currentSlideIndex = (this.currentSlideIndex + 1) % examples.length;
        this.updateSlideshow();
    }
    
    prevSlide() {
        const lessons = window.uiManager ? window.uiManager.lessons : window.utils.DEFAULT_LESSONS;
        const examples = lessons[this.currentSlideshow].ex;
        this.currentSlideIndex = (this.currentSlideIndex - 1 + examples.length) % examples.length;
        this.updateSlideshow();
    }
    
    closeSlideshow() {
        this.slideshowOverlay.classList.remove('active');
        document.querySelector('header').style.display = 'flex';
        document.body.style.overflow = 'auto';
        this.instructionModal.classList.remove('active');
        this.overlay.classList.remove('active');
    }
}

// Initialize Slideshow Manager
let slideshowManager;
document.addEventListener('DOMContentLoaded', () => {
    slideshowManager = new SlideshowManager();
    window.slideshowManager = slideshowManager;
});