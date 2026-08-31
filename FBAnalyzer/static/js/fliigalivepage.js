
// This file contains the script for updating the F-Liiga "Today's Matches"
// page with today's live/finished game cards.

var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = [];
var today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format

// Men/women, regular season (group_id=1, "Runkosarja") and playoffs
// (group_id=2, "Pudotuspelit") — confirmed against the Torneopal API's own
// group_name field. Inssi-Divari is no longer offered.
const FETCH_URLS = [
    "https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2025-2026&competition_id=sb2025&category_id=402&group_id=1",
    "https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2025-2026&competition_id=sb2025&category_id=402&group_id=2",
    "https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2025-2026&competition_id=sb2025&category_id=384&group_id=1",
    "https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2025-2026&competition_id=sb2025&category_id=384&group_id=2",
];

// Creates the HTML - page when the window is loaded

window.onload = function() {

    Promise.all(FETCH_URLS.map(url => fetch(url).then(response => response.json())))
        .then(results => {
            matches = results.flatMap(data => data.matches || []);
            matches = matches.filter(match => match.date === today);
            matches.sort(GetSortOrderRev("time"));

            const emptyState = document.getElementById('empty-state');
            if (matches.length === 0 && emptyState) {
                emptyState.style.display = "block";
            }

            matches.forEach(match => {

                const card = document.createElement('div');
                card.setAttribute('class', 'landing-match-card');

                const top = document.createElement('div');
                top.setAttribute('class', 'landing-match-card__top');

                const dateEl = document.createElement('span');
                dateEl.setAttribute('class', 'landing-match-card__date');
                top.appendChild(dateEl);

                const teams = document.createElement('div');
                teams.setAttribute('class', 'landing-match-card__teams');
                teams.innerText = match.team_A_name + " - " + match.team_B_name;

                const score = document.createElement('div');
                score.setAttribute('class', 'landing-match-card__score');

                const button = document.createElement('a');
                button.setAttribute('class', 'landing-btn landing-btn--primary');
                button.setAttribute('href', '/accounts/fliigalive/' + match.match_id);
                button.setAttribute('role', 'button');
                button.innerText = "Open live";

                if (match.live_period != "-1" && match.status != "Played") {
                    // Live now
                    const live = document.createElement('span');
                    live.setAttribute('class', 'landing-match-card__live');
                    live.innerText = "Live";
                    top.appendChild(live);

                    let per = Number(match.live_period);
                    let min = Number(match.live_time.slice(0, 2));
                    min = min + 20 * (per - 1);
                    if (min < 10) { min = "0" + min.toString(); }
                    let sec = match.live_time.slice(3, 5);
                    dateEl.innerText = min.toString() + ":" + sec;

                    score.innerText = match.fs_A.toString() + " - " + match.fs_B.toString();
                }
                else if (match.live_period == "-1") {
                    // Not started yet
                    dateEl.innerText = match.time.toString().slice(0, 5);
                    score.innerText = "vs";
                }
                else if (match.status == "Played") {
                    // Finished
                    dateEl.innerText = "Played";
                    score.innerText = match.fs_A.toString() + " - " + match.fs_B.toString();
                }

                card.appendChild(top);
                card.appendChild(teams);
                card.appendChild(score);
                card.appendChild(button);

                document.getElementById("head").appendChild(card);
            });

            console.log('Success:', matches);
        })
        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ location.reload(); }, 60000); // Update page every minute
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

function GetSortOrderRev(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

// Function to check if two dates are the same
function areDatesEqual(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
