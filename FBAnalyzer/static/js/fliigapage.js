// This file contains the script for updating the live game stream page with live game data

const csrftoken = getCookie('csrftoken');
var s_game = document.getElementById("select-game");
var imgcat = document.getElementById("imgcat");
let data = 0;
var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = "";
var events = "";
var lineups = [];
var lineup_t1 = [];
var lineup_t2 = [];
var lineup_t1l1 = [];
var lineup_t2l1 = [];
var lineup_t1l2 = [];
var lineup_t2l2 = [];
var lineup_t1l3 = [];
var lineup_t2l3 = [];
var lineup_t1l4 = [];
var lineup_t2l4 = [];
var lineup_t1g = [];
var lineup_t2g = [];
var shots = [];
var goaliedata = [];
var t1color = "#990000";
var t2color = "#002072";
var t1color_rgba = 'rgba(153, 0, 0';
var t2color_rgba = 'rgba(0, 32, 114';

var maxY = 3400; // Arvioitu, päätyviiva 0 - keskiviiva 1700
var maxX = 2000; // [-1000, 1000], maalivahdin näkökulmasta katsottuna oikealle negatiivinen, 0 keskilinjalla
var g_date = document.getElementById("stdate");
var imgcat = document.getElementById("imgcat");
var period = document.getElementById("periodNr");
var clock = document.getElementById("label");
var t1g = document.getElementById('sttotg_1');
var t2g = document.getElementById('sttotg_2');
var t1xG = document.getElementById('sttotxG_1');
var t2xG = document.getElementById('sttotxG_2');
var t1xGOT = document.getElementById('sttotxGOT_1');
var t2xGOT = document.getElementById('sttotxGOT_2');
var imgt1 = document.getElementById('imgt1');
var imgt2 = document.getElementById('imgt2');
var t1s = document.getElementById('sttotshots_1');
var t2s = document.getElementById('sttotshots_2');
var t1sOT = document.getElementById('sttotsOT_1');
var t2sOT = document.getElementById('sttotsOT_2');
var t1name = "";
var t2name = "";
var myImg = new Image();
myImg.src = "/static/field-new.png";
var cnvs = document.getElementById("liveShotMap");
var ctx = cnvs.getContext("2d");
var fLength = 332;
var fWidth = 200;
var xGTeamArray = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];


// Creates the HTML - page when the window is loaded

window.onload = function() {

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=402&group_id=2")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const matches_json = data.matches;
            matches_json.sort(GetSortOrder("date"));

            // List of keys you want to select from matches_json
            const selectedKeys = ['match_id','match_number','category_name','date','time','team_A_id','team_A_name','team_B_id','team_B_name','status'];

            // Create a new array to store the modified JSON objects
            const modifiedMatches = [];

            // Iterate through matches_json and create new objects with selected keys
            matches_json.forEach(match => {
              const modifiedMatch = {};
              selectedKeys.forEach(key => {
                if (match.hasOwnProperty(key)) {
                  modifiedMatch[key] = match[key];
                }
              });
              modifiedMatches.push(modifiedMatch);
            });

            matches = modifiedMatches;

            for (let j=0; j<matches.length; j++) {
                if (matches[j].status == 'Played') {
                    opt = new Option(matches[j].date + " | "  + matches[j].team_A_name + " - " + matches[j].team_B_name, matches[j].match_id);
                    s_game.appendChild(opt);
                }
            }
            imgcat.src = matches_json[0].category_logo;
            console.log('Success:', data);

        })
        .catch((error) => {
          console.error('Error:', error);
    });

    // t = setTimeout(function(){ updatePage() }, 60000); // Update page every minute
}

function changeGame() {

    match_id = s_game.value;
    updateData();

}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Sort JSON array by date, sorting function

function GetSortOrder(prop) {
    return function(a, b) {
        if (a[prop] < b[prop]) {
            return 1;
        } else if (a[prop] > b[prop]) {
            return -1;
        }
        return 0;
    }
}

function drawCharts() {

    document.getElementById("stt1name").innerHTML = t1name;
    document.getElementById("stt2name").innerHTML = t2name;

    var pldatat1l1 = new google.visualization.DataTable();
    pldatat1l1.addColumn('string', 'Player');
    pldatat1l1.addColumn('string', 'Pos.');
    pldatat1l1.addColumn('number', 'G');
    pldatat1l1.addColumn('number', 'A');
    pldatat1l1.addColumn('number', 'P');
    pldatat1l1.addColumn('number', 'S');
    pldatat1l1.addColumn('number', 'xG');
    pldatat1l1.addColumn('number', 'xGOT');
    pldatat1l1.addColumn('number', '+');
    pldatat1l1.addColumn('number', '-');

    var pldatat1l2 = new google.visualization.DataTable();
    pldatat1l2.addColumn('string', 'Player');
    pldatat1l2.addColumn('string', 'Pos.');
    pldatat1l2.addColumn('number', 'G');
    pldatat1l2.addColumn('number', 'A');
    pldatat1l2.addColumn('number', 'P');
    pldatat1l2.addColumn('number', 'S');
    pldatat1l2.addColumn('number', 'xG');
    pldatat1l2.addColumn('number', 'xGOT');
    pldatat1l2.addColumn('number', '+');
    pldatat1l2.addColumn('number', '-');

    var pldatat1l3 = new google.visualization.DataTable();
    pldatat1l3.addColumn('string', 'Player');
    pldatat1l3.addColumn('string', 'Pos.');
    pldatat1l3.addColumn('number', 'G');
    pldatat1l3.addColumn('number', 'A');
    pldatat1l3.addColumn('number', 'P');
    pldatat1l3.addColumn('number', 'S');
    pldatat1l3.addColumn('number', 'xG');
    pldatat1l3.addColumn('number', 'xGOT');
    pldatat1l3.addColumn('number', '+');
    pldatat1l3.addColumn('number', '-');

    var pldatat1l4 = new google.visualization.DataTable();
    pldatat1l4.addColumn('string', 'Player');
    pldatat1l4.addColumn('string', 'Pos.');
    pldatat1l4.addColumn('number', 'G');
    pldatat1l4.addColumn('number', 'A');
    pldatat1l4.addColumn('number', 'P');
    pldatat1l4.addColumn('number', 'S');
    pldatat1l4.addColumn('number', 'xG');
    pldatat1l4.addColumn('number', 'xGOT');
    pldatat1l4.addColumn('number', '+');
    pldatat1l4.addColumn('number', '-');

    var pldatat2l1 = new google.visualization.DataTable();
    pldatat2l1.addColumn('string', 'Player');
    pldatat2l1.addColumn('string', 'Pos.');
    pldatat2l1.addColumn('number', 'G');
    pldatat2l1.addColumn('number', 'A');
    pldatat2l1.addColumn('number', 'P');
    pldatat2l1.addColumn('number', 'S');
    pldatat2l1.addColumn('number', 'xG');
    pldatat2l1.addColumn('number', 'xGOT');
    pldatat2l1.addColumn('number', '+');
    pldatat2l1.addColumn('number', '-');

    var pldatat2l2 = new google.visualization.DataTable();
    pldatat2l2.addColumn('string', 'Player');
    pldatat2l2.addColumn('string', 'Pos.');
    pldatat2l2.addColumn('number', 'G');
    pldatat2l2.addColumn('number', 'A');
    pldatat2l2.addColumn('number', 'P');
    pldatat2l2.addColumn('number', 'S');
    pldatat2l2.addColumn('number', 'xG');
    pldatat2l2.addColumn('number', 'xGOT');
    pldatat2l2.addColumn('number', '+');
    pldatat2l2.addColumn('number', '-');

    var pldatat2l3 = new google.visualization.DataTable();
    pldatat2l3.addColumn('string', 'Player');
    pldatat2l3.addColumn('string', 'Pos.');
    pldatat2l3.addColumn('number', 'G');
    pldatat2l3.addColumn('number', 'A');
    pldatat2l3.addColumn('number', 'P');
    pldatat2l3.addColumn('number', 'S');
    pldatat2l3.addColumn('number', 'xG');
    pldatat2l3.addColumn('number', 'xGOT');
    pldatat2l3.addColumn('number', '+');
    pldatat2l3.addColumn('number', '-');

    var pldatat2l4 = new google.visualization.DataTable();
    pldatat2l4.addColumn('string', 'Player');
    pldatat2l4.addColumn('string', 'Pos.');
    pldatat2l4.addColumn('number', 'G');
    pldatat2l4.addColumn('number', 'A');
    pldatat2l4.addColumn('number', 'P');
    pldatat2l4.addColumn('number', 'S');
    pldatat2l4.addColumn('number', 'xG');
    pldatat2l4.addColumn('number', 'xGOT');
    pldatat2l4.addColumn('number', '+');
    pldatat2l4.addColumn('number', '-');

    lineup_t1l1.forEach(lineup => {
        pldatat1l1.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.xG, lineup.xGOT, lineup.plus, lineup.minus]);
    });
    lineup_t1l2.forEach(lineup => {
        pldatat1l2.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.xG, lineup.xGOT, lineup.plus, lineup.minus]);
    });
    lineup_t1l3.forEach(lineup => {
        pldatat1l3.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.xG, lineup.xGOT, lineup.plus, lineup.minus]);
    });
    lineup_t1l4.forEach(lineup => {
        pldatat1l4.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.xG, lineup.xGOT, lineup.plus, lineup.minus]);
    });

    lineup_t2l1.forEach(lineup => {
        pldatat2l1.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.xG, lineup.xGOT, lineup.plus, lineup.minus]);
    });
    lineup_t2l2.forEach(lineup => {
        pldatat2l2.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.xG, lineup.xGOT, lineup.plus, lineup.minus]);
    });
    lineup_t2l3.forEach(lineup => {
        pldatat2l3.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.xG, lineup.xGOT, lineup.plus, lineup.minus]);
    });
    lineup_t2l4.forEach(lineup => {
        pldatat2l4.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.xG, lineup.xGOT, lineup.plus, lineup.minus]);
    });

    var pldatat1g = new google.visualization.DataTable();
    pldatat1g.addColumn('string', 'Player');
    pldatat1g.addColumn('string', 'Pos.');
    pldatat1g.addColumn('number', 'GA');
    pldatat1g.addColumn('number', 'SA');
    pldatat1g.addColumn('number', 'xGOTA');
    pldatat1g.addColumn('number', 'GSAx');

    var pldatat2g = new google.visualization.DataTable();
    pldatat2g.addColumn('string', 'Player');
    pldatat2g.addColumn('string', 'Pos.');
    pldatat2g.addColumn('number', 'GA');
    pldatat2g.addColumn('number', 'SA');
    pldatat2g.addColumn('number', 'xGOTA');
    pldatat2g.addColumn('number', 'GSAx');

    lineup_t1g.forEach(lineup => {
        pldatat1g.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.saves,
        lineup.xGOT,lineup.xGOT - lineup.goals]);
    });

    lineup_t2g.forEach(lineup => {
        pldatat2g.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.saves,
        lineup.xGOT,lineup.xGOT - lineup.goals]);
    });

    var options = {
        title: 'Player stats, ' + t1name,
        bar: {groupWidth: "95%"},
        legend: { position: 'bottom'},
        colors: [t1color, t2color],
        hAxis: { textPosition: 'none' }
        };

    // Create and draw the visualization.
    var chartt1l1 = new google.visualization.Table(document.getElementById('stT1L1_playerchart'));
    chartt1l1.draw(pldatat1l1, options);
    var chartt1l2 = new google.visualization.Table(document.getElementById('stT1L2_playerchart'));
    chartt1l2.draw(pldatat1l2, options);
    var chartt1l3 = new google.visualization.Table(document.getElementById('stT1L3_playerchart'));
    chartt1l3.draw(pldatat1l3, options);
    var chartt1l4 = new google.visualization.Table(document.getElementById('stT1L4_playerchart'));
    chartt1l4.draw(pldatat1l4, options);
    var chartt1g = new google.visualization.Table(document.getElementById('stT1G_playerchart'));
    chartt1g.draw(pldatat1g, options);
    var chartt2l1 = new google.visualization.Table(document.getElementById('stT2L1_playerchart'));
    chartt2l1.draw(pldatat2l1, options);
    var chartt2l2 = new google.visualization.Table(document.getElementById('stT2L2_playerchart'));
    chartt2l2.draw(pldatat2l2, options);
    var chartt2l3 = new google.visualization.Table(document.getElementById('stT2L3_playerchart'));
    chartt2l3.draw(pldatat2l3, options);
    var chartt2l4 = new google.visualization.Table(document.getElementById('stT2L4_playerchart'));
    chartt2l4.draw(pldatat2l4, options);
    var chartt2g = new google.visualization.Table(document.getElementById('stT2G_playerchart'));
    chartt2g.draw(pldatat2g, options);


    // Team xG Chart
     var xGLiveData = google.visualization.arrayToDataTable(xGTeamArray);

     var options = {
        title: 'xG by Team',
        curveType: 'function',
        legend: { position: 'bottom' },
        seriesType: 'lines',
        series: {
            0: {color: t1color},
            1: {color: t2color},
            2: {type: 'bars', color: t1color},
            3: {type: 'bars', color: t2color}
        }
    };

    var chartlivexG = new google.visualization.ComboChart(document.getElementById('livexGmap'));
    chartlivexG.draw(xGLiveData, options);

    // xG by Line

    xG_t1l1 = lineup_t1l1.reduce(function (sum, player) {return sum + player.xG;}, 0);
    xG_t1l2 = lineup_t1l2.reduce(function (sum, player) {return sum + player.xG;}, 0);
    xG_t1l3 = lineup_t1l3.reduce(function (sum, player) {return sum + player.xG;}, 0);
    xG_t2l1 = lineup_t2l1.reduce(function (sum, player) {return sum + player.xG;}, 0);
    xG_t2l2 = lineup_t2l2.reduce(function (sum, player) {return sum + player.xG;}, 0);
    xG_t2l3 = lineup_t2l3.reduce(function (sum, player) {return sum + player.xG;}, 0);

    var xGByLineData = google.visualization.arrayToDataTable([
         ['Line', t1name, { role: 'style' }, { role: 'annotation' }, t2name, { role: 'style' }, { role: 'annotation' } ],
         ['Line 1', xG_t1l1, 'color: '+ t1color, xG_t1l1, xG_t2l1, 'color: '+ t2color, xG_t2l1 ],
         ['Line 2', xG_t1l2, 'color: '+ t1color, xG_t1l2, xG_t2l2, 'color: '+ t2color, xG_t2l2 ],
         ['Line 3', xG_t1l3, 'color: '+ t1color, xG_t1l3, xG_t2l3, 'color: '+ t2color, xG_t2l3 ]
      ]);

    var options = {
        title: 'xG by Line',
        bar: {groupWidth: "95%"},
        legend: { position: 'bottom'},
        colors: [t1color, t2color],
        hAxis: { textPosition: 'none' }
        };

    var chartxGByLine = new google.visualization.BarChart(document.getElementById('xGByLine'));
    chartxGByLine.draw(xGByLineData, options);
}

function drawShotMap() {

    ctx.drawImage(myImg,0,0,fWidth,fLength);
    shots.forEach(event => {
        locationString = event.location;
        coordinates = locationString.split(',');
        y = parseFloat(coordinates[1]);
        x = parseFloat(coordinates[0]);
        radius = 1 + 20 * event.xG; // Replace with your desired radius in pixels
        if (event.code == "laukausblokattu" || event.code == "laukausohi") {
            opacity = "0.25"; // Replace with your desired opacity (0 to 1)
        }
        else {
            opacity = "0.75"; // Replace with your desired opacity (0 to 1)
        }
        if (event.team == "A") {
            x = 1000 + x;
            x = fWidth * x / maxX;
            y = y + 300;
            y = fLength * y / (maxY + 350);
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = t1color_rgba + ", " + opacity + ")"; // Team A jersey color
            ctx.fill();
            if (event.code == "laukausmaali") {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
            ctx.closePath();
        }
        else if (event.team == "B") {
            x = 1000 - x;
            x = fWidth * x / maxX;
            y = y + 300;
            y = fLength - (fLength * y / (maxY + 350));
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = t2color_rgba + ", " + opacity + ")"; // Team B jersey color
            ctx.fill();
            if (event.code == "laukausmaali") {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
            ctx.closePath();
        }
    });
}

function calcxGArray() {

    xGTeamArray = [['Time','xG ' + t1name,'xG ' + t2name,'Goal ' + t1name,'Goal ' + t2name]];
    xG_A = 0;
    xG_B = 0;
    shots.forEach(event => {

        if (event.team == "A") {

            xG_A += event.xG;
            if (event.code == "laukausmaali") {
                xGTeamArray.push([event.time,xG_A,xG_B,xG_A,0]);
            }
            else {
                xGTeamArray.push([event.time,xG_A,xG_B,0,0]);
            }


        }
        else if (event.team == "B") {

            xG_B += event.xG;
            if (event.code == "laukausmaali") {
                xGTeamArray.push([event.time,xG_A,xG_B,0,xG_B]);
            }
            else {
                xGTeamArray.push([event.time,xG_A,xG_B,0,0]);
            }
        }
    });
}

function updateData() {

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatch?api_key="+api_key+"&match_id="+match_id)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const match = data.match;
            const events_json = match.events;
            const lineups_json = match.lineups;
            t1name = match.team_A_name;
            t2name = match.team_B_name;
            document.getElementById('game_attn').innerHTML = match.attendance;
            document.getElementById('A_teamname').innerHTML = t1name
            document.getElementById('B_teamname').innerHTML = t2name
            const gametime = document.createElement('h5');
            gametime.setAttribute('id', 'time' + match.match_id);
            gametime.innerText = match.time.toString();
            gametime.style.paddingTop = "5px";
            document.getElementById('stdate').innerHTML = gametime.innerHTML;

            // List of keys you want to select from events_json
            const selectedKeys = ['event_id','code','team_id','player_id','player_name','shirt_number','time','period','code_fi','description','location','placement','team'];

            // List of keys you want to select from lineups_json
            const selectedKeys_lineup = ['team_id','player_id','player_name','shirt_number','position','shots','saves','goals','assists','points','plus','minus'];

            // Create a new array to store the modified JSON objects
            const modifiedEvents = [];
            const modifiedLineups = [];

            // Iterate through events_json and create new objects with selected keys
            events_json.forEach(event => {
              const modifiedEvent = {};
              selectedKeys.forEach(key => {
                if (event.hasOwnProperty(key)) {
                  modifiedEvent[key] = event[key];
                }
              });
              modifiedEvents.push(modifiedEvent);
            });

            // Iterate through lineups_json and create new objects with selected keys
            lineups_json.forEach(lineup => {
              const modifiedLineup = {};
              selectedKeys_lineup.forEach(key => {
                if (lineup.hasOwnProperty(key)) {
                  modifiedLineup[key] = lineup[key];
                }
              });
              modifiedLineups.push(modifiedLineup);
            });

            events = modifiedEvents;
            lineups = modifiedLineups;
            lineups.forEach(event => {
                event.xGOT = 0;
                event.xG = 0;
            });

            // Filter rows where 'code' is one of the specified values
            shots = events.filter(event => ['laukausohi', 'laukausblokattu', 'laukausmaali', 'laukaus'].includes(event.code));
            //goaliedata = events.filter(event => ['torjunta', 'paastetty'].includes(event.code));
            goaliedata = events.filter(event => ['laukaus', 'laukausmaali'].includes(event.code));
            // Initialize 'xGOT' and 'xG' properties to 0
            shots.forEach(event => {
                event.xGOT = 0;
                event.xG = 0;
            });
            goaliedata.forEach(event => {
                event.xGOT = 0;
            });

            for (let i = 0; i < shots.length; i++) {
                const st = shots[i].location.split(',');
                const x = parseFloat(st[0]);
                const y = parseFloat(st[1]);
                xG = 0;
                xGOT = 0;

                if (match.category_id != '384') {
                    [xGOT, xG] = calcxG(x, y);
                }
                else {
                    [xGOT, xG] = calcxGW(x, y);
                }

                if (shots[i].code === 'laukaus' || shots[i].code === 'laukausmaali') {
                    shots[i].xGOT = xGOT;
                } else {
                    shots[i].xGOT = 0;
                }

                shots[i].xG = xG;
            }

            for (let i = 0; i < goaliedata.length; i++) {
                if (goaliedata[i].location != "") {
                    const st = goaliedata[i].location.split(',');
                    const x = parseFloat(st[0]);
                    const y = parseFloat(st[1]);
                    xG = 0;
                    xGOT = 0;

                    if (match.category_id != '384') {
                        [xGOT, xG] = calcxG(x, y);
                    }
                    else {
                        [xGOT, xG] = calcxGW(x, y);
                    }
                    goaliedata[i].xGOT = xGOT;
                }
            }

            // Sum all "xG" values using reduce
            t1xG_temp = Object.values(shots)
                .filter(shot => shot.team === 'A')
                .reduce((sum, shot) => sum + shot.xG, 0);

            t2xG_temp = Object.values(shots)
                .filter(shot => shot.team === 'B')
                .reduce((sum, shot) => sum + shot.xG, 0);

            t1xGOT_temp = Object.values(shots)
                .filter(shot => shot.team === 'A')
                .reduce((sum, shot) => sum + shot.xGOT, 0);

            t2xGOT_temp = Object.values(shots)
                .filter(shot => shot.team === 'B')
                .reduce((sum, shot) => sum + shot.xGOT, 0);

            t1s_temp = Object.values(shots).filter(shot => shot.team === 'A').length;
            t2s_temp = Object.values(shots).filter(shot => shot.team === 'B').length;
            t1sOT_temp = Object.values(shots).filter(shot => shot.team === "A" && (shot.code === "laukaus" || shot.code === "laukausmaali")).length;
            t2sOT_temp = Object.values(shots).filter(shot => shot.team === "B" && (shot.code === "laukaus" || shot.code === "laukausmaali")).length;

            // Calculate xG and xGOT to lineups

            lineups.forEach(lineup => {
                pl = lineup.player_id;

                txg = Object.values(shots)
                .filter(shot => shot.player_id === pl)
                .reduce((sum, shot) => sum + shot.xG, 0);
                lineup.xG = Number(txg.toFixed(2));
                txg = Object.values(shots)
                .filter(shot => shot.player_id === pl)
                .reduce((sum, shot) => sum + shot.xGOT, 0);
                lineup.xGOT = Number(txg.toFixed(2));
                lineup.shots = Object.values(shots)
                .filter(shot => shot.player_id === pl).length;

            });

            lineup_t1 = Object.values(lineups)
                .filter(lineup => lineup.team_id === match.team_A_id);
            lineup_t2 = Object.values(lineups)
                .filter(lineup => lineup.team_id === match.team_B_id);

            lineup_t1l1 = [];
            lineup_t2l1 = [];
            lineup_t1l2 = [];
            lineup_t2l2 = [];
            lineup_t1l3 = [];
            lineup_t2l3 = [];
            lineup_t1l4 = [];
            lineup_t2l4 = [];
            lineup_t1g = [];
            lineup_t2g = [];

            lineup_t1.forEach(lineup => {
                if (lineup.position == "OL/1" || lineup.position == "VL/1" || lineup.position == "KH/1" || lineup.position == "VP/1" || lineup.position == "OP/1") {
                    lineup_t1l1.push(lineup);
                    }
                else if (lineup.position == "OL/2" || lineup.position == "VL/2" || lineup.position == "KH/2" || lineup.position == "VP/2" || lineup.position == "OP/2") {
                    lineup_t1l2.push(lineup);
                    }
                else if (lineup.position == "OL/3" || lineup.position == "VL/3" || lineup.position == "KH/3" || lineup.position == "VP/3" || lineup.position == "OP/3") {
                    lineup_t1l3.push(lineup);
                    }
                else if (lineup.position == "OL/4" || lineup.position == "VL/4" || lineup.position == "KH/4" || lineup.position == "VP/4" || lineup.position == "OP/4") {
                    lineup_t1l4.push(lineup);
                    }
                else if (lineup.position == "MV/1" || lineup.position == "MV/2") {
                    lineup_t1g.push(lineup);
                    }
            });

            lineup_t2.forEach(lineup => {
                if (lineup.position == "OL/1" || lineup.position == "VL/1" || lineup.position == "KH/1" || lineup.position == "VP/1" || lineup.position == "OP/1") {
                    lineup_t2l1.push(lineup);
                    }
                else if (lineup.position == "OL/2" || lineup.position == "VL/2" || lineup.position == "KH/2" || lineup.position == "VP/2" || lineup.position == "OP/2") {
                    lineup_t2l2.push(lineup);
                    }
                else if (lineup.position == "OL/3" || lineup.position == "VL/3" || lineup.position == "KH/3" || lineup.position == "VP/3" || lineup.position == "OP/3") {
                    lineup_t2l3.push(lineup);
                    }
                else if (lineup.position == "OL/4" || lineup.position == "VL/4" || lineup.position == "KH/4" || lineup.position == "VP/4" || lineup.position == "OP/4") {
                    lineup_t2l4.push(lineup);
                    }
                else if (lineup.position == "MV/1" || lineup.position == "MV/2") {
                    lineup_t2g.push(lineup);
                    }
            });

            lineup_t1g.forEach(lineup => {
                ga = 0;
                xga = 0;
                gaxg = 0;
                goaliedata.forEach(shot => {
                    if (shot.team == "B") {
                        if (shot.code == "laukaus") {
                            xga += shot.xGOT;
                        }
                        if (shot.code == "laukausmaali") {
                            xga += shot.xGOT;
                            ga += 1;
                        }
                    }
                });
                lineup.xGOT = xga;
                lineup.goals = ga;
            });

            lineup_t2g.forEach(lineup => {
                ga = 0;
                xga = 0;
                gaxg = 0;
                goaliedata.forEach(shot => {
                    if (shot.team == "B") {
                        if (shot.code == "laukaus") {
                            xga += shot.xGOT;
                        }
                        if (shot.code == "laukausmaali") {
                            xga += shot.xGOT;
                            ga += 1;
                        }
                    }
                });
                lineup.xGOT = xga;
                lineup.goals = ga;
            });

            // Set game data to page
            imgt1.src = match.club_A_crest;
            imgt2.src = match.club_B_crest;
            t1g.innerHTML = match.fs_A;
            t2g.innerHTML = match.fs_B;
            t1xG.innerHTML = t1xG_temp.toFixed(2);
            t2xG.innerHTML = t2xG_temp.toFixed(2);
            t1xGOT.innerHTML = t1xGOT_temp.toFixed(2);
            t2xGOT.innerHTML = t2xGOT_temp.toFixed(2);
            t1s.innerHTML = t1s_temp;
            t2s.innerHTML = t2s_temp;
            t1sOT.innerHTML = t1sOT_temp;
            t2sOT.innerHTML = t2sOT_temp;
            g_date.innerHTML = match.date;
            period.innerHTML = "Period " + match.live_period;
            clock.innerHTML = match.live_time;

            // Convert the object into an array of key-value pairs
            var arrayPoints = Object.entries(lineups);
            // Filter out objects with position values "MV/1" or "MV/2"
            arrayPoints = arrayPoints.filter(obj => obj[1].position !== 'MV/1' && obj[1].position !== 'MV/2');
            // Sort the array based on xG values in descending order
            arrayPoints.sort((a, b) => b[1].goals - a[1].goals);

            pl_id1 = arrayPoints[0][1].player_id;
            pts = arrayPoints[0][1].goals + arrayPoints[0][1].assists;
            document.getElementById('p1s').innerHTML = arrayPoints[0][1].player_name + "&emsp;" +
            arrayPoints[0][1].goals + " + " + arrayPoints[0][1].assists + " = " + pts;
            fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_id1)
            .then(response => response.json())
            .then(data => {
                player = data.player;
                url = player.img_url;
                if (url != "") {
                    document.getElementById('imgsp1').src = url;
                }
                else {
                    document.getElementById('imgsp1').src = "/static/symbol_transparent.png";
                    document.getElementById("imgsp1").style.width = "50px";
                    document.getElementById('p1s').innerHTML = "&emsp;" + arrayPoints[0][1].player_name + "&emsp;" +
                    arrayPoints[0][1].goals + " + " + arrayPoints[0][1].assists + " = " + pts;

                }
            })

            pl_id2 = arrayPoints[1][1].player_id;
            pts = arrayPoints[1][1].goals + arrayPoints[1][1].assists;
            document.getElementById('p2s').innerHTML = arrayPoints[1][1].player_name + "&emsp;" +
            arrayPoints[1][1].goals + " + " + arrayPoints[1][1].assists + " = " + pts;
            fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_id2)
            .then(response => response.json())
            .then(data => {
                player = data.player;
                url = player.img_url;
                if (url != "") {
                    document.getElementById('imgsp2').src = url;
                }
                else {
                    document.getElementById('imgsp2').src = "/static/symbol_transparent.png";
                    document.getElementById("imgsp2").style.width = "50px";
                    document.getElementById('p2s').innerHTML = "&emsp;" + arrayPoints[1][1].player_name + "&emsp;" +
                    arrayPoints[1][1].goals + " + " + arrayPoints[1][1].assists + " = " + pts;

                }
            })

            pl_id3 = arrayPoints[2][1].player_id;
            pts = arrayPoints[2][1].goals + arrayPoints[2][1].assists;
            document.getElementById('p3s').innerHTML = arrayPoints[2][1].player_name + "&emsp;" +
            arrayPoints[2][1].goals + " + " + arrayPoints[2][1].assists + " = " + pts;
            fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_id3)
            .then(response => response.json())
            .then(data => {
                player = data.player;
                url = player.img_url;
                if (url != "") {
                    document.getElementById('imgsp3').src = url;
                }
                else {
                    document.getElementById('imgsp3').src = "/static/symbol_transparent.png";
                    document.getElementById("imgsp3").style.width = "50px";
                    document.getElementById('p3s').innerHTML = "&emsp;" + arrayPoints[2][1].player_name + "&emsp;" +
                    arrayPoints[2][1].goals + " + " + arrayPoints[2][1].assists + " = " + pts;

                }
            })

            // Convert the object into an array of key-value pairs
            var arrayLineups = Object.entries(lineups);
            // Sort the array based on xG values in descending order
            arrayLineups.sort((a, b) => b[1].xG - a[1].xG);

            pl_id1 = arrayLineups[0][1].player_id;
            document.getElementById('p1xG').innerHTML = arrayLineups[0][1].player_name + "&emsp;" + arrayLineups[0][1].xG;
            fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_id1)
            .then(response => response.json())
            .then(data => {
                player = data.player;
                url = player.img_url;
                if (url != "") {
                    document.getElementById('imgp1').src = url;
                }
                else {
                    document.getElementById('imgp1').src = "/static/symbol_transparent.png";
                    document.getElementById("imgp1").style.width = "50px";
                    document.getElementById('p1xG').innerHTML = "&emsp;" + arrayLineups[0][1].player_name + "&emsp;" + arrayLineups[0][1].xG;

                }
            })

            pl_id2 = arrayLineups[1][1].player_id;
            document.getElementById('p2xG').innerHTML = arrayLineups[1][1].player_name + "&emsp;" + arrayLineups[1][1].xG;
            fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_id2)
            .then(response => response.json())
            .then(data => {
                player = data.player;
                url = player.img_url;
                if (url != "") {
                    document.getElementById('imgp2').src = url;
                }
                else {
                    document.getElementById('imgp2').src = "/static/symbol_transparent.png";
                    document.getElementById("imgp2").style.width = "50px";
                    document.getElementById('p2xG').innerHTML = "&emsp;" + arrayLineups[1][1].player_name + "&emsp;" + arrayLineups[1][1].xG;

                }
            })

            pl_id3 = arrayLineups[2][1].player_id;
            document.getElementById('p3xG').innerHTML = arrayLineups[2][1].player_name + "&emsp;" + arrayLineups[2][1].xG;
            fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_id3)
            .then(response => response.json())
            .then(data => {
                player = data.player;
                url = player.img_url;
                if (url != "") {
                    document.getElementById('imgp3').src = url;
                }
                else {
                    document.getElementById('imgp3').src = "/static/symbol_transparent.png";
                    document.getElementById("imgp3").style.width = "50px";
                    document.getElementById('p3xG').innerHTML = "&emsp;" + arrayLineups[2][1].player_name + " " + arrayLineups[2][1].xG;
                }
            })

            if (lineup_t1g[0].position == "MV/1") {
                pl_g1 = lineup_t1g[0].player_id;
                temp = lineup_t1g[0].xGOT - lineup_t1g[0].goals;
                document.getElementById('g1xG').innerHTML = lineup_t1g[0].player_name + "&emsp;" + temp.toFixed(2);
            }
            else {
                pl_g1 = lineup_t1g[1].player_id;
                temp = lineup_t1g[1].xGOT - lineup_t1g[1].goals;
                document.getElementById('g1xG').innerHTML = lineup_t1g[1].player_name + "&emsp;" + temp.toFixed(2);
            }

            fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_g1)
            .then(response => response.json())
            .then(data => {
                player = data.player;
                url = player.img_url;
                if (url != "") {
                    document.getElementById('imgg1').src = url;
                }
                else {
                    document.getElementById('imgg1').src = "/static/symbol_transparent.png";
                    document.getElementById("imgg1").style.width = "50px";
                }
            })

            if (lineup_t2g[0].position == "MV/1") {
                pl_g2 = lineup_t2g[0].player_id;
                temp = lineup_t2g[0].xGOT - lineup_t2g[0].goals;
                document.getElementById('g2xG').innerHTML = lineup_t2g[0].player_name + "&emsp;" + temp.toFixed(2);
            }
            else {
                pl_g2 = lineup_t2g[1].player_id;
                temp = lineup_t2g[1].xGOT - lineup_t2g[1].goals;
                document.getElementById('g2xG').innerHTML = lineup_t2g[1].player_name + "&emsp;" + temp.toFixed(2);
            }

            fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_g2)
            .then(response => response.json())
            .then(data => {
                player = data.player;
                url = player.img_url;
                if (url != "") {
                    document.getElementById('imgg2').src = url;
                }
                else {
                    document.getElementById('imgg2').src = "/static/symbol_transparent.png";
                    document.getElementById("imgg2").style.width = "50px";
                }
            })

            calcxGArray();
            setTimeout(drawCharts, 500);
            setTimeout(drawShotMap, 1000);
            console.log('Success:', data);

        })
        .catch((error) => {
          console.error('Error:', error);
    });
}

function calcxG(x, y) {
    x = 1000 + x;

    if (y >= maxY) {
        y = maxY - 1;
    }

    const yd = 2 + Math.floor((y / maxY) * 12);
    const xd = Math.floor((x / maxX) * 12);
    const xGOT = xGOT_matrix[yd][xd] / 100;
    const xG = xG_matrix[yd][xd] / 100;

    return [xGOT, xG];
}

function calcxGW(x, y) {
    x = 1000 + x;

    if (y >= maxY) {
        y = maxY - 1;
    }

    const yd = 2 + Math.floor((y / maxY) * 12);
    const xd = Math.floor((x / maxX) * 12);
    const xGOT = xGOT_matrix_women[yd][xd] / 100;
    const xG = xG_matrix_women[yd][xd] / 100;

    return [xGOT, xG];
}

// xG mapping matrix ON Target

let xGOT_matrix = [           // This is the xGOT matrix

    [ 0.01, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.01, 0.01, 0.01],
    [ 0.01, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.01, 0.01, 0.01],
    [ 2, 2,13,14,15,38,64,38,15,14, 13, 2, 2],
    [ 4, 5,15,19,29,48,50,48,29,19,15, 5, 4],
    [ 5, 8,18,20,23,32,38,32,23,20,18, 8, 5],
    [ 7,12,16,22,26,32,36,32,26,22,16,12, 7],
    [ 8,13,16,18,25,29,33,29,25,18,16,13, 8],
    [ 9,15,16,23,27,31,32,31,27,23,16,15, 9],
    [12,14,16,19,23,29,30,29,23,19,16,14,12],
    [13,14,15,18,22,26,28,26,22,18,15,14,13],
    [13,13,13,16,21,25,25,25,21,16,13,13,13],
    [10,11,12,15,19,20,21,20,19,15,12,11,10],
    [ 7, 9,11,13,15,17,19,17,15,13,11, 9, 7],
    [ 5, 7,9,11,13,15,17,15,13,11,9, 7, 5],

    ];

let xG_matrix = [     // This is the xG matrix
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 7, 8, 8, 19, 54, 19, 8, 8, 7, 1, 1],
    [2, 3, 8, 10, 16, 30, 30, 30, 16, 10, 8, 3, 2],
    [3, 4, 10, 11, 12, 17, 21, 17, 12, 11, 10, 4, 3],
    [4, 7, 9, 12, 14, 17, 19, 17, 14, 12, 9, 6, 4],
    [4, 7, 9, 10, 14, 16, 18, 16, 14, 10, 9, 7, 4],
    [5, 8, 9, 12, 15, 17, 17, 17, 15, 12, 9, 8, 5],
    [7, 8, 9, 10, 12, 16, 16, 16, 12, 10, 9, 8, 7],
    [7, 8, 8, 10, 12, 14, 15, 14, 12, 10, 8, 8, 7],
    [7, 7, 7, 9, 11, 14, 14, 14, 11, 9, 7, 7, 7],
    [5, 6, 7, 8, 10, 11, 11, 11, 10, 8, 7, 6, 5],
    [4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4],
    [3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3],

    ];

let xG_matrix_women = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 12, 17, 19, 25, 35, 42, 30, 21, 16, 13, 9, 2],
    [3, 8, 14, 20, 27, 41, 43, 36, 23, 17, 11, 6, 2],
    [1, 3, 8, 13, 22, 29, 32, 27, 19, 11, 7, 3, 1],
    [1, 4, 7, 13, 18, 24, 25, 22, 15, 10, 6, 4, 1],
    [1, 4, 7, 10, 15, 18, 20, 17, 12, 8, 5, 3, 1],
    [1, 4, 6, 9, 12, 14, 14, 12, 9, 6, 4, 3, 1],
    [1, 3, 5, 7, 8, 11, 11, 9, 7, 6, 4, 3, 1],
    [1, 3, 4, 5, 6, 8, 8, 7, 6, 5, 4, 2, 1],
    [1, 2, 4, 4, 5, 6, 6, 6, 5, 5, 4, 2, 1],
    [1, 2, 4, 4, 4, 5, 5, 5, 5, 4, 3, 2, 1],
    [1, 3, 4, 4, 4, 4, 5, 5, 5, 4, 3, 2, 1],
    [1, 3, 4, 3, 3, 4, 4, 4, 3, 2, 2, 1, 0]
];

let xGOT_matrix_women = [

    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 2, 5, 7, 15, 31, 40, 29, 17, 10, 5, 2, 0],
    [1, 4, 9, 17, 26, 39, 44, 37, 25, 17, 9, 3, 1],
    [1, 5, 14, 20, 30, 35, 37, 33, 27, 19, 13, 5, 1],
    [2, 7, 12, 21, 27, 33, 34, 31, 25, 19, 13, 7, 2],
    [3, 8, 14, 19, 25, 29, 31, 29, 23, 17, 12, 7, 2],
    [3, 8, 15, 19, 24, 26, 27, 25, 21, 15, 11, 11, 7],
    [3, 8, 13, 18, 20, 24, 25, 22, 18, 15, 11, 11, 16],
    [3, 6, 11, 15, 18, 20, 23, 20, 17, 15, 12, 10, 6],
    [2, 6, 10, 13, 15, 18, 20, 19, 16, 14, 10, 6, 2],
    [2, 7, 11, 12, 14, 16, 19, 18, 15, 12, 9, 6, 2],
    [3, 8, 11, 10, 12, 14, 16, 16, 14, 9, 7, 5, 2],
    [2, 6, 6, 6, 7, 9, 10, 11, 8, 5, 3, 3, 2]


        ];
