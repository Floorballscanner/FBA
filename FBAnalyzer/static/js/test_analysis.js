
var s_game = document.getElementById("select-game");

function changeGame() {

    game_id = s_game.options[s_game.selectedIndex].value;

    fetch("https://fbscanner.io/apis/games/" + game_id + "/")
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    gd = data.game_data;
                    if (Object.keys(gd).length > 0) { // If game data is not empty

                        // Create a map to store shooter objects with unique jersey numbers
                        const uniqueShootersMap = new Map();

                        // Iterate through the array of arrays and extract shooter names
                        gd.printShotData.forEach(row => {
                            if (row[1].includes(gd.name_t1)) {
                                const shooterName = row[9]; // Assuming array indexing is 0-based
                                const matches = shooterName.match(/#(\d+) (.+)/); // Extract jersey number and name

                                if (matches && matches.length === 3) {
                                  const jerseyNumber = parseInt(matches[1], 10);
                                  const playerName = matches[2];

                                  // Check if a shooter with the same jersey number already exists
                                  if (!uniqueShootersMap.has(jerseyNumber)) {
                                    // If not, add the shooter to the map
                                    uniqueShootersMap.set(jerseyNumber, playerName);
                                  }
                                }
                            }
                        });

                        // Sort the unique shooter names by jersey number in ascending order
                        const sortedShooters = [...uniqueShootersMap.entries()]
                          .sort((a, b) => a[0] - b[0]) // Sort by jersey number
                          .map(entry => `#${entry[0]} ${entry[1]}`); // Map back to the original format

                        console.log(sortedShooters);

                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
            });
}