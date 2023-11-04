
// This file contains the script for updating the livepage with live game data

const csrftoken = getCookie('csrftoken');
var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = "";

// Creates the HTML - page when the window is loaded

window.onload = function() {

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=402&group_id=2")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const matches_json = data.matches;
            matches_json.sort(GetSortOrder("date"))

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
/*            for (let i = 0; i < rows ; i++) {

                const div = document.createElement('div');
                div.setAttribute('class', 'row');

                const div2 = document.createElement('div');
                div2.setAttribute('class', 'col-sm-12');

                const d = document.createElement('h5');
                d.innerText = data[i].date.substr(0, 10);
                d.style.paddingTop = "50px";

                const h = document.createElement('h1');
                h.innerText = data[i].nameT1 + " - " + data[i].nameT2;
                h.style.paddingTop = "5px";
                h.style.fontWeight = "bold"

                const h2 = document.createElement('h1');
                h2.innerText = data[i].goalsGameT1 + " - " + data[i].goalsGameT2;
                h2.style.paddingTop = "5px";
                h2.setAttribute('id', 'goals' + i);

                const h3 = document.createElement('h5');
                h3.innerText = "Period " + data[i].periodNr;
                h3.style.paddingTop = "5px";
                h3.setAttribute('id', 'period' + i);

                var date = new Date(data[i].periodClock * 1000);
                var display = date.toISOString().substr(11, 8);
                const disp = document.createElement('h3');
                disp.innerText = display;
                disp.style.paddingTop = "5px";
                disp.setAttribute('id', 'time' + i);

                const text = data[i].url;
                const nrArray = text.split("/");
                const nr = nrArray[nrArray.length-2];
                const button = document.createElement('a');
                button.setAttribute('class', 'btn btn-primary');
                button.setAttribute('href', '/live/' + nr);
                button.setAttribute('role', 'button');
                button.style.paddingTop = "5px";
                button.innerText = "Open live";
                button.style.paddingBottom = "5px";

                document.getElementById("head").appendChild(div);
                div.appendChild(div2);
                div2.appendChild(d);

                if (Date.now() - Date.parse(data[i].date) <= 3600000) { // max 1 hour from last update
                    const img = document.createElement('img');
                    img.setAttribute('src',"/static/live.png");
                    img.setAttribute('width', '70px');
                    img.style.paddingTop = "5px";
                    div2.appendChild(img);
                }
                //else {h.style.paddingTop = "55px";}

                div2.appendChild(h);
                div2.appendChild(h2);
                div2.appendChild(h3);
                div2.appendChild(disp);
                div2.appendChild(button);*/

        })
            console.log('Success:', data);

        .catch((error) => {
          console.error('Error:', error);
    });

    // t = setTimeout(function(){ updatePage() }, 60000); // Update page every minute
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
        if (a[prop] < b[prop]) {
            return 1;
        } else if (a[prop] > b[prop]) {
            return -1;
        }
        return 0;
    }
}