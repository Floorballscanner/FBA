
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
        ['plus', 'number', '+'],
        ['minus', 'number', '-'],
        ['xG', 'number', 'xG'],
        ['xGOT', 'number', 'xGOT'],
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

function maybeLoadStats() {

    const league = document.getElementById('select-league').value;
    const season = document.getElementById('select-season').value;
    const stage = document.getElementById('select-stage').value;
    const table = document.getElementById('select-table').value;

    if (!league || !season || !stage || !table) {
        return;
    }

    loadStats(season, league, stage, table);
}

function loadStats(season, category, stage, table) {

    const pendingMessage = document.getElementById('pending-message');
    const metaEl = document.getElementById('stats-meta');
    const container = document.getElementById('stats_table');
    pendingMessage.style.display = "none";
    metaEl.style.display = "none";
    container.innerHTML = "";

    const url = "/accounts/fliiga_stats_api/?season=" + encodeURIComponent(season)
        + "&category=" + encodeURIComponent(category)
        + "&stage=" + encodeURIComponent(stage)
        + "&table=" + encodeURIComponent(table);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status !== "ready") {
                pendingMessage.style.display = "block";
                return;
            }

            const computedAt = new Date(data.computed_at);
            metaEl.innerText = "Updated " + computedAt.toLocaleString()
                + (data.is_final ? " — final for this season/stage" : "");
            metaEl.style.display = "block";

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
