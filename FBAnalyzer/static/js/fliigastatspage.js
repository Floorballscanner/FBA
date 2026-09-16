
// Fetches a pre-computed F-Liiga stats table (team/player/goalie) from
// /accounts/fliiga_stats_api/ and renders it. All the heavy computation
// happens ahead of time via the compute_fliiga_stats management command —
// this script just displays whatever's cached.

const TABLE_COLUMNS = {
    teams: [
        ['team_name', 'string', 'Team'],
        ['Games', 'number', 'Games'],
        ['Points', 'number', 'Points'],
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
    teams: '<b>Points</b> = League points (regulation win 3, OT/SO win 2, OT/SO loss 1, regulation loss 0), '
        + '<b>GF/GA/GDiff</b> = Goals for/against/differential, '
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

// Renders a set of "TOP 3" leaderboard cards - one per stat, each showing the top 3
// rows ranked by that stat with a picture and the formatted value. Generic over `rows`
// and `cards` so teams/players/goalies can all reuse it.
// Each card: { label, direction: 'asc'|'desc', value(row), format(value), logo(row),
//              name(row), sub(row)? }. `avatarClass` (e.g. 'top3-card__logo--avatar')
// switches the image from the plain-logo treatment to a circular face-cropped one.
function renderTop3Cards(containerId, rows, cards, avatarClass) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    if (!rows || !rows.length) return;

    cards.forEach(card => {
        const ranked = rows
            .map(row => ({ row, value: card.value(row) }))
            .filter(r => Number.isFinite(r.value))
            .sort((a, b) => card.direction === 'asc' ? a.value - b.value : b.value - a.value)
            .slice(0, 3);
        if (!ranked.length) return;

        const cardEl = document.createElement('div');
        cardEl.className = 'top3-card';
        cardEl.innerHTML = '<h3 class="top3-card__title">' + card.label + '</h3>';

        ranked.forEach((entry, i) => {
            const logoUrl = card.logo(entry.row);
            const logoClasses = 'top3-card__logo' + (avatarClass ? ' ' + avatarClass : '');
            const sub = card.sub ? card.sub(entry.row) : '';
            const rowEl = document.createElement('div');
            rowEl.className = 'top3-card__row' + (i === 0 ? ' top3-card__row--first' : '');
            rowEl.innerHTML =
                '<span class="top3-card__rank">' + (i + 1) + '</span>'
                + (logoUrl ? '<img class="' + logoClasses + '" src="' + logoUrl + '" alt="">' : '<span class="' + logoClasses + '"></span>')
                + '<span class="top3-card__name">' + card.name(entry.row)
                + (sub ? '<small class="top3-card__sub">' + sub + '</small>' : '') + '</span>'
                + '<span class="top3-card__value">' + card.format(entry.value) + '</span>';
            cardEl.appendChild(rowEl);
        });

        container.appendChild(cardEl);
    });
}

const TEAM_TOP3_CARDS = [
    { label: 'Goals For / Game', direction: 'desc', value: row => row.Games ? row.GF / row.Games : NaN, format: v => v.toFixed(2), logo: row => row.crest, name: row => row.team_name },
    { label: 'Goals Against / Game', direction: 'asc', value: row => row.Games ? row.GA / row.Games : NaN, format: v => v.toFixed(2), logo: row => row.crest, name: row => row.team_name },
    { label: 'xG For / Game', direction: 'desc', value: row => row.Games ? row.xGF / row.Games : NaN, format: v => v.toFixed(2), logo: row => row.crest, name: row => row.team_name },
    { label: 'xG Against / Game', direction: 'asc', value: row => row.Games ? row.xGA / row.Games : NaN, format: v => v.toFixed(2), logo: row => row.crest, name: row => row.team_name },
    { label: 'xG %', direction: 'desc', value: row => row.Games ? row.xGperc * 100 : NaN, format: v => v.toFixed(1) + '%', logo: row => row.crest, name: row => row.team_name },
    { label: 'Points / Game', direction: 'desc', value: row => row.Games ? row.Points / row.Games : NaN, format: v => v.toFixed(2), logo: row => row.crest, name: row => row.team_name },
    { label: 'Powerplay %', direction: 'desc', value: row => row.Games ? row.PPperc * 100 : NaN, format: v => v.toFixed(1) + '%', logo: row => row.crest, name: row => row.team_name },
    { label: 'Shorthanded %', direction: 'desc', value: row => row.Games ? row.SHperc * 100 : NaN, format: v => v.toFixed(1) + '%', logo: row => row.crest, name: row => row.team_name },
];

const PLAYER_TOP3_CARDS = [
    { label: 'Goals', direction: 'desc', value: row => row.G, format: v => String(v), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'Assists', direction: 'desc', value: row => row.A, format: v => String(v), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'Points', direction: 'desc', value: row => row.P, format: v => String(v), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: '+/-', direction: 'desc', value: row => row.plus_minus, format: v => (v > 0 ? '+' + v : String(v)), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'xG', direction: 'desc', value: row => row.xG, format: v => v.toFixed(2), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'Shots', direction: 'desc', value: row => row.S, format: v => String(v), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'GAxG', direction: 'desc', value: row => row.GAxG, format: v => (v > 0 ? '+' + v.toFixed(2) : v.toFixed(2)), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'Shot %', direction: 'desc', value: row => row.S ? (row.G / row.S) * 100 : NaN, format: v => v.toFixed(1) + '%', logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
];

const GOALIE_TOP3_CARDS = [
    { label: 'GA / 60', direction: 'asc', value: row => row.PlaySeconds ? row.GA60 : NaN, format: v => v.toFixed(2), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'xGOT / 60', direction: 'desc', value: row => row.PlaySeconds ? row.xGOTA60 : NaN, format: v => v.toFixed(2), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'Save %', direction: 'desc', value: row => row.SA ? row.SavePerc * 100 : NaN, format: v => v.toFixed(1) + '%', logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
    { label: 'GSAx / 60', direction: 'desc', value: row => row.PlaySeconds ? row.GSAx60 : NaN, format: v => (v > 0 ? '+' + v.toFixed(2) : v.toFixed(2)), logo: row => row.photo, name: row => row.Name, sub: row => row.Team },
];

function loadStats(season, category, stage, table) {

    const pendingMessage = document.getElementById('pending-message');
    const metaEl = document.getElementById('stats-meta');
    const legendEl = document.getElementById('stats-legend');
    const container = document.getElementById('stats_table');
    const top3Containers = {
        teams: document.getElementById('top3-teams'),
        players: document.getElementById('top3-players'),
        goalies: document.getElementById('top3-goalies'),
    };
    pendingMessage.style.display = "none";
    metaEl.style.display = "none";
    legendEl.style.display = "none";
    container.innerHTML = "";
    Object.values(top3Containers).forEach(el => { if (el) { el.innerHTML = ""; el.style.display = "none"; } });

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

            if (table === 'teams' && top3Containers.teams) {
                renderTop3Cards('top3-teams', data.rows, TEAM_TOP3_CARDS);
                top3Containers.teams.style.display = "grid";
            }
            if (table === 'players' && top3Containers.players) {
                renderTop3Cards('top3-players', data.rows, PLAYER_TOP3_CARDS, 'top3-card__logo--avatar');
                top3Containers.players.style.display = "grid";
            }
            if (table === 'goalies' && top3Containers.goalies) {
                renderTop3Cards('top3-goalies', data.rows, GOALIE_TOP3_CARDS, 'top3-card__logo--avatar');
                top3Containers.goalies.style.display = "grid";
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
