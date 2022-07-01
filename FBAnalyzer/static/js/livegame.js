// This file contains the script for updating the live game stream page with live game data

const csrftoken = getCookie('csrftoken');

// Get the game nr from the url
var currentLocation = window.location.pathname;
var locArray = currentLocation.split("/");
var nr = locArray[locArray.length-1];

// Creates the HTML - page when the window is loaded

window.onload = function() {

    fetch("https://fbscanner.io/apis/livejson/" + nr)
        .then(response => response.json())
        .then(data => {

            if (Date.now() - Date.parse(data.date) <= 3600000) { // max 1 hour from last update
                    const img = document.createElement('img');
                    img.setAttribute('src',"/static/live.png");
                    img.setAttribute('width', '100px');
                    img.style.paddingTop = "35px";
                    img.style.paddingBottom = "10px"
                    document.getElementById('gstats').prepend(img);
            }
            else {
            document.getElementById('h1').style.paddingTop = "55px";
            }

            document.getElementById('h1').style.fontWeight = "bold"
            document.getElementById('homeTeam').innerHTML = data.nameT1;
            document.getElementById('awayTeam').innerHTML = data.nameT2;
            document.getElementById('periodNr').innerHTML = "Period " + data.periodNr;

            var date = new Date(data.periodClock * 1000);
            var display = date.toISOString().substr(11, 8);
            document.getElementById('label').innerHTML = display;

            document.getElementById('homeGoals').innerHTML = data.goalsGameT1;
            document.getElementById('awayGoals').innerHTML = data.goalsGameT2;
            document.getElementById('homeGoalsP').innerHTML = data.goalsPeriodT1;
            document.getElementById('awayGoalsP').innerHTML = data.goalsPeriodT2;
            document.getElementById('homexG').innerHTML = data.xGGameT1;
            document.getElementById('awayxG').innerHTML = data.xGGameT2;
            document.getElementById('homexGP').innerHTML = data.xGPeriodT1;
            document.getElementById('awayxGP').innerHTML = data.xGPeriodT2;

            document.getElementById('homeTeamLine').innerHTML = data.nameT1;
            document.getElementById('awayTeamLine').innerHTML = data.nameT2;
            document.getElementById('TocL1T1g').innerHTML = convertTime(data.TOCGameT1L1);
            document.getElementById('TocL1T1p').innerHTML = convertTime(data.TOCPeriodT1L1);
            document.getElementById('TocL1T2g').innerHTML = convertTime(data.TOCGameT2L1);
            document.getElementById('TocL1T2p').innerHTML = convertTime(data.TOCPeriodT2L1);
            document.getElementById('PosL1T1g').innerHTML = convertPos(data.possessionGameT1L1, data.gameClock);
            document.getElementById('PosL1T1p').innerHTML = convertPos(data.possessionPeriodT1L1, data.periodClock);
            document.getElementById('PosL1T2g').innerHTML = convertPos(data.possessionGameT2L1, data.gameClock);
            document.getElementById('PosL1T2p').innerHTML = convertPos(data.possessionPeriodT2L1, data.periodClock);
            document.getElementById('PML1T1g').innerHTML = data.gfGameT1L1 - data.gaGameT1L1;
            document.getElementById('PML1T1p').innerHTML = data.gfPeriodT1L1 - data.gaPeriodT1L1;
            document.getElementById('PML1T2g').innerHTML = data.gfGameT2L1 - data.gaGameT2L1;
            document.getElementById('PML1T2p').innerHTML = data.gfPeriodT2L1 - data.gaPeriodT2L1;
            document.getElementById('xGfL1T1g').innerHTML = data.xGfGameT1L1;
            document.getElementById('xGfL1T1p').innerHTML = data.xGfPeriodT1L1;
            document.getElementById('xGaL1T1g').innerHTML = data.xGaGameT1L1;
            document.getElementById('xGaL1T1p').innerHTML = data.xGaPeriodT1L1;
            document.getElementById('xGfL1T2g').innerHTML = data.xGfGameT2L1;
            document.getElementById('xGfL1T2p').innerHTML = data.xGfPeriodT2L1;
            document.getElementById('xGaL1T2g').innerHTML = data.xGaGameT2L1;
            document.getElementById('xGaL1T2p').innerHTML = data.xGaPeriodT2L1;

            updateCharts(data);
            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ updatePage() }, 1000);
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

// Function updates the Live page every second

function updatePage() {

    fetch("https://fbscanner.io/apis/livejson/" + nr)
        .then(response => response.json())
        .then(data => {

            document.getElementById('homeTeam').innerHTML = data.nameT1;
            document.getElementById('awayTeam').innerHTML = data.nameT2;
            document.getElementById('periodNr').innerHTML = "Period " + data.periodNr;

            var date = new Date(data.periodClock * 1000);
            var display = date.toISOString().substr(11, 8);
            document.getElementById('label').innerHTML = display;

            document.getElementById('homeGoals').innerHTML = data.goalsGameT1;
            document.getElementById('awayGoals').innerHTML = data.goalsGameT2;
            document.getElementById('homeGoalsP').innerHTML = data.goalsPeriodT1;
            document.getElementById('homexG').innerHTML = data.xGGameT1;
            document.getElementById('awayxG').innerHTML = data.xGGameT2;
            document.getElementById('homexGP').innerHTML = data.xGPeriodT1;
            document.getElementById('awayxGP').innerHTML = data.xGPeriodT2;

            document.getElementById('TocL1T1g').innerHTML = convertTime(data.TOCGameT1L1);
            document.getElementById('TocL1T1p').innerHTML = convertTime(data.TOCPeriodT1L1);
            document.getElementById('TocL1T2g').innerHTML = convertTime(data.TOCGameT2L1);
            document.getElementById('TocL1T2p').innerHTML = convertTime(data.TOCPeriodT2L1);
            document.getElementById('PosL1T1g').innerHTML = convertPos(data.possessionGameT1L1, data.gameClock);
            document.getElementById('PosL1T1p').innerHTML = convertPos(data.possessionPeriodT1L1, data.periodClock);
            document.getElementById('PosL1T2g').innerHTML = convertPos(data.possessionGameT2L1, data.gameClock);
            document.getElementById('PosL1T2p').innerHTML = convertPos(data.possessionPeriodT2L1, data.periodClock);
            document.getElementById('PML1T1g').innerHTML = data.gfGameT1L1 - data.gaGameT1L1;
            document.getElementById('PML1T1p').innerHTML = data.gfPeriodT1L1 - data.gaPeriodT1L1;
            document.getElementById('PML1T2g').innerHTML = data.gfGameT2L1 - data.gaGameT2L1;
            document.getElementById('PML1T2p').innerHTML = data.gfPeriodT2L1 - data.gaPeriodT2L1;
            document.getElementById('xGfL1T1g').innerHTML = data.xGfGameT1L1;
            document.getElementById('xGfL1T1p').innerHTML = data.xGfPeriodT1L1;
            document.getElementById('xGaL1T1g').innerHTML = data.xGaGameT1L1;
            document.getElementById('xGaL1T1p').innerHTML = data.xGaPeriodT1L1;
            document.getElementById('xGfL1T2g').innerHTML = data.xGfGameT2L1;
            document.getElementById('xGfL1T2p').innerHTML = data.xGfPeriodT2L1;
            document.getElementById('xGaL1T2g').innerHTML = data.xGaGameT2L1;
            document.getElementById('xGaL1T2p').innerHTML = data.xGaPeriodT2L1;

            updateCharts(data);
            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ updatePage() }, 1000);
}

function convertTime(arg) {
    var date = new Date(arg * 1000);
    var res = date.toISOString().substr(14, 5);
    return res;
}

function convertPos(lPos, counter) {
    res = Math.round(100 * lPos / counter);
    return res;
}

function updateCharts(jsonData) {

    // xG Game Chart

    console.log(jsonData);

    var data = google.visualization.arrayToDataTable([
         ['Line', jsonData.nameT1, { role: 'style' }, { role: 'annotation' }, jsonData.nameT2, { role: 'style' }, { role: 'annotation' } ],
         ['Line 1', ~~jsonData.xGfGameT1L1, 'color: #3046FB', ~~jsonData.xGfGameT1L1, ~~jsonData.xGfGameT2L1, 'color: #59D9EB', ~~jsonData.xGfGameT2L1 ],
         ['Line 2', ~~jsonData.xGfGameT1L2, 'color: #3046FB', ~~jsonData.xGfGameT1L2, ~~jsonData.xGfGameT2L2, 'color: #59D9EB', ~~jsonData.xGfGameT2L2 ],
         ['Line 3', ~~jsonData.xGfGameT1L3, 'color: #3046FB', ~~jsonData.xGfGameT1L3, ~~jsonData.xGfGameT2L3, 'color: #59D9EB', ~~jsonData.xGfGameT2L3 ],
         ['Powerplay', ~~jsonData.xGfGameT1L4 + ~~jsonData.xGfGameT1L5, 'color: #3046FB', ~~jsonData.xGfGameT1L4 + ~~jsonData.xGfGameT1L5, ~~jsonData.xGfGameT2L4 + ~~jsonData.xGfGameT2L5 , 'color: #59D9EB', ~~jsonData.xGfGameT2L4 + ~~jsonData.xGfGameT2L5 ],
         ['Shorthanded', ~~jsonData.xGfGameT1L6 + ~~jsonData.xGfGameT1L7, 'color: #3046FB', ~~jsonData.xGfGameT1L6 + ~~jsonData.xGfGameT1L7, ~~jsonData.xGfGameT2L6 + ~~jsonData.xGfGameT2L7 , 'color: #59D9EB', ~~jsonData.xGfGameT2L6 + ~~jsonData.xGfGameT2L7 ]
      ]);

    var options = {
        title: 'xG by Line',
        bar: {groupWidth: "95%"},
        };

    var chart = new google.visualization.BarChart(document.getElementById('xGGame_chart'));
    chart.draw(data, options);

}