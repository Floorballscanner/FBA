
// This file contains the script for updating the livepage with live game data

const csrftoken = getCookie('csrftoken');
var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = "";
var events = "";
var s_game = document.getElementById("select-game");
var g_date = document.getElementById("stdate");
var t1g = document.getElementById('sttotg_1').innerHTML
var t2g = document.getElementById('sttotg_2').innerHTML
var t1xG = document.getElementById('sttotxG_1').innerHTML
var t2xG = document.getElementById('sttotxG_2').innerHTML
var t1xGOT = document.getElementById('sttotxGOT_1').innerHTML
var t2xGOT = document.getElementById('sttotxGOT_2').innerHTML
var t1name = document.getElementById('stteam_1').innerHTML
var t2name = document.getElementById('stteam_2').innerHTML
var t1s = document.getElementById('sttotshots_1').innerHTML
var t1s = document.getElementById('sttotshots_2').innerHTML
var t1sOT = document.getElementById('sttotsOT_1').innerHTML
var t1sOT = document.getElementById('sttotsOT_2').innerHTML


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

            console.log('Success:', data);

        })
        .catch((error) => {
          console.error('Error:', error);
    });

    // t = setTimeout(function(){ updatePage() }, 60000); // Update page every minute
}

function changeGame() {

    match_id = s_game.value;
    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatch?api_key="+api_key+"&match_id="+match_id)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const match = data.match;
            const events_json = match_json.events;

            // List of keys you want to select from matches_json
            const selectedKeys = ['event_id','code','team_id','player_id','player_name','shirt_number','time','period','code_fi','description','location','placement','team'];

            // Create a new array to store the modified JSON objects
            const modifiedEvents = [];

            // Iterate through matches_json and create new objects with selected keys
            events_json.forEach(event => {
              const modifiedEvent = {};
              selectedKeys.forEach(key => {
                if (event.hasOwnProperty(key)) {
                  modifiedEvent[key] = event[key];
                }
              });
              modifiedEvents.push(modifiedEvent);
            });

            events = modifiedEvents;

            // Set game data to page
            t1name = match.team_A_name;
            t2name = match.team_B_name;
            t1g = match.fs_A;
            t2g = match.fs_B;
            t1xG = 0;
            t2xG = 0;
            t1xGOT = 0;
            t2xGOT = 0;
            t1s = 0;
            t1s = 0;
            t1sOT = 0;
            t1sOT = 0;
            g_date = match.date;
            
            console.log('Success:', data);

        })
        .catch((error) => {
          console.error('Error:', error);
    });

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

    fetch("https://fbscanner.io/apis/livedata/")
        .then(response => response.json())
        .then(data => {

            data.sort(GetSortOrder("date"))
            let rows = data.length;

            for (let i = 0; i < rows ; i++) {

                document.getElementById('goals' + i).innerHTML = data[i].goalsGameT1 + " - " + data[i].goalsGameT2;
                document.getElementById('period' + i).innerHTML = "Period " + data[i].periodNr;

                var date = new Date(data[i].periodClock * 1000);
                var display = date.toISOString().substr(11, 8);
                document.getElementById('time' + i).innerHTML = display;
            }

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ updatePage() }, 1000);
}

// Sort JSON array by date, sorting function

function GetSortOrder(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}