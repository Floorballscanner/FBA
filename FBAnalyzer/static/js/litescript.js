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

// Handle canvas click event
canvas.addEventListener("click", function(event) {
    // Calculate the click position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Open the shot form popup window
    const popupWindow = window.open("", "Shot Form", "width=300,height=200");

    // Set the HTML of the popup window
    popupWindow.document.body.innerHTML = `
        <h3>Select Shot Type</h3>
        <form>
            <div class="form-group">
                <label for="shot-type">Shot type:</label>
                <select class="form-control" id="shot-type">
                    <option value="wrist shot">Wrist shot</option>
                    <option value="slap shot">Slap shot</option>
                    <option value="snap shot">Snap shot</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Tag Shot</button>
        </form>
    `;

    // Show the popup window
    popupWindow.document.body.style.display = "block";

    // Handle form submission
    const form = popupWindow.document.querySelector("form");
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        // Get form input
        const shotType = form.elements["shot-type"].value;

        // Draw the shot on the canvas
        context.fillStyle = "#00F";
        context.beginPath();
        context.arc(x, y, 10, 0, 2 * Math.PI);
        context.fill();

        // Display a success message
        const successMessage = document.createElement("div");
        successMessage.classList.add("alert", "alert-success", "mt-3");
        successMessage.textContent = `A ${shotType} shot was tagged from (${x}, ${y})!`;
        form.appendChild(successMessage);

        // Reset the form and hide the popup
        form.reset();
        popupWindow.close();
    });
});
