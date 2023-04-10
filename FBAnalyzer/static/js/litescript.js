<!-- Floorball game logic -->
// Get the canvas element
const canvas = document.getElementById("floorball-canvas");
// Get the canvas context for drawing
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

// Handle form submission
const form = document.querySelector("form");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    // Get form inputs
    const playerName = document.getElementById("player-name").value;
    const shotType = document.getElementById("shot-type").value;
    const shotLocation = document.getElementById("shot-location").value;
    // Draw the shot on the canvas
    context.fillStyle = "#00F";
    context.beginPath();
    context.arc(shotLocation, canvas.height / 2, 10, 0, 2 * Math.PI);
    context.fill();
    // Display a success message
    const successMessage = document.createElement("div");
    successMessage.classList.add("alert", "alert-success", "mt-3");
    successMessage.textContent = `${playerName} made a ${shotType} from ${shotLocation}!`;
    form.appendChild(successMessage);
    // Reset the form
    form.reset();
    });