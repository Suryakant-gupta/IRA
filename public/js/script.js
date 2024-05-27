// Wait for the DOM to be fully loaded
// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // Room filtration
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      
      const location = 'Delhi';
      const acRoomChecked = document.getElementById('ac-room').checked;
      const nonAcRoomChecked = document.getElementById('non-ac-room').checked;
      
      // Construct URL with selected filter options
      let url = '/home';
      let queryParams = [];
      if (location) queryParams.push(`location=${location}`);
      if (acRoomChecked) queryParams.push('ac=true');
      if (nonAcRoomChecked) queryParams.push('ac=false');
      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }
      
      // Save the current scroll position
      sessionStorage.setItem('scrollPosition', window.scrollY);
    
      window.location.href = url;
      e.preventDefault();
      return false;
    });
  }

  // Restore the scroll position after the page reloads
  const savedScrollPosition = sessionStorage.getItem('scrollPosition');
  if (savedScrollPosition) {
      window.scrollTo(0, savedScrollPosition);
      sessionStorage.removeItem('scrollPosition');
  }
});

  
  document.addEventListener("DOMContentLoaded", ()=>{
    // Code for slideshow
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.nav-dots');
    const prevArrow = document.querySelector('.arrow.prev');
    const nextArrow = document.querySelector('.arrow.next');
    let currentSlide = 0;
  
    // Add navigation dots if there are slides
    if (slides.length > 0) {
      for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
          goToSlide(i);
        });
        dotsContainer.appendChild(dot);
      }
      const dots = document.querySelectorAll('.dot');
      dots[currentSlide].classList.add('active');
  
      // Go to a specific slide
      function goToSlide(index) {
        slides.forEach((slide) => {
          slide.style.transform = `translateX(-${index * 100}%)`;
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
        currentSlide = index;
      }
  
      // Go to previous slide
      function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(currentSlide);
      }
  
      // Go to next slide
      function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        goToSlide(currentSlide);
      }
  
      // Set up event listeners for navigation arrows
      prevArrow.addEventListener('click', prevSlide);
      nextArrow.addEventListener('click', nextSlide);
  
      // Automatic slide change
      setInterval(nextSlide, 3000); // Change slide every 3 seconds
    }
  
    // Code for read more/less functionality
    const readMoreLink = document.getElementById('read-more-link');
    const readLessLink = document.getElementById('read-less-link');
    if (readMoreLink && readLessLink) {
      readMoreLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.more-content').style.display = 'block';
        document.querySelector('.show-more').style.display = 'none';
        document.querySelector('.show-less').style.display = 'block';
      });
  
      readLessLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.more-content').style.display = 'none';
        document.querySelector('.show-more').style.display = 'block';
        document.querySelector('.show-less').style.display = 'none';
      });
    }
 
  })
    