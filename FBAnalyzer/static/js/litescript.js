const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

// Handle canvas click event
canvas.addEventListener("click", function(event) {
  // Calculate the click position relative to the canvas
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Create the shot list popup
  const popup = document.createElement("ul");
  popup.classList.add("shot-list");

  // Build the shot list HTML
  const shotListHtml = `
    <li class="shot-list-item" data-shot-type="wrist-shot">Wrist Shot</li>
    <li class="shot-list-item" data-shot-type="slap-shot">Slap Shot</li>
    <li class="shot-list-item" data-shot-type="snap-shot">Snap Shot</li>
  `;
  popup.innerHTML = shotListHtml;

  // Set the position of the popup to the click location
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;

  // Add popup to the canvas
  canvas.parentNode.appendChild(popup);

  // Handle shot selection
  popup.addEventListener("click", function(event) {
    // Get the selected shot type
    const shotType = event.target.getAttribute("data-shot-type");
    if (shotType) {
      // Draw the shot on the canvas
      context.fillStyle = "#00F";
      context.beginPath();
      context.arc(x, y, 10, 0, 2 * Math.PI);
      context.fill();

      // Display a success message
      const successMessage = document.createElement("div");
      successMessage.classList.add("alert", "alert-success", "mt-3");
      successMessage.textContent = `Made a ${shotType} from (${x}, ${y})!`;
      canvas.parentNode.appendChild(successMessage);

      // Remove popup and success message after 3 seconds
      setTimeout(function() {
        canvas.parentNode.removeChild(popup);
        canvas.parentNode.removeChild(successMessage);
      }, 3000);
    }
  });

  // Handle clicks outside the popup
  document.addEventListener("click", function(event) {
      if (popup && !popup.contains(event.target)) {
        canvas.parentNode.removeChild(popup);
      }
    });

});

