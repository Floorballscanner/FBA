
    var s_game = document.getElementById("select-game");
    var playerData = [['ID','Name','Games','ixG','ixAss','ixG_PP','ixAss_PP','Goals','Assists','Shots','Shot Assists','Possession+','Possession-']];
    var playerData_5v5 = [['ID','Name','Games','xG%','ixG','iGoals','xAss%','ixAss','iAss','iShots','iPasses','Pos+','Pos-','xGF','xGA','xG%','GF','GA','+-','SF','SA']];
    var playerData_PP = [['ID','Name','Games','xG%','ixG','iGoals','xAss%','ixAss','iAss','iShots','iPasses','Pos+','Pos-','xGF','xGA','xG%','GF','GA','+-','SF','SA']];
    var playerData_60 = [['ID','Name','Games','ixG/Game','ixAss/Game','ixG_PP/Game','ixGAss_PP/Game','xPoints/Game','Goals/Game','Assists/Game',
                        'Points/Game','Shots/Game','Passes/Game','Possession+/Game','Possession-/Game']];
    var gameData = [['Date','Team1','Team2','xGF','xGA','xGOTF','xGOTA','GF','GA','SF','SA']];
    var shotData = [];
    var data = 0;
    var idleTime = 0;
    var fLength = 332;
    var fWidth = 200;
    var s_p1 = document.getElementById('select-p1');
    var s_p2 = document.getElementById('select-p2');
    var s_p3 = document.getElementById('select-p3');
    var s_p4 = document.getElementById('select-p4');
    var s_p5 = document.getElementById('select-p5');

    var myImg = new Image();
    myImg.src = "/static/field-new.png";
    var cnvs1 = document.getElementById("p1Map");
    var cnvs2 = document.getElementById("p2Map");
    var cnvs3 = document.getElementById("p3Map");
    var cnvs4 = document.getElementById("p4Map");
    var cnvs5 = document.getElementById("p5Map");
    var ctx1 = cnvs1.getContext("2d");
    var ctx2 = cnvs2.getContext("2d");
    var ctx3 = cnvs3.getContext("2d");
    var ctx4 = cnvs4.getContext("2d");
    var ctx5 = cnvs5.getContext("2d");

async function getGameData(game_ids) {

    console.log('First game: ' + game_ids[0])
    let apiResponse = await fetch("https://fbscanner.io/apis/games/" + game_ids[0] + "/");
    data = await apiResponse.json();
    gd = data.game_data;
    date = data.date;

    if (Object.keys(gd).length > 0) { // If game data is not empty
        data = gd.plT1_array;
        shotData = shotData.concat(gd.printShotData);

        for (j=1;j<data.length;j++) { // Go through all game player stats

            if (data[j][0] != "") {
                found = 0;

                for (k=1;k<playerData.length;k++) { // Sum game datas

                    if (data[j][0] == playerData[k][0]) { // Player found
                        found = 1;
                        playerData[k][2]++;
                        playerData_5v5[k][2]++;
                        playerData_PP[k][2]++;
                        playerData[k][3] = playerData[k][3] + data[j][2];
                        playerData[k][4] = playerData[k][4] + data[j][3];
                        playerData[k][5] = playerData[k][5] + data[j][4];
                        playerData[k][6] = playerData[k][6] + data[j][5];
                        playerData[k][7] = playerData[k][7] + data[j][6];
                        playerData[k][8] = playerData[k][8] + data[j][7];
                        playerData[k][9] = playerData[k][9] + data[j][8];
                        playerData[k][10] = playerData[k][10] + data[j][9];
                        playerData[k][11] = playerData[k][11] + data[j][10];
                        playerData[k][12] = playerData[k][12] + data[j][11];
                    }
                }
                if (found == 0) { // Player not found, adding to list
                    playerData.push([data[j][0], data[j][1], 1, data[j][2], data[j][3], data[j][4], data[j][5],
                    data[j][6], data[j][7], data[j][8], data[j][9], data[j][10],data[j][11]]);
                    playerData_5v5.push([data[j][0],data[j][1],1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
                    playerData_PP.push([data[j][0],data[j][1],1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
                }
            }
        }
        // Game stats to game data array
        gameData.push([date, gd.name_t1, gd.name_t2, Number(gd.txG_1), Number(gd.txG_2), Number(gd.txGOT_1),
        Number(gd.txGOT_2), Number(gd.tgt_1), Number(gd.tgt_2), Number(gd.sf_g[7]), Number(gd.sfT2_g[7])]);
    }
    for (i=1;i<game_ids.length;i++) {
        console.log('Next game: ' + game_ids[i])
        let apiResponse = await fetch("https://fbscanner.io/apis/games/" + game_ids[i] + "/");
        data = await apiResponse.json();
        gd = data.game_data;
        date = data.date;

        if (Object.keys(gd).length > 0) { // If game data is not empty
            data = gd.plT1_array;
            shotData = shotData.concat(gd.printShotData);

            for (j=1;j<data.length;j++) { // Go through all game player stats

                if (data[j][0] != "") {
                    found = 0;

                    for (k=1;k<playerData.length;k++) { // Sum game datas

                        if (data[j][0] == playerData[k][0]) { // Player found
                            found = 1;
                            playerData[k][2]++;
                            playerData_5v5[k][2]++;
                            playerData_PP[k][2]++;
                            playerData[k][3] = playerData[k][3] + data[j][2];
                            playerData[k][4] = playerData[k][4] + data[j][3];
                            playerData[k][5] = playerData[k][5] + data[j][4];
                            playerData[k][6] = playerData[k][6] + data[j][5];
                            playerData[k][7] = playerData[k][7] + data[j][6];
                            playerData[k][8] = playerData[k][8] + data[j][7];
                            playerData[k][9] = playerData[k][9] + data[j][8];
                            playerData[k][10] = playerData[k][10] + data[j][9];
                            playerData[k][11] = playerData[k][11] + data[j][10];
                            playerData[k][12] = playerData[k][12] + data[j][11];
                        }
                    }
                    if (found == 0) { // Player not found, adding to list
                        playerData.push([data[j][0], data[j][1], 1, data[j][2], data[j][3], data[j][4], data[j][5],
                        data[j][6], data[j][7], data[j][8], data[j][9], data[j][10],data[j][11]]);
                        playerData_5v5.push([data[j][0],data[j][1],1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
                        playerData_PP.push([data[j][0],data[j][1],1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
                    }
                }
            }
            // Game stats to game data array
            gameData.push([date, gd.name_t1, gd.name_t2, Number(gd.txG_1), Number(gd.txG_2), Number(gd.txGOT_1),
            Number(gd.txGOT_2), Number(gd.tgt_1), Number(gd.tgt_2), Number(gd.sf_g[7]), Number(gd.sfT2_g[7])]);
        }
    }
}

function changeGame() {

    playerData = [['ID','Name','Games','ixG','ixAss','ixG_PP','ixAss_PP','Goals','Assists','Shots','Shot Assists','Possession+','Possession-']];
    gameData = [['Date','Team1','Team2','xG_Team1','xG_Team2','xGOT_Team1','xGOT_Team2','Goals_Team1','Goals_Team2','Shots_Team1','Shots_Team2']];
    playerData_5v5 = [['ID','Name','Games','xG%','ixG','iGoals','xAss%','ixAss','iAss','iShots','iPasses','Pos+','Pos-','xGF','xGA','xG%','GF','GA','+-','SF','SA']];
    playerData_PP = [['ID','Name','Games','xG%','ixG','iGoals','xAss%','ixAss','iAss','iShots','iPasses','Pos+','Pos-','xGF','xGA','xG%','GF','GA','+-','SF','SA']];
    shotData = [];
    var selectedValues = [];

    ctx1.drawImage(myImg,0,0,fWidth,fLength);
    ctx2.drawImage(myImg,0,0,fWidth,fLength);
    ctx3.drawImage(myImg,0,0,fWidth,fLength);
    ctx4.drawImage(myImg,0,0,fWidth,fLength);
    ctx5.drawImage(myImg,0,0,fWidth,fLength);

    // Iterate through each option in the select element
    for (i = 0; i < s_game.options.length; i++) {
        var option = s_game.options[i];

        // Check if the option is selected
        if (option.selected) {
            selectedValues.push(option.value);
        }
    }
    console.log("call getGameData()")
    getGameData(selectedValues);
    setTimeout(() => {
        console.log('Waited for one second');

        s_p1.disabled = false;
        s_p2.disabled = false;
        s_p3.disabled = false;

        s_p1.selectedIndex = "0";
        s_p2.selectedIndex = "0";
        s_p3.selectedIndex = "0";

        while (s_p1.options.length > 1) {
            s_p1.remove(s_p1.options.length-1);
            s_p2.remove(s_p2.options.length-1);
            s_p3.remove(s_p3.options.length-1);
        }

        for (let j=1; j<playerData.length; j++) {
            opt1 = new Option(playerData[j][1], playerData[j][0]);
            opt2 = new Option(playerData[j][1], playerData[j][0]);
            opt3 = new Option(playerData[j][1], playerData[j][0]);
            s_p1.appendChild(opt1);
            s_p2.appendChild(opt2);
            s_p3.appendChild(opt3);
        }
        sumofxG = 0;
        sumofxAss = 0;

        for (let j=1;j<shotData.length; j++) {

            if ((shotData[j][4] == gd.name_t1) && (shotData[j][5] != "Possession +") && (shotData[j][5] != "Possession -")) { // My team shot

                shooter = shotData[j][9];
                passer = shotData[j][10];
                xG = Number(shotData[j][7]);
                onField = [shotData[j][11],shotData[j][12],shotData[j][13],shotData[j][14],shotData[j][15]];

                if (shotData[j][25] == 1) {PP = 1}
                else {PP = 0}
                if (shotData[j][26] == 1) {SH = 1}
                else {SH = 0}

                goal = 0;
                if (shotData[j][5] == "Goal") {goal = 1}

                // If player shoots or passes or is on field
                shooter_row = 0;
                passer_row = 0;
                onf_row = [0,0,0,0,0];

                for (let k=1; k<playerData_5v5.length; k++) {
                    if (playerData_5v5[k][1] == shooter) {
                        shooter_row = k;
                    }
                    if (playerData_5v5[k][1] == passer) {
                        passer_row = k;
                    }
                    if (playerData_5v5[k][1] == onField[0]) {onf_row[0] = k}
                    if (playerData_5v5[k][1] == onField[1]) {onf_row[1] = k}
                    if (playerData_5v5[k][1] == onField[2]) {onf_row[2] = k}
                    if (playerData_5v5[k][1] == onField[3]) {onf_row[3] = k}
                    if (playerData_5v5[k][1] == onField[4]) {onf_row[4] = k}
                }

                if (PP == 0 && SH == 0) { // 5 vs 5 shots

                    temp = Number(playerData_5v5[shooter_row][4]) + xG;
                    playerData_5v5[shooter_row][4] = temp.toFixed(2);
                    playerData_5v5[shooter_row][9]++;
                    if (goal == 1) {
                        playerData_5v5[shooter_row][5]++;
                    }
                    if (passer_row != 0) {

                        temp = Number(playerData_5v5[passer_row][7]) + xG;
                        playerData_5v5[passer_row][7] = temp.toFixed(2);
                        playerData_5v5[passer_row][10]++;
                        if (goal == 1) {
                            playerData_5v5[passer_row][8]++;
                        }
                    }
                    for (l=0; l<onf_row.length; l++) {
                        temp = Number(playerData_5v5[onf_row[l]][13]) + xG;
                        playerData_5v5[onf_row[l]][13] = temp.toFixed(2);
                        playerData_5v5[onf_row[l]][19]++;
                        if (goal == 1) {
                            playerData_5v5[onf_row[l]][16]++;
                        }
                    }
                }
            }

            else if ((shotData[j][4] != gd.name_t1) && (shotData[j][5] != "Possession +") && (shotData[j][5] != "Possession -")) { // Opponent team shot

                xG = Number(shotData[j][7]);
                onField = [shotData[j][11],shotData[j][12],shotData[j][13],shotData[j][14],shotData[j][15]];

                if (shotData[j][25] == 1) {PP = 1}
                else {PP = 0}
                if (shotData[j][26] == 1) {SH = 1}
                else {SH = 0}

                goal = 0;
                if (shotData[j][5] == "Goal") {goal = 1}

                // If player is on field
                onf_row = [0,0,0,0,0];

                for (let k=1; k<playerData_5v5.length; k++) {
                    if (playerData_5v5[k][1] == onField[0]) {onf_row[0] = k}
                    if (playerData_5v5[k][1] == onField[1]) {onf_row[1] = k}
                    if (playerData_5v5[k][1] == onField[2]) {onf_row[2] = k}
                    if (playerData_5v5[k][1] == onField[3]) {onf_row[3] = k}
                    if (playerData_5v5[k][1] == onField[4]) {onf_row[4] = k}
                }

                if (PP == 0 && SH == 0) { // 5 vs 5 shots

                    for (l=0; l<onf_row.length; l++) {
                        temp = Number(playerData_5v5[onf_row[l]][14]) + xG;
                        playerData_5v5[onf_row[l]][14] = temp.toFixed(2);
                        playerData_5v5[onf_row[l]][20]++;
                        if (goal == 1) {
                            playerData_5v5[onf_row[l]][17]++;
                        }
                    }
                }
            }
            else if ((shotData[j][5] == "Possession +") || (shotData[j][5] == "Possession -")) {

                player = shotData[j][29];
                if (shotData[j][25] == 1) {PP = 1}
                else {PP = 0}
                if (shotData[j][26] == 1) {SH = 1}
                else {SH = 0}

                if (PP == 0 && SH == 0) { // 5 vs 5

                    player_row = 0;
                    for (let k=1; k<playerData_5v5.length; k++) {
                        if (playerData_5v5[k][1] == player) {
                            player_row = k;
                        }
                    }
                    if (shotData[j][5] == "Possession +") {
                        playerData_5v5[player_row][11]++;
                    }
                    if (shotData[j][5] == "Possession -") {
                        playerData_5v5[player_row][12]++;
                    }
                }
            }
        }

        for (l=1;l<playerData_5v5.length;l++) {
            sumofxG = sumofxG + Number(playerData_5v5[l][4]);
            sumofxAss = sumofxAss + Number(playerData_5v5[l][7]);
        }
        for (l=1;l<playerData_5v5.length;l++) {
            xG_p = Number(playerData_5v5[l][4]) / sumofxG;
            xG_p = xG_p.toFixed(2);
            xAss_p = Number(playerData_5v5[l][7]) / sumofxAss;
            xAss_p = xAss_p.toFixed(2);
            playerData_5v5[l][3] = xG_p;
            playerData_5v5[l][6] = xAss_p;
            playerData_5v5[l][18] = playerData_5v5[l][16] - playerData_5v5[l][17];
            xGp = Number(playerData_5v5[l][13]) / (Number(playerData_5v5[l][13]) + Number(playerData_5v5[l][14]))
            xGp = xGp.toFixed(2);
            playerData_5v5[l][15] = xGp;
        }
        console.log("drawCharts - function")
        drawCharts();
    }, 500 * selectedValues.length);
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

    google.visualization.events.addListener(gchart, 'sort',
    function(event) {
        gdata.sort([{column: event.column, desc: event.ascending}]);
        gchart.draw(gdata, options);
    });
    
    // 5 vs 5 Player data chart

    var pldata = new google.visualization.DataTable();
    pldata.addColumn('string', 'Player Name');
    pldata.addColumn('number', 'Games');
    pldata.addColumn('number', 'ixG%');
    pldata.addColumn('number', 'ixG');
    pldata.addColumn('number', 'iGoals');
    pldata.addColumn('number', 'xAss%');
    pldata.addColumn('number', 'ixAss');
    pldata.addColumn('number', 'iAss');
    pldata.addColumn('number', 'iShots');
    pldata.addColumn('number', 'iPasses');
    pldata.addColumn('number', 'Pos+');
    pldata.addColumn('number', 'Pos-');
    pldata.addColumn('number', 'xGF');
    pldata.addColumn('number', 'xGA');
    pldata.addColumn('number', 'xG%');
    pldata.addColumn('number', 'GF');
    pldata.addColumn('number', 'GA');
    pldata.addColumn('number', '+-');
    pldata.addColumn('number', 'SF');
    pldata.addColumn('number', 'SA');

    for (i = 1; i < playerData_5v5.length; i++) {
        pldata.addRow([playerData_5v5[i][1], Number(playerData_5v5[i][2]), Number(playerData_5v5[i][3]), Number(playerData_5v5[i][4]), Number(playerData_5v5[i][5]), Number(playerData_5v5[i][6]), Number(playerData_5v5[i][7]), Number(playerData_5v5[i][8]), Number(playerData_5v5[i][9]), Number(playerData_5v5[i][10]), Number(playerData_5v5[i][11]), Number(playerData_5v5[i][12]), Number(playerData_5v5[i][13]), Number(playerData_5v5[i][14]), Number(playerData_5v5[i][15]), Number(playerData_5v5[i][16]), Number(playerData_5v5[i][17]), Number(playerData_5v5[i][18]), Number(playerData_5v5[i][19]), Number(playerData_5v5[i][20])]);
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

    // Goals above xG chart

    max = Math.max(Number(playerData_5v5[1][4]), Number(playerData_5v5[1][5]));
    var GAxG_data = google.visualization.arrayToDataTable([
      ['ixG', 'iGoals', {role: 'annotation'}, {role: 'tooltip'}],
      [Number(playerData_5v5[1][4]), Number(playerData_5v5[1][5]), playerData_5v5[1][1], playerData_5v5[1][1] + " ixG: " + playerData_5v5[1][4] + " iGoals: " + playerData_5v5[1][5]]]);

    for (i = 2; i < playerData_5v5.length; i++) {
        GAxG_data.addRow([Number(playerData_5v5[i][4]), Number(playerData_5v5[i][5]), playerData_5v5[i][1], playerData_5v5[i][1] + " ixG: " + playerData_5v5[i][4] + " iGoals: " + playerData_5v5[i][5]]);
        if (max < Math.max(Number(playerData_5v5[i][4]), Number(playerData_5v5[i][5]))) {
            max = Math.max(Number(playerData_5v5[i][4]), Number(playerData_5v5[i][5]));
        }
    }

    max = Math.round(max) + 1;
    console.log("Max: " + max)

    var options = {
        title: 'Goals above xG per player',
        hAxis: {title: 'ixG', minValue: 0, maxValue: max },
        vAxis: {title: 'iGoals', minValue: 0, maxValue: max },
        legend: 'none',
    };

    var GAxG_chart = new google.visualization.ScatterChart(document.getElementById('GAxG_plot'));
    GAxG_chart.draw(GAxG_data, options);

    // Assists above xAss chart

    max = Math.max(Number(playerData_5v5[1][7]), Number(playerData_5v5[1][8]));
    var GAxAss_data = new google.visualization.arrayToDataTable([
      ['ixAss', 'iAssists', {role: 'annotation'}, {role: 'tooltip'}],
      [Number(playerData_5v5[1][7]), Number(playerData_5v5[1][8]), playerData_5v5[1][1], playerData_5v5[1][1] + " ixAss: " + playerData_5v5[1][7] + " iAssists: " + playerData_5v5[1][8]]]);

    for (i = 2; i < playerData_5v5.length; i++) {
        GAxAss_data.addRow([Number(playerData_5v5[i][7]), Number(playerData_5v5[i][8]), playerData_5v5[i][1], playerData_5v5[i][1] + " ixAss: " + playerData_5v5[i][7] + " iAssists: " + playerData_5v5[i][8]]);
        if (max < Math.max(Number(playerData_5v5[i][7]), Number(playerData_5v5[i][8]))) {
            max = Math.max(Number(playerData_5v5[i][7]), Number(playerData_5v5[i][8]));
        }
    }

    max = Math.round(max) + 1;
    console.log("Max: " + max)

    var options = {
          title: 'Assists above xAss per player',
          hAxis: {title: 'ixAss', minValue: 0, maxValue: max },
          vAxis: {title: 'iAssists', minValue: 0, maxValue: max },
          legend: 'none'
    };

    var GAxAss_chart = new google.visualization.ScatterChart(document.getElementById('GAxAss_plot'));
    GAxAss_chart.draw(GAxAss_data, options);
    
    // Points above xPoints chart

    max = Math.max((Number(playerData_5v5[1][4]) + Number(playerData_5v5[1][7])), (Number(playerData_5v5[1][5]) + Number(playerData_5v5[1][8])));
    ixP = Number(playerData_5v5[1][4]) + Number(playerData_5v5[1][7]);
    iP = Number(playerData_5v5[1][5]) + Number(playerData_5v5[1][8]);
    var GAxPoints_data = google.visualization.arrayToDataTable([
      ['ixPoints', 'iPoints', {role: 'annotation'}, {role: 'tooltip'}],
      [ixP, iP, playerData_5v5[1][1], playerData_5v5[1][1] + " ixPoints: " + ixP + " iPoints: " + iP]]);

    for (i = 2; i < playerData_5v5.length; i++) {
        ixP = Number(playerData_5v5[i][4]) + Number(playerData_5v5[i][7]);
        iP = Number(playerData_5v5[i][5]) + Number(playerData_5v5[i][8]);
        GAxPoints_data.addRow([ixP, iP, playerData_5v5[i][1], playerData_5v5[i][1] + " ixPoints: " + ixP + " iPoints: " + iP]);
        if (max < Math.max(ixP, iP) {
            max = Math.max(ixP, iP);
        }
    }

    max = Math.round(max) + 1;
    console.log("Max: " + max)

    var options = {
          title: 'Points above xPoints per player',
          hAxis: {title: 'ixPoints', minValue: 0, maxValue: max },
          vAxis: {title: 'iPoints', minValue: 0, maxValue: max },
          legend: 'none'
    };

    var GAxPoints_chart = new google.visualization.ScatterChart(document.getElementById('GAxPoints_plot'));
    GAxPoints_chart.draw(GAxPoints_data, options);

    // xG% chart

    max = Math.max(Number(playerData_5v5[1][14]), Number(playerData_5v5[1][13]));
    var xG_data = google.visualization.arrayToDataTable([
      ['xGA', 'xGF', {role: 'annotation'}, {role: 'tooltip'}],
      [Number(playerData_5v5[1][14]), Number(playerData_5v5[1][13]), playerData_5v5[1][1], playerData_5v5[1][1] + " xGA: " + playerData_5v5[1][14] + " xGF: " + playerData_5v5[1][13]]]);

    for (i = 2; i < playerData_5v5.length; i++) {
        xG_data.addRow([Number(playerData_5v5[i][14]), Number(playerData_5v5[i][13]), playerData_5v5[i][1], playerData_5v5[i][1] + " xGA: " + playerData_5v5[i][14] + " xGF: " + playerData_5v5[i][13]]);
        if (max < Math.max(Number(playerData_5v5[i][14]), Number(playerData_5v5[i][13]))) {
            max = Math.max(Number(playerData_5v5[i][14]), Number(playerData_5v5[i][13]));
        }
    }

    max = Math.round(max) + 1;
    console.log("Max: " + max)

    var options = {
          title: 'xGF vs xGA per player',
          hAxis: {title: 'xGA', minValue: 0, maxValue: max },
          vAxis: {title: 'xGF', minValue: 0, maxValue: max },
          legend: 'none'
    };

    var xG_chart = new google.visualization.ScatterChart(document.getElementById('xG%_plot'));
    xG_chart.draw(xG_data, options);

    /*// Player data chart / Game

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
    });*/
}

function calcxy(radius, angle) {

    angle = 360 - angle;

    x = radius * Math.cos(Math.PI * 2 * angle / 360);
    y = radius * Math.sin(Math.PI * 2 * angle / 360);

    return [x,y]
}

function drawMap(pl) {

    if (pl == 1) {

        name = s_p1.options[s_p1.selectedIndex].text;
        for (i=1;i<shotData.length;i++) {

            if (shotData[i][9] == name) {
                radius = Number(shotData[i][27]);
                angle = Number(shotData[i][28]);

                [x,y] = calcxy(radius,angle);
                x = (fWidth /2) + (x * fWidth / 20);
                y = (fLength / 10) - (y * fLength / 40);

                if (shotData[i][5] == "Missed") {
                        
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx1.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx1.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx1.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx1.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx1.fillStyle = "blue";
                    }
                    ctx1.fillText("M", x, y);
                }
                if (shotData[i][5] == "Saved") {

                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx1.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx1.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx1.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx1.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx1.fillStyle = "blue";
                    }
                    ctx1.fillText("S", x, y);
                }
                if (shotData[i][5] == "Blocked") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx1.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx1.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx1.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx1.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx1.fillStyle = "blue";
                    }
                    ctx1.fillText("B", x, y);
                }
                if (shotData[i][5] == "Goal") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx1.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx1.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx1.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx1.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx1.fillStyle = "blue";
                    }
                    ctx1.fillText("G", x, y);
                }
            }
        }
    }
    else if (pl == 2) {

        name = s_p2.options[s_p2.selectedIndex].text;

        for (i=1;i<shotData.length;i++) {

            if (shotData[i][9] == name) {
                radius = Number(shotData[i][27]);
                angle = Number(shotData[i][28]);

                [x,y] = calcxy(radius,angle);
                x = (fWidth /2) + (x * fWidth / 20);
                y = (fLength / 10) - (y * fLength / 40);

                if (shotData[i][5] == "Missed") {
                        
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx2.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx2.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx2.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx2.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx2.fillStyle = "blue";
                    }
                    ctx2.fillText("M", x, y);
                }
                if (shotData[i][5] == "Saved") {

                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx2.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx2.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx2.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx2.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx2.fillStyle = "blue";
                    }
                    ctx2.fillText("S", x, y);
                }
                if (shotData[i][5] == "Blocked") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx2.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx2.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx2.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx2.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx2.fillStyle = "blue";
                    }
                    ctx2.fillText("B", x, y);
                }
                if (shotData[i][5] == "Goal") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx2.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx2.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx2.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx2.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx2.fillStyle = "blue";
                    }
                    ctx2.fillText("G", x, y);
                }
            }
        }
    }
    else if (pl == 3) {

        name = s_p3.options[s_p3.selectedIndex].text;
        
        for (i=1;i<shotData.length;i++) {

            if (shotData[i][9] == name) {
                radius = Number(shotData[i][27]);
                angle = Number(shotData[i][28]);

                [x,y] = calcxy(radius,angle);
                x = (fWidth /2) + (x * fWidth / 20);
                y = (fLength / 10) - (y * fLength / 40);

                if (shotData[i][5] == "Missed") {
                        
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx3.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx3.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx3.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx3.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx3.fillStyle = "blue";
                    }
                    ctx3.fillText("M", x, y);
                }
                if (shotData[i][5] == "Saved") {

                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx3.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx3.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx3.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx3.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx3.fillStyle = "blue";
                    }
                    ctx3.fillText("S", x, y);
                }
                if (shotData[i][5] == "Blocked") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx3.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx3.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx3.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx3.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx3.fillStyle = "blue";
                    }
                    ctx3.fillText("B", x, y);
                }
                if (shotData[i][5] == "Goal") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx3.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx3.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx3.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx3.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx3.fillStyle = "blue";
                    }
                    ctx3.fillText("G", x, y);
                }
            }
        }
    }
    else if (pl == 4) {

        name = s_p4.options[s_p4.selectedIndex].text;
        
        for (i=1;i<shotData.length;i++) {

            if (shotData[i][9] == name) {
                radius = Number(shotData[i][27]);
                angle = Number(shotData[i][28]);

                [x,y] = calcxy(radius,angle);
                x = (fWidth /2) + (x * fWidth / 20);
                y = (fLength / 10) - (y * fLength / 40);

                if (shotData[i][5] == "Missed") {
                        
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx4.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx4.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx4.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx4.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx4.fillStyle = "blue";
                    }
                    ctx4.fillText("M", x, y);
                }
                if (shotData[i][5] == "Saved") {

                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx4.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx4.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx4.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx4.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx4.fillStyle = "blue";
                    }
                    ctx4.fillText("S", x, y);
                }
                if (shotData[i][5] == "Blocked") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx4.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx4.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx4.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx4.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx4.fillStyle = "blue";
                    }
                    ctx4.fillText("B", x, y);
                }
                if (shotData[i][5] == "Goal") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx4.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx4.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx4.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx4.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx4.fillStyle = "blue";
                    }
                    ctx4.fillText("G", x, y);
                }
            }
        }
    }
    else if (pl == 5) {

        name = s_p5.options[s_p5.selectedIndex].text;
        
        for (i=1;i<shotData.length;i++) {

            if (shotData[i][9] == name) {
                radius = Number(shotData[i][27]);
                angle = Number(shotData[i][28]);

                [x,y] = calcxy(radius,angle);
                x = (fWidth /2) + (x * fWidth / 20);
                y = (fLength / 10) - (y * fLength / 40);

                if (shotData[i][5] == "Missed") {
                        
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx5.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx5.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx5.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx5.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx5.fillStyle = "blue";
                    }
                    ctx5.fillText("M", x, y);
                }
                if (shotData[i][5] == "Saved") {

                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx5.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx5.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx5.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx5.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx5.fillStyle = "blue";
                    }
                    ctx5.fillText("S", x, y);
                }
                if (shotData[i][5] == "Blocked") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx5.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx5.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx5.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx5.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx5.fillStyle = "blue";
                    }
                    ctx5.fillText("B", x, y);
                }
                if (shotData[i][5] == "Goal") {
                    
                    if (shotData[i][6] == "Turnover | One-timer") {
                        ctx5.fillStyle = "darkgreen";
                    }
                    else if (shotData[i][6] == "Turnover | Direct") {
                        ctx5.fillStyle = "lawngreen";
                    }
                    else if (shotData[i][6] == "One-timer") {
                        ctx5.fillStyle = "black";
                    }
                    else if (shotData[i][6] == "Rebound") {
                        ctx5.fillStyle = "blue";
                    }
                    else if (shotData[i][6] == "Direct") {
                        ctx5.fillStyle = "blue";
                    }
                    ctx5.fillText("G", x, y);
                }
            }
        }
    }

}



