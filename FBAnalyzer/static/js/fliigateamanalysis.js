
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
        kpiTile("GAxG For / Game", facts.gaxgf_per_game.toFixed(2), ranks.gaxgf_per_game),
        kpiTile("GAxG Against / Game", facts.gaxga_per_game.toFixed(2), ranks.gaxga_per_game),
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

function probabilityLabel(slot) {
    return Math.round(slot.probability * 100) + '% (' + slot.games + ' of ' + slot.of + ' games)';
}

function goalieCard(label, goalie) {
    if (!goalie) {
        return '<div class="team-goalie-card"><h5>' + label + '</h5><p class="team-goalie-card__empty">No data yet.</p></div>';
    }
    return '<div class="team-goalie-card">'
        + '<h5>' + label + '</h5>'
        + '<div class="team-goalie-card__name">' + goalie.player_name + '</div>'
        + '<div class="team-goalie-card__confidence">' + probabilityLabel(goalie) + '</div>'
        + '</div>';
}

// Smooth (seaborn-style) heatmaps drawn over the same rink image the live
// game shotmap uses, cropped to one attacking zone (field-half.png - the top
// half of field-new.png, goal line at the top edge). Every location_x/
// location_y pair is a soft Gaussian "splat" instead of a hard grid cell, so
// overlapping shots build up continuous density rather than blocky squares.
const HEATMAP_WIDTH = 200;
const HEATMAP_HEIGHT = 166;  // matches field-half.png's ~516:428 aspect ratio
const HEATMAP_SIGMA = 13;    // splat radius in canvas px
const HEATMAP_MAX_X = 2000;  // insights.xg_model.MAX_X - location_x spans [-1000, 1000]
const HEATMAP_HALF_COURT_Y = 1700;  // insights.xg_model.HALF_COURT_Y - location_y spans [0, 1700]

const rinkImage = new Image();
let rinkImageReady = false;
rinkImage.onload = () => { rinkImageReady = true; };
rinkImage.src = "/static/field-half.png";

function projectToHeatmap(x, y) {
    return [
        (x + HEATMAP_MAX_X / 2) / HEATMAP_MAX_X * HEATMAP_WIDTH,
        y / HEATMAP_HALF_COURT_Y * HEATMAP_HEIGHT,
    ];
}

function buildDensity(locations) {
    const density = new Float32Array(HEATMAP_WIDTH * HEATMAP_HEIGHT);
    const radius = Math.ceil(HEATMAP_SIGMA * 2.5);
    const twoSigmaSq = 2 * HEATMAP_SIGMA * HEATMAP_SIGMA;

    locations.forEach(([px, py]) => {
        const [cx, cy] = projectToHeatmap(px, py);
        const x0 = Math.max(0, Math.floor(cx - radius)), x1 = Math.min(HEATMAP_WIDTH - 1, Math.ceil(cx + radius));
        const y0 = Math.max(0, Math.floor(cy - radius)), y1 = Math.min(HEATMAP_HEIGHT - 1, Math.ceil(cy + radius));
        for (let yy = y0; yy <= y1; yy++) {
            for (let xx = x0; xx <= x1; xx++) {
                const dx = xx - cx, dy = yy - cy;
                density[yy * HEATMAP_WIDTH + xx] += Math.exp(-(dx * dx + dy * dy) / twoSigmaSq);
            }
        }
    });
    return density;
}

function renderHeatmap(canvas, locations, rgb) {
    canvas.width = HEATMAP_WIDTH;
    canvas.height = HEATMAP_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (rinkImageReady) {
        ctx.drawImage(rinkImage, 0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
    } else {
        // Background image not decoded yet (first render before onload fires) -
        // retry once it is, rather than leaving the canvas blank forever.
        rinkImage.addEventListener('load', () => renderHeatmap(canvas, locations, rgb), {once: true});
        ctx.fillStyle = '#8fb4d9';
        ctx.fillRect(0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
    }

    if (!locations.length) {
        return;
    }

    const density = buildDensity(locations);
    let max = 0;
    for (let i = 0; i < density.length; i++) {
        max = Math.max(max, density[i]);
    }
    if (max <= 0) {
        return;
    }

    const imageData = ctx.getImageData(0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
    for (let i = 0; i < density.length; i++) {
        const t = density[i] / max;
        if (t <= 0.03) {
            continue;
        }
        const alpha = Math.min(0.85, t * 1.5);
        const idx = i * 4;
        imageData.data[idx] = rgb[0] * alpha + imageData.data[idx] * (1 - alpha);
        imageData.data[idx + 1] = rgb[1] * alpha + imageData.data[idx + 1] * (1 - alpha);
        imageData.data[idx + 2] = rgb[2] * alpha + imageData.data[idx + 2] * (1 - alpha);
    }
    ctx.putImageData(imageData, 0, 0);
}

const SHOT_COLOR = [48, 70, 251];   // var(--landing-accent)
const GOAL_COLOR = [249, 115, 22];  // matches the site's existing 6v5-banner orange

function lineCard(line) {
    const playersHtml = SKATER_ROLES.map(role => {
        const slot = line.players[role];
        const name = slot ? slot.player_name : 'Unknown';
        const confidence = slot ? probabilityLabel(slot) : '';
        return '<div class="team-line-slot">'
            + '<div class="team-line-slot__role">' + ROLE_LABELS[role] + '</div>'
            + '<div class="team-line-slot__name">' + name + '</div>'
            + (confidence ? '<div class="team-line-slot__confidence">' + confidence + '</div>' : '')
            + '</div>';
    }).join('');

    return '<div class="team-line-card">'
        + '<h5>Line ' + line.line_number + '</h5>'
        + '<div class="team-line-slots">' + playersHtml + '</div>'
        + '<div class="team-line-kpis">'
        + '<span>' + line.shots + ' shots</span>'
        + '<span>' + line.goals + ' goals</span>'
        + '<span>' + line.goals_against + ' goals against (est.)</span>'
        + '<span>' + line.xg + ' xG</span>'
        + '<span>' + line.xgot + ' xGOT</span>'
        + '<span>' + line.gaxg + ' GAxG</span>'
        + '</div>'
        + '<div class="team-line-heatmaps">'
        + '<div><div class="team-line-heatmaps__label">Shots</div><canvas id="shot-heatmap-' + line.line_number + '"></canvas></div>'
        + '<div><div class="team-line-heatmaps__label">Goals</div><canvas id="goal-heatmap-' + line.line_number + '"></canvas></div>'
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
        renderHeatmap(document.getElementById('shot-heatmap-' + line.line_number), line.shot_locations, SHOT_COLOR);
        renderHeatmap(document.getElementById('goal-heatmap-' + line.line_number), line.goal_locations, GOAL_COLOR);
    });
}
