// Script to make the music player responsive to scrolling
document.addEventListener('DOMContentLoaded', function() {
  const playerContainer = document.getElementById('music-player-container');
  if (!playerContainer) return;
  
  let scrollTimer = null;
  let isScrolling = false;
  
  // Function to handle scroll events
  function handleScroll() {
    if (!isScrolling) {
      isScrolling = true;
      playerContainer.classList.add('opacity-0', 'pointer-events-none');
      playerContainer.classList.remove('opacity-100');
    }
    
    // Clear the timeout if it's already set
    if (scrollTimer) clearTimeout(scrollTimer);
    
    // Set a timeout to run after scrolling ends (300ms)
    scrollTimer = setTimeout(function() {
      isScrolling = false;
      playerContainer.classList.remove('opacity-0', 'pointer-events-none');
      playerContainer.classList.add('opacity-100');
    }, 1000);
  }
  
  // Add transition class for smooth fade in/out
  playerContainer.classList.add('transition-opacity', 'duration-300', 'ease-in-out', 'opacity-100');
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  
  console.log('Music player scroll behavior initialized');
});
