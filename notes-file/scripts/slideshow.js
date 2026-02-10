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
        this.slideToggle?.addEventListener('click', () => this.startSlideshow());
        this.slideshowClose?.addEventListener('click', () => this.closeSlideshow());
        this.slideshowTop?.addEventListener('click', () => this.nextSlide());
        this.slideshowBottom?.addEventListener('click', () => this.prevSlide());
        this.closeInstruction?.addEventListener('click', () => this.beginSlideshow());
        
        // Close slideshow when clicking outside content area
        this.slideshowOverlay?.addEventListener('click', (e) => {
            if (e.target === this.slideshowOverlay) {
                this.closeSlideshow();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.slideshowOverlay?.classList.contains('active')) return;
            
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'Spacebar':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeSlideshow();
                    break;
            }
        });
    }
    
    startSlideshow() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.trim();
        const lessons = window.uiManager ? window.uiManager.lessons : window.utils.DEFAULT_LESSONS;
        
        if (!searchTerm) {
            window.utils.showNotification('Please search for a topic first', '⚠️', false, false);
            return;
        }
        
        if (!lessons[searchTerm]) {
            window.utils.showNotification(`Topic "${searchTerm}" not found`, '❌', true, false);
            return;
        }
        
        const topic = lessons[searchTerm];
        if (!topic.ex || topic.ex.length === 0) {
            window.utils.showNotification('No examples available for this topic', '⚠️', false, false);
            return;
        }
        
        this.currentSlideshow = searchTerm;
        this.currentSlideIndex = 0;
        this.selectedWords = {};
        
        // Show instruction modal
        if (this.instructionModal && this.overlay) {
            this.instructionModal.classList.add('active');
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            this.beginSlideshow();
        }
    }
    
    beginSlideshow() {
        // Hide instruction modal first
        if (this.instructionModal && this.overlay) {
            this.instructionModal.classList.remove('active');
            this.overlay.classList.remove('active');
        }
        
        // Hide header and show slideshow
        const header = document.querySelector('header');
        if (header) header.style.display = 'none';
        
        if (this.slideshowOverlay) {
            this.slideshowOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.updateSlideshow();
        }
    }
    
    updateSlideshow() {
        const lessons = window.uiManager ? window.uiManager.lessons : window.utils.DEFAULT_LESSONS;
        if (!lessons[this.currentSlideshow]) return;
        
        const examples = lessons[this.currentSlideshow].ex || [];
        if (this.currentSlideIndex >= examples.length) {
            this.currentSlideIndex = 0;
        }
        
        const currentExample = examples[this.currentSlideIndex] || '';
        
        if (this.slideshowContent) {
            this.slideshowContent.innerHTML = '';
            
            // Initialize selected words for this slide if needed
            if (!this.selectedWords[this.currentSlideIndex]) {
                this.selectedWords[this.currentSlideIndex] = {};
            }
            
            // Create word elements
            const words = currentExample.split(/\s+/).filter(word => word.length > 0);
            
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
                    this.selectedWords[this.currentSlideIndex][index] = 
                        !this.selectedWords[this.currentSlideIndex][index];
                    
                    // Toggle visual selection
                    wordSpan.classList.toggle('selected');
                });
                
                this.slideshowContent.appendChild(wordSpan);
                
                // Add space between words
                if (index < words.length - 1) {
                    this.slideshowContent.appendChild(document.createTextNode(' '));
                }
            });
        }
        
        if (this.slideshowIndicator) {
            this.slideshowIndicator.textContent = `${this.currentSlideIndex + 1}/${examples.length}`;
        }
    }
    
    nextSlide() {
        const lessons = window.uiManager ? window.uiManager.lessons : window.utils.DEFAULT_LESSONS;
        if (!lessons[this.currentSlideshow]) return;
        
        const examples = lessons[this.currentSlideshow].ex || [];
        if (examples.length === 0) return;
        
        this.currentSlideIndex = (this.currentSlideIndex + 1) % examples.length;
        this.updateSlideshow();
    }
    
    prevSlide() {
        const lessons = window.uiManager ? window.uiManager.lessons : window.utils.DEFAULT_LESSONS;
        if (!lessons[this.currentSlideshow]) return;
        
        const examples = lessons[this.currentSlideshow].ex || [];
        if (examples.length === 0) return;
        
        this.currentSlideIndex = (this.currentSlideIndex - 1 + examples.length) % examples.length;
        this.updateSlideshow();
    }
    
    closeSlideshow() {
        // Show header
        const header = document.querySelector('header');
        if (header) header.style.display = 'flex';
        
        // Close slideshow overlay
        if (this.slideshowOverlay) {
            this.slideshowOverlay.classList.remove('active');
        }
        
        // Close instruction modal if open
        if (this.instructionModal) {
            this.instructionModal.classList.remove('active');
        }
        
        // Close overlay
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        // Restore scroll
        document.body.style.overflow = 'auto';
    }
}

// Initialize with safety checks
let slideshowManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        slideshowManager = new SlideshowManager();
        window.slideshowManager = slideshowManager;
    } catch (error) {
        console.error('Error initializing SlideshowManager:', error);
    }
});