
// This file contains the JSON for live data

function updateLive() {

    data = {
      "date": today,
      "periodNr": periodN,
      "gameClock": gameCounter,
      "periodClock": counter,
      "teams": [
        {
          "name": name_t1,
          "lineOn": line_on,
          "possessionPeriod": Pos_p[7],
          "possessionGame": Pos_g[7],
          "goalsPeriod": ~~gfTeamp.innerHTML,
          "goalsGame": ~~gfTeamg.innerHTML,
          "xGPeriod": xGf_p[7],
          "xGGame": xGf_g[7],
          "lines": [
            {
                "name": "Line 1",
                "possessionPeriod": Pos_p[0],
                "possessionGame": Pos_g[0],
                "gfPeriod": ~~gfL1p.innerHTML,
                "gfGame": ~~gfL1g.innerHTML,
                "gaPeriod": ~~gaL1p.innerHTML,
                "gaGame": ~~gaL1g.innerHTML,
                "TOCPeriod": Toc_p[0],
                "TOCGame": Toc_g[0],
                "xGfPeriod": xGf_p[0],
                "xGfGame": xGf_g[0],
                "xGaPeriod": xGa_p[0],
                "xGaGame": xGa_g[0],
            },
            {
                "name": "Line 2",
                "possessionPeriod": Pos_p[1],
                "possessionGame": Pos_g[1],
                "gfPeriod": ~~gfL2p.innerHTML,
                "gfGame": ~~gfL2g.innerHTML,
                "gaPeriod": ~~gaL2p.innerHTML,
                "gaGame": ~~gaL2g.innerHTML,
                "TOCPeriod": Toc_p[1],
                "TOCGame": Toc_g[1],
                "xGfPeriod": xGf_p[1],
                "xGfGame": xGf_g[1],
                "xGaPeriod": xGa_p[1],
                "xGaGame": xGa_g[1],
            },
            {
                "name": "Line 3",
                "possessionPeriod": Pos_p[2],
                "possessionGame": Pos_g[2],
                "gfPeriod": ~~gfL3p.innerHTML,
                "gfGame": ~~gfL3g.innerHTML,
                "gaPeriod": ~~gaL3p.innerHTML,
                "gaGame": ~~gaL3g.innerHTML,
                "TOCPeriod": Toc_p[2],
                "TOCGame": Toc_g[2],
                "xGfPeriod": xGf_p[2],
                "xGfGame": xGf_g[2],
                "xGaPeriod": xGa_p[2],
                "xGaGame": xGa_g[2],
            },
            {
                "name": "Powerplay 1",
                "possessionPeriod": Pos_p[3],
                "possessionGame": Pos_g[3],
                "gfPeriod": ~~gfPP1p.innerHTML,
                "gfGame": ~~gfPP1g.innerHTML,
                "gaPeriod": ~~gaPP1p.innerHTML,
                "gaGame": ~~gaPP1g.innerHTML,
                "TOCPeriod": Toc_p[3],
                "TOCGame": Toc_g[3],
                "xGfPeriod": xGf_p[3],
                "xGfGame": xGf_g[3],
                "xGaPeriod": xGa_p[3],
                "xGaGame": xGa_g[3],
            },
            {
                "name": "Powerplay 2",
                "possessionPeriod": Pos_p[4],
                "possessionGame": Pos_g[4],
                "gfPeriod": ~~gfPP2p.innerHTML,
                "gfGame": ~~gfPP2g.innerHTML,
                "gaPeriod": ~~gaPP2p.innerHTML,
                "gaGame": ~~gaPP2g.innerHTML,
                "TOCPeriod": Toc_p[4],
                "TOCGame": Toc_g[4],
                "xGfPeriod": xGf_p[4],
                "xGfGame": xGf_g[4],
                "xGaPeriod": xGa_p[4],
                "xGaGame": xGa_g[4],
            },
            {
                "name": "Shorthanded 1",
                "possessionPeriod": Pos_p[5],
                "possessionGame": Pos_g[5],
                "gfPeriod": ~~gfSH1p.innerHTML,
                "gfGame": ~~gfSH1g.innerHTML,
                "gaPeriod": ~~gaSH1p.innerHTML,
                "gaGame": ~~gaSH1g.innerHTML,
                "TOCPeriod": Toc_p[5],
                "TOCGame": Toc_g[5],
                "xGfPeriod": xGf_p[5],
                "xGfGame": xGf_g[5],
                "xGaPeriod": xGa_p[5],
                "xGaGame": xGa_g[5],
            },
            {
                "name": "Shorthanded 2",
                "possessionPeriod": Pos_p[6],
                "possessionGame": Pos_g[6],
                "gfPeriod": ~~gfSH2p.innerHTML,
                "gfGame": ~~gfSH2g.innerHTML,
                "gaPeriod": ~~gaSH2p.innerHTML,
                "gaGame": ~~gaSH2g.innerHTML,
                "TOCPeriod": Toc_p[6],
                "TOCGame": Toc_g[6],
                "xGfPeriod": xGf_p[6],
                "xGfGame": xGf_g[6],
                "xGaPeriod": xGa_p[6],
                "xGaGame": xGa_g[6],
            }
          ]
        },
        {
          "name": name_t2,
          "lineOn": line_on_2,
          "possessionPeriod": PosT2_p[7],
          "possessionGame": PosT2_g[7],
          "goalsPeriod": ~~gaTeamp.innerHTML,
          "goalsGame": ~~gaTeamg.innerHTML,
          "xGPeriod": xGfT2_p[7],
          "xGGame": xGfT2_g[7],
          "lines": [
            {
                "name": "Line 1",
                "possessionPeriod": PosT2_p[0],
                "possessionGame": PosT2_g[0],
                "gfPeriod": ~~gfL1T2p.innerHTML,
                "gfGame": ~~gfL1T2g.innerHTML,
                "gaPeriod": ~~gaL1T2p.innerHTML,
                "gaGame": ~~gaL1T2g.innerHTML,
                "TOCPeriod": TocT2_p[0],
                "TOCGame": TocT2_g[0],
                "xGfPeriod": xGfT2_p[0],
                "xGfGame": xGfT2_g[0],
                "xGaPeriod": xGaT2_p[0],
                "xGaGame": xGaT2_g[0],
            },
            {
                "name": "Line 2",
                "possessionPeriod": PosT2_p[1],
                "possessionGame": PosT2_g[1],
                "gfPeriod": ~~gfL2T2p.innerHTML,
                "gfGame": ~~gfL2T2g.innerHTML,
                "gaPeriod": ~~gaL2T2p.innerHTML,
                "gaGame": ~~gaL2T2g.innerHTML,
                "TOCPeriod": TocT2_p[1],
                "TOCGame": TocT2_g[1],
                "xGfPeriod": xGfT2_p[1],
                "xGfGame": xGfT2_g[1],
                "xGaPeriod": xGaT2_p[1],
                "xGaGame": xGaT2_g[1],
            },
            {
                "name": "Line 3",
                "possessionPeriod": PosT2_p[2],
                "possessionGame": PosT2_g[2],
                "gfPeriod": ~~gfL3T2p.innerHTML,
                "gfGame": ~~gfL3T2g.innerHTML,
                "gaPeriod": ~~gaL3T2p.innerHTML,
                "gaGame": ~~gaL3T2g.innerHTML,
                "TOCPeriod": TocT2_p[2],
                "TOCGame": TocT2_g[2],
                "xGfPeriod": xGfT2_p[2],
                "xGfGame": xGfT2_g[2],
                "xGaPeriod": xGaT2_p[2],
                "xGaGame": xGaT2_g[2],
            },
            {
                "name": "Powerplay 1",
                "possessionPeriod": PosT2_p[3],
                "possessionGame": PosT2_g[3],
                "gfPeriod": ~~gfPP1T2p.innerHTML,
                "gfGame": ~~gfPP1T2g.innerHTML,
                "gaPeriod": ~~gaPP1T2p.innerHTML,
                "gaGame": ~~gaPP1T2g.innerHTML,
                "TOCPeriod": TocT2_p[3],
                "TOCGame": TocT2_g[3],
                "xGfPeriod": xGfT2_p[3],
                "xGfGame": xGfT2_g[3],
                "xGaPeriod": xGaT2_p[3],
                "xGaGame": xGaT2_g[3],
            },
            {
                "name": "Powerplay 2",
                "possessionPeriod": PosT2_p[4],
                "possessionGame": PosT2_g[4],
                "gfPeriod": ~~gfPP2T2p.innerHTML,
                "gfGame": ~~gfPP2T2g.innerHTML,
                "gaPeriod": ~~gaPP2T2p.innerHTML,
                "gaGame": ~~gaPP2T2g.innerHTML,
                "TOCPeriod": TocT2_p[4],
                "TOCGame": TocT2_g[4],
                "xGfPeriod": xGfT2_p[4],
                "xGfGame": xGfT2_g[4],
                "xGaPeriod": xGaT2_p[4],
                "xGaGame": xGaT2_g[4],
            },
            {
                "name": "Shorthanded 1",
                "possessionPeriod": PosT2_p[5],
                "possessionGame": PosT2_g[5],
                "gfPeriod": ~~gfSH1T2p.innerHTML,
                "gfGame": ~~gfSH1T2g.innerHTML,
                "gaPeriod": ~~gaSH1T2p.innerHTML,
                "gaGame": ~~gaSH1T2g.innerHTML,
                "TOCPeriod": TocT2_p[5],
                "TOCGame": TocT2_g[5],
                "xGfPeriod": xGfT2_p[5],
                "xGfGame": xGfT2_g[5],
                "xGaPeriod": xGaT2_p[5],
                "xGaGame": xGaT2_g[5],
            },
            {
                "name": "Shorthanded 2",
                "possessionPeriod": PosT2_p[6],
                "possessionGame": PosT2_g[6],
                "gfPeriod": ~~gfSH2T2p.innerHTML,
                "gfGame": ~~gfSH2T2g.innerHTML,
                "gaPeriod": ~~gaSH2T2p.innerHTML,
                "gaGame": ~~gaSH2T2g.innerHTML,
                "TOCPeriod": TocT2_p[6],
                "TOCGame": TocT2_g[6],
                "xGfPeriod": xGfT2_p[6],
                "xGfGame": xGfT2_g[6],
                "xGaPeriod": xGaT2_p[6],
                "xGaGame": xGaT2_g[6],
            }
          ]
        }
      ]
    }

    teamData = {
                "url": "http://www.fbscanner.io/apis/teams/12/",
                "name": name_t1,
                "lineOn": line_on,
                "possessionPeriod": Pos_p[7],
                "possessionGame": Pos_g[7],
                "goalsPeriod": ~~gfTeamp.innerHTML,
                "goalsGame": ~~gfTeamg.innerHTML,
                "xgPeriod": xGf_p[7],
                "xgGame": xGf_g[7],
                }

    fetch('https://fbscanner.io/livejson/', {

          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
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
const csrftoken = getCookie('csrftoken');