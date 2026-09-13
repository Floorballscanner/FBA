
// F-Liiga Team Analysis page. Category -> team picker, then fetches a cached
// TeamSeasonStats row (computed ahead of time by the compute_team_stats
// management command) and renders the General Season Performance theme.

const PLAYER_METRICS = [
    ['points', 'Points'], ['goals', 'Goals'], ['assists', 'Assists'],
    ['xg', 'xG'], ['xgot', 'xGOT'], ['gaxg', 'GAxG'],
];

// Mirrors insights.lineups.ROLE_LABELS/SKATER_ROLES - left-to-right display
// order for one line (left wing, center, right wing, left D, right D).
const SKATER_ROLES = ['VL', 'KH', 'OL', 'VP', 'OP'];
const ROLE_LABELS = {
    OL: 'Right Wing', VL: 'Left Wing', KH: 'Center', VP: 'Left Defense', OP: 'Right Defense',
};

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
    renderGamesTable(facts.last_games || []);
    renderPlayerTables(facts.best_players || {});
    renderFiveVFive(facts.five_v_five || null);
}

function ordinal(n) {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return n + "st";
    if (j === 2 && k !== 12) return n + "nd";
    if (j === 3 && k !== 13) return n + "rd";
    return n + "th";
}

function perc(value) {
    return value === null || value === undefined ? "-" : (value * 100).toFixed(1) + "%";
}

function rankBadge(rankInfo) {
    if (!rankInfo) {
        return '';
    }
    return '<div class="team-kpi-tile__rank">' + ordinal(rankInfo.rank) + ' of ' + rankInfo.of + '</div>';
}

function kpiTile(label, value, rankInfo) {
    return '<div class="team-kpi-tile">'
        + '<div class="team-kpi-tile__value">' + value + '</div>'
        + '<div class="team-kpi-tile__label">' + label + '</div>'
        + rankBadge(rankInfo)
        + '</div>';
}

function renderKpiGrid(facts) {
    const ranks = facts.ranks || {};
    const tiles = [
        kpiTile("Record", facts.wins + "-" + facts.losses),
        kpiTile("Win %", perc(facts.win_perc), ranks.win_perc),
        kpiTile("Goals For / Game", facts.gf_per_game.toFixed(2), ranks.gf_per_game),
        kpiTile("Goals Against / Game", facts.ga_per_game.toFixed(2), ranks.ga_per_game),
        kpiTile("xG For / Game", facts.xgf_per_game.toFixed(2), ranks.xgf_per_game),
        kpiTile("xG Against / Game", facts.xga_per_game.toFixed(2), ranks.xga_per_game),
        kpiTile("xGOT For / Game", facts.xgotf_per_game.toFixed(2), ranks.xgotf_per_game),
        kpiTile("xGOT Against / Game", facts.xgota_per_game.toFixed(2), ranks.xgota_per_game),
        kpiTile("Powerplay %", perc(facts.pp_perc), ranks.pp_perc),
        kpiTile("Shorthanded %", perc(facts.sh_perc), ranks.sh_perc),
    ];
    document.getElementById('kpi-grid').innerHTML = tiles.join('');
}

function renderPlayerTables(bestPlayers) {
    const container = document.getElementById('players-tables');
    container.innerHTML = PLAYER_METRICS.map(([key, label]) => {
        const players = bestPlayers[key] || [];
        const rows = players.length
            ? players.map(p => '<tr><td>' + p.name + '</td><td>' + p[key] + '</td></tr>').join('')
            : '<tr><td colspan="2">No data yet.</td></tr>';
        return '<div class="team-best-players-table">'
            + '<h5>' + label + '</h5>'
            + '<table class="team-stats-table"><tr><th>Player</th><th>' + label + '</th></tr>' + rows + '</table>'
            + '</div>';
    }).join('');
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

function goalieCard(label, goalie) {
    if (!goalie) {
        return '<div class="team-goalie-card"><h5>' + label + '</h5><p class="team-goalie-card__empty">No data yet.</p></div>';
    }
    return '<div class="team-goalie-card">'
        + '<h5>' + label + '</h5>'
        + '<div class="team-goalie-card__name">' + goalie.player_name + '</div>'
        + '<div class="team-goalie-card__confidence">' + goalie.games + ' of ' + goalie.of + ' games</div>'
        + '</div>';
}

function renderHeatmap(canvas, grid) {
    const ctx = canvas.getContext('2d');
    const rows = grid.length, cols = grid[0].length;
    const cellW = canvas.width / cols, cellH = canvas.height / rows;
    const max = Math.max(1, ...grid.flat());

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const value = grid[r][c];
            const alpha = value ? 0.12 + 0.88 * (value / max) : 0;
            ctx.fillStyle = 'rgba(48, 70, 251,' + alpha + ')';
            ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
    }
    ctx.strokeStyle = 'rgba(20, 22, 31, 0.08)';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function lineCard(line) {
    const playersHtml = SKATER_ROLES.map(role => {
        const slot = line.players[role];
        const name = slot ? slot.player_name : 'Unknown';
        const confidence = slot ? slot.games + '/' + slot.of : '';
        return '<div class="team-line-slot">'
            + '<div class="team-line-slot__role">' + ROLE_LABELS[role] + '</div>'
            + '<div class="team-line-slot__name">' + name + '</div>'
            + (confidence ? '<div class="team-line-slot__confidence">' + confidence + ' games</div>' : '')
            + '</div>';
    }).join('');

    return '<div class="team-line-card">'
        + '<h5>Line ' + line.line_number + '</h5>'
        + '<div class="team-line-slots">' + playersHtml + '</div>'
        + '<div class="team-line-kpis">'
        + '<span>' + line.shots + ' shots</span>'
        + '<span>' + line.goals + ' goals</span>'
        + '<span>' + line.xg + ' xG</span>'
        + '<span>' + line.xgot + ' xGOT</span>'
        + '<span>' + line.gaxg + ' GAxG</span>'
        + '</div>'
        + '<div class="team-line-heatmaps">'
        + '<div><div class="team-line-heatmaps__label">Shots</div><canvas width="140" height="119" id="shot-heatmap-' + line.line_number + '"></canvas></div>'
        + '<div><div class="team-line-heatmaps__label">Goals</div><canvas width="140" height="119" id="goal-heatmap-' + line.line_number + '"></canvas></div>'
        + '</div>'
        + '</div>';
}

function renderFiveVFive(fivevfive) {
    const kpiGrid = document.getElementById('fivevfive-kpi-grid');
    const goaliesEl = document.getElementById('fivevfive-goalies');
    const linesEl = document.getElementById('fivevfive-lines');

    if (!fivevfive) {
        kpiGrid.innerHTML = '';
        goaliesEl.innerHTML = '<p>No 5v5 data yet.</p>';
        linesEl.innerHTML = '';
        return;
    }

    kpiGrid.innerHTML = [
        kpiTile("xG For / Game (5v5)", fivevfive.xgf_per_game.toFixed(2)),
        kpiTile("xG Against / Game (5v5)", fivevfive.xga_per_game.toFixed(2)),
        kpiTile("Goals For / Game (5v5)", fivevfive.gf_per_game.toFixed(2)),
        kpiTile("Goals Against / Game (5v5)", fivevfive.ga_per_game.toFixed(2)),
    ].join('');

    goaliesEl.innerHTML = goalieCard('Starting Goalie', fivevfive.starting_goalie)
        + goalieCard('Backup Goalie', fivevfive.backup_goalie);

    linesEl.innerHTML = fivevfive.lines.map(lineCard).join('');
    fivevfive.lines.forEach(line => {
        renderHeatmap(document.getElementById('shot-heatmap-' + line.line_number), line.shot_heatmap);
        renderHeatmap(document.getElementById('goal-heatmap-' + line.line_number), line.goal_heatmap);
    });
}
