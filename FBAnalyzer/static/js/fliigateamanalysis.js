
// F-Liiga Team Analysis page. Category -> team picker, then fetches a cached
// TeamSeasonStats row (computed ahead of time by the compute_team_stats
// management command) and renders the General Season Performance theme.

function onCategoryChange() {
    const category = document.getElementById('select-category').value;
    const teamSelect = document.getElementById('select-team');
    teamSelect.innerHTML = '<option value="" selected disabled>Loading...</option>';
    teamSelect.disabled = true;
    hideStats();

    if (!category) {
        return;
    }

    fetch("/accounts/fliiga_team_list_api/?category=" + encodeURIComponent(category))
        .then(response => response.json())
        .then(data => {
            teamSelect.innerHTML = '';
            const placeholder = document.createElement('option');
            placeholder.value = "";
            placeholder.selected = true;
            placeholder.disabled = true;
            placeholder.innerText = "Select a team...";
            teamSelect.appendChild(placeholder);

            (data.teams || []).forEach(team => {
                const opt = document.createElement('option');
                opt.value = team.team_id;
                opt.innerText = team.team_name;
                teamSelect.appendChild(opt);
            });
            teamSelect.disabled = false;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function maybeLoadTeamStats() {
    const teamId = document.getElementById('select-team').value;
    const category = document.getElementById('select-category').value;
    const season = document.getElementById('select-season').value;
    const stage = document.getElementById('select-stage').value;

    if (!teamId || !category || !season || !stage) {
        return;
    }

    loadTeamStats(teamId, category, season, stage);
}

function hideStats() {
    document.getElementById('team-stats').style.display = "none";
    document.getElementById('pending-message').style.display = "none";
    document.getElementById('empty-message').style.display = "block";
}

function loadTeamStats(teamId, category, season, stage) {
    const emptyMessage = document.getElementById('empty-message');
    const pendingMessage = document.getElementById('pending-message');
    const statsEl = document.getElementById('team-stats');
    emptyMessage.style.display = "none";
    pendingMessage.style.display = "none";
    statsEl.style.display = "none";

    const url = "/accounts/fliiga_team_stats_api/?team_id=" + encodeURIComponent(teamId)
        + "&category=" + encodeURIComponent(category)
        + "&season=" + encodeURIComponent(season)
        + "&stage=" + encodeURIComponent(stage);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status !== "ready") {
                pendingMessage.style.display = "block";
                return;
            }

            renderTeamStats(data);
            statsEl.style.display = "block";
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function renderTeamStats(data) {
    const facts = data.facts;

    const computedAt = new Date(data.computed_at);
    document.getElementById('stats-meta').innerText = data.team_name + " - Updated " + computedAt.toLocaleString();

    renderKpiGrid(facts);
    renderPlayersTable(facts.best_players || []);
    renderGamesTable(facts.last_games || []);
}

function kpiTile(label, value) {
    return '<div class="team-kpi-tile">'
        + '<div class="team-kpi-tile__value">' + value + '</div>'
        + '<div class="team-kpi-tile__label">' + label + '</div>'
        + '</div>';
}

function perc(value) {
    return value === null || value === undefined ? "-" : (value * 100).toFixed(1) + "%";
}

function renderKpiGrid(facts) {
    const tiles = [
        kpiTile("Record", facts.wins + "-" + facts.losses),
        kpiTile("Win %", perc(facts.win_perc)),
        kpiTile("Goals For / Game", facts.gf_per_game.toFixed(2)),
        kpiTile("Goals Against / Game", facts.ga_per_game.toFixed(2)),
        kpiTile("xG For / Game", facts.xgf_per_game.toFixed(2)),
        kpiTile("xG Against / Game", facts.xga_per_game.toFixed(2)),
        kpiTile("xGOT For / Game", facts.xgotf_per_game.toFixed(2)),
        kpiTile("xGOT Against / Game", facts.xgota_per_game.toFixed(2)),
        kpiTile("Powerplay %", perc(facts.pp_perc)),
        kpiTile("Shorthanded %", perc(facts.sh_perc)),
    ];
    document.getElementById('kpi-grid').innerHTML = tiles.join('');
}

function renderPlayersTable(players) {
    const columns = [
        ['name', 'Player'], ['points', 'P'], ['goals', 'G'], ['assists', 'A'],
        ['xg', 'xG'], ['xgot', 'xGOT'], ['gaxg', 'GAxG'],
    ];
    const table = document.getElementById('players-table');
    if (!players.length) {
        table.innerHTML = '<tr><td>No player data yet.</td></tr>';
        return;
    }
    let html = '<tr>' + columns.map(([key, label]) => '<th>' + label + '</th>').join('') + '</tr>';
    players.forEach(p => {
        html += '<tr>' + columns.map(([key]) => '<td>' + p[key] + '</td>').join('') + '</tr>';
    });
    table.innerHTML = html;
}

function renderGamesTable(games) {
    const columns = [
        ['date', 'Date'], ['opponent', 'Opponent'], ['result', 'Result'],
        ['score_for', 'GF'], ['score_against', 'GA'], ['xg_for', 'xGF'], ['xg_against', 'xGA'],
    ];
    const table = document.getElementById('games-table');
    if (!games.length) {
        table.innerHTML = '<tr><td>No games played yet.</td></tr>';
        return;
    }
    let html = '<tr>' + columns.map(([key, label]) => '<th>' + label + '</th>').join('') + '</tr>';
    games.forEach(g => {
        html += '<tr>' + columns.map(([key]) => '<td>' + g[key] + '</td>').join('') + '</tr>';
    });
    table.innerHTML = html;
}
