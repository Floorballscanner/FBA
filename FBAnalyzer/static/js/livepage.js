
// This file contains the script for updating the livepage with live game data

const csrftoken = getCookie('csrftoken');

// Creates the HTML - page when the window is loaded

window.onload = function() {

    fetch("https://fbscanner.io/apis/livedata/")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            data.sort(GetSortOrder("date"))
            let rows = data.length;

            const emptyState = document.getElementById("empty-state");
            if (rows > 0 && emptyState) {
                emptyState.style.display = "none";
            }

            for (let i = 0; i < rows ; i++) {

                const card = document.createElement('div');
                card.setAttribute('class', 'landing-match-card');

                const top = document.createElement('div');
                top.setAttribute('class', 'landing-match-card__top');

                const dateEl = document.createElement('span');
                dateEl.setAttribute('class', 'landing-match-card__date');
                dateEl.innerText = data[i].date.substr(0, 10);
                top.appendChild(dateEl);

                if (Date.now() - Date.parse(data[i].date) <= 3600000) { // max 1 hour from last update
                    const live = document.createElement('span');
                    live.setAttribute('class', 'landing-match-card__live');
                    live.innerText = "Live";
                    top.appendChild(live);
                }

                const teams = document.createElement('div');
                teams.setAttribute('class', 'landing-match-card__teams');
                teams.innerText = data[i].nameT1 + " - " + data[i].nameT2;

                const score = document.createElement('div');
                score.setAttribute('class', 'landing-match-card__score');
                score.innerText = data[i].goalsGameT1 + " - " + data[i].goalsGameT2;
                score.setAttribute('id', 'goals' + i);

                const meta = document.createElement('div');
                meta.setAttribute('class', 'landing-match-card__meta');

                const period = document.createElement('span');
                period.innerText = "Period " + data[i].periodNr;
                period.setAttribute('id', 'period' + i);

                var date = new Date(data[i].periodClock * 1000);
                var display = date.toISOString().substr(11, 8);
                const clock = document.createElement('span');
                clock.innerText = display;
                clock.setAttribute('id', 'time' + i);

                meta.appendChild(period);
                meta.appendChild(clock);

                const text = data[i].url;
                const nrArray = text.split("/");
                const nr = nrArray[nrArray.length-2];
                const button = document.createElement('a');
                button.setAttribute('class', 'landing-btn landing-btn--primary');
                button.setAttribute('href', '/live/' + nr);
                button.setAttribute('role', 'button');
                button.innerText = "Open live";

                card.appendChild(top);
                card.appendChild(teams);
                card.appendChild(score);
                card.appendChild(meta);
                card.appendChild(button);

                document.getElementById("head").appendChild(card);
            }

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ updatePage() }, 60000); // Update page every minute
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