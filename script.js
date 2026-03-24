class WebsiteLauncher {
    constructor() {
        this.menuContainer = document.getElementById('menuContainer');
        this.browserContainer = document.getElementById('browserContainer');
        this.websiteFrame = document.getElementById('websiteFrame');
        this.browserTitle = document.getElementById('browserTitle');
        this.backBtn = document.getElementById('backBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.menuItems = document.querySelectorAll('.menu-item');
        
        this.isFullscreen = false;
        this.currentUrl = '';
        
        this.init();
    }
    
    init() {
        // Add click handlers to menu items
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                const title = item.querySelector('.menu-title').textContent;
                this.openWebsite(url, title);
            });
        });
        
        // Back button handler
        this.backBtn.addEventListener('click', () => {
            this.backToMenu();
        });
        
        // Fullscreen button handler
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isFullscreen) {
                    this.toggleFullscreen();
                } else if (this.browserContainer.classList.contains('active')) {
                    this.backToMenu();
                }
            }
        });
        
        // Prevent right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Prevent F12, Ctrl+Shift+I, Ctrl+U
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Handle iframe load events
        this.websiteFrame.addEventListener('load', () => {
            this.hideLoadingIndicator();
        });
        
        // Handle visibility change to prevent URL peeking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.browserContainer.classList.contains('active')) {
                // When tab becomes hidden, clear the iframe
                this.websiteFrame.src = 'about:blank';
            } else if (!document.hidden && this.currentUrl) {
                // When tab becomes visible again, reload the URL
                this.websiteFrame.src = this.currentUrl;
            }
        });
    }
    
    openWebsite(url, title) {
        this.currentUrl = url;
        this.browserTitle.textContent = title;
        
        // Show loading state
        this.showLoadingIndicator();
        
        // Hide menu, show browser
        this.menuContainer.classList.add('hidden');
        setTimeout(() => {
            this.menuContainer.style.display = 'none';
            this.browserContainer.classList.add('active');
            this.websiteFrame.src = url;
        }, 500);
        
        // Clear browser history if possible
        this.clearBrowserHistory();
    }
    
    backToMenu() {
        // Clear iframe
        this.websiteFrame.src = 'about:blank';
        this.currentUrl = '';
        
        // Hide browser, show menu
        this.browserContainer.classList.remove('active');
        this.menuContainer.style.display = 'flex';
        setTimeout(() => {
            this.menuContainer.classList.remove('hidden');
        }, 50);
        
        // Exit fullscreen if active
        if (this.isFullscreen) {
            this.toggleFullscreen();
        }
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            // Enter fullscreen
            if (this.browserContainer.requestFullscreen) {
                this.browserContainer.requestFullscreen();
            } else if (this.browserContainer.webkitRequestFullscreen) {
                this.browserContainer.webkitRequestFullscreen();
            } else if (this.browserContainer.msRequestFullscreen) {
                this.browserContainer.msRequestFullscreen();
            }
            
            this.browserContainer.classList.add('fullscreen');
            this.fullscreenBtn.textContent = '⛶ Exit Fullscreen';
            this.isFullscreen = true;
            
            // Hide browser controls after 3 seconds in fullscreen
            setTimeout(() => {
                if (this.isFullscreen) {
                    this.browserControls.style.opacity = '0';
                    this.browserControls.style.pointerEvents = 'none';
                }
            }, 3000);
            
            // Show controls on mouse movement
            this.browserContainer.addEventListener('mousemove', this.showControls.bind(this));
            
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            this.browserContainer.classList.remove('fullscreen');
            this.fullscreenBtn.textContent = '⛶ Fullscreen';
            this.isFullscreen = false;
            this.browserControls.style.opacity = '1';
            this.browserControls.style.pointerEvents = 'auto';
            
            // Remove mousemove listener
            this.browserContainer.removeEventListener('mousemove', this.showControls.bind(this));
        }
    }
    
    showControls() {
        if (this.isFullscreen) {
            this.browserControls.style.opacity = '1';
            this.browserControls.style.pointerEvents = 'auto';
            
            // Hide controls after 3 seconds of no movement
            clearTimeout(this.controlsTimeout);
            this.controlsTimeout = setTimeout(() => {
                if (this.isFullscreen) {
                    this.browserControls.style.opacity = '0';
                    this.browserControls.style.pointerEvents = 'none';
                }
            }, 3000);
        }
    }
    
    showLoadingIndicator() {
        this.websiteFrame.style.opacity = '0.5';
        // You could add a loading spinner here if needed
    }
    
    hideLoadingIndicator() {
        this.websiteFrame.style.opacity = '1';
    }
    
    clearBrowserHistory() {
        // Try to manipulate history to hide the URL
        if (window.history && window.history.pushState) {
            window.history.pushState({}, '', window.location.href);
        }
    }
}

// Initialize the launcher when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteLauncher();
});

// Additional security measures
(function() {
    'use strict';
    
    // Disable text selection on the entire page
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Disable drag and drop
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Prevent opening developer tools through various methods
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > 200 || 
            window.outerWidth - window.innerWidth > 200) {
            // Window might be resized due to dev tools
            window.close();
        }
    }, 1000);
    
    // Check if dev tools are open
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                // Close the window or redirect
                window.location.href = 'about:blank';
            }
        } else {
            devtools.open = false;
        }
    }, 500);
})();
