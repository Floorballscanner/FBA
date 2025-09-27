// This file contains the script for updating the live game stream page with live game data

// Creates the HTML - page when the window is loaded

window.onload = function() {

}

// --- "importit" / tuonnit ---

// Matalan tason funktiot JS:ssä
function floor(x) {
    return Math.floor(x);
}

function round(x, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round(x * factor) / factor;
}

// Parametrit
const maxY = 1700;
const maxX = 2000;

// Funktiot laskemaan xG ja xGOT
function calcxG(x, y) {
    x = 1000 + x;
    if (y >= maxY) {
        y = maxY - 1;
    }
    const yd = 2 + floor(y / maxY * 12);
    const xd = floor(x / maxX * 12);
    const xGOT = xGOT_matrix[yd][xd] / 100;
    const xG = xG_matrix[yd][xd] / 100;
    return { xGOT, xG };
}

// (Vastaava naisversio, jos käytössä)
function calcxGW(x, y, xGOT_matrix_women, xG_matrix_women) {
    x = 1000 + x;
    if (y >= maxY) {
        y = maxY - 1;
    }
    const yd = 2 + floor(y / maxY * 12);
    const xd = floor(x / maxX * 12);
    const xGOT = xGOT_matrix_women[yd][xd] / 100;
    const xG = xG_matrix_women[yd][xd] / 100;
    return { xGOT, xG };
}

async function fetchMatches() {
    const url = `https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key=${api_key}&season_id=2025-2026&competition_id=${comp_id}&category_id=${cat_id}&group_id=${group_id}`;
    const resp = await fetch(url);
    const temp = await resp.json();
    return temp.matches;
}

async function fetchTeams() {
    const url = `https://salibandy.api.torneopal.com/taso/rest/getTeams?api_key=${api_key}&competition_id=${comp_id}&category_id=${cat_id}`;
    const resp = await fetch(url);
    const temp = await resp.json();
    return temp.teams;
}

async function fetchMatchEvents(matchId) {
    const url = `https://salibandy.api.torneopal.com/taso/rest/getMatch?api_key=${api_key}&match_id=${matchId}`;
    const resp = await fetch(url);
    const temp = await resp.json();
    return temp.match.events;
}

// Pääfunktio, joka yhdistää kaiken
async function main() {
    const matches = await fetchMatches();
    const teams = await fetchTeams();

    // Tallennetaan tapahtumat
    let allEvents = [];
    for (const match of matches) {
        if (match.status === "Played") {
            const events = await fetchMatchEvents(match.match_id);
            // liitä match_id jokaiseen eventiin
            for (const e of events) {
                e.match_id = match.match_id;
            }
            allEvents = allEvents.concat(events);
        }
    }

    // Suodata pois ei‑halutut kentät (voit tehdä kopioita)
    const shots = allEvents.filter(ev => {
        return ["laukausohi", "laukausblokattu", "laukausmaali", "laukaus"]
            .includes(ev.code);
    });

    // Lisää xG ja xGOT arvoiksi 0 alustuksena
    for (const shot of shots) {
        shot.xGOT = 0;
        shot.xG = 0;
    }

    // Laske xG/xGOT jokaiselle laukaukselle
    for (const shot of shots) {
        let [xs, ys] = [0, 0];
        if (shot.location) {
            const parts = shot.location.split(',');
            if (parts.length === 2) {
                xs = parseFloat(parts[0]);
                ys = parseFloat(parts[1]);
            }
        }
        let res;
        if (cat_id !== '384') {
            res = calcxG(xs, ys);
        } else {
            // oletetaan että sinulla on naisversiot matriiseista
            // res = calcxGW(xs, ys, xGOT_matrix_women, xG_matrix_women);
            res = calcxG(xs, ys);  // väliaikainen fallback
        }
        if (shot.code === 'laukaus' || shot.code === 'laukausmaali') {
            shot.xGOT = res.xGOT;
        } else {
            shot.xGOT = 0;
        }
        shot.xG = res.xG;
    }

    // Rakennetaan “ottelut” vastaava data‐rakenne
    const matchesPlayed = matches.filter(m => m.status === "Played");

    // Lisätään kenttiä otteluille
    for (const m of matchesPlayed) {
        m.S_A = 0; m.S_B = 0;
        m.G_A = 0; m.G_B = 0;
        m.xG_A = 0; m.xG_B = 0;
        m.xGOT_A = 0; m.xGOT_B = 0;
    }

    // Täytetään otteluiden tiedot
    for (const m of matchesPlayed) {
        const mid = m.match_id;
        const matchShots = shots.filter(s => s.match_id === mid);

        const sA = matchShots.filter(s => s.team_id === m.team_A_id);
        const sB = matchShots.filter(s => s.team_id === m.team_B_id);

        const gA = sA.filter(s => s.code === 'laukausmaali');
        const gB = sB.filter(s => s.code === 'laukausmaali');

        let xGOT_a = 0, xG_a = 0, xGOT_b = 0, xG_b = 0;
        for (const s of sA) {
            xGOT_a += s.xGOT;
            xG_a += s.xG;
        }
        for (const s of sB) {
            xGOT_b += s.xGOT;
            xG_b += s.xG;
        }

        m.xG_A = round(xG_a, 2);
        m.xG_B = round(xG_b, 2);
        m.xGOT_A = round(xGOT_a, 2);
        m.xGOT_B = round(xGOT_b, 2);

        m.S_A = sA.length;
        m.S_B = sB.length;
        m.G_A = gA.length;
        m.G_B = gB.length;
    }

    // Tiimitilastot
    const teamStats = teams.map(team => {
        return {
            team_id: team.team_id,
            team_name: team.team_name,
            Games: 0,
            GF: 0, GA: 0,
            GDiff: 0,
            SF: 0, SA: 0,
            SDiff: 0,
            xGF: 0, xGA: 0,
            xGDiff: 0,
            xGperc: 0,
            xGOTF: 0, xGOTA: 0,
            xGOTperc: 0,
            GFAxG: 0,
            GAAxG: 0,
        };
    });

    for (const ts of teamStats) {
        for (const m of matchesPlayed) {
            if (m.team_A_name === ts.team_name) {
                ts.Games += 1;
                ts.GF += m.G_A;
                ts.GA += m.G_B;
                ts.SF += m.S_A;
                ts.SA += m.S_B;
                ts.xGF += m.xG_A;
                ts.xGA += m.xG_B;
                ts.xGOTF += m.xGOT_A;
                ts.xGOTA += m.xGOT_B;
            }
            if (m.team_B_name === ts.team_name) {
                ts.Games += 1;
                ts.GF += m.G_B;
                ts.GA += m.G_A;
                ts.SF += m.S_B;
                ts.SA += m.S_A;
                ts.xGF += m.xG_B;
                ts.xGA += m.xG_A;
                ts.xGOTF += m.xGOT_B;
                ts.xGOTA += m.xGOT_A;
            }
        }
        ts.xGDiff = ts.xGF - ts.xGA;
        ts.xGperc = round(ts.xGF / (ts.xGF + ts.xGA), 2);
        ts.GFAxG = ts.GF - ts.xGF;
        ts.GAAxG = ts.GA - ts.xGA;
        ts.SDiff = ts.SF - ts.SA;
        ts.GDiff = ts.GF - ts.GA;
        ts.xGOTperc = round(ts.xGOTF / (ts.xGOTF + ts.xGOTA), 2);
    }

    // Sorttaus xGDiff suuruusjärjestykseen laskevasti
    teamStats.sort((a, b) => b.xGDiff - a.xGDiff);

    console.log(teamStats);
}

function selectMen() {

    api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
    comp_id = 'sb2025';
    cat_id = '402';
    group_id = '1';

    main().catch(err => console.error(err));

    var st_teamchart = new google.visualization.DataTable();
    st_teamchart.addColumn('string', 'Team');
    st_teamchart.addColumn('string', 'Games');
    st_teamchart.addColumn('number', 'GF');
    st_teamchart.addColumn('number', 'GA');
    st_teamchart.addColumn('number', 'GDiff');
    st_teamchart.addColumn('number', 'SF');
    st_teamchart.addColumn('number', 'SA');
    st_teamchart.addColumn('number', 'SDiff');
    st_teamchart.addColumn('number', 'xGF');
    st_teamchart.addColumn('number', 'xGA');
    st_teamchart.addColumn('number', 'xGDiff');
    st_teamchart.addColumn('number', 'xG%');
    st_teamchart.addColumn('number', 'xGOTF');
    st_teamchart.addColumn('number', 'xGOTA');
    st_teamchart.addColumn('number', 'xGOT%');
    st_teamchart.addColumn('number', 'GFAxG');
    st_teamchart.addColumn('number', 'GAAxG');

    teamStats.forEach(team => {
        st_teamchart.addRow([team.team_name, team.Games, team.GF, team.GA, team.GDiff, team.SF, team.SA, team.SDiff,
                             team.xGF, team.xGA, team.xGDiff, geam.xG%, team.XGOTF, team.xGOTA, team.xGOT%, team.GFAxG, team.GAAxG]);
    });

}

function selectWomen() {

    s_game.innerHTML = "";
    opt = new Option("Select a game...");
    s_game.appendChild(opt);

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2025-2026&competition_id=sb2025&category_id=384&group_id=1")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            matches_json = data.matches;

/*            fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2024-2025&competition_id=sb2024&category_id=384&group_id=2")
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        matches_json = matches_json.concat(data.matches);*/

                        matches_json.sort(GetSortOrder("date"));

                        // List of keys you want to select from matches_json
                        const selectedKeys = ['match_id','match_number','category_name','date','time','team_A_id','team_A_name','team_B_id','team_B_name','status'];

                        // Create a new array to store the modified JSON objects
                        const modifiedMatches = [];

                        // Iterate through matches_json and create new objects with selected keys
                        matches_json.forEach(match => {
                          const modifiedMatch = {};
                          selectedKeys.forEach(key => {
                            if (match.hasOwnProperty(key)) {
                              modifiedMatch[key] = match[key];
                            }
                          });
                          modifiedMatches.push(modifiedMatch);
                        });

                        matches = modifiedMatches;

                        for (let j=0; j<matches.length; j++) {
                            if (matches[j].status == 'Played') {
                                opt = new Option(matches[j].date + " | "  + matches[j].team_A_name + " - " + matches[j].team_B_name, matches[j].match_id);
                                s_game.appendChild(opt);
                            }
                        }
                        console.log('Success:', data);

/*                        })

                    .catch((error) => {
                          console.error('Error:', error);
                    });*/
        })
        .catch((error) => {
          console.error('Error:', error);
    });
}

function selectID() {

    s_game.innerHTML = "";
    opt = new Option("Select a game...");
    s_game.appendChild(opt);

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2025-2026&competition_id=sb2025&category_id=444&group_id=1")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            matches_json = data.matches;

            matches_json.sort(GetSortOrder("date"));

            // List of keys you want to select from matches_json
            const selectedKeys = ['match_id','match_number','category_name','date','time','team_A_id','team_A_name','team_B_id','team_B_name','status'];

            // Create a new array to store the modified JSON objects
            const modifiedMatches = [];

            // Iterate through matches_json and create new objects with selected keys
            matches_json.forEach(match => {
              const modifiedMatch = {};
              selectedKeys.forEach(key => {
                if (match.hasOwnProperty(key)) {
                  modifiedMatch[key] = match[key];
                }
              });
              modifiedMatches.push(modifiedMatch);
            });

            matches = modifiedMatches;

            for (let j=0; j<matches.length; j++) {
                if (matches[j].status == 'Played') {
                    opt = new Option(matches[j].date + " | "  + matches[j].team_A_name + " - " + matches[j].team_B_name, matches[j].match_id);
                    s_game.appendChild(opt);
                }
            }
            console.log('Success:', data);

            })

        .catch((error) => {
              console.error('Error:', error);
        });

}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
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

// xG mapping matrix ON Target

let xGOT_matrix = [           // This is the xGOT matrix

    [ 0.01, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.01, 0.01, 0.01],
    [0.0, 0.0, 10, 10, 16.67, 66.67, 16.67, 16.67, 16.67, 10, 10, 0.0, 0.0],
    [ 2, 2,13,14,29,38,64,38,29,14,13, 2, 2],
    [ 4, 5,15,19,29,48,50,48,29,19,15, 5, 4],
    [ 5, 8,18,20,23,32,38,32,23,20,18, 8, 5],
    [ 7,12,16,22,26,32,36,32,26,22,16,12, 7],
    [ 8,13,16,18,25,29,33,29,25,18,16,13, 8],
    [ 9,15,16,23,27,31,32,31,27,23,16,15, 9],
    [12,14,16,19,23,29,30,29,23,19,16,14,12],
    [13,14,15,18,22,26,28,26,22,18,15,14,13],
    [13,13,13,16,21,25,25,25,21,16,13,13,13],
    [10,11,12,15,19,20,21,20,19,15,12,11,10],
    [ 7, 9,11,13,15,17,19,17,15,13,11, 9, 7],
    [ 5, 7,9,11,13,15,17,15,13,11,9, 7, 5],

    ];

let xG_matrix = [     // This is the xG matrix
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.0, 0.0, 17, 17, 17, 40.0, 40.0, 40.0, 40.0, 0.0, 25.0, 0.0, 0.0],
    [1, 1, 7, 14, 20, 30, 54, 30, 20, 14, 7, 1, 1],
    [2, 3, 8, 10, 16, 30, 30, 30, 16, 10, 8, 3, 2],
    [3, 4, 10, 11, 12, 17, 21, 17, 12, 11, 10, 4, 3],
    [4, 7, 9, 12, 14, 17, 19, 17, 14, 12, 9, 6, 4],
    [4, 7, 9, 10, 14, 16, 18, 16, 14, 10, 9, 7, 4],
    [5, 8, 9, 12, 15, 17, 17, 17, 15, 12, 9, 8, 5],
    [7, 8, 9, 10, 12, 16, 16, 16, 12, 10, 9, 8, 7],
    [7, 8, 8, 10, 12, 14, 15, 14, 12, 10, 8, 8, 7],
    [7, 7, 7, 9, 11, 14, 14, 14, 11, 9, 7, 7, 7],
    [5, 6, 7, 8, 10, 11, 11, 11, 10, 8, 7, 6, 5],
    [4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4],
    [3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3],

    ];

let xG_matrix_women = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 12, 17, 19, 25, 35, 42, 30, 21, 16, 13, 9, 2],
    [3, 8, 14, 20, 27, 41, 43, 36, 23, 17, 11, 6, 2],
    [1, 3, 8, 13, 22, 29, 32, 27, 19, 11, 7, 3, 1],
    [1, 4, 7, 13, 18, 24, 25, 22, 15, 10, 6, 4, 1],
    [1, 4, 7, 10, 15, 18, 20, 17, 12, 8, 5, 3, 1],
    [1, 4, 6, 9, 12, 14, 14, 12, 9, 6, 4, 3, 1],
    [1, 3, 5, 7, 8, 11, 11, 9, 7, 6, 4, 3, 1],
    [1, 3, 4, 5, 6, 8, 8, 7, 6, 5, 4, 2, 1],
    [1, 2, 4, 4, 5, 6, 6, 6, 5, 5, 4, 2, 1],
    [1, 2, 4, 4, 4, 5, 5, 5, 5, 4, 3, 2, 1],
    [1, 3, 4, 4, 4, 4, 5, 5, 5, 4, 3, 2, 1],
    [1, 3, 4, 3, 3, 4, 4, 4, 3, 2, 2, 1, 0]
];

let xGOT_matrix_women = [

    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 2, 5, 7, 15, 31, 40, 29, 17, 10, 5, 2, 0],
    [1, 4, 9, 17, 26, 39, 44, 37, 25, 17, 9, 3, 1],
    [1, 5, 14, 20, 30, 35, 37, 33, 27, 19, 13, 5, 1],
    [2, 7, 12, 21, 27, 33, 34, 31, 25, 19, 13, 7, 2],
    [3, 8, 14, 19, 25, 29, 31, 29, 23, 17, 12, 7, 2],
    [3, 8, 15, 19, 24, 26, 27, 25, 21, 15, 11, 11, 7],
    [3, 8, 13, 18, 20, 24, 25, 22, 18, 15, 11, 11, 16],
    [3, 6, 11, 15, 18, 20, 23, 20, 17, 15, 12, 10, 6],
    [2, 6, 10, 13, 15, 18, 20, 19, 16, 14, 10, 6, 2],
    [2, 7, 11, 12, 14, 16, 19, 18, 15, 12, 9, 6, 2],
    [3, 8, 11, 10, 12, 14, 16, 16, 14, 9, 7, 5, 2],
    [2, 6, 6, 6, 7, 9, 10, 11, 8, 5, 3, 3, 2]


        ];
