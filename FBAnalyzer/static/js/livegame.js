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
            document.getElementById('PosL1T1g').innerHTML = data.PossessionGameT1L1;
            document.getElementById('PosL1T1p').innerHTML = data.PossessionPeriodT1L1;
            document.getElementById('PosL1T2g').innerHTML = data.PossessionGameT2L1;
            document.getElementById('PosL1T2p').innerHTML = data.PossessionPeriodT2L1;
            document.getElementById('PML1T1g').innerHTML = data.GfGameT1L1 - data.GaGameT1L1;
            document.getElementById('PML1T1p').innerHTML = data.GfPeriodT1L1 - data.GaPeriodT1L1;
            document.getElementById('PML1T2g').innerHTML = data.GfGameT1L1 - data.GaGameT1L1;
            document.getElementById('PML1T2p').innerHTML = data.GfPeriodT2L1 - data.GaPeriodT2L1;
            document.getElementById('xGfL1T1g').innerHTML = data.XGfGameT1L1;
            document.getElementById('xGfL1T1p').innerHTML = data.XGfPeriodT1L1;
            document.getElementById('xGaL1T1g').innerHTML = data.XGaGameT1L1;
            document.getElementById('xGaL1T1p').innerHTML = data.XGaPeriodT1L1;
            document.getElementById('xGfL1T2g').innerHTML = data.XGfGameT2L1;
            document.getElementById('xGfL1T2p').innerHTML = data.XGfPeriodT2L1;
            document.getElementById('xGaL1T2g').innerHTML = data.XGaGameT2L1;
            document.getElementById('xGaL1T2p').innerHTML = data.XGaPeriodT2L1;

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
            document.getElementById('PosL1T1g').innerHTML = data.PossessionGameT1L1;
            document.getElementById('PosL1T1p').innerHTML = data.PossessionPeriodT1L1;
            document.getElementById('PosL1T2g').innerHTML = data.PossessionGameT2L1;
            document.getElementById('PosL1T2p').innerHTML = data.PossessionPeriodT2L1;
            document.getElementById('PML1T1g').innerHTML = data.GfGameT1L1 - data.GaGameT1L1;
            document.getElementById('PML1T1p').innerHTML = data.GfPeriodT1L1 - data.GaPeriodT1L1;
            document.getElementById('PML1T2g').innerHTML = data.GfGameT1L1 - data.GaGameT1L1;
            document.getElementById('PML1T2p').innerHTML = data.GfPeriodT2L1 - data.GaPeriodT2L1;
            document.getElementById('xGfL1T1g').innerHTML = data.XGfGameT1L1;
            document.getElementById('xGfL1T1p').innerHTML = data.XGfPeriodT1L1;
            document.getElementById('xGaL1T1g').innerHTML = data.XGaGameT1L1;
            document.getElementById('xGaL1T1p').innerHTML = data.XGaPeriodT1L1;
            document.getElementById('xGfL1T2g').innerHTML = data.XGfGameT2L1;
            document.getElementById('xGfL1T2p').innerHTML = data.XGfPeriodT2L1;
            document.getElementById('xGaL1T2g').innerHTML = data.XGaGameT2L1;
            document.getElementById('xGaL1T2p').innerHTML = data.XGaPeriodT2L1;

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

