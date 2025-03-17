document.addEventListener("DOMContentLoaded", function() {
  const counterText = document.getElementById("counterText");

  // Set the date for October 1st, 2024
  const octoberFirst = new Date("2025-04-01");

  function updateCounter() {
    // Get the current date and time
    const now = new Date();

    // Calculate the difference in time
    const differenceInTime = now.getTime() - octoberFirst.getTime();

    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(differenceInTime / (1000 * 3600 * 24));
    const hours = Math.floor((differenceInTime % (1000 * 3600 * 24)) / (1000 * 3600));
    const minutes = Math.floor((differenceInTime % (1000 * 3600)) / (1000 * 60));
    const seconds = Math.floor((differenceInTime % (1000 * 60)) / 1000);

    // Update the HTML element with the calculated values in the desired format
    counterText.textContent = `Das MTB ist schon ${days} Tage, ${hours} Stunden, ${minutes} Minuten und ${seconds} Sekunden zu spät!`;
  }

  // Call updateCounter initially to start the counter immediately
  updateCounter();

  // Update the counter every second
  setInterval(updateCounter, 1000);
});


document.querySelectorAll('.floating-cat').forEach(cat => {
  cat.style.left = Math.random() * window.innerWidth + 'px';
  cat.style.top = Math.random() * window.innerHeight + 'px';
});

