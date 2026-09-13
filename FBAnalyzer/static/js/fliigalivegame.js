// This file contains the script for updating the live game stream page with live game data

const csrftoken = getCookie('csrftoken');
let data = 0;

// Get the game nr from the url
var currentLocation = window.location.pathname;
var locArray = currentLocation.split("/");
var match_id = locArray[locArray.length-1];
var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
// Whether the match is currently live - gates whether updateData() keeps
// polling every 10s (see its .finally() below). Starts true so a fetch that
// fails before we've learned the real status still gets retried, same
// fail-safe reasoning as the polling-death fix this pairs with.
var liveGameIsActive = true;
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

var maxY = 3400; // Arvioitu, päätyviiva 0 - keskiviiva 1700. Outer bound of Torneopal's own
// location_y range - NOT the xG matrix's row divisor (see halfCourtY below). Still used as-is
// by drawShotMap()'s own (separately calibrated) pixel scaling.
var halfCourtY = 1700; // goal line (0) to half court; at or beyond this, xG is 0 - this IS
// the xG matrix's row divisor. calcxG/calcxGW used maxY here by mistake, which made every
// shot's distance look about half of what it really was.
var maxX = 2000; // [-1000, 1000], maalivahdin näkökulmasta katsottuna oikealle negatiivinen, 0 keskilinjalla
var g_date = document.getElementById("stdate");
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
var t1pp = document.getElementById('sttotpp_1');
var t2pp = document.getElementById('sttotpp_2');
var t1_wp = document.getElementById('stwp_1');
var t2_wp = document.getElementById('stwp_2');
var t1name = "";
var t2name = "";
var myImg = new Image();
myImg.src = "/static/field-new.png";
var cnvs = document.getElementById("liveShotMap");
var ctx = cnvs.getContext("2d");
var fLength = 332;
var fWidth = 200;
var xGTeamArray = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
var distArray = [];
var c_1 = 0; // Calculator for Team 1 win
var c_even = 0;
var c_2 = 0;
var momm = 0;
var n_Sim = 5000; // Number of simulations

// Creates the HTML - page when the window is loaded

window.onload = function() {

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatch?api_key="+api_key+"&match_id="+match_id)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const match = data.match;
            const events_json = match.events;
            const lineups_json = match.lineups;
            t1name = match.team_A_name;
            t2name = match.team_B_name;
            document.getElementById('A_teamname').innerHTML = t1name
            document.getElementById('B_teamname').innerHTML = t2name
            document.getElementById('game_attn').innerHTML = match.attendance;
            updateStreamButton(match);
            liveGameIsActive = (match.live_period != "" && match.status != "Played");

            if (match.live_period != "" && match.status != "Played") {
                const badge = document.createElement('span');
                badge.setAttribute('class', 'landing-live-badge');
                badge.setAttribute('id', 'liveBadge' + match.match_id);
                badge.innerText = "Live";
                document.getElementById('gstats').prepend(badge);
            }

            else if (match.live_period == "") {
                const gametime = document.createElement('h5');
                gametime.setAttribute('id', 'time' + match.match_id);
                gametime.innerText = match.time.toString();
                gametime.style.paddingTop = "5px";
                document.getElementById('gstats').prepend(gametime);
            }

            // List of keys you want to select from events_json
            const selectedKeys = ['event_id','code','team_id','player_id','player_name','shirt_number','time','time_sec','period','code_fi','description','location','placement','team'];

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
            pushMatchEvents(match, modifiedEvents, modifiedLineups);
            updateInsightsPanel(match);
            updatePregameLayout(match, lineups);
            lineups.forEach(event => {
                event.xGOT = 0;
                event.xG = 0;
            });

            // Filter rows where 'code' is one of the specified values
            shots = events.filter(event => ['laukausohi', 'laukausblokattu', 'laukausmaali', 'laukaus'].includes(event.code));
            goaliedata = events.filter(event => ['torjunta', 'paastetty'].includes(event.code));
            // Initialize 'xGOT' and 'xG' properties to 0
            shots.forEach(event => {
                event.xGOT = 0;
                event.xG = 0;
            });
            goaliedata.forEach(event => {
                event.xGOT = 0;
            });

            const shotSituations = computeShotSituations(events, match.period_lengths_sec);

            for (let i = 0; i < shots.length; i++) {
                const st = shots[i].location.split(',');
                const x = parseFloat(st[0]);
                const y = parseFloat(st[1]);
                xG = 0;
                xGOT = 0;

                if (shots[i].code === 'laukausmaali') {
                    shots[i].situation = shotSituations[shots[i].event_id] || situationFromGoalTag(findGoalTag(events, shots[i]));
                } else {
                    shots[i].situation = shotSituations[shots[i].event_id] || 'EVEN';
                }

                if (match.category_id != '384') {
                    [xGOT, xG] = calcxG(x, y, shots[i].situation);
                }
                else {
                    [xGOT, xG] = calcxGW(x, y, shots[i].situation);
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
                    const situation = goaliedata[i].code === 'paastetty'
                        ? (shotSituations[goaliedata[i].event_id] || situationFromGoalTag(findGoalTagForGoalie(events, goaliedata[i])))
                        : (shotSituations[goaliedata[i].event_id] || 'EVEN');

                    if (match.category_id != '384') {
                        [xGOT, xG] = calcxG(x, y, situation);
                    }
                    else {
                        [xGOT, xG] = calcxGW(x, y, situation);
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

            const penEventsA = events.filter(e => e.team === 'A' && parsePenaltySegments(e.code)).length;
            const penEventsB = events.filter(e => e.team === 'B' && parsePenaltySegments(e.code)).length;
            t1ppOpp_temp = penEventsB; // team A's PP opportunities = team B's penalty events
            t2ppOpp_temp = penEventsA;
            t1ppGoals_temp = Object.values(shots).filter(shot => shot.team === 'A' && shot.code === 'laukausmaali' && shot.situation === 'PP').length;
            t2ppGoals_temp = Object.values(shots).filter(shot => shot.team === 'B' && shot.code === 'laukausmaali' && shot.situation === 'PP').length;

            // Calculate xG and xGOT to lineups

            lineups.forEach(lineup => {
                pl = lineup.player_id;
                const playerShots = Object.values(shots).filter(shot => shot.player_id === pl);

                const sumXg = (situation) => Number(playerShots
                    .filter(s => situation === null || s.situation === situation)
                    .reduce((sum, s) => sum + s.xG, 0).toFixed(2));
                const sumXgot = (situation) => Number(playerShots
                    .filter(s => situation === null || s.situation === situation)
                    .reduce((sum, s) => sum + s.xGOT, 0).toFixed(2));

                lineup.xG = sumXg(null);
                lineup.xGOT = sumXgot(null);
                lineup.xG5v5 = sumXg('EVEN');
                lineup.xGOT5v5 = sumXgot('EVEN');
                lineup.xGPP = sumXg('PP');
                lineup.xGOTPP = sumXgot('PP');
                lineup.xGSH = sumXg('SH');
                lineup.xGOTSH = sumXgot('SH');
                lineup.xG6v5 = sumXg('6V5');
                lineup.xGOT6v5 = sumXgot('6V5');
                lineup.shots = playerShots.length;
            });

            lineup_t1 = Object.values(lineups)
                .filter(lineup => lineup.team_id === match.team_A_id);
            lineup_t2 = Object.values(lineups)
                .filter(lineup => lineup.team_id === match.team_B_id);

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
                    if (shot.player_id == lineup.player_id) {
                        if (shot.code == "torjunta") {
                            xga += shot.xGOT;
                        }
                        if (shot.code == "paastetty") {
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
                    if (shot.player_id == lineup.player_id) {
                        if (shot.code == "torjunta") {
                            xga += shot.xGOT;
                        }
                        if (shot.code == "paastetty") {
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
            updatePPIndicator(events, match.period_lengths_sec, t1name, t2name);
            update6v5Indicator(events, match.period_lengths_sec, t1name, t2name);
            t1s.innerHTML = t1s_temp;
            t2s.innerHTML = t2s_temp;
            t1sOT.innerHTML = t1sOT_temp;
            t2sOT.innerHTML = t2sOT_temp;
            t1pp.innerHTML = t1ppGoals_temp + '/' + t1ppOpp_temp;
            t2pp.innerHTML = t2ppGoals_temp + '/' + t2ppOpp_temp;
            g_date.innerHTML = match.date;
            period.innerHTML = "Period " + match.live_period;
            clock.innerHTML = match.live_time;

            // Draw Events
            var drawEvents = events.filter(event => ['maali', 'syotto'].includes(event.code));
            var drawDiv = document.createElement('div');
            drawDiv.setAttribute('id', 'drawDiv');
            document.getElementById("eventBar").insertAdjacentElement("afterend", drawDiv);
            drawEvents.forEach((event, index, array) => {

                if (event.code == "maali") {

                    var row = document.createElement('div');
                    row.setAttribute('class', 'landing-result__event-row');

                    var imgteam = document.createElement('img');
                    if (event.team == "A") {
                        imgteam.setAttribute('src', match.club_A_crest);
                    }
                    else if (event.team == "B") {
                        imgteam.setAttribute('src', match.club_B_crest);
                    }
                    row.appendChild(imgteam);

                    var d = document.createElement('span');
                    if (array[index+1] != undefined) {
                        if (array[index+1].code == "syotto") {
                            d.innerText = event.time + " " + event.description + " #" + event.shirt_number + " "
                                    + event.player_name + " (#" + array[index+1].shirt_number + " " + array[index+1].player_name + ")";
                        }
                        else {
                        d.innerText = event.time + " " + event.description + " #" + event.shirt_number + " "
                                + event.player_name
                        }
                    }
                    else {
                        d.innerText = event.time + " " + event.description + " #" + event.shirt_number + " "
                                + event.player_name
                    }
                    row.appendChild(d);

                    drawDiv.appendChild(row);
                }
            });

            // Convert the object into an array of key-value pairs
            var arrayPoints = Object.entries(lineups);
            // Filter out objects with position values "MV/1" or "MV/2"
            arrayPoints = arrayPoints.filter(obj => obj[1].position !== 'MV/1' && obj[1].position !== 'MV/2');
            // Sort the array based on xG values in descending order
            arrayPoints.sort((a, b) => b[1].points - a[1].points);

            if (arrayPoints.length >= 3) {
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
                    document.getElementById('imgsp1').src = "/static/silhouette.png";
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
                    document.getElementById('imgsp2').src = "/static/silhouette.png";
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
                    document.getElementById('imgsp3').src = "/static/silhouette.png";
                    document.getElementById("imgsp3").style.width = "50px";
                    document.getElementById('p3s').innerHTML = "&emsp;" + arrayPoints[2][1].player_name + "&emsp;" +
                    arrayPoints[2][1].goals + " + " + arrayPoints[2][1].assists + " = " + pts;

                }
            })
            }

            // Convert the object into an array of key-value pairs
            var arrayLineups = Object.entries(lineups);
            // Sort the array based on xG values in descending order
            arrayLineups.sort((a, b) => b[1].xG - a[1].xG);

            if (arrayLineups.length >= 3) {
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
                    document.getElementById('imgp1').src = "/static/silhouette.png";
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
                    document.getElementById('imgp2').src = "/static/silhouette.png";
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
                    document.getElementById('imgp3').src = "/static/silhouette.png";
                    document.getElementById("imgp3").style.width = "50px";
                    document.getElementById('p3xG').innerHTML = "&emsp;" + arrayLineups[2][1].player_name + "&emsp;" + arrayLineups[2][1].xG;

                }
            })
            }

            if (lineup_t1g.length > 0) {
                const starter1 = lineup_t1g.find(g => g.position === "MV/1") || lineup_t1g[0];
                pl_g1 = starter1.player_id;
                temp = starter1.xGOT - starter1.goals;
                document.getElementById('g1xG').innerHTML = starter1.player_name + "&emsp;" + temp.toFixed(2);

                fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_g1)
                .then(response => response.json())
                .then(data => {
                    player = data.player;
                    url = player.img_url;
                    if (url != "") {
                        document.getElementById('imgg1').src = url;
                    }
                    else {
                        document.getElementById('imgg1').src = "/static/silhouette.png";
                        document.getElementById("imgg1").style.width = "50px";
                    }
                })
            }

            if (lineup_t2g.length > 0) {
                const starter2 = lineup_t2g.find(g => g.position === "MV/1") || lineup_t2g[0];
                pl_g2 = starter2.player_id;
                temp = starter2.xGOT - starter2.goals;
                document.getElementById('g2xG').innerHTML = starter2.player_name + "&emsp;" + temp.toFixed(2);

                fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_g2)
                .then(response => response.json())
                .then(data => {
                    player = data.player;
                    url = player.img_url;
                    if (url != "") {
                        document.getElementById('imgg2').src = url;
                    }
                    else {
                        document.getElementById('imgg2').src = "/static/silhouette.png";
                        document.getElementById("imgg2").style.width = "50px";
                    }
                })
            }

            calcDistArray();
            calckello();

            t1per = c_1 / n_Sim + (1/2*c_even/n_Sim);
            t1_wp.innerHTML = Math.round(100*t1per) + " %";

            t2per = c_2 / n_Sim + (1/2*c_even/n_Sim);
            t2_wp.innerHTML = Math.round(100*t2per) + " %";

            calcxGArray();
            setTimeout(drawCharts, 500);
            setTimeout(drawShotMap, 1000);
            console.log('Success:', data);

        })
        .catch((error) => {
          console.error('Error:', error);
        })
        .finally(() => {
            // Only keep polling while the match is actually live - before
            // kickoff and after final whistle the page is static until
            // manually reloaded, instead of hitting Torneopal/our own
            // ingestion endpoint every 10s forever for no reason.
            if (liveGameIsActive) {
                t = setTimeout(function(){ updateData() }, 10000); // Update page every 10 seconds
            }
        });
}

// Torneopal exposes several similarly-named stream fields (stream, stream_url,
// stream_media, live_url) and not every match populates the same one - some
// matches/tiers have no broadcast at all. Try them in priority order and hide
// the button entirely rather than leaving a dead link when nothing is set.
function updateStreamButton(match) {
    const btn = document.getElementById('streamBtn');
    if (!btn) return;
    const isLive = match.live_period != "" && match.status != "Played";
    const url = isLive ? (match.stream_url || match.stream || match.stream_media || match.live_url || '') : '';
    if (url) {
        btn.setAttribute('href', url);
        btn.style.display = '';
    } else {
        btn.style.display = 'none';
    }
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

// Pushes this tick's match + event data to the insight engine's ingestion
// endpoint. All xG/xGOT/situation derivation happens server-side (see
// insights/views.py), so only Torneopal's own raw fields are sent. Fire-
// and-forget: a failed push must never block the page's own rendering.
function pushMatchEvents(match, events, lineups) {
    const payload = {
        match_id: match.match_id,
        category_id: match.category_id,
        season_id: match.season_id,
        group_id: match.group_id,
        date: match.date,
        status: match.status,
        live_period: match.live_period,
        period_lengths_sec: match.period_lengths_sec,
        team_a_id: match.team_A_id,
        team_b_id: match.team_B_id,
        team_a_name: match.team_A_name,
        team_b_name: match.team_B_name,
        score_a: match.fs_A,
        score_b: match.fs_B,
        events: events,
        lineups: lineups,
    };

    fetch("/apis/insights/events/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (!response.ok) {
                console.error('Insights push failed:', response.status);
            }
        })
        .catch((error) => {
            console.error('Error pushing match events to insights:', error);
        });
}

// Renders the pregame/live/post-game analysis section (insights.views).
// Which endpoint gets hit follows the same status/live_period branching
// used throughout this file to tell scheduled/live/played apart.
function renderInsightBullets(feedEl, sentences) {
    feedEl.innerHTML = '';
    sentences.forEach(sentence => {
        const li = document.createElement('li');
        const icon = document.createElement('span');
        icon.className = 'bullet-icon';
        const textSpan = document.createElement('span');
        textSpan.className = 'bullet-text';
        textSpan.textContent = sentence;
        li.appendChild(icon);
        li.appendChild(textSpan);
        feedEl.appendChild(li);
    });
}

function updateInsightsPanel(match) {
    const section = document.getElementById('insightsSection');
    if (section == null) {
        return;
    }
    const titleEl = document.getElementById('insightsSectionTitle');
    const textEl = document.getElementById('insightsText');
    const feedEl = document.getElementById('insightsFeed');

    const isPlayed = match.status === 'Played';
    const isLive = !isPlayed && match.live_period !== '';

    section.style.display = '';
    // Only show the "Loading..." placeholder on the very first render - the
    // 10s poll calls this again and again, and blanking the panel every
    // time shrank it to one line for a moment, shifting everything below
    // it and making the page appear to jump while someone was mid-read.
    if (!section.dataset.loaded) {
        feedEl.style.display = 'none';
        feedEl.innerHTML = '';
        textEl.style.display = '';
        textEl.textContent = 'Loading...';
    }
    section.dataset.loaded = '1';

    if (isPlayed) {
        titleEl.textContent = 'Post-Game Analysis';
        fetch('/apis/insights/postgame/' + match.match_id + '/')
            .then(response => response.json())
            .then(data => {
                const bullets = data.status === 'ready' && data.facts && data.facts.bullets;
                if (bullets && bullets.length > 0) {
                    renderInsightBullets(feedEl, bullets);
                    feedEl.style.display = '';
                    textEl.style.display = 'none';
                } else if (data.status === 'ready') {
                    textEl.textContent = data.text;
                    textEl.style.display = '';
                } else {
                    section.style.display = 'none';
                }
            })
            .catch(() => { section.style.display = 'none'; });
    } else if (isLive) {
        titleEl.textContent = 'Live Insights';
        fetch('/apis/insights/live/' + match.match_id + '/')
            .then(response => response.json())
            .then(data => {
                if (!data.insights || data.insights.length === 0) {
                    section.style.display = 'none';
                    return;
                }
                textEl.style.display = 'none';
                feedEl.style.display = '';
                feedEl.innerHTML = '';
                data.insights.forEach(insight => {
                    const li = document.createElement('li');
                    const icon = document.createElement('img');
                    icon.className = 'bullet-icon';
                    icon.src = '/static/logo_transparent.png';
                    icon.alt = '';
                    const textSpan = document.createElement('span');
                    textSpan.className = 'bullet-text';
                    textSpan.textContent = insight.text;
                    const timeEl = document.createElement('time');
                    timeEl.textContent = new Date(insight.created_at).toLocaleTimeString(
                        [], {hour: '2-digit', minute: '2-digit'}
                    );
                    textSpan.appendChild(timeEl);
                    li.appendChild(icon);
                    li.appendChild(textSpan);
                    feedEl.appendChild(li);
                });
            })
            .catch(() => { section.style.display = 'none'; });
    } else {
        titleEl.textContent = 'Pregame Analysis';
        fetch('/apis/insights/pregame/' + match.match_id + '/')
            .then(response => response.json())
            .then(data => {
                const bullets = data.status === 'ready' && data.facts && data.facts.bullets;
                if (bullets && bullets.length > 0) {
                    renderInsightBullets(feedEl, bullets);
                    feedEl.style.display = '';
                    textEl.style.display = 'none';
                } else if (data.status === 'ready') {
                    textEl.textContent = data.text;
                    textEl.style.display = '';
                } else {
                    section.style.display = 'none';
                }
            })
            .catch(() => { section.style.display = 'none'; });
    }
}

// Before a match has started there's nothing to show yet - hide score/xG/
// events/charts sections and only surface the header (logos/date/time/
// attendance), the pregame analysis, and (once rosters are out) the player
// stats tables, so the page doesn't look broken/empty pregame.
function updatePregameLayout(match, lineups) {
    const isPlayed = match.status === 'Played';
    const isScheduled = !isPlayed && match.live_period === '';

    ['periodBlock', 'scoreBlock', 'statsBlock', 'eventsSection', 'topScorersSection',
     'topXgSection', 'goaliesSection', 'xgByLineSection', 'chartsSection'].forEach(id => {
        const el = document.getElementById(id);
        if (el != null) {
            el.style.display = isScheduled ? 'none' : '';
        }
    });

    const playerStats = document.getElementById('playerStatsSection');
    if (playerStats != null) {
        const hasLineups = lineups != null && lineups.length > 0;
        playerStats.style.display = (isScheduled && !hasLineups) ? 'none' : '';
    }
}

// Function updates the Live page every second

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
    pldatat1l1.addColumn('number', '+');
    pldatat1l1.addColumn('number', '-');
    pldatat1l1.addColumn('number', 'xG5v5');
    pldatat1l1.addColumn('number', 'xGOT5v5');
    pldatat1l1.addColumn('number', 'xGPP');
    pldatat1l1.addColumn('number', 'xGOTPP');
    pldatat1l1.addColumn('number', 'xGSH');
    pldatat1l1.addColumn('number', 'xGOTSH');
    pldatat1l1.addColumn('number', 'xG6v5');
    pldatat1l1.addColumn('number', 'xGOT6v5');

    var pldatat1l2 = new google.visualization.DataTable();
    pldatat1l2.addColumn('string', 'Player');
    pldatat1l2.addColumn('string', 'Pos.');
    pldatat1l2.addColumn('number', 'G');
    pldatat1l2.addColumn('number', 'A');
    pldatat1l2.addColumn('number', 'P');
    pldatat1l2.addColumn('number', 'S');
    pldatat1l2.addColumn('number', '+');
    pldatat1l2.addColumn('number', '-');
    pldatat1l2.addColumn('number', 'xG5v5');
    pldatat1l2.addColumn('number', 'xGOT5v5');
    pldatat1l2.addColumn('number', 'xGPP');
    pldatat1l2.addColumn('number', 'xGOTPP');
    pldatat1l2.addColumn('number', 'xGSH');
    pldatat1l2.addColumn('number', 'xGOTSH');
    pldatat1l2.addColumn('number', 'xG6v5');
    pldatat1l2.addColumn('number', 'xGOT6v5');

    var pldatat1l3 = new google.visualization.DataTable();
    pldatat1l3.addColumn('string', 'Player');
    pldatat1l3.addColumn('string', 'Pos.');
    pldatat1l3.addColumn('number', 'G');
    pldatat1l3.addColumn('number', 'A');
    pldatat1l3.addColumn('number', 'P');
    pldatat1l3.addColumn('number', 'S');
    pldatat1l3.addColumn('number', '+');
    pldatat1l3.addColumn('number', '-');
    pldatat1l3.addColumn('number', 'xG5v5');
    pldatat1l3.addColumn('number', 'xGOT5v5');
    pldatat1l3.addColumn('number', 'xGPP');
    pldatat1l3.addColumn('number', 'xGOTPP');
    pldatat1l3.addColumn('number', 'xGSH');
    pldatat1l3.addColumn('number', 'xGOTSH');
    pldatat1l3.addColumn('number', 'xG6v5');
    pldatat1l3.addColumn('number', 'xGOT6v5');

    var pldatat1l4 = new google.visualization.DataTable();
    pldatat1l4.addColumn('string', 'Player');
    pldatat1l4.addColumn('string', 'Pos.');
    pldatat1l4.addColumn('number', 'G');
    pldatat1l4.addColumn('number', 'A');
    pldatat1l4.addColumn('number', 'P');
    pldatat1l4.addColumn('number', 'S');
    pldatat1l4.addColumn('number', '+');
    pldatat1l4.addColumn('number', '-');
    pldatat1l4.addColumn('number', 'xG5v5');
    pldatat1l4.addColumn('number', 'xGOT5v5');
    pldatat1l4.addColumn('number', 'xGPP');
    pldatat1l4.addColumn('number', 'xGOTPP');
    pldatat1l4.addColumn('number', 'xGSH');
    pldatat1l4.addColumn('number', 'xGOTSH');
    pldatat1l4.addColumn('number', 'xG6v5');
    pldatat1l4.addColumn('number', 'xGOT6v5');

    var pldatat2l1 = new google.visualization.DataTable();
    pldatat2l1.addColumn('string', 'Player');
    pldatat2l1.addColumn('string', 'Pos.');
    pldatat2l1.addColumn('number', 'G');
    pldatat2l1.addColumn('number', 'A');
    pldatat2l1.addColumn('number', 'P');
    pldatat2l1.addColumn('number', 'S');
    pldatat2l1.addColumn('number', '+');
    pldatat2l1.addColumn('number', '-');
    pldatat2l1.addColumn('number', 'xG5v5');
    pldatat2l1.addColumn('number', 'xGOT5v5');
    pldatat2l1.addColumn('number', 'xGPP');
    pldatat2l1.addColumn('number', 'xGOTPP');
    pldatat2l1.addColumn('number', 'xGSH');
    pldatat2l1.addColumn('number', 'xGOTSH');
    pldatat2l1.addColumn('number', 'xG6v5');
    pldatat2l1.addColumn('number', 'xGOT6v5');

    var pldatat2l2 = new google.visualization.DataTable();
    pldatat2l2.addColumn('string', 'Player');
    pldatat2l2.addColumn('string', 'Pos.');
    pldatat2l2.addColumn('number', 'G');
    pldatat2l2.addColumn('number', 'A');
    pldatat2l2.addColumn('number', 'P');
    pldatat2l2.addColumn('number', 'S');
    pldatat2l2.addColumn('number', '+');
    pldatat2l2.addColumn('number', '-');
    pldatat2l2.addColumn('number', 'xG5v5');
    pldatat2l2.addColumn('number', 'xGOT5v5');
    pldatat2l2.addColumn('number', 'xGPP');
    pldatat2l2.addColumn('number', 'xGOTPP');
    pldatat2l2.addColumn('number', 'xGSH');
    pldatat2l2.addColumn('number', 'xGOTSH');
    pldatat2l2.addColumn('number', 'xG6v5');
    pldatat2l2.addColumn('number', 'xGOT6v5');

    var pldatat2l3 = new google.visualization.DataTable();
    pldatat2l3.addColumn('string', 'Player');
    pldatat2l3.addColumn('string', 'Pos.');
    pldatat2l3.addColumn('number', 'G');
    pldatat2l3.addColumn('number', 'A');
    pldatat2l3.addColumn('number', 'P');
    pldatat2l3.addColumn('number', 'S');
    pldatat2l3.addColumn('number', '+');
    pldatat2l3.addColumn('number', '-');
    pldatat2l3.addColumn('number', 'xG5v5');
    pldatat2l3.addColumn('number', 'xGOT5v5');
    pldatat2l3.addColumn('number', 'xGPP');
    pldatat2l3.addColumn('number', 'xGOTPP');
    pldatat2l3.addColumn('number', 'xGSH');
    pldatat2l3.addColumn('number', 'xGOTSH');
    pldatat2l3.addColumn('number', 'xG6v5');
    pldatat2l3.addColumn('number', 'xGOT6v5');

    var pldatat2l4 = new google.visualization.DataTable();
    pldatat2l4.addColumn('string', 'Player');
    pldatat2l4.addColumn('string', 'Pos.');
    pldatat2l4.addColumn('number', 'G');
    pldatat2l4.addColumn('number', 'A');
    pldatat2l4.addColumn('number', 'P');
    pldatat2l4.addColumn('number', 'S');
    pldatat2l4.addColumn('number', '+');
    pldatat2l4.addColumn('number', '-');
    pldatat2l4.addColumn('number', 'xG5v5');
    pldatat2l4.addColumn('number', 'xGOT5v5');
    pldatat2l4.addColumn('number', 'xGPP');
    pldatat2l4.addColumn('number', 'xGOTPP');
    pldatat2l4.addColumn('number', 'xGSH');
    pldatat2l4.addColumn('number', 'xGOTSH');
    pldatat2l4.addColumn('number', 'xG6v5');
    pldatat2l4.addColumn('number', 'xGOT6v5');

    lineup_t1l1.forEach(lineup => {
        pldatat1l1.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.plus, lineup.minus,
        lineup.xG5v5, lineup.xGOT5v5, lineup.xGPP, lineup.xGOTPP, lineup.xGSH, lineup.xGOTSH, lineup.xG6v5, lineup.xGOT6v5]);
    });
    lineup_t1l2.forEach(lineup => {
        pldatat1l2.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.plus, lineup.minus,
        lineup.xG5v5, lineup.xGOT5v5, lineup.xGPP, lineup.xGOTPP, lineup.xGSH, lineup.xGOTSH, lineup.xG6v5, lineup.xGOT6v5]);
    });
    lineup_t1l3.forEach(lineup => {
        pldatat1l3.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.plus, lineup.minus,
        lineup.xG5v5, lineup.xGOT5v5, lineup.xGPP, lineup.xGOTPP, lineup.xGSH, lineup.xGOTSH, lineup.xG6v5, lineup.xGOT6v5]);
    });
    lineup_t1l4.forEach(lineup => {
        pldatat1l4.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.plus, lineup.minus,
        lineup.xG5v5, lineup.xGOT5v5, lineup.xGPP, lineup.xGOTPP, lineup.xGSH, lineup.xGOTSH, lineup.xG6v5, lineup.xGOT6v5]);
    });
    lineup_t2l1.forEach(lineup => {
        pldatat2l1.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.plus, lineup.minus,
        lineup.xG5v5, lineup.xGOT5v5, lineup.xGPP, lineup.xGOTPP, lineup.xGSH, lineup.xGOTSH, lineup.xG6v5, lineup.xGOT6v5]);
    });
    lineup_t2l2.forEach(lineup => {
        pldatat2l2.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.plus, lineup.minus,
        lineup.xG5v5, lineup.xGOT5v5, lineup.xGPP, lineup.xGOTPP, lineup.xGSH, lineup.xGOTSH, lineup.xG6v5, lineup.xGOT6v5]);
    });
    lineup_t2l3.forEach(lineup => {
        pldatat2l3.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.plus, lineup.minus,
        lineup.xG5v5, lineup.xGOT5v5, lineup.xGPP, lineup.xGOTPP, lineup.xGSH, lineup.xGOTSH, lineup.xG6v5, lineup.xGOT6v5]);
    });
    lineup_t2l4.forEach(lineup => {
        pldatat2l4.addRow(["#" + lineup.shirt_number + " " + lineup.player_name, lineup.position, lineup.goals, lineup.assists,
        lineup.goals + lineup.assists, lineup.shots, lineup.plus, lineup.minus,
        lineup.xG5v5, lineup.xGOT5v5, lineup.xGPP, lineup.xGOTPP, lineup.xGSH, lineup.xGOTSH, lineup.xG6v5, lineup.xGOT6v5]);
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
        },
        vAxis: {
            viewWindow: {
                min: 0
            }
        }
    };

    var chartlivexG = new google.visualization.ComboChart(document.getElementById('livexGmap'));
    chartlivexG.draw(xGLiveData, options);

    // Momentumchart
    var momentumData = google.visualization.arrayToDataTable(momm);

    var options = {
        title: 'Momentum',
        curveType: 'function',
        legend: { position: 'bottom' },
        seriesType: 'area',
        areaOpacity: 0.9,
        series: {
            0: {color: t1color},
            1: {color: t2color},
            2: {type: 'line', color: 'black'}
        },
        vAxis: {
        textPosition: 'none', // Piilottaa y-akselin labelit
        viewWindow: {
            min: mommmin - 0.1, // Käytä muuttujaa minimiarvona
            max: mommmax + 0.1 // Käytä muuttujaa maksimiarvona
            }
        }
    };

    var chartmomentum = new google.visualization.ComboChart(document.getElementById('livemomentumchart'));
    chartmomentum.draw(momentumData, options);

    // Tempo chart

    var tempoData = google.visualization.arrayToDataTable(tempo);

   var options = {
        title: 'More Action',
        curveType: 'function',
        legend: { position: 'bottom' },
        seriesType: 'area',
        areaOpacity: 0.9,
        series: {
            0: {color: 'forestgreen'},
            1: {color: 'red'},
            2: {type: 'line', color: 'black'}
        },
        vAxis: {
        textPosition: 'none', // Piilottaa y-akselin labelit
        viewWindow: {
            min: tempmin - 0.1, // Käytä muuttujaa minimiarvona
            max: tempmax + 0.1 // Käytä muuttujaa maksimiarvona
            }
        }
    };

    var charttempo = new google.visualization.ComboChart(document.getElementById('livetempochart'));
    charttempo.draw(tempoData, options);

    // xG by Line

    // Line 1/2/3 bars are 5v5 xG only - PP/SH/6v5 get their own bars below,
    // so a line's bar isn't inflated by, e.g., its players' power-play shots.
    xG_t1l1 = lineup_t1l1.reduce(function (sum, player) {return sum + player.xG5v5;}, 0);
    xG_t1l2 = lineup_t1l2.reduce(function (sum, player) {return sum + player.xG5v5;}, 0);
    xG_t1l3 = lineup_t1l3.reduce(function (sum, player) {return sum + player.xG5v5;}, 0);
    xG_t2l1 = lineup_t2l1.reduce(function (sum, player) {return sum + player.xG5v5;}, 0);
    xG_t2l2 = lineup_t2l2.reduce(function (sum, player) {return sum + player.xG5v5;}, 0);
    xG_t2l3 = lineup_t2l3.reduce(function (sum, player) {return sum + player.xG5v5;}, 0);

    xG_t1PP = Object.values(shots).filter(s => s.team === 'A' && s.situation === 'PP').reduce((sum, s) => sum + s.xG, 0);
    xG_t2PP = Object.values(shots).filter(s => s.team === 'B' && s.situation === 'PP').reduce((sum, s) => sum + s.xG, 0);
    xG_t1SH = Object.values(shots).filter(s => s.team === 'A' && s.situation === 'SH').reduce((sum, s) => sum + s.xG, 0);
    xG_t2SH = Object.values(shots).filter(s => s.team === 'B' && s.situation === 'SH').reduce((sum, s) => sum + s.xG, 0);
    xG_t16v5 = Object.values(shots).filter(s => s.team === 'A' && s.situation === '6V5').reduce((sum, s) => sum + s.xG, 0);
    xG_t26v5 = Object.values(shots).filter(s => s.team === 'B' && s.situation === '6V5').reduce((sum, s) => sum + s.xG, 0);

    var xGByLineData = google.visualization.arrayToDataTable([
         ['Line', t1name, { role: 'style' }, { role: 'annotation' }, t2name, { role: 'style' }, { role: 'annotation' } ],
         ['Line 1', xG_t1l1, 'color: '+ t1color, xG_t1l1, xG_t2l1, 'color: '+ t2color, xG_t2l1 ],
         ['Line 2', xG_t1l2, 'color: '+ t1color, xG_t1l2, xG_t2l2, 'color: '+ t2color, xG_t2l2 ],
         ['Line 3', xG_t1l3, 'color: '+ t1color, xG_t1l3, xG_t2l3, 'color: '+ t2color, xG_t2l3 ],
         ['PP', xG_t1PP, 'color: '+ t1color, xG_t1PP, xG_t2PP, 'color: '+ t2color, xG_t2PP ],
         ['SH', xG_t1SH, 'color: '+ t1color, xG_t1SH, xG_t2SH, 'color: '+ t2color, xG_t2SH ],
         ['6v5', xG_t16v5, 'color: '+ t1color, xG_t16v5, xG_t26v5, 'color: '+ t2color, xG_t26v5 ]
      ]);

    var options = {
        title: 'xG by Line',
        height: 320,
        bar: {groupWidth: "75%"},
        legend: { position: 'bottom'},
        colors: [t1color, t2color],
        hAxis: { textPosition: 'none' }
        };

    var chartxGByLine = new google.visualization.BarChart(document.getElementById('xGByLine'));
    chartxGByLine.draw(xGByLineData, options);

    // xG Distribution Chart

    var matrixResult = res1.map((value, index) => [value, res2[index]]);

    matrixResult.unshift([t1name, t2name]);

    var dataDist = google.visualization.arrayToDataTable(matrixResult);

    var options = {
        title: 'Goal Probabilities, 5000 sims',
        legend: { position: 'bottom', maxLines: 2 },
        colors: [t1color, t2color],
        interpolateNulls: false,
        histogram: {bucketSize: 1},
        vAxis: { ticks: [{v:500, f:'10%'}, {v:1000, f:'20%'}] }
    };

    var chartDist = new google.visualization.Histogram(document.getElementById('xGDist'));
    chartDist.draw(dataDist, options);
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

function calcActionArray() {

    actionArray = [['Time','Shots Team 1','Shots Team 2','Goals Team 1','Goals Team 2','xG Team 1','xG Team 2']];
    for (let i = 1; i < 61; i++) {
        actionArray.push([i,0,0,0,0,0,0])
    }

    for (let i = 1; i < actionArray.length; i++) {
        for (let j = 0; j < shots.length; j++) {
            temp = shots[j].time.split(':');
            min = Number(temp[0]) + 1;
            if (min == i) {
                if (shots[j].team == "A") {
                    actionArray[i][1]++;
                    actionArray[i][5] += shots[j].xG;
                }
                if (shots[j].team == "B") {
                    actionArray[i][2]++;
                    actionArray[i][6] += shots[j].xG;
                }
                if (shots[j].team == "A" & shots[j].code == "laukausmaali") {
                    actionArray[i][3]++;
                }
                if (shots[j].team == "B" & shots[j].code == "laukausmaali") {
                    actionArray[i][4]++;
                }
            }
        }
    }
}

// dist[k] = exact P(exactly k goals), given each shot is an independent
// Bernoulli(xGOT) trial - the Poisson-binomial distribution, built one shot
// at a time. Same idea as insights/win_probability.py's server-side twin;
// mirrored here (no shared runtime between client and server) so the win%
// and "Goal Probabilities" chart are exact and cheap instead of resimulated
// from scratch on every 10s poll.
function goalDistribution(xgotValues) {
    let dist = [1.0];
    for (const p of xgotValues) {
        const next = new Array(dist.length + 1).fill(0);
        for (let k = 0; k < dist.length; k++) {
            next[k] += dist[k] * (1 - p);
            next[k + 1] += dist[k] * p;
        }
        dist = next;
    }
    return dist;
}

// One random draw from a discrete distribution, via its cumulative table -
// O(goals) per draw instead of the old O(shots) (one random() roll per shot,
// every draw), and independent of how many shots were actually taken.
function sampleFromCumulative(cumulative) {
    const r = Math.random();
    for (let k = 0; k < cumulative.length; k++) {
        if (r < cumulative[k]) {
            return k;
        }
    }
    return cumulative.length - 1;
}

function calcDistArray() {

    t1ar = shots.filter(entry => entry['team'] === "A").map(entry => entry['xGOT']);
    t2ar = shots.filter(entry => entry['team'] === "B").map(entry => entry['xGOT']);

    const dist1 = goalDistribution(t1ar);
    const dist2 = goalDistribution(t2ar);

    // Exact win/tie/loss shares, summed directly over the two distributions
    // instead of counted from n_Sim simulated rounds. c_1/c_even/c_2 are
    // scaled back up to look like round counts (rather than fractions) so
    // the existing "/ n_Sim" callers below need no changes.
    let wp1 = 0, wpEven = 0;
    for (let i = 0; i < dist1.length; i++) {
        for (let j = 0; j < dist2.length; j++) {
            const p = dist1[i] * dist2[j];
            if (i > j) { wp1 += p; }
            else if (i === j) { wpEven += p; }
        }
    }
    c_1 = wp1 * n_Sim;
    c_even = wpEven * n_Sim;
    c_2 = n_Sim - c_1 - c_even;

    // res1/res2 still feed the "Goal Probabilities" histogram, which expects
    // n_Sim raw (goalsA, goalsB) sample pairs - draw them from the exact
    // distributions above instead of resimulating every shot n_Sim times.
    const cum1 = [], cum2 = [];
    let running1 = 0, running2 = 0;
    for (let k = 0; k < dist1.length; k++) { running1 += dist1[k]; cum1.push(running1); }
    for (let k = 0; k < dist2.length; k++) { running2 += dist2[k]; cum2.push(running2); }

    res1 = [];
    res2 = [];
    for (let i = 0; i < n_Sim; i++) {
        res1.push(sampleFromCumulative(cum1));
        res2.push(sampleFromCumulative(cum2));
    }
}

function calckello() {
    kello = []
    selectedColumns = ["code", "team", "time", "xGOT", "xG"];

// Luo uusi taulukko valituista sarakkeista
    kudit = shots.map(shoot => ({
        code: shoot.code,
        team: (shoot.team === 'A') ? t1name : t2name,
        time: shoot.time,
        xGOT: shoot.xGOT,
        xG: shoot.xG
     }));
    // Lisää 'aika' -sarake
    kudit.forEach(shoot => {
      timeComponents = shoot.time.split(':');
      shoot.aika = parseInt(timeComponents[0]) * 60 + parseInt(timeComponents[1]);
      shoot.aika = Math.ceil(shoot.aika / 60);
    });
// Lisää 'xGG' -sarake
    kudit.forEach(shoot => {
      shoot.xGG = (parseFloat(shoot.xG) + parseFloat(shoot.xGOT)) / 2;
      shoot.xGG = Math.round(shoot.xGG * 100) / 100; // Pyöristä kahden desimaalin tarkkuuteen
    });

    // Etsi suurin aika ja pyöristetään
    suurinAika = Math.ceil(Math.max(...kudit.map(shoot => shoot.aika)));
    kello = Array.from({ length: suurinAika }, (_, i) => ({ Min: i + 1 }));

    korjauskertoimet = {
      0: 0.00,
      1: 0.02,
      2: 0.20,
      3: 0.45,
      4: 0.6,
      5: 0.8,
      6: 0.95,
      7: 0.99,
      8: 0.99,
      9: 0.99,
      10: 0.99,
      11: 0.99,
      12: 0.99,
      13: 0.99,
      14: 0.99,
      15: 0.99,
      16: 0.99,
      17: 0.99,
      18: 0.99,
      19: 0.99,
      20: 0.99,
    };
    uniqueTeams = Array.from(new Set(kudit.map(shoot => shoot.team)));

    uniqueTeams.forEach(joukkue => {
      // Laske 'shots' -sarake
      kello[joukkue + 'shots'] = Array.from({ length: suurinAika }, (_, i) => {
        return kudit
          .filter(shoot => shoot.team === joukkue && shoot.aika === i + 1)
          .reduce((acc, shoot) => {
            acc += 1;
            return acc;
          }, 0);
      });
    });

    // Laske 'Yhteensä' -sarake
    kello['Yhteensä'] = Array.from({ length: suurinAika }, (_, i) =>
        uniqueTeams.reduce((acc, joukkue) => acc + (kello[joukkue + 'shots'][i] || 0), 0)
    );

    // Käy läpi jokainen joukkue
    uniqueTeams.forEach(joukkue => {
         // Suodata DataFrame vain "laukausmaali" -koodeilla
        joukkueenLaukaukset = kudit.filter(shoot => shoot.team === joukkue && shoot.code === 'laukausmaali');

    // Laske 'G' -sarake
    kello[joukkue + 'G'] = Array.from({ length: suurinAika }, (_, i) =>
        joukkueenLaukaukset.filter(shoot => shoot.aika === i + 1).length
        );
    });
    // Laske 'G_cumulative' -sarake
    uniqueTeams.forEach(joukkue => {
        kello[joukkue + 'G_cumulative'] = Array.from({ length: suurinAika }, (_, i) =>
            kello[joukkue + 'G'].slice(0, i + 1).reduce((acc, g) => acc + g, 0)
        );
    });

    // Laske 'erotus' -sarake
    kello['erotus'] = Array.from({ length: suurinAika }, (_, i) => {
        team1G = kello[uniqueTeams[0] + 'G_cumulative'][i] || 0;
        team2G = kello[uniqueTeams[1] + 'G_cumulative'][i] || 0;
        return Math.abs(team1G - team2G);
    });
    uniqueTeams.forEach(joukkue => {
        // Laske '_xG' -sarake
        kello[joukkue + '_xG'] = Array.from({ length: suurinAika }, (_, i) => {
            return kudit
                .filter(shoot => shoot.team === joukkue && shoot.aika === i)
                .reduce((acc, shoot) => {
                    var korjauskerroin = kello['erotus'][i-2] in korjauskertoimet ? korjauskertoimet[kello['erotus'][i-2]] : 0;
                    var xGValue = shoot.xGG * (1 - korjauskerroin);
                    acc += isNaN(xGValue) ? 0 : xGValue;
                    return acc;
                }, 0);
        });
    });
    // Alustetaan uudet sarakkeet
    kello['Tempo'] = Array(kello.length).fill(0);
    kello['Tempo2'] = Array(kello.length).fill(0);


    // Lasketaan Tempo-sarake
    for (var i = 0; i < kello.length; i++) {
        if (i === 0) {
            kello['Tempo'][i] = 0.6 * kello['Yhteensä'][i] - 1.37;
        } else if (i === 1) {
         kello['Tempo'][i] = 0.6 * kello['Yhteensä'][i] + 0.4 * kello['Yhteensä'][i-1] - 1.37;
        } else if (i === 2) {
         kello['Tempo'][i] = 0.5 * kello['Yhteensä'][i] + 0.32 * kello['Yhteensä'][i-1] + 0.18 * kello['Yhteensä'][i-2] - 1.37;
        } else if (i === 3) {
         kello['Tempo'][i] = 0.35 * kello['Yhteensä'][i] + 0.28 * kello['Yhteensä'][i-1] + 0.22 * kello['Yhteensä'][i-2] + 0.15 * kello['Yhteensä'][i-3] - 1.37;
        } else {
         kello['Tempo'][i] = 0.3 * kello['Yhteensä'][i] + 0.25 * kello['Yhteensä'][i-1] + 0.2 * kello['Yhteensä'][i-2] + 0.15 * kello['Yhteensä'][i-3] + 0.1 * kello['Yhteensä'][i-4] - 1.37;
        }
    }

    // Kopioidaan 'Tempo' 'Tempo2' -sarakkeeseen ja tehdään jakolasku
    kello['Tempo2'] = kello['Tempo'].map(value => parseFloat((value / 0.74).toFixed(2)));
    uniqueTeams.forEach(joukkue => {
        for (var i = 0; i < kello.length; i++) {
        // Alusta 'momin' -sarakkeet tarvittaessa
            if (!kello[joukkue + 'momin']) {
                kello[joukkue + 'momin'] = Array(kello.length).fill(0);
            }

            if (i === 0) {
                kello[joukkue + 'momin'][i] = 0.6 * kello[joukkue + 'shots'][i];
            } else if (i === 1) {
                kello[joukkue + 'momin'][i] = 0.6 * kello[joukkue + 'shots'][i] + 0.4 * kello[joukkue + 'shots'][i-1];
            } else if (i === 2) {
                kello[joukkue + 'momin'][i] = 0.5 * kello[joukkue + 'shots'][i] + 0.32 * kello[joukkue + 'shots'][i-1] + 0.18 * kello[joukkue + 'shots'][i-2];
            } else if (i === 3) {
                kello[joukkue + 'momin'][i] = 0.35 * kello[joukkue + 'shots'][i] + 0.28 * kello[joukkue + 'shots'][i-1] + 0.22 * kello[joukkue + 'shots'][i-2] + 0.15 * kello[joukkue + 'shots'][i-3];
            } else {
                kello[joukkue + 'momin'][i] = 0.3 * kello[joukkue + 'shots'][i] + 0.25 * kello[joukkue + 'shots'][i-1] + 0.2 * kello[joukkue + 'shots'][i-2] + 0.15 * kello[joukkue + 'shots'][i-3] + 0.1 * kello[joukkue + 'shots'][i-4];
            }
        }
    });

    kello['momentum'] = Array(kello.length).fill(0);
    for (var i = 0; i < kello.length; i++) {
        kello['momentum'][i] = kello[t1name + 'momin'][i] - kello[t2name + 'momin'][i];
    };

    momm = Array.from({ length: kello.length }, (_, index) => [
       index + 1,
       kello['momentum'][index] > 0 ? kello['momentum'][index] : 0,
       kello['momentum'][index] < 0 ? kello['momentum'][index] : 0,
       0
    ]);
    momm.unshift(['Aika', t1name, t2name, 'Even']);

    momax = momm.slice(1).map(function(rivi) {
        return rivi[1]; // Oletetaan, että "Tempo" on aina toisessa sarakkeessa (indeksi 1)
    });
    momin = momm.slice(2).map(function(rivi) {
        return rivi[2]; // Oletetaan, että "Tempo" on aina toisessa sarakkeessa (indeksi 1)
    });
    mommmax = Math.max(...momax);
    mommmin = Math.min(...momin)


    tempo = Array.from({ length: kello.length }, (_, index) => [
       index + 1,
       kello['Tempo2'][index] > 0 ? kello['Tempo2'][index] : 0,
       kello['Tempo2'][index] < 0 ? kello['Tempo2'][index] : 0,
       0
    ]);
    tempo.unshift(['Aika', 'Nice amount of action!','No action', 'Average tempo']);

    temmax = tempo.slice(1).map(function(rivi) {
        return rivi[1]; // Oletetaan, että "Tempo" on aina toisessa sarakkeessa (indeksi 1)
    });
    temmin = tempo.slice(2).map(function(rivi) {
        return rivi[2]; // Oletetaan, että "Tempo" on aina toisessa sarakkeessa (indeksi 1)
    });
    tempmax = Math.max(...temmax);
    tempmin = Math.min(...temmin);


   }

function updateData() {

    if (document.getElementById('drawDiv') != null) {
        document.getElementById('drawDiv').remove();
    }

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
            updateStreamButton(match);
            liveGameIsActive = (match.status != "Played" && match.live_period != "");

            if (match.status == "Played") {
                if (document.getElementById('liveBadge' + match.match_id) != null) {
                    document.getElementById('liveBadge' + match.match_id).remove();
                }
                if (document.getElementById('time' + match.match_id) == null) {
                    const gametime = document.createElement('h5');
                    gametime.setAttribute('id', 'time' + match.match_id);
                    gametime.innerText = match.time.toString();
                    gametime.style.paddingTop = "5px";
                    document.getElementById('gstats').prepend(gametime);
                }
            }

            else if (match.status != "Played" && match.live_period == "") {
                if (document.getElementById('liveBadge' + match.match_id) != null) {
                    document.getElementById('liveBadge' + match.match_id).remove();
                }
                if (document.getElementById('time' + match.match_id) == null) {
                    const gametime = document.createElement('h5');
                    gametime.setAttribute('id', 'time' + match.match_id);
                    gametime.innerText = match.time.toString();
                    gametime.style.paddingTop = "5px";
                    document.getElementById('gstats').prepend(gametime);
                }
            }

            else if (match.status != "Played" && match.live_period != "") {
                if (document.getElementById('liveBadge' + match.match_id) == null) {
                    const badge = document.createElement('span');
                    badge.setAttribute('class', 'landing-live-badge');
                    badge.setAttribute('id', 'liveBadge' + match.match_id);
                    badge.innerText = "Live";
                    document.getElementById('gstats').prepend(badge);
                }
                if (document.getElementById('time' + match.match_id) != null) {
                    document.getElementById('time' + match.match_id).remove();
                }
            }

            // List of keys you want to select from events_json
            const selectedKeys = ['event_id','code','team_id','player_id','player_name','shirt_number','time','time_sec','period','code_fi','description','location','placement','team'];

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
            pushMatchEvents(match, modifiedEvents, modifiedLineups);
            updateInsightsPanel(match);
            updatePregameLayout(match, lineups);
            lineups.forEach(event => {
                event.xGOT = 0;
                event.xG = 0;
            });

            // Filter rows where 'code' is one of the specified values
            shots = events.filter(event => ['laukausohi', 'laukausblokattu', 'laukausmaali', 'laukaus'].includes(event.code));
            goaliedata = events.filter(event => ['torjunta', 'paastetty'].includes(event.code));
            // Initialize 'xGOT' and 'xG' properties to 0
            shots.forEach(event => {
                event.xGOT = 0;
                event.xG = 0;
            });
            goaliedata.forEach(event => {
                event.xGOT = 0;
            });

            const shotSituations = computeShotSituations(events, match.period_lengths_sec);

            for (let i = 0; i < shots.length; i++) {
                const st = shots[i].location.split(',');
                const x = parseFloat(st[0]);
                const y = parseFloat(st[1]);
                xG = 0;
                xGOT = 0;

                if (shots[i].code === 'laukausmaali') {
                    shots[i].situation = shotSituations[shots[i].event_id] || situationFromGoalTag(findGoalTag(events, shots[i]));
                } else {
                    shots[i].situation = shotSituations[shots[i].event_id] || 'EVEN';
                }

                if (match.category_id != '384') {
                    [xGOT, xG] = calcxG(x, y, shots[i].situation);
                }
                else {
                    [xGOT, xG] = calcxGW(x, y, shots[i].situation);
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
                    const situation = goaliedata[i].code === 'paastetty'
                        ? (shotSituations[goaliedata[i].event_id] || situationFromGoalTag(findGoalTagForGoalie(events, goaliedata[i])))
                        : (shotSituations[goaliedata[i].event_id] || 'EVEN');

                    if (match.category_id != '384') {
                        [xGOT, xG] = calcxG(x, y, situation);
                    }
                    else {
                        [xGOT, xG] = calcxGW(x, y, situation);
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

            const penEventsA = events.filter(e => e.team === 'A' && parsePenaltySegments(e.code)).length;
            const penEventsB = events.filter(e => e.team === 'B' && parsePenaltySegments(e.code)).length;
            t1ppOpp_temp = penEventsB; // team A's PP opportunities = team B's penalty events
            t2ppOpp_temp = penEventsA;
            t1ppGoals_temp = Object.values(shots).filter(shot => shot.team === 'A' && shot.code === 'laukausmaali' && shot.situation === 'PP').length;
            t2ppGoals_temp = Object.values(shots).filter(shot => shot.team === 'B' && shot.code === 'laukausmaali' && shot.situation === 'PP').length;

            // Calculate xG and xGOT to lineups

            lineups.forEach(lineup => {
                pl = lineup.player_id;
                const playerShots = Object.values(shots).filter(shot => shot.player_id === pl);

                const sumXg = (situation) => Number(playerShots
                    .filter(s => situation === null || s.situation === situation)
                    .reduce((sum, s) => sum + s.xG, 0).toFixed(2));
                const sumXgot = (situation) => Number(playerShots
                    .filter(s => situation === null || s.situation === situation)
                    .reduce((sum, s) => sum + s.xGOT, 0).toFixed(2));

                lineup.xG = sumXg(null);
                lineup.xGOT = sumXgot(null);
                lineup.xG5v5 = sumXg('EVEN');
                lineup.xGOT5v5 = sumXgot('EVEN');
                lineup.xGPP = sumXg('PP');
                lineup.xGOTPP = sumXgot('PP');
                lineup.xGSH = sumXg('SH');
                lineup.xGOTSH = sumXgot('SH');
                lineup.xG6v5 = sumXg('6V5');
                lineup.xGOT6v5 = sumXgot('6V5');
                lineup.shots = playerShots.length;
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
                    if (shot.player_id == lineup.player_id) {
                        if (shot.code == "torjunta") {
                            xga += shot.xGOT;
                        }
                        if (shot.code == "paastetty") {
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
                    if (shot.player_id == lineup.player_id) {
                        if (shot.code == "torjunta") {
                            xga += shot.xGOT;
                        }
                        if (shot.code == "paastetty") {
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
            updatePPIndicator(events, match.period_lengths_sec, t1name, t2name);
            update6v5Indicator(events, match.period_lengths_sec, t1name, t2name);
            t1s.innerHTML = t1s_temp;
            t2s.innerHTML = t2s_temp;
            t1sOT.innerHTML = t1sOT_temp;
            t2sOT.innerHTML = t2sOT_temp;
            t1pp.innerHTML = t1ppGoals_temp + '/' + t1ppOpp_temp;
            t2pp.innerHTML = t2ppGoals_temp + '/' + t2ppOpp_temp;
            g_date.innerHTML = match.date;
            period.innerHTML = "Period " + match.live_period;
            clock.innerHTML = match.live_time;

            // Draw Events
            var drawEvents = events.filter(event => ['maali', 'syotto'].includes(event.code));
            var drawDiv = document.createElement('div');
            drawDiv.setAttribute('id', 'drawDiv');
            document.getElementById("eventBar").insertAdjacentElement("afterend", drawDiv);
            drawEvents.forEach((event, index, array) => {

                if (event.code == "maali") {

                    var row = document.createElement('div');
                    row.setAttribute('class', 'landing-result__event-row');

                    var imgteam = document.createElement('img');
                    if (event.team == "A") {
                        imgteam.setAttribute('src', match.club_A_crest);
                    }
                    else if (event.team == "B") {
                        imgteam.setAttribute('src', match.club_B_crest);
                    }
                    row.appendChild(imgteam);

                    var d = document.createElement('span');
                    if (array[index+1] != undefined) {
                        if (array[index+1].code == "syotto") {
                            d.innerText = event.time + " " + event.description + " #" + event.shirt_number + " "
                                    + event.player_name + " (#" + array[index+1].shirt_number + " " + array[index+1].player_name + ")";
                        }
                        else {
                        d.innerText = event.time + " " + event.description + " #" + event.shirt_number + " "
                                + event.player_name
                        }
                    }
                    else {
                        d.innerText = event.time + " " + event.description + " #" + event.shirt_number + " "
                                + event.player_name
                    }
                    row.appendChild(d);

                    drawDiv.appendChild(row);
                }
            });

            // Convert the object into an array of key-value pairs
            var arrayPoints = Object.entries(lineups);
            // Filter out objects with position values "MV/1" or "MV/2"
            arrayPoints = arrayPoints.filter(obj => obj[1].position !== 'MV/1' && obj[1].position !== 'MV/2');
            // Sort the array based on xG values in descending order
            arrayPoints.sort((a, b) => b[1].points - a[1].points);

            if (arrayPoints.length >= 3) {
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
                    document.getElementById('imgsp1').src = "/static/silhouette.png";
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
                    document.getElementById('imgsp2').src = "/static/silhouette.png";
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
                    document.getElementById('imgsp3').src = "/static/silhouette.png";
                    document.getElementById("imgsp3").style.width = "50px";
                    document.getElementById('p3s').innerHTML = "&emsp;" + arrayPoints[2][1].player_name + "&emsp;" +
                    arrayPoints[2][1].goals + " + " + arrayPoints[2][1].assists + " = " + pts;

                }
            })
            }

            // Convert the object into an array of key-value pairs
            var arrayLineups = Object.entries(lineups);
            // Sort the array based on xG values in descending order
            arrayLineups.sort((a, b) => b[1].xG - a[1].xG);

            if (arrayLineups.length >= 3) {
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
                    document.getElementById('imgp1').src = "/static/silhouette.png";
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
                    document.getElementById('imgp2').src = "/static/silhouette.png";
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
                    document.getElementById('imgp3').src = "/static/silhouette.png";
                    document.getElementById("imgp3").style.width = "50px";
                    document.getElementById('p3xG').innerHTML = "&emsp;" + arrayLineups[2][1].player_name + " " + arrayLineups[2][1].xG;
                }
            })
            }

            if (lineup_t1g.length > 0) {
                const starter1 = lineup_t1g.find(g => g.position === "MV/1") || lineup_t1g[0];
                pl_g1 = starter1.player_id;
                temp = starter1.xGOT - starter1.goals;
                document.getElementById('g1xG').innerHTML = starter1.player_name + "&emsp;" + temp.toFixed(2);

                fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_g1)
                .then(response => response.json())
                .then(data => {
                    player = data.player;
                    url = player.img_url;
                    if (url != "") {
                        document.getElementById('imgg1').src = url;
                    }
                    else {
                        document.getElementById('imgg1').src = "/static/silhouette.png";
                        document.getElementById("imgg1").style.width = "50px";
                    }
                })
            }

            if (lineup_t2g.length > 0) {
                const starter2 = lineup_t2g.find(g => g.position === "MV/1") || lineup_t2g[0];
                pl_g2 = starter2.player_id;
                temp = starter2.xGOT - starter2.goals;
                document.getElementById('g2xG').innerHTML = starter2.player_name + "&emsp;" + temp.toFixed(2);

                fetch("https://salibandy.api.torneopal.com/taso/rest/getPlayer?api_key="+api_key+"&player_id="+pl_g2)
                .then(response => response.json())
                .then(data => {
                    player = data.player;
                    url = player.img_url;
                    if (url != "") {
                        document.getElementById('imgg2').src = url;
                    }
                    else {
                        document.getElementById('imgg2').src = "/static/silhouette.png";
                        document.getElementById("imgg2").style.width = "50px";
                    }
                })
            }

            calcDistArray();
            calckello();

            t1per = c_1 / n_Sim + (1/2*c_even/n_Sim);
            t1_wp.innerHTML = Math.round(100*t1per) + " %";

            t2per = c_2 / n_Sim + (1/2*c_even/n_Sim);
            t2_wp.innerHTML = Math.round(100*t2per) + " %";

            calcxGArray();
            setTimeout(drawCharts, 500);
            setTimeout(drawShotMap, 1000);
            console.log('Success:', data);

        })
        .catch((error) => {
          console.error('Error:', error);
        })
        .finally(() => {
            // Reschedule the next poll here (not just on success) - a single
            // transient failure (a mobile signal drop, a brief Torneopal
            // API hiccup) must not silently and permanently stop the page
            // from updating. It used to: this call previously lived inside
            // the success .then() only, so one bad tick and the page went
            // stale until the viewer manually reloaded.
            //
            // But only keep polling at all while the match is actually live -
            // liveGameIsActive was just refreshed above from this tick's own
            // match.status/live_period (or, on a failed fetch, still holds
            // its last known value, so a transient failure mid-game doesn't
            // stop polling either).
            if (liveGameIsActive) {
                t = setTimeout(function(){ updateData() }, 10000); // Update page every 10 seconds
            }
        });
}

// ============ Special teams (Powerplay/Shorthanded) derivation ============
// Ruleset confirmed against real Torneopal match data (2025-2026 season):
// - Penalty codes are "<N>min" or "<N>_<M>min" (e.g. "2min", "2_2min", "2_10min").
//   Only components of minor/major length (<=5 min) create a skater-count
//   disadvantage; a paired 10/20-min component is a misconduct served without one.
// - A power-play goal ends the conceding team's soonest-to-expire active penalty,
//   same as ice hockey. If that was the first half of a double-minor, the second
//   half starts immediately from the goal.
// - Goals must NOT use this derivation - read Torneopal's own description tag
//   instead (situationFromGoalTag), since a delayed-penalty ('SR') goal has no
//   backing penalty event to derive a window from.

function parsePenaltySegments(code) {
    const m = /^(\d+)(?:_(\d+))?min$/.exec(code || '');
    if (!m) return null;
    const segments = [parseInt(m[1], 10) * 60];
    if (m[2] && parseInt(m[2], 10) <= 5) {
        segments.push(parseInt(m[2], 10) * 60);
    }
    return segments;
}

function absGameTime(period, timeSec, periodLengths) {
    let elapsed = 0;
    const p = parseInt(period, 10);
    for (let i = 1; i < p; i++) {
        elapsed += (periodLengths && periodLengths[i]) || 1200;
    }
    return elapsed + parseInt(timeSec, 10);
}

// Torneopal tags goal events' description with the situation directly (space-
// separated from the running score, e.g. "YV  2-7"). YV/YV2 = power play (one
// or two-man advantage), AV = shorthanded, SR = delayed-penalty goal (treated
// as power-play-equivalent - the offending team never gets a formal penalty
// event since the goal itself cancels it), everything else (including TV, both
// teams simultaneously penalized) is even strength for this purpose.
function situationFromGoalTag(description) {
    const tag = (description || '').trim().split(/\s+/)[0];
    if (tag === 'YV' || tag === 'YV2' || tag === 'SR') return 'PP';
    if (tag === 'AV') return 'SH';
    return 'EVEN';
}

// Simulates penalty windows and goalie-pulled state chronologically over the
// full event list and returns event_id -> situation ('PP'/'SH'/'EVEN'/'6V5')
// for every non-scoring shot and every goalie-facing event (torjunta/
// paastetty, from the shooting/opposing team's perspective, since that's
// whose situation the xG/xGOT matrix lookup needs). '6V5' (the shooting
// team's own goalie pulled, from Torneopal's own 'mvvaihto' event -
// description contains "pois"/"sisään") takes priority over PP/SH/EVEN and
// is computed the same way for goals too - a non-pulled goal gets no entry
// here and keeps using its own tag-based determination (situationFromGoalTag).
function computeShotSituations(allEvents, periodLengths) {
    const timed = allEvents
        .map(e => Object.assign({}, e, { _t: absGameTime(e.period, e.time_sec, periodLengths) }))
        .sort((a, b) => a._t - b._t);

    const active = []; // { team, start, end, pendingNext }
    const pulled = { A: false, B: false };

    function activeCount(team, t) {
        return active.filter(w => w.team === team && w.start <= t && t < w.end).length;
    }

    // A power-play goal ends the conceding team's active penalty that's due to
    // expire soonest (same rule as ice hockey for simultaneous penalties). If
    // that penalty had a pending second segment (double-minor), it starts now.
    function endSoonest(concedingTeam, t) {
        const candidates = active.filter(w => w.team === concedingTeam && w.start <= t && t < w.end);
        if (!candidates.length) return;
        candidates.sort((a, b) => a.end - b.end);
        const ending = candidates[0];
        const pending = ending.pendingNext;
        ending.end = t;
        ending.pendingNext = null;
        if (pending) {
            active.push({ team: concedingTeam, start: t, end: t + pending, pendingNext: null });
        }
    }

    const situations = {};

    timed.forEach(e => {
        if (e.code === 'mvvaihto') {
            if (e.team === 'A' || e.team === 'B') {
                const desc = e.description || '';
                if (desc.indexOf('pois') !== -1) {
                    pulled[e.team] = true;
                } else if (desc.indexOf('sis') !== -1) {
                    pulled[e.team] = false;
                }
            }
            return;
        }

        const segs = parsePenaltySegments(e.code);
        if (segs) {
            active.push({ team: e.team, start: e._t, end: e._t + segs[0], pendingNext: segs[1] || null });
            return;
        }
        if (e.code === 'maali') {
            endSoonest(e.team === 'A' ? 'B' : 'A', e._t);
            return;
        }

        if (e.code === 'laukaus' || e.code === 'laukausohi' || e.code === 'laukausblokattu') {
            if (pulled[e.team]) {
                situations[e.event_id] = '6V5';
                return;
            }
            const other = e.team === 'A' ? 'B' : 'A';
            const mine = activeCount(e.team, e._t);
            const theirs = activeCount(other, e._t);
            situations[e.event_id] = mine < theirs ? 'PP' : (mine > theirs ? 'SH' : 'EVEN');
        } else if (e.code === 'laukausmaali') {
            if (pulled[e.team]) {
                situations[e.event_id] = '6V5';
            }
        } else if (e.code === 'paastetty') {
            // A goal against - situation comes from the goal's own
            // authoritative tag (findGoalTagForGoalie in the caller), not
            // this active-penalty simulation. A PP goal ends the scoring
            // team's power play at this exact instant (the 'maali' branch
            // above, processed earlier at the same timestamp, already
            // truncated the window to end right here), so by now
            // activeCount() no longer sees it as active - only the 6V5
            // (own goalie pulled) override applies here, same as laukausmaali.
            const shootingTeam = e.team === 'A' ? 'B' : 'A';
            if (pulled[shootingTeam]) {
                situations[e.event_id] = '6V5';
            }
        } else if (e.code === 'torjunta') {
            const shootingTeam = e.team === 'A' ? 'B' : 'A';
            if (pulled[shootingTeam]) {
                situations[e.event_id] = '6V5';
                return;
            }
            const mine = activeCount(shootingTeam, e._t);
            const theirs = activeCount(e.team, e._t);
            situations[e.event_id] = mine < theirs ? 'PP' : (mine > theirs ? 'SH' : 'EVEN');
        }
    });

    return situations;
}

// A laukausmaali (goal-shot) shares time/period/team/player with its paired
// maali event, which carries the authoritative situation tag.
function findGoalTag(allEvents, shot) {
    const goal = allEvents.find(e => e.code === 'maali' && e.team === shot.team
        && e.period === shot.period && e.time === shot.time && e.player_id === shot.player_id);
    return goal ? goal.description : '';
}

// A paastetty (goal-against) event shares period/time with the maali event
// of the SCORING (opposing) team - matched without player_id, unlike
// findGoalTag, since the goalie isn't the scorer. Gives the goalie's side of
// a goal the same authoritative PP/SH/EVEN tag the shooter's side gets.
function findGoalTagForGoalie(allEvents, goalieEvent) {
    const scoringTeam = goalieEvent.team === 'A' ? 'B' : 'A';
    const goal = allEvents.find(e => e.code === 'maali' && e.team === scoringTeam
        && e.period === goalieEvent.period && e.time === goalieEvent.time);
    return goal ? goal.description : '';
}

// Current special-teams state "as of now" (the latest processed event), for
// the live PP indicator: which team (if any) is on a power play, and for how
// much longer. Returns null if nobody is currently shorthanded.
function currentSpecialTeams(allEvents, periodLengths) {
    const timed = allEvents
        .map(e => Object.assign({}, e, { _t: absGameTime(e.period, e.time_sec, periodLengths) }))
        .sort((a, b) => a._t - b._t);
    if (!timed.length) return null;
    const now = timed[timed.length - 1]._t;

    const active = [];
    function endSoonest(concedingTeam, t) {
        const candidates = active.filter(w => w.team === concedingTeam && w.start <= t && t < w.end);
        if (!candidates.length) return;
        candidates.sort((a, b) => a.end - b.end);
        const ending = candidates[0];
        const pending = ending.pendingNext;
        ending.end = t;
        ending.pendingNext = null;
        if (pending) {
            active.push({ team: concedingTeam, start: t, end: t + pending, pendingNext: null });
        }
    }
    timed.forEach(e => {
        const segs = parsePenaltySegments(e.code);
        if (segs) {
            active.push({ team: e.team, start: e._t, end: e._t + segs[0], pendingNext: segs[1] || null });
        } else if (e.code === 'maali') {
            endSoonest(e.team === 'A' ? 'B' : 'A', e._t);
        }
    });

    const stillActive = active.filter(w => w.start <= now && now < w.end);
    if (!stillActive.length) return null;

    const countA = stillActive.filter(w => w.team === 'A').length;
    const countB = stillActive.filter(w => w.team === 'B').length;
    if (countA === countB) return null; // e.g. both teams penalized (TV) - net even

    const shorthandedTeam = countA > countB ? 'A' : 'B';
    const endsAt = Math.max(...stillActive.filter(w => w.team === shorthandedTeam).map(w => w.end));
    return { shorthandedTeam, remainingSec: Math.max(0, endsAt - now) };
}

// Shows/hides the live power-play banner (#ppIndicator in f-liiga_game.html).
// Refreshes once per poll (every 10s), matching the rest of the live page.
function updatePPIndicator(allEvents, periodLengths, teamAName, teamBName) {
    const indicator = document.getElementById('ppIndicator');
    if (!indicator) return;
    const st = currentSpecialTeams(allEvents, periodLengths);
    if (!st) {
        indicator.style.display = 'none';
        return;
    }
    const ppTeamName = st.shorthandedTeam === 'A' ? teamBName : teamAName;
    const mins = Math.floor(st.remainingSec / 60);
    const secs = Math.floor(st.remainingSec % 60);
    document.getElementById('ppIndicatorTeam').innerText = ppTeamName;
    document.getElementById('ppIndicatorTime').innerText = mins + ':' + (secs < 10 ? '0' : '') + secs;
    indicator.style.display = 'flex';
}

// Current goalie-pulled state "as of now" (the latest processed event): which
// team, if any, currently has their own goalie off for an extra attacker.
// Unlike currentSpecialTeams there's no timer to wind down - mvvaihto simply
// toggles the state directly (description contains "pois"/"sisään" - see
// computeShotSituations) - so this just replays every toggle in order and
// reports where each team landed.
function current6v5State(allEvents, periodLengths) {
    const timed = allEvents
        .map(e => Object.assign({}, e, { _t: absGameTime(e.period, e.time_sec, periodLengths) }))
        .sort((a, b) => a._t - b._t);
    const pulled = { A: false, B: false };
    timed.forEach(e => {
        if (e.code === 'mvvaihto' && (e.team === 'A' || e.team === 'B')) {
            const desc = e.description || '';
            if (desc.indexOf('pois') !== -1) {
                pulled[e.team] = true;
            } else if (desc.indexOf('sis') !== -1) {
                pulled[e.team] = false;
            }
        }
    });
    if (pulled.A) return 'A';
    if (pulled.B) return 'B';
    return null;
}

// Shows/hides the live 6-vs-5 banner (#sixVFiveIndicator in f-liiga_game.html) -
// same excitement-building idea as the power-play banner, for the moment a
// team pulls their goalie for an extra attacker. Refreshes once per poll.
function update6v5Indicator(allEvents, periodLengths, teamAName, teamBName) {
    const indicator = document.getElementById('sixVFiveIndicator');
    if (!indicator) return;
    const pulledTeam = current6v5State(allEvents, periodLengths);
    if (!pulledTeam) {
        indicator.style.display = 'none';
        return;
    }
    document.getElementById('sixVFiveIndicatorTeam').innerText = pulledTeam === 'A' ? teamAName : teamBName;
    indicator.style.display = 'flex';
}

function calcxG(x, y, situation) {
    if (y >= halfCourtY) {
        return [0, 0];
    }
    x = 1000 + x;

    const yd = 2 + Math.floor((y / halfCourtY) * 12);
    const xd = Math.floor((x / maxX) * 12);
    const [xG_matrix, xGOT_matrix] = getMatrices('men', situation);
    const xGOT = xGOT_matrix[yd][xd] / 100;
    const xG = xG_matrix[yd][xd] / 100;

    return [xGOT, xG];
}

function calcxGW(x, y, situation) {
    if (y >= halfCourtY) {
        return [0, 0];
    }
    x = 1000 + x;

    const yd = 2 + Math.floor((y / halfCourtY) * 12);
    const xd = Math.floor((x / maxX) * 12);
    const [xG_matrix, xGOT_matrix] = getMatrices('women', situation);
    const xGOT = xGOT_matrix[yd][xd] / 100;
    const xG = xG_matrix[yd][xd] / 100;

    return [xGOT, xG];
}

// xG mapping matrix ON Target

// Situational xG/xGOT matrices - mirrors insights/refined_xg_matrices.py, see that
// module's docstring for how these were built (angle-and-distance-aware adaptive
// kernel smoothing of three real seasons of shot data). Kept in sync by hand, no
// shared runtime with the Python side.

const men_5v5_xG_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [8.5, 10.4, 12.8, 15.5, 18.7, 23.3, 23.3, 18.7, 15.5, 12.8, 10.4, 8.5, 7],
    [8.5, 10.5, 13, 16.1, 20.3, 35, 35, 20.3, 16.1, 13, 10.5, 8.5, 7],
    [8.4, 10.4, 13, 16.4, 21.1, 31.4, 31.4, 21.1, 16.4, 13, 10.4, 8.4, 6.9],
    [8.1, 9.9, 12.3, 15.4, 19.2, 22.6, 22.6, 19.2, 15.4, 12.3, 9.9, 8.1, 6.7],
    [7.5, 9.1, 11.2, 13.6, 16.2, 18.1, 18.1, 16.2, 13.6, 11.2, 9.1, 7.5, 6.4],
    [6.9, 8.2, 9.8, 11.5, 13.2, 14.3, 14.3, 13.2, 11.5, 9.8, 8.2, 6.9, 6],
    [6.3, 7.3, 8.4, 9.7, 10.8, 11.4, 11.4, 10.8, 9.7, 8.4, 7.3, 6.3, 5.7],
    [5.8, 6.5, 7.3, 8.1, 8.8, 9.2, 9.2, 8.8, 8.1, 7.3, 6.5, 5.8, 5.4],
    [5.4, 5.8, 6.3, 6.9, 7.3, 7.6, 7.6, 7.3, 6.9, 6.3, 5.8, 5.4, 5.3],
    [5.3, 5.4, 5.7, 6, 6.2, 6.4, 6.4, 6.2, 6, 5.7, 5.4, 5.3, 5.3],
    [5.4, 5.3, 5.3, 5.4, 5.6, 5.6, 5.6, 5.6, 5.4, 5.3, 5.3, 5.4, 5.7],
    [5.8, 5.5, 5.3, 5.3, 5.3, 5.3, 5.3, 5.3, 5.3, 5.3, 5.5, 5.8, 6.2],
    [6.4, 6, 5.7, 5.5, 5.4, 5.4, 5.4, 5.4, 5.5, 5.7, 6, 6.4, 6],
];

const men_5v5_xGOT_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [21, 23.1, 25, 26.7, 28.3, 31.3, 31.3, 28.3, 26.7, 25, 23.1, 21, 18.9],
    [21, 23.3, 25.3, 27.4, 29.8, 39.7, 39.7, 29.8, 27.4, 25.3, 23.3, 21, 19],
    [20.9, 23.3, 25.6, 27.9, 30.6, 37.3, 37.3, 30.6, 27.9, 25.6, 23.3, 20.9, 18.9],
    [20.5, 22.8, 25.2, 27.5, 29.8, 31.8, 31.8, 29.8, 27.5, 25.2, 22.8, 20.5, 18.5],
    [19.9, 22, 24.3, 26.4, 28.2, 29.3, 29.3, 28.2, 26.4, 24.3, 22, 19.9, 18],
    [19, 20.8, 22.8, 24.7, 26.2, 27.1, 27.1, 26.2, 24.7, 22.8, 20.8, 19, 17.5],
    [18.1, 19.6, 21.2, 22.8, 24, 24.7, 24.7, 24, 22.8, 21.2, 19.6, 18.1, 16.8],
    [17.2, 18.3, 19.6, 20.8, 21.7, 22.3, 22.3, 21.7, 20.8, 19.6, 18.3, 17.2, 16.3],
    [16.4, 17.2, 18.1, 19, 19.6, 20, 20, 19.6, 19, 18.1, 17.2, 16.4, 15.9],
    [15.9, 16.3, 16.9, 17.5, 18, 18.2, 18.2, 18, 17.5, 16.9, 16.3, 15.9, 15.8],
    [15.8, 15.8, 16.1, 16.4, 16.7, 16.9, 16.9, 16.7, 16.4, 16.1, 15.8, 15.8, 16.1],
    [16.1, 15.9, 15.8, 15.8, 15.9, 16, 16, 15.9, 15.8, 15.8, 15.9, 16.1, 16.3],
    [16.4, 16.2, 16.1, 16, 15.9, 15.8, 15.8, 15.9, 16, 16.1, 16.2, 16.4, 16.6],
];

const men_PP_xG_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [11.4, 13.7, 16.9, 19.7, 21.9, 24.8, 24.8, 21.9, 19.7, 16.9, 13.7, 11.4, 9.7],
    [11.4, 13.7, 16.9, 20.8, 24.5, 24.4, 24.4, 24.5, 20.8, 16.9, 13.7, 11.4, 9.7],
    [11.2, 13.4, 16.5, 20.3, 24.5, 27.2, 27.2, 24.5, 20.3, 16.5, 13.4, 11.2, 9.6],
    [10.8, 12.8, 15.4, 18.8, 22.4, 25.9, 25.9, 22.4, 18.8, 15.4, 12.8, 10.8, 9.3],
    [10.2, 11.9, 14, 16.6, 19.2, 21.1, 21.1, 19.2, 16.6, 14, 11.9, 10.2, 8.9],
    [9.6, 10.9, 12.5, 14.3, 16.1, 17.2, 17.2, 16.1, 14.3, 12.5, 10.9, 9.6, 8.3],
    [8.8, 9.9, 11.1, 12.4, 13.5, 14.1, 14.1, 13.5, 12.4, 11.1, 9.9, 8.8, 7.8],
    [8, 9, 9.9, 10.8, 11.5, 11.9, 11.9, 11.5, 10.8, 9.9, 9, 8, 7.1],
    [7.3, 8.1, 8.8, 9.4, 9.9, 10.2, 10.2, 9.9, 9.4, 8.8, 8.1, 7.3, 6.5],
    [6.5, 7.2, 7.8, 8.3, 8.7, 8.9, 8.9, 8.7, 8.3, 7.8, 7.2, 6.5, 6.3],
    [6.3, 6.3, 6.9, 7.3, 7.6, 7.7, 7.7, 7.6, 7.3, 6.9, 6.3, 6.3, 6.7],
    [6.6, 6.6, 6, 6.3, 6.6, 6.7, 6.7, 6.6, 6.3, 6, 6.6, 6.6, 7.1],
    [7, 6.9, 6.7, 6.5, 6.2, 6.3, 6.3, 6.2, 6.5, 6.7, 6.9, 7, 7.5],
];

const men_PP_xGOT_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [28.1, 30.7, 33.3, 34.9, 35.3, 36.7, 36.7, 35.3, 34.9, 33.3, 30.7, 28.1, 25.8],
    [28.1, 30.8, 33.7, 35.6, 36.6, 36.4, 36.4, 36.6, 35.6, 33.7, 30.8, 28.1, 25.8],
    [28, 30.7, 33.8, 36.3, 37.2, 37.7, 37.7, 37.2, 36.3, 33.8, 30.7, 28, 25.7],
    [27.5, 30.1, 33.1, 35.8, 37.2, 37.5, 37.5, 37.2, 35.8, 33.1, 30.1, 27.5, 25.3],
    [26.8, 29.1, 31.8, 34.4, 36.3, 37.1, 37.1, 36.3, 34.4, 31.8, 29.1, 26.8, 24.7],
    [25.8, 27.9, 30.1, 32.3, 34.1, 35.1, 35.1, 34.1, 32.3, 30.1, 27.9, 25.8, 23.8],
    [24.7, 26.5, 28.2, 30, 31.4, 32.2, 32.2, 31.4, 30, 28.2, 26.5, 24.7, 22.7],
    [23.3, 25, 26.5, 27.8, 28.8, 29.4, 29.4, 28.8, 27.8, 26.5, 25, 23.3, 22.1],
    [22.4, 23.4, 24.7, 25.8, 26.5, 27, 27, 26.5, 25.8, 24.7, 23.4, 22.4, 22.4],
    [22.5, 22.2, 22.8, 23.8, 24.5, 24.8, 24.8, 24.5, 23.8, 22.8, 22.2, 22.5, 22.8],
    [22.7, 22.9, 22.3, 22.4, 22.4, 22.7, 22.7, 22.4, 22.4, 22.3, 22.9, 22.7, 23.9],
    [23.7, 23.1, 23.1, 22.9, 22.6, 22.1, 22.1, 22.6, 22.9, 23.1, 23.1, 23.7, 24.2],
    [24.6, 24, 23.9, 23.6, 23.3, 22.7, 22.7, 23.3, 23.6, 23.9, 24, 24.6, 24.6],
];

const men_6v5_xG_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4.4, 5.4, 7, 8.3, 9, 10.3, 10.3, 9, 8.3, 7, 5.4, 4.4, 3.3],
    [4.4, 5.5, 7.1, 8.9, 10.6, 8.9, 8.9, 10.6, 8.9, 7.1, 5.5, 4.4, 3.3],
    [4.3, 5.4, 6.8, 9.5, 11.2, 10.7, 10.7, 11.2, 9.5, 6.8, 5.4, 4.3, 3.2],
    [4.1, 5.1, 6.3, 8.3, 10.3, 11, 11, 10.3, 8.3, 6.3, 5.1, 4.1, 3],
    [3.7, 4.8, 5.7, 6.9, 8.6, 9.9, 9.9, 8.6, 6.9, 5.7, 4.8, 3.7, 2.7],
    [3.2, 4.2, 5.1, 5.8, 6.7, 7.3, 7.3, 6.7, 5.8, 5.1, 4.2, 3.2, 2.3],
    [2.6, 3.5, 4.4, 5, 5.5, 5.8, 5.8, 5.5, 5, 4.4, 3.5, 2.6, 2],
    [2.1, 2.8, 3.5, 4.1, 4.6, 4.8, 4.8, 4.6, 4.1, 3.5, 2.8, 2.1, 1.8],
    [1.9, 2.1, 2.6, 3.1, 3.5, 3.7, 3.7, 3.5, 3.1, 2.6, 2.1, 1.9, 1.9],
    [1.9, 1.8, 2, 2.3, 2.5, 2.7, 2.7, 2.5, 2.3, 2, 1.8, 1.9, 2.1],
    [2.1, 2, 1.8, 1.9, 1.9, 2, 2, 1.9, 1.9, 1.8, 2, 2.1, 2.2],
    [2.3, 2.2, 2.1, 2, 1.9, 1.9, 1.9, 1.9, 2, 2.1, 2.2, 2.3, 2.4],
    [2.4, 2.3, 2.2, 2.2, 2.2, 2.1, 2.1, 2.2, 2.2, 2.2, 2.3, 2.4, 2.5],
];

const men_6v5_xGOT_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [12.7, 14.1, 15.3, 15.9, 16.2, 17.4, 17.4, 16.2, 15.9, 15.3, 14.1, 12.7, 11.2],
    [12.7, 14.1, 15.5, 16.4, 17.2, 16.6, 16.6, 17.2, 16.4, 15.5, 14.1, 12.7, 11.1],
    [12.7, 14, 15.5, 16.8, 17.5, 17.3, 17.3, 17.5, 16.8, 15.5, 14, 12.7, 11],
    [12.4, 13.8, 15.1, 16.4, 17.3, 17.5, 17.5, 17.3, 16.4, 15.1, 13.8, 12.4, 10.6],
    [11.8, 13.5, 14.5, 15.6, 16.6, 17, 17, 16.6, 15.6, 14.5, 13.5, 11.8, 10.1],
    [10.9, 12.8, 13.9, 14.7, 15.4, 15.9, 15.9, 15.4, 14.7, 13.9, 12.8, 10.9, 9.9],
    [10.1, 11.4, 13, 13.9, 14.4, 14.6, 14.6, 14.4, 13.9, 13, 11.4, 10.1, 9.7],
    [9.6, 10, 11.4, 12.7, 13.4, 13.7, 13.7, 13.4, 12.7, 11.4, 10, 9.6, 9.9],
    [10, 9.6, 10.1, 10.8, 11.5, 12, 12, 11.5, 10.8, 10.1, 9.6, 10, 10.4],
    [10.1, 10, 9.8, 9.9, 10, 10.2, 10.2, 10, 9.9, 9.8, 10, 10.1, 10.5],
    [10.5, 10.3, 10, 10, 9.9, 9.7, 9.7, 9.9, 10, 10, 10.3, 10.5, 10.9],
    [11, 10.6, 10.6, 10.3, 10.2, 10.2, 10.2, 10.2, 10.3, 10.6, 10.6, 11, 11.2],
    [11.3, 11.1, 10.9, 10.8, 10.7, 10.5, 10.5, 10.7, 10.8, 10.9, 11.1, 11.3, 11.4],
];

const women_5v5_xG_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [7.1, 8.7, 10.5, 12.9, 16, 21.2, 21.2, 16, 12.9, 10.5, 8.7, 7.1, 5.7],
    [7.1, 8.8, 10.8, 13.5, 17.7, 31.1, 31.1, 17.7, 13.5, 10.8, 8.8, 7.1, 5.8],
    [7, 8.7, 10.9, 13.9, 18.7, 27, 27, 18.7, 13.9, 10.9, 8.7, 7, 5.7],
    [6.7, 8.3, 10.4, 13.1, 16.7, 20.1, 20.1, 16.7, 13.1, 10.4, 8.3, 6.7, 5.5],
    [6.3, 7.7, 9.4, 11.5, 13.8, 15.6, 15.6, 13.8, 11.5, 9.4, 7.7, 6.3, 5.2],
    [5.7, 6.9, 8.3, 9.8, 11.3, 12.2, 12.2, 11.3, 9.8, 8.3, 6.9, 5.7, 4.9],
    [5.2, 6.1, 7.1, 8.2, 9.2, 9.7, 9.7, 9.2, 8.2, 7.1, 6.1, 5.2, 4.5],
    [4.7, 5.3, 6.1, 6.8, 7.5, 7.8, 7.8, 7.5, 6.8, 6.1, 5.3, 4.7, 4.3],
    [4.3, 4.7, 5.2, 5.7, 6.1, 6.3, 6.3, 6.1, 5.7, 5.2, 4.7, 4.3, 4.1],
    [4.1, 4.3, 4.6, 4.9, 5.1, 5.3, 5.3, 5.1, 4.9, 4.6, 4.3, 4.1, 4],
    [4, 4.1, 4.2, 4.3, 4.5, 4.5, 4.5, 4.5, 4.3, 4.2, 4.1, 4, 4.1],
    [4.1, 4.1, 4, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 4, 4.1, 4.1, 4.3],
    [4.3, 4.2, 4.1, 4.1, 4, 4, 4, 4, 4.1, 4.1, 4.2, 4.3, 4.3],
];

const women_5v5_xGOT_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [17.8, 19.8, 21.7, 23.7, 26, 30.7, 30.7, 26, 23.7, 21.7, 19.8, 17.8, 15.6],
    [17.9, 20, 22.1, 24.6, 28.2, 36.2, 36.2, 28.2, 24.6, 22.1, 20, 17.9, 15.6],
    [17.8, 20.1, 22.5, 25.4, 29.3, 34, 34, 29.3, 25.4, 22.5, 20.1, 17.8, 15.5],
    [17.4, 19.8, 22.2, 24.9, 28, 30.4, 30.4, 28, 24.9, 22.2, 19.8, 17.4, 15.2],
    [16.7, 18.9, 21.2, 23.6, 25.8, 27.3, 27.3, 25.8, 23.6, 21.2, 18.9, 16.7, 14.6],
    [15.7, 17.8, 19.8, 21.8, 23.4, 24.4, 24.4, 23.4, 21.8, 19.8, 17.8, 15.7, 13.9],
    [14.6, 16.4, 18.2, 19.8, 21.1, 21.8, 21.8, 21.1, 19.8, 18.2, 16.4, 14.6, 13.1],
    [13.5, 14.9, 16.4, 17.7, 18.7, 19.3, 19.3, 18.7, 17.7, 16.4, 14.9, 13.5, 12.3],
    [12.5, 13.5, 14.6, 15.7, 16.5, 16.9, 16.9, 16.5, 15.7, 14.6, 13.5, 12.5, 11.6],
    [11.7, 12.4, 13.2, 13.9, 14.5, 14.8, 14.8, 14.5, 13.9, 13.2, 12.4, 11.7, 11.2],
    [11.2, 11.5, 12, 12.5, 12.9, 13.1, 13.1, 12.9, 12.5, 12, 11.5, 11.2, 11.5],
    [11.5, 11.1, 11.3, 11.5, 11.8, 11.9, 11.9, 11.8, 11.5, 11.3, 11.1, 11.5, 11.8],
    [11.8, 11.6, 11.5, 11.1, 11.2, 11.2, 11.2, 11.2, 11.1, 11.5, 11.6, 11.8, 12.2],
];

const women_PP_xG_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [7.7, 9.4, 11.3, 12.8, 13.4, 16.9, 16.9, 13.4, 12.8, 11.3, 9.4, 7.7, 6.4],
    [7.7, 9.4, 11.6, 13.4, 15.6, 16.5, 16.5, 15.6, 13.4, 11.6, 9.4, 7.7, 6.4],
    [7.6, 9.2, 11.4, 14.3, 17.2, 17.9, 17.9, 17.2, 14.3, 11.4, 9.2, 7.6, 6.4],
    [7.3, 8.8, 10.8, 13.4, 16.5, 17.6, 17.6, 16.5, 13.4, 10.8, 8.8, 7.3, 6.2],
    [6.9, 8.1, 9.8, 11.7, 14, 16, 16, 14, 11.7, 9.8, 8.1, 6.9, 5.9],
    [6.4, 7.4, 8.7, 10.1, 11.4, 12.3, 12.3, 11.4, 10.1, 8.7, 7.4, 6.4, 5.6],
    [5.9, 6.7, 7.6, 8.6, 9.4, 9.9, 9.9, 9.4, 8.6, 7.6, 6.7, 5.9, 5.2],
    [5.4, 6, 6.6, 7.3, 7.9, 8.2, 8.2, 7.9, 7.3, 6.6, 6, 5.4, 4.9],
    [5, 5.4, 5.8, 6.3, 6.7, 6.9, 6.9, 6.7, 6.3, 5.8, 5.4, 5, 4.9],
    [4.9, 5, 5.2, 5.5, 5.8, 5.9, 5.9, 5.8, 5.5, 5.2, 5, 4.9, 5],
    [5.2, 5, 4.8, 5, 5.1, 5.2, 5.2, 5.1, 5, 4.8, 5, 5.2, 5.4],
    [5.4, 5.2, 5.1, 5, 4.9, 4.8, 4.8, 4.9, 5, 5.1, 5.2, 5.4, 5.6],
    [5.7, 5.5, 5.4, 5.3, 5.2, 5.2, 5.2, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8],
];

const women_PP_xGOT_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [22.4, 24, 25.4, 26.5, 27.2, 29.2, 29.2, 27.2, 26.5, 25.4, 24, 22.4, 21.1],
    [22.2, 24, 25.6, 27, 28.5, 28.8, 28.8, 28.5, 27, 25.6, 24, 22.2, 20.8],
    [22.1, 23.9, 25.7, 27.6, 29.3, 30, 30, 29.3, 27.6, 25.7, 23.9, 22.1, 20.7],
    [21.6, 23.4, 25.4, 27.3, 29.1, 29.6, 29.6, 29.1, 27.3, 25.4, 23.4, 21.6, 20.4],
    [21, 22.6, 24.6, 26.5, 27.8, 28.8, 28.8, 27.8, 26.5, 24.6, 22.6, 21, 20.3],
    [20.5, 21.6, 23.3, 25, 26.3, 26.9, 26.9, 26.3, 25, 23.3, 21.6, 20.5, 20.1],
    [20, 20.7, 21.9, 23.3, 24.3, 24.9, 24.9, 24.3, 23.3, 21.9, 20.7, 20, 19.9],
    [19.9, 20.2, 20.7, 21.5, 22.4, 22.8, 22.8, 22.4, 21.5, 20.7, 20.2, 19.9, 20],
    [20.1, 19.9, 20, 20.4, 20.8, 21.1, 21.1, 20.8, 20.4, 20, 19.9, 20.1, 20.4],
    [20.5, 20.1, 20, 19.8, 19.9, 20.1, 20.1, 19.9, 19.8, 20, 20.1, 20.5, 20.8],
    [20.8, 20.7, 20.1, 20.2, 20.1, 19.9, 19.9, 20.1, 20.2, 20.1, 20.7, 20.8, 21.2],
    [21.1, 20.9, 20.7, 20.7, 20.5, 20.3, 20.3, 20.5, 20.7, 20.7, 20.9, 21.1, 21.5],
    [21.6, 21.4, 21.2, 20.9, 20.8, 20.8, 20.8, 20.8, 20.9, 21.2, 21.4, 21.6, 21.8],
];

const women_6v5_xG_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2.3, 3.3, 4.4, 5.2, 7, 7, 5.2, 4.4, 3.3, 2.3, 2, 2],
    [1.9, 2.2, 3.3, 4.7, 6.4, 5.7, 5.7, 6.4, 4.7, 3.3, 2.2, 1.9, 2],
    [2, 2.1, 3.2, 5.1, 7.3, 6.9, 6.9, 7.3, 5.1, 3.2, 2.1, 2, 2],
    [2, 2, 2.5, 4.4, 6.6, 7.4, 7.4, 6.6, 4.4, 2.5, 2, 2, 2],
    [2, 2, 2.2, 3, 4.9, 6.1, 6.1, 4.9, 3, 2.2, 2, 2, 2],
    [2, 2, 2, 2.2, 2.8, 3.6, 3.6, 2.8, 2.2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2.1, 2.2, 2.2, 2.1, 2, 2, 2, 2, 1.9],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1.8],
    [1.8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1.8, 1.7],
    [1.7, 1.8, 1.9, 2, 2, 2, 2, 2, 2, 1.9, 1.8, 1.7, 1.7],
    [1.6, 1.7, 1.7, 1.8, 1.9, 1.9, 1.9, 1.9, 1.8, 1.7, 1.7, 1.6, 1.7],
    [1.7, 1.7, 1.6, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.6, 1.7, 1.7, 1.7],
    [1.8, 1.7, 1.7, 1.6, 1.7, 1.6, 1.6, 1.7, 1.6, 1.7, 1.7, 1.8, 1.8],
];

const women_6v5_xGOT_matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [10.2, 10.6, 11, 11.2, 11.3, 11.6, 11.6, 11.3, 11.2, 11, 10.6, 10.2, 10],
    [10.2, 10.6, 11, 11.3, 11.6, 11.5, 11.5, 11.6, 11.3, 11, 10.6, 10.2, 10],
    [10.1, 10.5, 11, 11.4, 11.7, 11.6, 11.6, 11.7, 11.4, 11, 10.5, 10.1, 9.9],
    [10, 10.4, 10.9, 11.3, 11.6, 11.7, 11.7, 11.6, 11.3, 10.9, 10.4, 10, 10],
    [10, 10.2, 10.6, 11.1, 11.4, 11.6, 11.6, 11.4, 11.1, 10.6, 10.2, 10, 9.9],
    [9.9, 10, 10.3, 10.7, 11, 11.2, 11.2, 11, 10.7, 10.3, 10, 9.9, 9.9],
    [9.9, 9.9, 10, 10.3, 10.5, 10.7, 10.7, 10.5, 10.3, 10, 9.9, 9.9, 10],
    [10, 9.9, 9.9, 10, 10.2, 10.2, 10.2, 10.2, 10, 9.9, 9.9, 10, 10.1],
    [10, 10, 9.9, 9.9, 10, 10, 10, 10, 9.9, 9.9, 10, 10, 10.2],
    [10.1, 10.1, 10, 10, 10, 9.9, 9.9, 10, 10, 10, 10.1, 10.1, 10.2],
    [10.2, 10.1, 10.1, 10, 10, 10, 10, 10, 10, 10.1, 10.1, 10.2, 10.3],
    [10.3, 10.2, 10.2, 10.2, 10.1, 10.1, 10.1, 10.1, 10.2, 10.2, 10.2, 10.3, 10.4],
    [10.4, 10.3, 10.3, 10.3, 10.2, 10.2, 10.2, 10.2, 10.3, 10.3, 10.3, 10.4, 10.4],
];

// situation as computed below ('PP'/'SH'/'EVEN'/'6V5') -> which matrix bucket to use.
// SH has no matrix of its own; EVEN and anything unrecognised fall back to 5v5 too.
function situationBucket(situation) {
    if (situation === 'PP') return 'PP';
    if (situation === '6V5') return '6v5';
    return '5v5';
}

function getMatrices(category, situation) {
    const bucket = situationBucket(situation);
    if (category === 'women') {
        if (bucket === 'PP') return [women_PP_xG_matrix, women_PP_xGOT_matrix];
        if (bucket === '6v5') return [women_6v5_xG_matrix, women_6v5_xGOT_matrix];
        return [women_5v5_xG_matrix, women_5v5_xGOT_matrix];
    }
    if (bucket === 'PP') return [men_PP_xG_matrix, men_PP_xGOT_matrix];
    if (bucket === '6v5') return [men_6v5_xG_matrix, men_6v5_xGOT_matrix];
    return [men_5v5_xG_matrix, men_5v5_xGOT_matrix];
}
