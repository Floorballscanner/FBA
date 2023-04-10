const canvas = document.querySelector("floorball-canvas");
const context = canvas.getContext("2d");

// Draw the floorball game
function drawGame() {
    // Draw the rink
    context.fillStyle = "#FFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#B2B2B2";
    context.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Draw the net
    context.fillStyle = "#F00";
    context.fillRect(20, canvas.height / 2 - 30, 20, 60);
    context.fillRect(canvas.width - 40, canvas.height / 2 - 30, 20, 60);
    context.fillStyle = "#FFF";
    context.fillRect(40, canvas.height / 2 - 20, canvas.width - 80, 40);

    // Draw the ball
    context.fillStyle = "#000";
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI);
    context.fill();
}

// Draw the initial game state
drawGame();

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

