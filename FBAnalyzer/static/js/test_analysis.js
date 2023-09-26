
var s_game = document.getElementById("select-game");

function changeGame() {

    game_id = s_game.options[s_game.selectedIndex].value;

    fetch("https://fbscanner.io/apis/games/" + game_id + "/")
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    gd = data.game_data;
                    if (Object.keys(gd).length > 0) { // If game data is not empty

                        // Create an empty Set to store unique shooter names
                        const uniqueShooters = new Set();

                        // Iterate through the array of arrays and extract shooter names
                        gd.printShotData.forEach(row => {
                            if (row[1].includes(gd.name_t1)) { // Check the 2nd column for team 1
                                const shooterName = row[9]; // Assuming array indexing is 0-based
                                uniqueShooters.add(shooterName);
                            }
                        });

                        // Convert the Set to an array if needed
                        const uniqueShootersArray = Array.from(uniqueShooters);
                        console.log(uniqueShootersArray);

                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
            });
}