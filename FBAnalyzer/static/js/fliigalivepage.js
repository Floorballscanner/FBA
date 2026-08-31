
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

                const row = document.createElement('a');
                row.setAttribute('class', 'landing-match-row');
                row.setAttribute('href', '/accounts/fliigalive/' + match.match_id);

                const status = document.createElement('span');
                status.setAttribute('class', 'landing-match-row__status');

                const teams = document.createElement('span');
                teams.setAttribute('class', 'landing-match-row__teams');
                teams.innerText = match.team_A_name + " - " + match.team_B_name;

                const score = document.createElement('span');
                score.setAttribute('class', 'landing-match-row__score');

                const chevron = document.createElement('span');
                chevron.setAttribute('class', 'landing-match-row__chevron');
                chevron.innerText = "›";

                if (match.live_period != "-1" && match.status != "Played") {
                    // Live now
                    status.classList.add('landing-match-row__status--live');
                    status.innerText = "Live";

                    score.innerText = match.fs_A.toString() + " - " + match.fs_B.toString();
                }
                else if (match.live_period == "-1") {
                    // Not started yet
                    status.innerText = match.time.toString().slice(0, 5);
                    score.innerText = "vs";
                }
                else if (match.status == "Played") {
                    // Finished
                    status.innerText = "Played";
                    score.innerText = match.fs_A.toString() + " - " + match.fs_B.toString();
                }

                row.appendChild(status);
                row.appendChild(teams);
                row.appendChild(score);
                row.appendChild(chevron);

                document.getElementById("head").appendChild(row);
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
