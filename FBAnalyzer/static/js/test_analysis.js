
var s_game = document.getElementById("select-game");

function changeGame() {

    game_id = s_game.options[s_game.selectedIndex].value;

    fetch("https://fbscanner.io/apis/games/" + game_id + "/")
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    gd = data.game_data;
                    if (Object.keys(gd).length > 0) { // If game data is not empty



                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
            });
}