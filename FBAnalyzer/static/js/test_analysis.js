
var s_game = document.getElementById("select-game");
var playerData = [['ID','Name','Games','ixG','ixAss','ixG_PP','ixAss_PP','Goals','Assists','Shots','Shot Assists','Possession+','Possession-']];
var playerData_60 = [['ID','Name','Games','ixG/Game','ixAss/Game','ixG_PP/Game','ixGAss_PP/Game','xPoints/Game','Goals/Game','Assists/Game',
                    'Points/Game','Shots/Game','Passes/Game','Possession+/Game','Possession-/Game']];
var gameData = [['Date','Team1','Team2','xG_Team1','xG_Team2','xGOT_Team1','xGOT_Team2','Goals_Team1','Goals_Team2','Shots_Team1','Shots_Team2']];
var idleTime = 0;

function changeGame() {

    playerData = [['ID','Name','Games','ixG','ixAss','ixG_PP','ixAss_PP','Goals','Assists','Shots','Shot Assists','Possession+','Possession-']];
    gameData = [['Date','Team1','Team2','xG_Team1','xG_Team2','xGOT_Team1','xGOT_Team2','Goals_Team1','Goals_Team2','Shots_Team1','Shots_Team2']];
    var selectedValues = [];

    // Iterate through each option in the select element
    for (var i = 0; i < s_game.options.length; i++) {
        var option = s_game.options[i];

        // Check if the option is selected
        if (option.selected) {
            selectedValues.push(option.value);
        }
    }

    for (i=0;i<selectedValues.length;i++) {
        game_id = selectedValues[i];

        fetch("https://fbscanner.io/apis/games/" + game_id + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                gd = data.game_data;
                date = data.date;

                if (Object.keys(gd).length > 0) { // If game data is not empty
                    data = gd.plT1_array;

                    for (i=1;i<data.length;i++) { // Go through all game player stats

                        if (data[i][0] != "") {
                            found = 0;

                            for (j=1;j<playerData.length;j++) { // Sum game datas

                                if (data[i][0] == playerData[j][0]) { // Player found
                                    found = 1;
                                    playerData[j][2]++;
                                    playerData[j][3] = playerData[j][3] + data[i][2];
                                    playerData[j][4] = playerData[j][4] + data[i][3];
                                    playerData[j][5] = playerData[j][5] + data[i][4];
                                    playerData[j][6] = playerData[j][6] + data[i][5];
                                    playerData[j][7] = playerData[j][7] + data[i][6];
                                    playerData[j][8] = playerData[j][8] + data[i][7];
                                    playerData[j][9] = playerData[j][9] + data[i][8];
                                    playerData[j][10] = playerData[j][10] + data[i][9];
                                    playerData[j][11] = playerData[j][11] + data[i][10];
                                    playerData[j][12] = playerData[j][12] + data[i][11];
                                }
                            }
                            if (found == 0) { // Player not found, adding to list
                                playerData.push([data[i][0], data[i][1], 1, data[i][2], data[i][3], data[i][4], data[i][5],
                                data[i][6], data[i][7], data[i][8], data[i][9], data[i][10],data[i][11]]);
                            }
                        }
                    }
                    // Game stats to game data array
                    gameData.push([date, gd.name_t1, gd.name_t2, Number(gd.txG_1), Number(gd.txG_2), Number(gd.txGOT_1),
                    Number(gd.txGOT_2), Number(gd.tgt_1), Number(gd.tgt_2), Number(gd.sf_g[7]), Number(gd.sfT2_g[7])]);
                    
                }
                drawCharts();
            })
            .catch((error) => {
                console.error('Error:', error);
        });
    }
}

function drawCharts() {

    // Game data chart

    var gdata = new google.visualization.DataTable();
    gdata.addColumn('string', 'Date');
    gdata.addColumn('string', 'Team 1');
    gdata.addColumn('string', 'Team 2');
    gdata.addColumn('number', 'xG T1');
    gdata.addColumn('number', 'xG T2');
    gdata.addColumn('number', 'xGOT T1');
    gdata.addColumn('number', 'xGOT T2');
    gdata.addColumn('number', 'Goals T1');
    gdata.addColumn('number', 'Goals T2');
    gdata.addColumn('number', 'Shots T1');
    gdata.addColumn('number', 'Shots T2');

    for(i = 1; i < gameData.length; i++){
        gdata.addRow([gameData[i][0], gameData[i][1], gameData[i][2], gameData[i][3], gameData[i][4], gameData[i][5],
        gameData[i][6], gameData[i][7], gameData[i][8], gameData[i][9], gameData[i][10]]);
    }

    var options = {
        title: 'Game stats',
        bar: {groupWidth: "95%"},
        legend: { position: 'bottom'},
        colors: ['#002072', '#59D9EB'],
        hAxis: { textPosition: 'none' }
        };


    // Create and draw the visualization.
    var gchart = new google.visualization.Table(document.getElementById('gameData'));
    gchart.draw(gdata, options);

    // Add sort listener

    google.visualization.events.addListener(chart, 'sort',
    function(event) {
        gdata.sort([{column: event.column, desc: event.ascending}]);
        gchart.draw(gdata, options);
    });
    
    // Player data chart

    var pldata = new google.visualization.DataTable();
    pldata.addColumn('string', 'Player Name');
    pldata.addColumn('number', 'Games');
    pldata.addColumn('number', 'ixG');
    pldata.addColumn('number', 'ixAss');
    pldata.addColumn('number', 'ixG_PP');
    pldata.addColumn('number', 'ixAss_PP');
    pldata.addColumn('number', 'Goals');
    pldata.addColumn('number', 'Assists');
    pldata.addColumn('number', 'Shots');
    pldata.addColumn('number', 'Shot Assists');
    pldata.addColumn('number', 'Possession +');
    pldata.addColumn('number', 'Possession -');

    for(i = 1; i < playerData.length; i++){
        pldata.addRow([playerData[i][1], playerData[i][2], playerData[i][3], playerData[i][4], playerData[i][5], playerData[i][6],
        playerData[i][7], playerData[i][8], playerData[i][9], playerData[i][10], playerData[i][11], playerData[i][12]]);
    }

    var options = {
        title: 'Player stats',
        bar: {groupWidth: "95%"},
        legend: { position: 'bottom'},
        colors: ['#002072', '#59D9EB'],
        hAxis: { textPosition: 'none' }
        };


    // Create and draw the visualization.
    var chart = new google.visualization.Table(document.getElementById('playerData'));
    chart.draw(pldata, options);

    // Add sort listener

    google.visualization.events.addListener(chart, 'sort',
    function(event) {
        pldata.sort([{column: event.column, desc: event.ascending}]);
        chart.draw(pldata, options);
    });
    
    // Player data chart / Game

    var pldata60 = new google.visualization.DataTable();
    pldata60.addColumn('string', 'Player Name');
    pldata60.addColumn('number', 'Games');
    pldata60.addColumn('number', 'ixG');
    pldata60.addColumn('number', 'ixAss');
    pldata60.addColumn('number', 'ixG_PP');
    pldata60.addColumn('number', 'ixAss_PP');
    pldata60.addColumn('number', 'Goals');
    pldata60.addColumn('number', 'Assists');
    pldata60.addColumn('number', 'Shots');
    pldata60.addColumn('number', 'ixG/Shot');
    pldata60.addColumn('number', 'Shot Assists');
    pldata60.addColumn('number', 'ixAss/Assist');
    pldata60.addColumn('number', 'Possession +');
    pldata60.addColumn('number', 'Possession -');


    for(i = 1; i < playerData.length; i++){
        pldata60.addRow([playerData[i][1], playerData[i][2], playerData[i][3]/playerData[i][2], playerData[i][4]/playerData[i][2],
        playerData[i][5]/playerData[i][2], playerData[i][6]/playerData[i][2], playerData[i][7]/playerData[i][2], playerData[i][8]/playerData[i][2],
        playerData[i][9]/playerData[i][2], playerData[i][3]/playerData[i][9], playerData[i][10]/playerData[i][2], playerData[i][4]/playerData[i][10],
        playerData[i][11]/playerData[i][2], playerData[i][12]/playerData[i][2]]);
    }

    var options60 = {
        title: 'Player stats / Game',
        bar: {groupWidth: "95%"},
        legend: { position: 'bottom'},
        colors: ['#002072', '#59D9EB'],
        hAxis: { textPosition: 'none' }
        };


    // Create and draw the visualization.
    var chart60 = new google.visualization.Table(document.getElementById('playerData60'));
    chart60.draw(pldata60, options60);

    // Add sort listener

    google.visualization.events.addListener(chart60, 'sort',
    function(event) {
        pldata60.sort([{column: event.column, desc: event.ascending}]);
        chart60.draw(pldata60, options60);
    });
}

function findShooters() {

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

    document.addEventListener("DOMContentLoaded", function () {
        // Increment the idle time counter every minute.
        var idleInterval = setInterval(timerIncrement, 60000); // 1 minute

        // Zero the idle timer on mouse movement.
        document.addEventListener("mousemove", function (e) {
            idleTime = 0;
        });

        document.addEventListener("keypress", function (e) {
            idleTime = 0;
        });
    });

    function timerIncrement() {
        idleTime = idleTime + 1;
        if (idleTime > 19) { // 20 minutes
            window.location.replace("https://fbscanner.io/accounts");
        }
    }