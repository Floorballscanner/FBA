
    var s_game = document.getElementById("select-game");
    var playerData = [['ID','Name','Games','ixG','ixAss','ixG_PP','ixAss_PP','Goals','Assists','Shots','Shot Assists','Possession+','Possession-']];
    var playerData_60 = [['ID','Name','Games','ixG/Game','ixAss/Game','ixG_PP/Game','ixGAss_PP/Game','xPoints/Game','Goals/Game','Assists/Game',
                        'Points/Game','Shots/Game','Passes/Game','Possession+/Game','Possession-/Game']];
    var gameData = [['Date','Team1','Team2','xG_Team1','xG_Team2','xGOT_Team1','xGOT_Team2','Goals_Team1','Goals_Team2','Shots_Team1','Shots_Team2']];
    var shotData = [];
    var idleTime = 0;
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

function changeGame() {

    playerData = [['ID','Name','Games','ixG','ixAss','ixG_PP','ixAss_PP','Goals','Assists','Shots','Shot Assists','Possession+','Possession-']];
    gameData = [['Date','Team1','Team2','xG_Team1','xG_Team2','xGOT_Team1','xGOT_Team2','Goals_Team1','Goals_Team2','Shots_Team1','Shots_Team2']];
    var selectedValues = [];

    // Iterate through each option in the select element
    for (i = 0; i < s_game.options.length; i++) {
        var option = s_game.options[i];

        // Check if the option is selected
        if (option.selected) {
            selectedValues.push(option.value);
        }
    }

    last = selectedValues[selectedValues.length-1];
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
                    shotData = shotData.concat(gd.printShotData);

                    for (j=1;j<data.length;j++) { // Go through all game player stats

                        if (data[j][0] != "") {
                            found = 0;

                            for (k=1;k<playerData.length;k++) { // Sum game datas

                                if (data[j][0] == playerData[k][0]) { // Player found
                                    found = 1;
                                    playerData[k][2]++;
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
                            }
                        }
                    }
                    // Game stats to game data array
                    gameData.push([date, gd.name_t1, gd.name_t2, Number(gd.txG_1), Number(gd.txG_2), Number(gd.txGOT_1),
                    Number(gd.txGOT_2), Number(gd.tgt_1), Number(gd.tgt_2), Number(gd.sf_g[7]), Number(gd.sfT2_g[7])]);

                }

                if (game_id == last) {
                    drawCharts();
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
                }
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

    google.visualization.events.addListener(gchart, 'sort',
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

function calcxy(radius, angle) {

    angle = angle + 90;

    x = radius * Math.sin(Math.PI * 2 * angle / 360);
    y = radius * Math.cos(Math.PI * 2 * angle / 360);

    return [x,y]
}

function drawMap(pl) {

    fLength = 332;
    fWidth = 200;

    if (pl == 1) {

        name = s_p1.options[s_p1.selectedIndex].text;
        ctx1.drawImage(myImg,0,0,fWidth,fLength);
        for (i=1;i<shotData.length;i++) {

            if (shotData[i][9] == name) {
                radius = Number(shotData[i][27]);
                angle = Number(shotData[i][28]);

                [x,y] = calcxy(radius,angle);
                x = x + (fWidth/2);
                y = y + (fLength/10);

                ctx1.fillStyle = "blue";
                ctx1.fillText("o", x, y);

                console.log('Radius: ' + radius);
                console.log('Angle: ' + angle);
                console.log('x: ' + x);
                console.log('y: ' + y);

            }
        }
    }
    else if (pl == 2) {

        name = s_p2.options[s_p2.selectedIndex].text;
        ctx2.drawImage(myImg,0,0,fWidth,fLength);
        ctx2.fillStyle = "blue";
        ctx2.fillText("o", x, y);
    }
    else if (pl == 3) {

        name = s_p3.options[s_p3.selectedIndex].text;
        ctx3.drawImage(myImg,0,0,fWidth,fLength);
    }




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


