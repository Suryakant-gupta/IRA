document.addEventListener('DOMContentLoaded', () => {
    const reserveBtn = document.querySelector(".reserve-btn");
    const scheduleBtn = document.querySelector(".schedule-btn");
    const reserve = document.querySelector(".rs");
    const firstf = document.querySelector(".first-f");
    const secondf = document.querySelector(".second-f");
    const whats = document.querySelector(".whats");
    const visitBtn = document.querySelector(".vb");
  
    // Check if the elements exist before adding event listeners
    if (reserveBtn && scheduleBtn && reserve && firstf && secondf && whats && visitBtn) {
      // Add form submission event listener
      document.addEventListener("submit", function(event) {
        event.preventDefault();
      });
  
      reserveBtn.addEventListener("click", (event) => {
        event.preventDefault();
        reserve.style.display = (reserve.style.display === "flex") ? "none" : "flex";
        reserveBtn.style.color = (reserve.style.color === "#000") ? "#000" : "#E7991C";
        whats.style.display = "none";
        firstf.style.display = "none";
        secondf.style.display = "none";
        visitBtn.style.display = "none";
      });
  
      scheduleBtn.addEventListener("click", (event) => {
        event.preventDefault();
        reserve.style.display = "none";
        scheduleBtn.style.color = (reserve.style.color === "#000") ? "#000" : "#E7991C";
        whats.style.display = "flex";
        firstf.style.display = "flex";
        secondf.style.display = "flex";
        visitBtn.style.display = "flex";
      });
    } else {
      console.error("One or more required elements are missing from the DOM.");
    }
  });