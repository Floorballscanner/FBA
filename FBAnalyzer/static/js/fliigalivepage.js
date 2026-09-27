
// This file contains the script for updating the F-Liiga "Today's Matches"
// page with today's live/finished game cards.

var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = [];
var today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format

// Men/women, regular season (group_id=1, "Runkosarja") and playoffs
// (group_id=2, "Pudotuspelit") — confirmed against the Torneopal API's own
// group_name field. Inssi-Divari is no longer offered.
const FETCH_URLS = [
    "https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2026-2027&competition_id=sb2026&category_id=402&group_id=1",
    "https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2026-2027&competition_id=sb2026&category_id=402&group_id=2",
    "https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2026-2027&competition_id=sb2026&category_id=384&group_id=1",
    "https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2026-2027&competition_id=sb2026&category_id=384&group_id=2",
];

// Reduced-motion users get the same up-to-date numbers, just without the flash - checked once
// up front rather than on every flash, since a user's OS-level preference doesn't change mid-session.
const REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// match_id -> "fs_A-fs_B" score text last rendered, so a refresh can tell whether a match's score
// actually changed since the previous poll (and never flashes on a match's first-ever render -
// that's not "something just happened", that's just the page loading).
var previousScores = {};

function scoreTextFor(match) {
    if (match.live_period == "-1") return "vs"; // not started yet
    return match.fs_A.toString() + " - " + match.fs_B.toString();
}

function buildRow(match) {
    const row = document.createElement('a');
    row.setAttribute('class', 'landing-match-row');
    row.setAttribute('href', '/accounts/fliigalive/' + match.match_id);
    row.dataset.matchId = match.match_id;

    const logo = document.createElement('img');
    logo.setAttribute('class', 'landing-match-row__logo');
    logo.setAttribute('alt', '');

    const status = document.createElement('span');
    status.setAttribute('class', 'landing-match-row__status');

    const teams = document.createElement('span');
    teams.setAttribute('class', 'landing-match-row__teams');

    const score = document.createElement('span');
    score.setAttribute('class', 'landing-match-row__score');

    const chevron = document.createElement('span');
    chevron.setAttribute('class', 'landing-match-row__chevron');
    chevron.innerText = "›";

    row.appendChild(logo);
    row.appendChild(status);
    row.appendChild(teams);
    row.appendChild(score);
    row.appendChild(chevron);
    return row;
}

// Fills in (or updates) one row's content from a match, and flashes the score span if it
// changed since the last time this match_id was rendered.
function updateRow(row, match) {
    const logo = row.querySelector('.landing-match-row__logo');
    const status = row.querySelector('.landing-match-row__status');
    const teams = row.querySelector('.landing-match-row__teams');
    const score = row.querySelector('.landing-match-row__score');

    logo.setAttribute('src', match.category_logo);
    teams.innerText = match.team_A_name + " - " + match.team_B_name;

    status.classList.remove('landing-match-row__status--live');
    if (match.live_period != "-1" && match.status != "Played") {
        status.classList.add('landing-match-row__status--live');
        status.innerText = "Live";
    } else if (match.live_period == "-1") {
        status.innerText = match.time.toString().slice(0, 5);
    } else if (match.status == "Played") {
        status.innerText = "Played";
    }

    const newScoreText = scoreTextFor(match);
    const previous = previousScores[match.match_id];
    score.innerText = newScoreText;
    if (previous !== undefined && previous !== newScoreText && !REDUCE_MOTION) {
        score.classList.remove('landing-match-row__score--flash');
        // Force a reflow so re-adding the class restarts the animation even if it's still
        // mid-flash from a very recent previous change.
        void score.offsetWidth;
        score.classList.add('landing-match-row__score--flash');
    }
    previousScores[match.match_id] = newScoreText;
}

function refresh() {
    Promise.all(FETCH_URLS.map(url => fetch(url).then(response => response.json())))
        .then(results => {
            matches = results.flatMap(data => data.matches || []);
            matches = matches.filter(match => match.date === today);
            matches.sort(GetSortOrderRev("time"));

            const container = document.getElementById("head");
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = matches.length === 0 ? "block" : "none";
            }

            matches.forEach(match => {
                let row = container.querySelector('[data-match-id="' + match.match_id + '"]');
                if (!row) {
                    row = buildRow(match);
                }
                updateRow(row, match);
                // Re-appending an already-present node just moves it - this keeps every row's
                // identity (and any in-progress flash animation) intact while still re-sorting
                // the list to match the freshly fetched order.
                container.appendChild(row);
            });

            console.log('Success:', matches);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
}

window.onload = function() {
    refresh();
    setInterval(refresh, 15000); // Refresh in place every 15s - no more full page reloads.
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
