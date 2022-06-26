
// This file contains the JSON for live data

// InitializeLive - function initializes the Game and adds a row to the Game - model.
// Function returns an url for the Game instance.

function initializeLive() {

    data = {
        "date": today,
        "periodNr": periodN,
        "gameClock": gameCounter,
        "periodClock": counter,
        "nameT1": name_t1,
        "lineOnT1": line_on,
        "possessionPeriodT1": Pos_p[7],
        "possessionGameT1": Pos_g[7],
        "goalsPeriodT1": ~~gfTeamp.innerHTML,
        "goalsGameT1": ~~gfTeamg.innerHTML,
        "xGPeriodT1": xGf_p[7],
        "xGGameT1": xGf_g[7],
        "nameT2": name_t2,
        "lineOnT2": line_on_2,
        "possessionPeriodT2": PosT2_p[7],
        "possessionGameT2": PosT2_g[7],
        "goalsPeriodT2": ~~gaTeamp.innerHTML,
        "goalsGameT2": ~~gaTeamg.innerHTML,
        "xGPeriodT2": xGfT2_p[7],
        "xGGameT2": xGfT2_g[7],
        "nameL1": "Line 1",
        "possessionPeriodT1L1": Pos_p[0],
        "possessionGameT1L1": Pos_g[0],
        "gfPeriodT1L1": ~~gfL1p.innerHTML,
        "gfGameT1L1": ~~gfL1g.innerHTML,
        "gaPeriodT1L1": ~~gaL1p.innerHTML,
        "gaGameT1L1": ~~gaL1g.innerHTML,
        "TOCPeriodT1L1": Toc_p[0],
        "TOCGameT1L1": Toc_g[0],
        "xGfPeriodT1L1": xGf_p[0],
        "xGfGameT1L1": xGf_g[0],
        "xGaPeriodT1L1": xGa_p[0],
        "xGaGameT1L1": xGa_g[0],
        "possessionPeriodT2L1": PosT2_p[0],
        "possessionGameT2L1": PosT2_g[0],
        "gfPeriodT2L1": ~~gfL1T2p.innerHTML,
        "gfGameT2L1": ~~gfL1T2g.innerHTML,
        "gaPeriodT2L1": ~~gaL1T2p.innerHTML,
        "gaGameT2L1": ~~gaL1T2g.innerHTML,
        "TOCPeriodT2L1": TocT2_p[0],
        "TOCGameT2L1": TocT2_g[0],
        "xGfPeriodT2L1": xGfT2_p[0],
        "xGfGameT2L1": xGfT2_g[0],
        "xGaPeriodT2L1": xGaT2_p[0],
        "xGaGameT2L1": xGaT2_g[0],
        "nameL2": "Line 2",
        "possessionPeriodT1L2": Pos_p[1],
        "possessionGameT1L2": Pos_g[1],
        "gfPeriodT1L2": ~~gfL2p.innerHTML,
        "gfGameT1L2": ~~gfL2g.innerHTML,
        "gaPeriodT1L2": ~~gaL2p.innerHTML,
        "gaGameT1L2": ~~gaL2g.innerHTML,
        "TOCPeriodT1L2": Toc_p[1],
        "TOCGameT1L2": Toc_g[1],
        "xGfPeriodT1L2": xGf_p[1],
        "xGfGameT1L2": xGf_g[1],
        "xGaPeriodT1L2": xGa_p[1],
        "xGaGameT1L2": xGa_g[1],
        "possessionPeriodT2L2": PosT2_p[1],
        "possessionGameT2L2": PosT2_g[1],
        "gfPeriodT2L2": ~~gfL2T2p.innerHTML,
        "gfGameT2L2": ~~gfL2T2g.innerHTML,
        "gaPeriodT2L2": ~~gaL2T2p.innerHTML,
        "gaGameT2L2": ~~gaL2T2g.innerHTML,
        "TOCPeriodT2L2": TocT2_p[1],
        "TOCGameT2L2": TocT2_g[1],
        "xGfPeriodT2L2": xGfT2_p[1],
        "xGfGameT2L2": xGfT2_g[1],
        "xGaPeriodT2L2": xGaT2_p[1],
        "xGaGameT2L2": xGaT2_g[1],
        "nameL3": "Line 3",
        "possessionPeriodT1L3": Pos_p[2],
        "possessionGameT1L3": Pos_g[2],
        "gfPeriodT1L3": ~~gfL3p.innerHTML,
        "gfGameT1L3": ~~gfL3g.innerHTML,
        "gaPeriodT1L3": ~~gaL3p.innerHTML,
        "gaGameT1L3": ~~gaL3g.innerHTML,
        "TOCPeriodT1L3": Toc_p[2],
        "TOCGameT1L3": Toc_g[2],
        "xGfPeriodT1L3": xGf_p[2],
        "xGfGameT1L3": xGf_g[2],
        "xGaPeriodT1L3": xGa_p[2],
        "xGaGameT1L3": xGa_g[2],
        "possessionPeriodT2L3": PosT2_p[2],
        "possessionGameT2L3": PosT2_g[2],
        "gfPeriodT2L3": ~~gfL3T2p.innerHTML,
        "gfGameT2L3": ~~gfL3T2g.innerHTML,
        "gaPeriodT2L3": ~~gaL3T2p.innerHTML,
        "gaGameT2L3": ~~gaL3T2g.innerHTML,
        "TOCPeriodT2L3": TocT2_p[2],
        "TOCGameT2L3": TocT2_g[2],
        "xGfPeriodT2L3": xGfT2_p[2],
        "xGfGameT2L3": xGfT2_g[2],
        "xGaPeriodT2L3": xGaT2_p[2],
        "xGaGameT2L3": xGaT2_g[2],
        "nameL4": "Powerplay 1",
        "possessionPeriodT1L4": Pos_p[3],
        "possessionGameT1L4": Pos_g[3],
        "gfPeriodT1L4": ~~gfPP1p.innerHTML,
        "gfGameT1L4": ~~gfPP1g.innerHTML,
        "gaPeriodT1L4": ~~gaPP1p.innerHTML,
        "gaGameT1L4": ~~gaPP1g.innerHTML,
        "TOCPeriodT1L4": Toc_p[3],
        "TOCGameT1L4": Toc_g[3],
        "xGfPeriodT1L4": xGf_p[3],
        "xGfGameT1L4": xGf_g[3],
        "xGaPeriodT1L4": xGa_p[3],
        "xGaGameT1L4": xGa_g[3],
        "possessionPeriodT2L4": PosT2_p[3],
        "possessionGameT2L4": PosT2_g[3],
        "gfPeriodT2L4": ~~gfPP1T2p.innerHTML,
        "gfGameT2L4": ~~gfPP1T2g.innerHTML,
        "gaPeriodT2L4": ~~gaPP1T2p.innerHTML,
        "gaGameT2L4": ~~gaPP1T2g.innerHTML,
        "TOCPeriodT2L4": TocT2_p[3],
        "TOCGameT2L4": TocT2_g[3],
        "xGfPeriodT2L4": xGfT2_p[3],
        "xGfGameT2L4": xGfT2_g[3],
        "xGaPeriodT2L4": xGaT2_p[3],
        "xGaGameT2L4": xGaT2_g[3],
        "nameL5": "Powerplay 2",
        "possessionPeriodT1L5": Pos_p[4],
        "possessionGameT1L5": Pos_g[4],
        "gfPeriodT1L5": ~~gfPP2p.innerHTML,
        "gfGameT1L5": ~~gfPP2g.innerHTML,
        "gaPeriodT1L5": ~~gaPP2p.innerHTML,
        "gaGameT1L5": ~~gaPP2g.innerHTML,
        "TOCPeriodT1L5": Toc_p[4],
        "TOCGameT1L5": Toc_g[4],
        "xGfPeriodT1L5": xGf_p[4],
        "xGfGameT1L5": xGf_g[4],
        "xGaPeriodT1L5": xGa_p[4],
        "xGaGameT1L5": xGa_g[4],
        "possessionPeriodT2L5": PosT2_p[4],
        "possessionGameT2L5": PosT2_g[4],
        "gfPeriodT2L5": ~~gfPP2T2p.innerHTML,
        "gfGameT2L5": ~~gfPP2T2g.innerHTML,
        "gaPeriodT2L5": ~~gaPP2T2p.innerHTML,
        "gaGameT2L5": ~~gaPP2T2g.innerHTML,
        "TOCPeriodT2L5": TocT2_p[4],
        "TOCGameT2L5": TocT2_g[4],
        "xGfPeriodT2L5": xGfT2_p[4],
        "xGfGameT2L5": xGfT2_g[4],
        "xGaPeriodT2L5": xGaT2_p[4],
        "xGaGameT2L5": xGaT2_g[4],
        "nameL6": "Shorthanded 1",
        "possessionPeriodT1L6": Pos_p[5],
        "possessionGameT1L6": Pos_g[5],
        "gfPeriodT1L6": ~~gfSH1p.innerHTML,
        "gfGameT1L6": ~~gfSH1g.innerHTML,
        "gaPeriodT1L6": ~~gaSH1p.innerHTML,
        "gaGameT1L6": ~~gaSH1g.innerHTML,
        "TOCPeriodT1L6": Toc_p[5],
        "TOCGameT1L6": Toc_g[5],
        "xGfPeriodT1L6": xGf_p[5],
        "xGfGameT1L6": xGf_g[5],
        "xGaPeriodT1L6": xGa_p[5],
        "xGaGameT1L6": xGa_g[5],
        "possessionPeriodT2L6": PosT2_p[5],
        "possessionGameT2L6": PosT2_g[5],
        "gfPeriodT2L6": ~~gfSH1T2p.innerHTML,
        "gfGameT2L6": ~~gfSH1T2g.innerHTML,
        "gaPeriodT2L6": ~~gaSH1T2p.innerHTML,
        "gaGameT2L6": ~~gaSH1T2g.innerHTML,
        "TOCPeriodT2L6": TocT2_p[5],
        "TOCGameT2L6": TocT2_g[5],
        "xGfPeriodT2L6": xGfT2_p[5],
        "xGfGameT2L6": xGfT2_g[5],
        "xGaPeriodT2L6": xGaT2_p[5],
        "xGaGameT2L6": xGaT2_g[5],
        "nameL7": "Shorthanded 2",
        "possessionPeriodT1L7": Pos_p[6],
        "possessionGameT1L7": Pos_g[6],
        "gfPeriodT1L7": ~~gfSH2p.innerHTML,
        "gfGameT1L7": ~~gfSH2g.innerHTML,
        "gaPeriodT1L7": ~~gaSH2p.innerHTML,
        "gaGameT1L7": ~~gaSH2g.innerHTML,
        "TOCPeriodT1L7": Toc_p[6],
        "TOCGameT1L7": Toc_g[6],
        "xGfPeriodT1L7": xGf_p[6],
        "xGfGameT1L7": xGf_g[6],
        "xGaPeriodT1L7": xGa_p[6],
        "xGaGameT1L7": xGa_g[6],
        "possessionPeriodT2L7": PosT2_p[6],
        "possessionGameT2L7": PosT2_g[6],
        "gfPeriodT2L7": ~~gfSH2T2p.innerHTML,
        "gfGameT2L7": ~~gfSH2T2g.innerHTML,
        "gaPeriodT2L7": ~~gaSH2T2p.innerHTML,
        "gaGameT2L7": ~~gaSH2T2g.innerHTML,
        "TOCPeriodT2L7": TocT2_p[6],
        "TOCGameT2L7": TocT2_g[6],
        "xGfPeriodT2L7": xGfT2_p[6],
        "xGfGameT2L7": xGfT2_g[6],
        "xGaPeriodT2L7": xGaT2_p[6],
        "xGaGameT2L7": xGaT2_g[6],
    }

    console.log(data);

    let response = fetch("https://fbscanner.io/livejson/", {

          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => console.log(data)) {
          console.log('Success:', response);
    })
        .catch((error) => {
          console.error('Error:', error);
    });

}

// updateLive - function updates the Game data every 1 second.

function updateLive() {

    data = {
        "url": "https://fbscanner.io/apis/livejson/4/",
        "date": today,
        "periodNr": periodN,
        "gameClock": gameCounter,
        "periodClock": counter,
        "nameT1": name_t1,
        "lineOnT1": line_on,
        "possessionPeriodT1": Pos_p[7],
        "possessionGameT1": Pos_g[7],
        "goalsPeriodT1": ~~gfTeamp.innerHTML,
        "goalsGameT1": ~~gfTeamg.innerHTML,
        "xGPeriodT1": xGf_p[7],
        "xGGameT1": xGf_g[7],
        "nameT2": name_t2,
        "lineOnT2": line_on_2,
        "possessionPeriodT2": PosT2_p[7],
        "possessionGameT2": PosT2_g[7],
        "goalsPeriodT2": ~~gaTeamp.innerHTML,
        "goalsGameT2": ~~gaTeamg.innerHTML,
        "xGPeriodT2": xGfT2_p[7],
        "xGGameT2": xGfT2_g[7],
        "nameL1": "Line 1",
        "possessionPeriodT1L1": Pos_p[0],
        "possessionGameT1L1": Pos_g[0],
        "gfPeriodT1L1": ~~gfL1p.innerHTML,
        "gfGameT1L1": ~~gfL1g.innerHTML,
        "gaPeriodT1L1": ~~gaL1p.innerHTML,
        "gaGameT1L1": ~~gaL1g.innerHTML,
        "TOCPeriodT1L1": Toc_p[0],
        "TOCGameT1L1": Toc_g[0],
        "xGfPeriodT1L1": xGf_p[0],
        "xGfGameT1L1": xGf_g[0],
        "xGaPeriodT1L1": xGa_p[0],
        "xGaGameT1L1": xGa_g[0],
        "possessionPeriodT2L1": PosT2_p[0],
        "possessionGameT2L1": PosT2_g[0],
        "gfPeriodT2L1": ~~gfL1T2p.innerHTML,
        "gfGameT2L1": ~~gfL1T2g.innerHTML,
        "gaPeriodT2L1": ~~gaL1T2p.innerHTML,
        "gaGameT2L1": ~~gaL1T2g.innerHTML,
        "TOCPeriodT2L1": TocT2_p[0],
        "TOCGameT2L1": TocT2_g[0],
        "xGfPeriodT2L1": xGfT2_p[0],
        "xGfGameT2L1": xGfT2_g[0],
        "xGaPeriodT2L1": xGaT2_p[0],
        "xGaGameT2L1": xGaT2_g[0],
        "nameL2": "Line 2",
        "possessionPeriodT1L2": Pos_p[1],
        "possessionGameT1L2": Pos_g[1],
        "gfPeriodT1L2": ~~gfL2p.innerHTML,
        "gfGameT1L2": ~~gfL2g.innerHTML,
        "gaPeriodT1L2": ~~gaL2p.innerHTML,
        "gaGameT1L2": ~~gaL2g.innerHTML,
        "TOCPeriodT1L2": Toc_p[1],
        "TOCGameT1L2": Toc_g[1],
        "xGfPeriodT1L2": xGf_p[1],
        "xGfGameT1L2": xGf_g[1],
        "xGaPeriodT1L2": xGa_p[1],
        "xGaGameT1L2": xGa_g[1],
        "possessionPeriodT2L2": PosT2_p[1],
        "possessionGameT2L2": PosT2_g[1],
        "gfPeriodT2L2": ~~gfL2T2p.innerHTML,
        "gfGameT2L2": ~~gfL2T2g.innerHTML,
        "gaPeriodT2L2": ~~gaL2T2p.innerHTML,
        "gaGameT2L2": ~~gaL2T2g.innerHTML,
        "TOCPeriodT2L2": TocT2_p[1],
        "TOCGameT2L2": TocT2_g[1],
        "xGfPeriodT2L2": xGfT2_p[1],
        "xGfGameT2L2": xGfT2_g[1],
        "xGaPeriodT2L2": xGaT2_p[1],
        "xGaGameT2L2": xGaT2_g[1],
        "nameL3": "Line 3",
        "possessionPeriodT1L3": Pos_p[2],
        "possessionGameT1L3": Pos_g[2],
        "gfPeriodT1L3": ~~gfL3p.innerHTML,
        "gfGameT1L3": ~~gfL3g.innerHTML,
        "gaPeriodT1L3": ~~gaL3p.innerHTML,
        "gaGameT1L3": ~~gaL3g.innerHTML,
        "TOCPeriodT1L3": Toc_p[2],
        "TOCGameT1L3": Toc_g[2],
        "xGfPeriodT1L3": xGf_p[2],
        "xGfGameT1L3": xGf_g[2],
        "xGaPeriodT1L3": xGa_p[2],
        "xGaGameT1L3": xGa_g[2],
        "possessionPeriodT2L3": PosT2_p[2],
        "possessionGameT2L3": PosT2_g[2],
        "gfPeriodT2L3": ~~gfL3T2p.innerHTML,
        "gfGameT2L3": ~~gfL3T2g.innerHTML,
        "gaPeriodT2L3": ~~gaL3T2p.innerHTML,
        "gaGameT2L3": ~~gaL3T2g.innerHTML,
        "TOCPeriodT2L3": TocT2_p[2],
        "TOCGameT2L3": TocT2_g[2],
        "xGfPeriodT2L3": xGfT2_p[2],
        "xGfGameT2L3": xGfT2_g[2],
        "xGaPeriodT2L3": xGaT2_p[2],
        "xGaGameT2L3": xGaT2_g[2],
        "nameL4": "Powerplay 1",
        "possessionPeriodT1L4": Pos_p[3],
        "possessionGameT1L4": Pos_g[3],
        "gfPeriodT1L4": ~~gfPP1p.innerHTML,
        "gfGameT1L4": ~~gfPP1g.innerHTML,
        "gaPeriodT1L4": ~~gaPP1p.innerHTML,
        "gaGameT1L4": ~~gaPP1g.innerHTML,
        "TOCPeriodT1L4": Toc_p[3],
        "TOCGameT1L4": Toc_g[3],
        "xGfPeriodT1L4": xGf_p[3],
        "xGfGameT1L4": xGf_g[3],
        "xGaPeriodT1L4": xGa_p[3],
        "xGaGameT1L4": xGa_g[3],
        "possessionPeriodT2L4": PosT2_p[3],
        "possessionGameT2L4": PosT2_g[3],
        "gfPeriodT2L4": ~~gfPP1T2p.innerHTML,
        "gfGameT2L4": ~~gfPP1T2g.innerHTML,
        "gaPeriodT2L4": ~~gaPP1T2p.innerHTML,
        "gaGameT2L4": ~~gaPP1T2g.innerHTML,
        "TOCPeriodT2L4": TocT2_p[3],
        "TOCGameT2L4": TocT2_g[3],
        "xGfPeriodT2L4": xGfT2_p[3],
        "xGfGameT2L4": xGfT2_g[3],
        "xGaPeriodT2L4": xGaT2_p[3],
        "xGaGameT2L4": xGaT2_g[3],
        "nameL5": "Powerplay 2",
        "possessionPeriodT1L5": Pos_p[4],
        "possessionGameT1L5": Pos_g[4],
        "gfPeriodT1L5": ~~gfPP2p.innerHTML,
        "gfGameT1L5": ~~gfPP2g.innerHTML,
        "gaPeriodT1L5": ~~gaPP2p.innerHTML,
        "gaGameT1L5": ~~gaPP2g.innerHTML,
        "TOCPeriodT1L5": Toc_p[4],
        "TOCGameT1L5": Toc_g[4],
        "xGfPeriodT1L5": xGf_p[4],
        "xGfGameT1L5": xGf_g[4],
        "xGaPeriodT1L5": xGa_p[4],
        "xGaGameT1L5": xGa_g[4],
        "possessionPeriodT2L5": PosT2_p[4],
        "possessionGameT2L5": PosT2_g[4],
        "gfPeriodT2L5": ~~gfPP2T2p.innerHTML,
        "gfGameT2L5": ~~gfPP2T2g.innerHTML,
        "gaPeriodT2L5": ~~gaPP2T2p.innerHTML,
        "gaGameT2L5": ~~gaPP2T2g.innerHTML,
        "TOCPeriodT2L5": TocT2_p[4],
        "TOCGameT2L5": TocT2_g[4],
        "xGfPeriodT2L5": xGfT2_p[4],
        "xGfGameT2L5": xGfT2_g[4],
        "xGaPeriodT2L5": xGaT2_p[4],
        "xGaGameT2L5": xGaT2_g[4],
        "nameL6": "Shorthanded 1",
        "possessionPeriodT1L6": Pos_p[5],
        "possessionGameT1L6": Pos_g[5],
        "gfPeriodT1L6": ~~gfSH1p.innerHTML,
        "gfGameT1L6": ~~gfSH1g.innerHTML,
        "gaPeriodT1L6": ~~gaSH1p.innerHTML,
        "gaGameT1L6": ~~gaSH1g.innerHTML,
        "TOCPeriodT1L6": Toc_p[5],
        "TOCGameT1L6": Toc_g[5],
        "xGfPeriodT1L6": xGf_p[5],
        "xGfGameT1L6": xGf_g[5],
        "xGaPeriodT1L6": xGa_p[5],
        "xGaGameT1L6": xGa_g[5],
        "possessionPeriodT2L6": PosT2_p[5],
        "possessionGameT2L6": PosT2_g[5],
        "gfPeriodT2L6": ~~gfSH1T2p.innerHTML,
        "gfGameT2L6": ~~gfSH1T2g.innerHTML,
        "gaPeriodT2L6": ~~gaSH1T2p.innerHTML,
        "gaGameT2L6": ~~gaSH1T2g.innerHTML,
        "TOCPeriodT2L6": TocT2_p[5],
        "TOCGameT2L6": TocT2_g[5],
        "xGfPeriodT2L6": xGfT2_p[5],
        "xGfGameT2L6": xGfT2_g[5],
        "xGaPeriodT2L6": xGaT2_p[5],
        "xGaGameT2L6": xGaT2_g[5],
        "nameL7": "Shorthanded 2",
        "possessionPeriodT1L7": Pos_p[6],
        "possessionGameT1L7": Pos_g[6],
        "gfPeriodT1L7": ~~gfSH2p.innerHTML,
        "gfGameT1L7": ~~gfSH2g.innerHTML,
        "gaPeriodT1L7": ~~gaSH2p.innerHTML,
        "gaGameT1L7": ~~gaSH2g.innerHTML,
        "TOCPeriodT1L7": Toc_p[6],
        "TOCGameT1L7": Toc_g[6],
        "xGfPeriodT1L7": xGf_p[6],
        "xGfGameT1L7": xGf_g[6],
        "xGaPeriodT1L7": xGa_p[6],
        "xGaGameT1L7": xGa_g[6],
        "possessionPeriodT2L7": PosT2_p[6],
        "possessionGameT2L7": PosT2_g[6],
        "gfPeriodT2L7": ~~gfSH2T2p.innerHTML,
        "gfGameT2L7": ~~gfSH2T2g.innerHTML,
        "gaPeriodT2L7": ~~gaSH2T2p.innerHTML,
        "gaGameT2L7": ~~gaSH2T2g.innerHTML,
        "TOCPeriodT2L7": TocT2_p[6],
        "TOCGameT2L7": TocT2_g[6],
        "xGfPeriodT2L7": xGfT2_p[6],
        "xGfGameT2L7": xGfT2_g[6],
        "xGaPeriodT2L7": xGaT2_p[6],
        "xGaGameT2L7": xGaT2_g[6],
    }

    fetch("https://fbscanner.io/apis/livejson/4/", {

          method: 'PUT', // or 'PUSH'
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