
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
          "possessionPeriod": PosTeam_p,
          "possessionGame": PosTeam_g,
          "goalsPeriod": ~~gfTeamp.innerHTML,
          "goalsGame": ~~gfTeamg.innerHTML,
          "xGPeriod": xGfTeam_p,
          "xGGame": xGfTeam_g,
          "lines": [
            {
                "name": "Line 1",
                "possessionPeriod": PosL1p,
                "possessionGame": PosL1g,
                "gfPeriod": ~~gfL1p.innerHTML,
                "gfGame": ~~gfL1g.innerHTML,
                "gaPeriod": ~~gaL1p.innerHTML,
                "gaGame": ~~gaL1g.innerHTML,
                "TOCPeriod": TocL1p,
                "TOCGame": TocL1g,
                "xGfPeriod": xGfL1p,
                "xGfGame": xGfL1g,
                "xGaPeriod": xGaL1p,
                "xGaGame": xGaL1g,
            },
            {
                "name": "Line 2",
                "possessionPeriod": PosL2p,
                "possessionGame": PosL2g,
                "gfPeriod": ~~gfL2p.innerHTML,
                "gfGame": ~~gfL2g.innerHTML,
                "gaPeriod": ~~gaL2p.innerHTML,
                "gaGame": ~~gaL2g.innerHTML,
                "TOCPeriod": TocL2p,
                "TOCGame": TocL2g,
                "xGfPeriod": xGfL2p,
                "xGfGame": xGfL2g,
                "xGaPeriod": xGaL2p,
                "xGaGame": xGaL2g,
            },
            {
                "name": "Line 3",
                "possessionPeriod": PosL3p,
                "possessionGame": PosL3g,
                "gfPeriod": ~~gfL3p.innerHTML,
                "gfGame": ~~gfL3g.innerHTML,
                "gaPeriod": ~~gaL3p.innerHTML,
                "gaGame": ~~gaL3g.innerHTML,
                "TOCPeriod": TocL3p,
                "TOCGame": TocL3g,
                "xGfPeriod": xGfL3p,
                "xGfGame": xGfL3g,
                "xGaPeriod": xGaL3p,
                "xGaGame": xGaL3g,
            },
            {
                "name": "Powerplay 1",
                "possessionPeriod": PosPP1p,
                "possessionGame": PosPP1g,
                "gfPeriod": ~~gfPP1p.innerHTML,
                "gfGame": ~~gfPP1g.innerHTML,
                "gaPeriod": ~~gaPP1p.innerHTML,
                "gaGame": ~~gaPP1g.innerHTML,
                "TOCPeriod": TocPP1p,
                "TOCGame": TocPP1g,
                "xGfPeriod": xGfPP1p,
                "xGfGame": xGfPP1g,
                "xGaPeriod": xGaPP1p,
                "xGaGame": xGaPP1g,
            },
            {
                "name": "Powerplay 2",
                "possessionPeriod": PosPP2p,
                "possessionGame": PosPP2g,
                "gfPeriod": ~~gfPP2p.innerHTML,
                "gfGame": ~~gfPP2g.innerHTML,
                "gaPeriod": ~~gaPP2p.innerHTML,
                "gaGame": ~~gaPP2g.innerHTML,
                "TOCPeriod": TocPP2p,
                "TOCGame": TocPP2g,
                "xGfPeriod": xGfPP2p,
                "xGfGame": xGfPP2g,
                "xGaPeriod": xGaPP2p,
                "xGaGame": xGaPP2g,
            },
            {
                "name": "Shorthanded 1",
                "possessionPeriod": PosSH1p,
                "possessionGame": PosSH1g,
                "gfPeriod": ~~gfSH1p.innerHTML,
                "gfGame": ~~gfSH1g.innerHTML,
                "gaPeriod": ~~gaSH1p.innerHTML,
                "gaGame": ~~gaSH1g.innerHTML,
                "TOCPeriod": TocSH1p,
                "TOCGame": TocSH1g,
                "xGfPeriod": xGfSH1p,
                "xGfGame": xGfSH1g,
                "xGaPeriod": xGaSH1p,
                "xGaGame": xGaSH1g,
            },
            {
                "name": "Shorthanded 2",
                "possessionPeriod": PosSH2p,
                "possessionGame": PosSH2g,
                "gfPeriod": ~~gfSH2p.innerHTML,
                "gfGame": ~~gfSH2g.innerHTML,
                "gaPeriod": ~~gaSH2p.innerHTML,
                "gaGame": ~~gaSH2g.innerHTML,
                "TOCPeriod": TocSH2p,
                "TOCGame": TocSH2g,
                "xGfPeriod": xGfSH2p,
                "xGfGame": xGfSH2g,
                "xGaPeriod": xGaSH2p,
                "xGaGame": xGaSH2g,
            }
          ]
        },
        {
          "name": name_t2,
          "lineOn": line_on_2,
          "possessionPeriod": PosTeamT2_p,
          "possessionGame": PosTeamT2_g,
          "goalsPeriod": ~~gaTeamp.innerHTML,
          "goalsGame": ~~gaTeamg.innerHTML,
          "xGPeriod": xGaTeam_p,
          "xGGame": xGaTeam_g,
          "lines": [
            {
                "name": "Line 1",
                "possessionPeriod": PosL1T2p,
                "possessionGame": PosL1T2g,
                "gfPeriod": ~~gfL1T2p.innerHTML,
                "gfGame": ~~gfL1T2g.innerHTML,
                "gaPeriod": ~~gaL1T2p.innerHTML,
                "gaGame": ~~gaL1T2g.innerHTML,
                "TOCPeriod": TocL1T2p,
                "TOCGame": TocL1T2g,
                "xGfPeriod": xGfL1T2p,
                "xGfGame": xGfL1T2g,
                "xGaPeriod": xGaL1T2p,
                "xGaGame": xGaL1T2g,
            },
            {
                "name": "Line 2",
                "possessionPeriod": PosL2T2p,
                "possessionGame": PosL2T2g,
                "gfPeriod": ~~gfL2T2p.innerHTML,
                "gfGame": ~~gfL2T2g.innerHTML,
                "gaPeriod": ~~gaL2T2p.innerHTML,
                "gaGame": ~~gaL2T2g.innerHTML,
                "TOCPeriod": TocL2T2p,
                "TOCGame": TocL2T2g,
                "xGfPeriod": xGfL2T2p,
                "xGfGame": xGfL2T2g,
                "xGaPeriod": xGaL2T2p,
                "xGaGame": xGaL2T2g,
            },
            {
                "name": "Line 3",
                "possessionPeriod": PosL3T2p,
                "possessionGame": PosL3T2g,
                "gfPeriod": ~~gfL3T2p.innerHTML,
                "gfGame": ~~gfL3T2g.innerHTML,
                "gaPeriod": ~~gaL3T2p.innerHTML,
                "gaGame": ~~gaL3T2g.innerHTML,
                "TOCPeriod": TocL3T2p,
                "TOCGame": TocL3T2g,
                "xGfPeriod": xGfL3T2p,
                "xGfGame": xGfL3T2g,
                "xGaPeriod": xGaL3T2p,
                "xGaGame": xGaL3T2g,
            },
            {
                "name": "Powerplay 1",
                "possessionPeriod": PosPP1T2p,
                "possessionGame": PosPP1T2g,
                "gfPeriod": ~~gfPP1T2p.innerHTML,
                "gfGame": ~~gfPP1T2g.innerHTML,
                "gaPeriod": ~~gaPP1T2p.innerHTML,
                "gaGame": ~~gaPP1T2g.innerHTML,
                "TOCPeriod": TocPP1T2p,
                "TOCGame": TocPP1T2g,
                "xGfPeriod": xGfPP1T2p,
                "xGfGame": xGfPP1T2g,
                "xGaPeriod": xGaPP1T2p,
                "xGaGame": xGaPP1T2g,
            },
            {
                "name": "Powerplay 2",
                "possessionPeriod": PosPP2T2p,
                "possessionGame": PosPP2T2g,
                "gfPeriod": ~~gfPP2T2p.innerHTML,
                "gfGame": ~~gfPP2T2g.innerHTML,
                "gaPeriod": ~~gaPP2T2p.innerHTML,
                "gaGame": ~~gaPP2T2g.innerHTML,
                "TOCPeriod": TocPP2T2p,
                "TOCGame": TocPP2T2g,
                "xGfPeriod": xGfPP2T2p,
                "xGfGame": xGfPP2T2g,
                "xGaPeriod": xGaPP2T2p,
                "xGaGame": xGaPP2T2g,
            },
            {
                "name": "Shorthanded 1",
                "possessionPeriod": PosSH1T2p,
                "possessionGame": PosSH1T2g,
                "gfPeriod": ~~gfSH1T2p.innerHTML,
                "gfGame": ~~gfSH1T2g.innerHTML,
                "gaPeriod": ~~gaSH1T2p.innerHTML,
                "gaGame": ~~gaSH1T2g.innerHTML,
                "TOCPeriod": TocSH1T2p,
                "TOCGame": TocSH1T2g,
                "xGfPeriod": xGfSH1T2p,
                "xGfGame": xGfSH1T2g,
                "xGaPeriod": xGaSH1T2p,
                "xGaGame": xGaSH1T2g,
            },
            {
                "name": "Shorthanded 2",
                "possessionPeriod": PosSH2T2p,
                "possessionGame": PosSH2T2g,
                "gfPeriod": ~~gfSH2T2p.innerHTML,
                "gfGame": ~~gfSH2T2g.innerHTML,
                "gaPeriod": ~~gaSH2T2p.innerHTML,
                "gaGame": ~~gaSH2T2g.innerHTML,
                "TOCPeriod": TocSH2T2p,
                "TOCGame": TocSH2T2g,
                "xGfPeriod": xGfSH2T2p,
                "xGfGame": xGfSH2T2g,
                "xGaPeriod": xGaSH2T2p,
                "xGaGame": xGaSH2T2g,
            }
          ]
        }
      ]
    }
}