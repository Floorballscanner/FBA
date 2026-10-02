
// This file contains the script for updating the F-Liiga "Today's Matches"
// page with today's live/finished game cards.

var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = [];
var today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
var selectedDate = today; // which carousel day is currently being shown

// How far ahead the date carousel looks - a full season's worth of fixture dates would be
// an unscannable wall of pills, so this caps it to a scannable week-ahead window.
const CAROUSEL_DAYS_AHEAD = 7;

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

// "Today", then "Thu 8", "Fri 9", ... - short enough that a week of pills stays scannable.
function dayLabel(dateStr) {
    if (dateStr === today) return 'Today';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {weekday: 'short'}) + ' ' + d.getDate();
}

// Rebuilt every refresh (cheap - matches is already in memory, nothing new to fetch) so a
// fixture that gets added/rescheduled mid-session still shows up without a page reload.
// Hidden entirely when there's nothing to pick between (today's the only day with games).
function buildCarousel() {
    const carousel = document.getElementById('dateCarousel');
    if (!carousel) return;

    const maxDate = new Date(today + 'T00:00:00');
    maxDate.setDate(maxDate.getDate() + CAROUSEL_DAYS_AHEAD);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const datesWithGames = Array.from(new Set(
        matches.map(m => m.date).filter(d => d >= today && d <= maxDateStr)
    )).sort();

    carousel.innerHTML = '';
    datesWithGames.forEach(dateStr => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'date-carousel__pill' + (dateStr === selectedDate ? ' date-carousel__pill--active' : '');
        pill.textContent = dayLabel(dateStr);
        pill.onclick = function() {
            selectedDate = dateStr;
            renderDay();
            buildCarousel(); // only to move the active-pill highlight to the new selection
        };
        carousel.appendChild(pill);
    });
    carousel.style.display = datesWithGames.length > 1 ? '' : 'none';
}

// Renders whichever day is currently selected - split out from refresh() so clicking a
// carousel pill can re-render instantly from already-fetched data, no extra request.
function renderDay() {
    const dayMatches = matches.filter(match => match.date === selectedDate).sort(GetSortOrderRev("time"));

    const container = document.getElementById("head");
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.textContent = 'No F-Liiga matches on ' + dayLabel(selectedDate) + '.';
        emptyState.style.display = dayMatches.length === 0 ? "block" : "none";
    }

    // Switching days (unlike a same-day 15s refresh) means the previously-rendered rows
    // belong to a different day entirely - drop anything not in the newly selected day's
    // match set before re-adding, instead of letting stale rows pile up alongside new ones.
    const dayMatchIds = new Set(dayMatches.map(m => m.match_id));
    Array.from(container.children).forEach(row => {
        if (!dayMatchIds.has(row.dataset.matchId)) {
            row.remove();
        }
    });

    dayMatches.forEach(match => {
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
}

function refresh() {
    Promise.all(FETCH_URLS.map(url => fetch(url).then(response => response.json())))
        .then(results => {
            matches = results.flatMap(data => data.matches || []);
            buildCarousel();
            renderDay();
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
