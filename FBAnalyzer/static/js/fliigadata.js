
function calcxG(x, y) {
  let xd, yd;
  if (x > maxX / 2) { // välille 0 - 13
    xd = Math.floor((maxX - x) / maxX * 2 * 14);
    yd = Math.floor(y / maxY * 13);
  } else {
    xd = Math.floor(x / maxX * 2 * 14);
    yd = Math.floor(y / maxY * 13);
  }

  const xGOT = xGOT_matrix[xd][yd] / 100;
  const xG = xG_matrix[xd][yd] / 100;
  return [xGOT, xG];
}

function getTeam(nr) {
    temp = "";
    for (i=0;i<men_teams.length;i++) {
        if (men_teams[i,1].value == nr) {
            temp = men_teams[i,0];
        }
    }
    return temp
}

function getGameData(selectObject) {

    let gameID = selectObject.value;
    let team1nr = 3587;
    let team2nr = 2682;
    let data = 'GameID=' + gameID + '/helper/getshootings.php';
    let team1name = getTeam(team1nr);
    let team2name = getTeam(team2nr);

    fetch('https://www.tilastopalvelu.fi/fb/gameshootingmap/helper/getshootings.php', {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'http://www.tilastopalvelu.fi',
            'Referer': 'http://www.tilastopalvelu.fi/fb/gameshootingmap/?gid=3436&lang=',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: new URLSearchParams({
            'GameID': gameID
        })})

        .then(response => response.json())
        .then(temp => {

        let shots_temp = temp.map(s => ({
          UniqueID: s.UniqueID,
          ShotX: s.ShotX,
          ShotY: s.ShotY,
          GoalX: s.GoalX,
          GoalY: s.GoalY,
          PlayerID: s.PlayerID,
          Period: s.Period,
          GameTime: s.GameTime,
          LogTime: s.LogTime,
          EventType: s.EventType,
          LTeamID: s.LTeamID,
          RTeamID: s.RTeamID,
          ShootingTeamID: s.ShootingTeamID,
          ShootingPlayerID: s.ShootingPlayerID,
          BlockingPlayerID: s.BlockingPlayerID,
          Plus: s.Plus,
          Minus: s.Minus,
          Ass1Jersey: s.Ass1Jersey,
          Ass2Jersey: s.Ass2Jersey,
          Goaltype: s.Goaltype,

        }));

        let shots = new DataFrame(shots_temp);
        shots['GameTime'] = shots['GameTime'].apply(parseFloat);
        shots = shots.sort_values('GameTime');
        shots['xGOT'] = 0;
        shots['xG'] = 0;

        for (let i = 0; i < shots.length; i++) {
          let x = parseFloat(shots.loc[i]['ShotX']);
          if (x === 512) {
            x = 513;
          }
          let y = parseFloat(shots.loc[i]['ShotY']);
          let [xGOT, xG] = calcxG(x, y);
          if (shots.loc[i]['EventType'] === '1' || shots.loc[i]['EventType'] === '2') {
            shots.loc[i]['xGOT'] = xGOT;
          } else {
            shots.loc[i]['xGOT'] = 0;
          }
          shots.loc[i]['xG'] = xG;
        }

        let team1 = shots.filter(s => s['ShootingTeamID'] === team1nr);
        let team2 = shots.filter(s => s['ShootingTeamID'] === team2nr);

        let team1xGot = shots.filter(s => s['ShootingTeamID'] === team1nr && (s['EventType'] === '1' || s['EventType'] === '2'));
        let team2xGot = shots.filter(s => s['ShootingTeamID'] === team2nr && (s['EventType'] === '1' || s['EventType'] === '2'));

        let team1xGmis = shots.filter(s => s['ShootingTeamID'] === team1nr && s['EventType'] === '0');
        let team2xGmis = shots.filter(s => s['ShootingTeamID'] === team2nr && s['EventType'] === '0');

        let team1saxG = shots.filter(s => s['ShootingTeamID'] === team1nr && s['EventType'] === '2');
        let team2saxG = shots.filter(s => s['ShootingTeamID'] === team2nr && s['EventType'] === '2');

        let team1goxG = shots.filter(s => s['ShootingTeamID'] === team1nr && s['EventType'] === '1');
        let team2goxG = shots.filter(s => s['ShootingTeamID'] === team2nr && s['EventType'] === '1');

        let team1xG = Math.round(team1.reduce((acc, s) => acc + s['xG'], 0) * 100) / 100;
        let team2xG = Math.round(team2.reduce((acc, s) => acc + s['xG'], 0) * 100) / 100;

        let team1ot = Math.round(team1xGot.reduce((acc, s) => acc + s['xGOT'], 0) * 100) / 100;
        let team2ot = Math.round(team2xGot.reduce((acc, s) => acc + s['xGOT'], 0) * 100) / 100;

        let team1otshots = team1xGot.length;
        let team2otshots = team2xGot.length;

        let team1mis = Math.round(team1xGmis.reduce((acc, s) => acc + s['xG'], 0) * 100) / 100;
        let team2mis = Math.round(team2xGmis.reduce((acc, s) => acc + s['xG'], 0) * 100) / 100;

        let team1sav = Math.round(team1saxG.reduce((acc, s) => acc + s['xG'], 0) * 100) / 100;
        let team2sav = Math.round(team2saxG.reduce((acc, s) => acc + s['xG'], 0) * 100) / 100;

        let team1go = team1goxG.length;
        let team2go = team2goxG.length;

        let time = parseInt(shots['GameTime'][shots.length - 1]) / 60;
        let hours = parseInt(time);
        let minutes = (time * 60) % 60;
        let seconds = (time * 3600) % 60;

        document.getElementById('fltotg_1').innerHTML = team1go;
        document.getElementById('fltotg_2').innerHTML = team2go;
        document.getElementById('fltotxG_1').innerHTML = team1ot;
        document.getElementById('fltotxG_2').innerHTML = team2ot;
        document.getElementById('flt1name1').innerHTML = team1name;
        document.getElementById('flt1name2').innerHTML = team2name;
        document.getElementById('fldate').innerHTML = '18.2.2023';
        });
}




