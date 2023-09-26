
var s_game = document.getElementById("select-game");

function changeGame() {

    game_id = s_game.options[s_game.selectedIndex].value;

    fetch("https://fbscanner.io/apis/games/" + game_id + "/")
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    gd = data.game_data;
                    if (Object.keys(gd).length > 0) { // If game data is not empty

                        // Create an empty array to store shooter objects
                        const shooterObjects = [];

                        // Iterate through the array of arrays and extract shooter names
                        gd.printShotData.forEach(row => {
                            if (row[1].includes(name_t1)) {
                                const shooterName = row[9]; // Assuming array indexing is 0-based
                                const matches = shooterName.match(/#(\d+) (.+)/); // Extract jersey number and name

                                if (matches && matches.length === 3) {
                                  const jerseyNumber = parseInt(matches[1], 10);
                                  const playerName = matches[2];
                                  shooterObjects.push({ jerseyNumber, playerName });
                                }
                            }
                        });

                        // Sort shooter objects by jersey number in ascending order
                        shooterObjects.sort((a, b) => a.jerseyNumber - b.jerseyNumber);

                        // Extract the sorted shooter names from the sorted objects
                        const sortedShooters = shooterObjects.map(obj => `#${obj.jerseyNumber} ${obj.playerName}`);

                        console.log(sortedShooters);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
            });
}