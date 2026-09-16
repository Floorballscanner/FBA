
// Fetches a pre-computed F-Liiga stats table (team/player/goalie) from
// /accounts/fliiga_stats_api/ and renders it. All the heavy computation
// happens ahead of time via the compute_fliiga_stats management command —
// this script just displays whatever's cached.

const TABLE_COLUMNS = {
    teams: [
        ['team_name', 'string', 'Team'],
        ['Games', 'number', 'Games'],
        ['GF', 'number', 'GF'],
        ['GA', 'number', 'GA'],
        ['GDiff', 'number', 'GDiff'],
        ['SF', 'number', 'SF'],
        ['SA', 'number', 'SA'],
        ['SDiff', 'number', 'SDiff'],
        ['xGF', 'number', 'xGF'],
        ['xGA', 'number', 'xGA'],
        ['xGDiff', 'number', 'xGDiff'],
        ['xGperc', 'number', 'xG%'],
        ['xGOTF', 'number', 'xGOTF'],
        ['xGOTA', 'number', 'xGOTA'],
        ['xGOTperc', 'number', 'xGOT%'],
        ['xGFPP', 'number', 'xGFPP'],
        ['xGAPP', 'number', 'xGAPP'],
        ['xGF6v5', 'number', 'xGF6v5'],
        ['xGA6v5', 'number', 'xGA6v5'],
        ['PPperc', 'number', 'PP%'],
        ['SHperc', 'number', 'SH%'],
        ['GFAxG', 'number', 'GFAxG'],
        ['GAAxG', 'number', 'GAAxG'],
    ],
    players: [
        ['Name', 'string', 'Player'],
        ['Team', 'string', 'Team'],
        ['Nr', 'string', 'Nr'],
        ['Games', 'number', 'Games'],
        ['G', 'number', 'G'],
        ['A', 'number', 'A'],
        ['P', 'number', 'P'],
        ['S', 'number', 'S'],
        ['SM', 'number', 'SM'],
        ['plus_minus', 'number', '+/-'],
        ['xG5v5', 'number', 'xG5v5'],
        ['xGOT5v5', 'number', 'xGOT5v5'],
        ['xGPP', 'number', 'xGPP'],
        ['xGOTPP', 'number', 'xGOTPP'],
        ['xGSH', 'number', 'xGSH'],
        ['xGOTSH', 'number', 'xGOTSH'],
        ['xG6v5', 'number', 'xG6v5'],
        ['xGOT6v5', 'number', 'xGOT6v5'],
        ['GAxG', 'number', 'GAxG'],
    ],
    goalies: [
        ['Name', 'string', 'Goalie'],
        ['Team', 'string', 'Team'],
        ['Games', 'number', 'Games'],
        ['xGOTA', 'number', 'xGOTA'],
        ['GA', 'number', 'GA'],
        ['SA', 'number', 'SA'],
        ['Saves', 'number', 'Saves'],
        ['GSAx', 'number', 'GSAx'],
        ['GSAxPerGame', 'number', 'GSAx/Game'],
    ],
};

// Explains every column abbreviation, same idea as the legend on the
// per-game live/results pages.
const TABLE_LEGENDS = {
    teams: '<b>GF/GA/GDiff</b> = Goals for/against/differential, '
        + '<b>SF/SA/SDiff</b> = Shots for/against/differential, '
        + '<b>xGF/xGA/xGDiff</b> = expected Goals for/against/differential, '
        + '<b>xG%</b> = share of combined xG this team created, '
        + '<b>xGOTF/xGOTA/xGOT%</b> = same, using only on-target shots, '
        + '<b>xGFPP</b> = expected Goals created while on a powerplay, '
        + '<b>xGAPP</b> = opponents\' expected Goals while this team was shorthanded, '
        + '<b>xGF6v5</b> = expected Goals created with this team\'s own goalie pulled, '
        + '<b>xGA6v5</b> = opponents\' expected Goals while their goalie was pulled against this team, '
        + '<b>PP%</b> = percentage of powerplays that ended in a goal, '
        + '<b>SH%</b> = percentage of shorthanded situations the opponent failed to score in, '
        + '<b>GFAxG/GAAxG</b> = Goals minus expected Goals, for/against.',
    players: '<b>Nr</b> = Shirt number, '
        + '<b>G/A/P</b> = Goals/Assists/Points, '
        + '<b>S</b> = Shots (on target and missed), '
        + '<b>SM</b> = Shots that missed the target, '
        + '<b>+/-</b> = On-field goals for/against, '
        + '<b>xG5v5/xGOT5v5</b> = expected Goals at even strength (all shots / on-target shots only), '
        + '<b>xGPP/xGOTPP</b> = same, while on a powerplay, '
        + '<b>xGSH/xGOTSH</b> = same, while shorthanded, '
        + '<b>xG6v5/xGOT6v5</b> = same, with this player\'s own goalie pulled, '
        + '<b>GAxG</b> = Goals minus expected Goals (all situations).',
    goalies: '<b>xGOTA</b> = expected Goals (on-target shots) faced, '
        + '<b>GA</b> = Goals allowed, '
        + '<b>SA</b> = Shots on target faced, '
        + '<b>Saves</b> = Shots saved, '
        + '<b>GSAx</b> = Goals Saved above expected (xGOTA minus GA), '
        + '<b>GSAx/Game</b> = GSAx per game played.',
};

// F-Liiga Live/Trial tier users only get season FLIIGA_TEASER_SEASON for free - other
// seasons show the upgrade CTA instead of loading real stats. fliiga_stats_api enforces
// this server-side too (see accounts/views.py _fliiga_season_locked); this is just so the
// page doesn't even bother asking before showing the CTA.
const FLIIGA_TEASER_TIERS = ['fliiga', 'fliiga_trial'];
const FLIIGA_TEASER_SEASON = '2024-2025';

function isFliigaSeasonLocked(season) {
    const tierEl = document.getElementById('license_tier');
    const tier = tierEl ? JSON.parse(tierEl.textContent) : null;
    return FLIIGA_TEASER_TIERS.includes(tier) && season !== FLIIGA_TEASER_SEASON;
}

function maybeLoadStats() {

    const league = document.getElementById('select-league').value;
    const season = document.getElementById('select-season').value;
    const stage = document.getElementById('select-stage').value;
    const table = document.getElementById('select-table').value;

    if (!league || !season || !stage || !table) {
        return;
    }

    const cta = document.getElementById('fliiga-teaser-cta');
    if (isFliigaSeasonLocked(season)) {
        if (cta) cta.style.display = "block";
        document.getElementById('pending-message').style.display = "none";
        document.getElementById('stats-meta').style.display = "none";
        document.getElementById('stats-legend').style.display = "none";
        document.getElementById('stats_table').innerHTML = "";
        return;
    }
    if (cta) cta.style.display = "none";

    loadStats(season, league, stage, table);
}

function loadStats(season, category, stage, table) {

    const pendingMessage = document.getElementById('pending-message');
    const metaEl = document.getElementById('stats-meta');
    const legendEl = document.getElementById('stats-legend');
    const container = document.getElementById('stats_table');
    pendingMessage.style.display = "none";
    metaEl.style.display = "none";
    legendEl.style.display = "none";
    container.innerHTML = "";

    const url = "/accounts/fliiga_stats_api/?season=" + encodeURIComponent(season)
        + "&category=" + encodeURIComponent(category)
        + "&stage=" + encodeURIComponent(stage)
        + "&table=" + encodeURIComponent(table);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === "locked") {
                const cta = document.getElementById('fliiga-teaser-cta');
                if (cta) cta.style.display = "block";
                return;
            }
            if (data.status !== "ready") {
                pendingMessage.style.display = "block";
                return;
            }

            const computedAt = new Date(data.computed_at);
            metaEl.innerText = "Updated " + computedAt.toLocaleString()
                + (data.is_final ? " — final for this season/stage" : "");
            metaEl.style.display = "block";

            legendEl.innerHTML = TABLE_LEGENDS[table];
            legendEl.style.display = "block";

            const columns = TABLE_COLUMNS[table];
            const dataTable = new google.visualization.DataTable();
            columns.forEach(([key, type, label]) => dataTable.addColumn(type, label));
            data.rows.forEach(row => {
                dataTable.addRow(columns.map(([key]) => row[key]));
            });

            const options = {
                width: '100%',
                frozenColumns: 1,
            };
            const chart = new google.visualization.Table(container);
            chart.draw(dataTable, options);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
