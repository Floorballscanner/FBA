    // Variables file for New Game - html

    var tgt_1 = document.getElementById("totg_1");
    var tgt_2 = document.getElementById("totg_2");
    var txG_1 = document.getElementById("totxG_1");
    var txG_2 = document.getElementById("totxG_2");
    var txGOT_1 = document.getElementById("totxGOT_1");
    var txGOT_2 = document.getElementById("totxGOT_2");
    var tgtp_1 = document.getElementById("totp_1");
    var tgtp_2 = document.getElementById("totp_2");
    var txGp_1 = document.getElementById("totxGp_1");
    var txGp_2 = document.getElementById("totxGp_2");
    var txGOTp_1 = document.getElementById("totxGOTp_1");
    var txGOTp_2 = document.getElementById("totxGOTp_2");
    var line_on = 1; // Line on court Team 1
    var line_on_2 = 1; // Line on court Team 2
    var started = 0; // Game started 0/1
    var lines = ["L1", "L2", "L3", "Pp1", "Pp2", "Sh1", "Sh2"]; // Line array Team 1
    var lines_2 = ["L1T2", "L2T2", "L3T2", "Pp1T2", "Pp2T2", "Sh1T2", "Sh2T2"]; // Line array Team 2
    var is_on = 0; // Game clock on 1/0
    var counter = 0; // Counter for the period time * 1000 ms
    var gameCounter = 0; // Counter for the game time * 1000 ms
    var periodN = 1; // Period number
    var Ball_pos = 1; // Ball possession Team 1/2
    var Ball_zone = 1; // Ball at the def zone (1) or att zone (2) in relation to Team 1
    var Order = 1; // Order of team and zone buttons 1/2
    var PosX = 0;
    var PosY = 0;
    var myImg = new Image();
    myImg.src = "/static/field-new.png";
    var img = new Image();
    var img1 = new Image();
    var img2 = new Image();
    var img3 = new Image();
    var img4 = new Image();
    var img5 = new Image();
    var PosTime = 0; // Possession time in counters Team 1
    var PosTime_2 = 0; // Possession time in counters Team 2
    var LineTime = 0; // Line on court time in counters Team 1
    var LineTime_2 = 0; // Line on court time in counters Team 2
    var fWidth = 300; // Width of the shotmap field in pixels
    var fLength = 500; // Length of the shotmap field in pixels
    var shiftNo = 1; // Number of shifts in numbers Team 1
    var shiftNo_2 = 1; // Number of shifts in numbers Team 2
    var shiftPos = 0; // Possession time in shift in counters Team 1
    var shiftPos_2 = 0; // Possession time in shift in counters Team 2
    var data = {}; // Live data object
    var data_url = "null"; // Live data url
    var today = new Date();
    var live = 0; // If live updates are sent to API 1 yes / 0 no
    var shooter_select = 0; // If user wants to tag shooter
    var user_id = JSON.parse(document.getElementById('user_id').textContent); // user id number
    var game_id = 0; // game id number
    var shot_on = 0; // Shot tag process on/off
    var data_object = {}; // Save data object contains all saved/loaded data
    var undo_object = {}; // Undo object contains previous state data
    var data_object_stringified = {} // Deep copy of a data_object

    // Premium game level, team, and player select box elements

    var load_game = document.getElementById("load-game");
    var s_Level_T1 = document.getElementById("select-level-t1");
    var s_Level_T2 = document.getElementById("select-level-t2");
    var s_T1 = document.getElementById("select-team-1");
    var s_T2 = document.getElementById("select-team-2");
    var s_T1G = document.getElementById("sT1G");
    var s_T2G = document.getElementById("sT2G");
    var s_T1L1LW = document.getElementById("sT1L1LW");
    var s_T1L1C = document.getElementById("sT1L1C");
    var s_T1L1RW = document.getElementById("sT1L1RW");
    var s_T1L1LD = document.getElementById("sT1L1LD");
    var s_T1L1RD = document.getElementById("sT1L1RD");
    var s_T1L2LW = document.getElementById("sT1L2LW");
    var s_T1L2C = document.getElementById("sT1L2C");
    var s_T1L2RW = document.getElementById("sT1L2RW");
    var s_T1L2LD = document.getElementById("sT1L2LD");
    var s_T1L2RD = document.getElementById("sT1L2RD");
    var s_T1L3LW = document.getElementById("sT1L3LW");
    var s_T1L3C = document.getElementById("sT1L3C");
    var s_T1L3RW = document.getElementById("sT1L3RW");
    var s_T1L3LD = document.getElementById("sT1L3LD");
    var s_T1L3RD = document.getElementById("sT1L3RD");
    var s_T2L1LW = document.getElementById("sT2L1LW");
    var s_T2L1C = document.getElementById("sT2L1C");
    var s_T2L1RW = document.getElementById("sT2L1RW");
    var s_T2L1LD = document.getElementById("sT2L1LD");
    var s_T2L1RD = document.getElementById("sT2L1RD");
    var s_T2L2LW = document.getElementById("sT2L2LW");
    var s_T2L2C = document.getElementById("sT2L2C");
    var s_T2L2RW = document.getElementById("sT2L2RW");
    var s_T2L2LD = document.getElementById("sT2L2LD");
    var s_T2L2RD = document.getElementById("sT2L2RD");
    var s_T2L3LW = document.getElementById("sT2L3LW");
    var s_T2L3C = document.getElementById("sT2L3C");
    var s_T2L3RW = document.getElementById("sT2L3RW");
    var s_T2L3LD = document.getElementById("sT2L3LD");
    var s_T2L3RD = document.getElementById("sT2L3RD");
    var s_T1PPLW = document.getElementById("sT1PPLW");
    var s_T1PPC = document.getElementById("sT1PPC");
    var s_T1PPRW = document.getElementById("sT1PPRW");
    var s_T1PPLD = document.getElementById("sT1PPLD");
    var s_T1PPRD = document.getElementById("sT1PPRD");
    var s_T2PPLW = document.getElementById("sT2PPLW");
    var s_T2PPC = document.getElementById("sT2PPC");
    var s_T2PPRW = document.getElementById("sT2PPRW");
    var s_T2PPLD = document.getElementById("sT2PPLD");
    var s_T2PPRD = document.getElementById("sT2PPRD");
    var s_T16v5LW = document.getElementById("sT16v5LW");
    var s_T16v5C = document.getElementById("sT16v5C");
    var s_T16v5RW = document.getElementById("sT16v5RW");
    var s_T16v5LD = document.getElementById("sT16v5LD");
    var s_T16v5RD = document.getElementById("sT16v5RD");
    var s_T16v5X = document.getElementById("sT16v5X");
    var s_T26v5LW = document.getElementById("sT26v5LW");
    var s_T26v5C = document.getElementById("sT26v5C");
    var s_T26v5RW = document.getElementById("sT26v5RW");
    var s_T26v5LD = document.getElementById("sT26v5LD");
    var s_T26v5RD = document.getElementById("sT26v5RD");
    var s_T26v5X = document.getElementById("sT26v5X");

    var s_T1_p = [s_T1G, s_T1L1LW, s_T1L1C, s_T1L1RW, s_T1L1LD, s_T1L1RD,
                    s_T1L2LW, s_T1L2C, s_T1L2RW, s_T1L2LD, s_T1L2RD,
                    s_T1L3LW, s_T1L3C, s_T1L3RW, s_T1L3LD, s_T1L3RD,
                    s_T1PPLW, s_T1PPC, s_T1PPRW, s_T1PPLD, s_T1PPRD,
                    s_T16v5LW, s_T16v5C, s_T16v5RW, s_T16v5LD, s_T16v5RD, s_T16v5X];

    var s_T2_p = [s_T2G, s_T2L1LW, s_T2L1C, s_T2L1RW, s_T2L1LD, s_T2L1RD,
                    s_T2L2LW, s_T2L2C, s_T2L2RW, s_T2L2LD, s_T2L2RD,
                    s_T2L3LW, s_T2L3C, s_T2L3RW, s_T2L3LD, s_T2L3RD,
                    s_T2PPLW, s_T2PPC, s_T2PPRW, s_T2PPLD, s_T2PPRD,
                    s_T26v5LW, s_T26v5C, s_T26v5RW, s_T26v5LD, s_T26v5RD, s_T26v5X];

    // Team 1 and Team 2 name elements

    var name_t1 = "Team 1"; // Team 1 name variable
    var name_t2 = "Team 2"; // Team 2 name variable

    var n_t1_1 = document.getElementById("name_t1_1");
    var n_t1_2 = document.getElementById("name_t1_2");
    var n_t1_3 = document.getElementById("name_t1_3");
    var n_t1_4 = document.getElementById("name_t1_4");
    var n_t1_5 = document.getElementById("name_t1_5");
    var n_t1_6 = document.getElementById("name_t1_6");
    var n_t1_7 = document.getElementById("name_t1_7");
    var n_t1_8 = document.getElementById("name_t1_8");
    var n_t1_9 = document.getElementById("name_t1_9");
    var n_t1_10 = document.getElementById("name_t1_10");
    var n_t1_11 = document.getElementById("name_t1_11");
    var n_t1_12 = document.getElementById("name_t1_12");
    var n_t1_13 = document.getElementById("name_t1_13");
    var n_t1_14 = document.getElementById("name_t1_14");
    var n_t1_15 = document.getElementById("name_t1_15");
    var n_t1_16 = document.getElementById("name_t1_16");
    var n_t1_17 = document.getElementById("name_t1_17");
    var n_t1_18 = document.getElementById("name_t1_18");
    var n_t1_19 = document.getElementById("name_t1_19");
    var n_t1_20 = document.getElementById("name_t1_20");
    var n_t1_21 = document.getElementById("name_t1_21");

    var name_t1_id = [n_t1_1, n_t1_2, n_t1_3, n_t1_4, n_t1_5, n_t1_6, n_t1_7, n_t1_8,
                 n_t1_9, n_t1_10, n_t1_11, n_t1_12, n_t1_13, n_t1_14, n_t1_15,
                 n_t1_16, n_t1_17, n_t1_18, n_t1_19, n_t1_20, n_t1_21];

    var n_t2_1 = document.getElementById("name_t2_1");
    var n_t2_2 = document.getElementById("name_t2_2");
    var n_t2_3 = document.getElementById("name_t2_3");
    var n_t2_4 = document.getElementById("name_t2_4");
    var n_t2_5 = document.getElementById("name_t2_5");
    var n_t2_6 = document.getElementById("name_t2_6");
    var n_t2_7 = document.getElementById("name_t2_7");
    var n_t2_8 = document.getElementById("name_t2_8");
    var n_t2_9 = document.getElementById("name_t2_9");
    var n_t2_10 = document.getElementById("name_t2_10");
    var n_t2_11 = document.getElementById("name_t2_11");
    var n_t2_12 = document.getElementById("name_t2_12");
    var n_t2_13 = document.getElementById("name_t2_13");
    var n_t2_14 = document.getElementById("name_t2_14");
    var n_t2_15 = document.getElementById("name_t2_15");
    var n_t2_16 = document.getElementById("name_t2_16");
    var n_t2_17 = document.getElementById("name_t2_17");
    var n_t2_18 = document.getElementById("name_t2_18");
    var n_t2_19 = document.getElementById("name_t2_19");
    var n_t2_20 = document.getElementById("name_t2_20");
    var n_t2_21 = document.getElementById("name_t2_21");

    var name_t2_id = [n_t2_1, n_t2_2, n_t2_3, n_t2_4, n_t2_5, n_t2_6, n_t2_7, n_t2_8,
                 n_t2_9, n_t2_10, n_t2_11, n_t2_12, n_t2_13, n_t2_14, n_t2_15,
                 n_t2_16, n_t2_17, n_t2_18, n_t2_19, n_t2_20, n_t2_21];

    // Google charts

    google.charts.load('current', {'packages':['corechart']});

    // Data arrays for shots and seconds

    var shotData = [['User', 'Game', 'Time', 'Possession', 'Result', 'Type', 'Distance', 'Angle', 'xG', 'PP', 'SH']];
    var premShotData = [['User', 'Game', 'Time', 'Possession', 'Result', 'Type', 'Distance',
                        'Angle', 'xG', 'Shooter', 'Passer', 'TFLW', 'TFC', 'TFRW', 'TFLD', 'TFRD', 'TFG',
                        'TALW', 'TAC', 'TARW', 'TALD', 'TARD', 'TAG', 'PP', 'SH']];
    var printShotData = [['Date', 'Team 1', 'Team 2', 'Time', 'Shooting Team', 'Result', 'Type', 'xG', 'xGOT', 'Shooter',
                        'Passer', 'T1LW', 'T1C', 'T1RW', 'T1LD', 'T1RD', 'T1G', 'T2LW', 'T2C', 'T2RW', 'T2LD', 'T2RD', 'T2G',
                        'PP', 'SH','Distance','Angle', 'Player Team 1', 'Player Team 2']];
    var premTimeData = [['User', 'Game', 'Time', 'Possession', 'Line T1', 'Line T2', 'T1LW', 'T1C', 'T1RW',
                        'T1LD', 'T1RD', 'T1G', 'T2LW', 'T2C', 'T2RW', 'T2LD', 'T2RD', 'T2G']];
    var timeData = [['User', 'Game', 'Time', 'Possession', 'Line T1', 'Line T2']];
    var dataShot = 0;
    var dataRes = 0;
    var dataRes_str = "";
    var dataxG = 0;
    var dataxGOT = 0;
    var dataType = 0;
    var dataType_str = "";
    var dataDis = 0;
    var dataAngle = 0;
    var dataPp = 0;
    var dataSh = 0;
    var shooter_id = 0;
    var passer_id = 0;
    var shooter_str = "";
    var passer_str = "";
    var posT1_id = 0;
    var posT2_id = 0;
    var posT1_str = "";
    var posT2_str = "";
    var shooting_team = "";
    var shotCounter = 0;

    // Data arrays for xG charts

    var xGTeam_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL1_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL3_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];

    var xGTeamT2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL1T2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL2T2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL3T2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];

    // Data arrays for xGOT charts

    var xGOTTeam_array = [['Time','xGOT Team 1','xGOT Team 2','Goal Team 1','Goal Team 2']];
    var xGOTL1_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGOTL2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGOTL3_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];

    var xGOTTeamT2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGOTL1T2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGOTL2T2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGOTL3T2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];


    // Data arrays for line shift charts

    var posTeam_array = [['Shift nr','Line 1','Line 2','Line 3','PP Line','SH Line', 'Team']];
    var posTeamT2_array = [['Shift nr','Line 1','Line 2','Line 3','PP Line','SH Line', 'Team']];

    // Data arrays for players charts

    var plT1_array = [['ID', 'Name', 'Shot_xG','Passed_xG','Goals','Assists','Shots', 'Shot Assists','Possession+','Possession-']];
    var plT2_array = [['ID','Name', 'Shot_xG','Passed_xG','Goals','Assists','Shots', 'Shot Assists','Possession+','Possession-']];
    var plT1p_array = [['ID', 'Name', 'Shot_xG','Passed_xG','Goals','Assists','Shots', 'Shot Assists','Possession+','Possession-']];
    var plT2p_array = [['ID','Name', 'Shot_xG','Passed_xG','Goals','Assists','Shots', 'Shot Assists','Possession+','Possession-']];

    // Variables for print chart images
    var p_xGGame_chart = "";
    var p_xG_per_Game_chart = "";
    var p_T1_st_piechart = "";
    var p_T2_st_piechart = "";
    var p_xGTeam_chart = "";
    var p_T1_typechart = "";
    var p_T2_typechart = "";
    var p_T1_plstats_chart = "";
    var p_T2_plstats_chart = "";
    var p_T1_linestats_chart = "";
    var p_T2_linestats_chart = "";
    var p_pmGame_chart = "";

    var p_xGGame_chart_1 = "";
    var p_xG_per_Game_chart_1 = "";
    var p_T1_st_piechart_1 = "";
    var p_T2_st_piechart_1 = "";
    var p_xGTeam_chart_1 = "";
    var p_T1_typechart_1 = "";
    var p_T2_typechart_1 = "";

    var p_xGGame_chart_2 = "";
    var p_xG_per_Game_chart_2 = "";
    var p_T1_st_piechart_2 = "";
    var p_T2_st_piechart_2 = "";
    var p_xGTeam_chart_2 = "";
    var p_T1_typechart_2 = "";
    var p_T2_typechart_2 = "";

    var p_xGGame_chart_3 = "";
    var p_xG_per_Game_chart_3 = "";
    var p_T1_st_piechart_3 = "";
    var p_T2_st_piechart_3 = "";
    var p_xGTeam_chart_3 = "";
    var p_T1_typechart_3 = "";
    var p_T2_typechart_3 = "";

    var p_xGGame_chart_4 = "";
    var p_xG_per_Game_chart_4 = "";
    var p_T1_st_piechart_4 = "";
    var p_T2_st_piechart_4 = "";
    var p_xGTeam_chart_4 = "";
    var p_T1_typechart_4 = "";
    var p_T2_typechart_4 = "";

    // Data arrays for shot type charts

    var stT1Teamg_array = [0,0,0,0,0];
    var stT2Teamg_array = [0,0,0,0,0];
    var stT1Teamp_array = [0,0,0,0,0];
    var stT2Teamp_array = [0,0,0,0,0];
    var stT1L1g_array = [0,0,0,0,0];
    var stT2L1g_array = [0,0,0,0,0];
    var stT1L1p_array = [0,0,0,0,0];
    var stT2L1p_array = [0,0,0,0,0];
    var stT1L2g_array = [0,0,0,0,0];
    var stT2L2g_array = [0,0,0,0,0];
    var stT1L2p_array = [0,0,0,0,0];
    var stT2L2p_array = [0,0,0,0,0];
    var stT1L3g_array = [0,0,0,0,0];
    var stT2L3g_array = [0,0,0,0,0];
    var stT1L3p_array = [0,0,0,0,0];
    var stT2L3p_array = [0,0,0,0,0];


    // Data arrays for shot type xG charts

    var stxGT1Teamg_array = [0,0,0,0,0];
    var stxGT2Teamg_array = [0,0,0,0,0];
    var stxGT1Teamp_array = [0,0,0,0,0];
    var stxGT2Teamp_array = [0,0,0,0,0];
    var stxGT1L1g_array = [0,0,0,0,0];
    var stxGT2L1g_array = [0,0,0,0,0];
    var stxGT1L1p_array = [0,0,0,0,0];
    var stxGT2L1p_array = [0,0,0,0,0];
    var stxGT1L2g_array = [0,0,0,0,0];
    var stxGT2L2g_array = [0,0,0,0,0];
    var stxGT1L2p_array = [0,0,0,0,0];
    var stxGT2L2p_array = [0,0,0,0,0];
    var stxGT1L3g_array = [0,0,0,0,0];
    var stxGT2L3g_array = [0,0,0,0,0];
    var stxGT1L3p_array = [0,0,0,0,0];
    var stxGT2L3p_array = [0,0,0,0,0];

    // Data arrays for shot type against charts

    var staT1Teamg_array = [0,0,0,0,0];
    var staT2Teamg_array = [0,0,0,0,0];
    var staT1Teamp_array = [0,0,0,0,0];
    var staT2Teamp_array = [0,0,0,0,0];
    var staT1L1g_array = [0,0,0,0,0];
    var staT2L1g_array = [0,0,0,0,0];
    var staT1L1p_array = [0,0,0,0,0];
    var staT2L1p_array = [0,0,0,0,0];
    var staT1L2g_array = [0,0,0,0,0];
    var staT2L2g_array = [0,0,0,0,0];
    var staT1L2p_array = [0,0,0,0,0];
    var staT2L2p_array = [0,0,0,0,0];
    var staT1L3g_array = [0,0,0,0,0];
    var staT2L3g_array = [0,0,0,0,0];
    var staT1L3p_array = [0,0,0,0,0];
    var staT2L3p_array = [0,0,0,0,0];

    // Data arrays for shot type xG against charts

    var staxGT1Teamg_array = [0,0,0,0,0];
    var staxGT2Teamg_array = [0,0,0,0,0];
    var staxGT1Teamp_array = [0,0,0,0,0];
    var staxGT2Teamp_array = [0,0,0,0,0];
    var staxGT1L1g_array = [0,0,0,0,0];
    var staxGT2L1g_array = [0,0,0,0,0];
    var staxGT1L1p_array = [0,0,0,0,0];
    var staxGT2L1p_array = [0,0,0,0,0];
    var staxGT1L2g_array = [0,0,0,0,0];
    var staxGT2L2g_array = [0,0,0,0,0];
    var staxGT1L2p_array = [0,0,0,0,0];
    var staxGT2L2p_array = [0,0,0,0,0];
    var staxGT1L3g_array = [0,0,0,0,0];
    var staxGT2L3g_array = [0,0,0,0,0];
    var staxGT1L3p_array = [0,0,0,0,0];
    var staxGT2L3p_array = [0,0,0,0,0];

    // Data arrays for line Possession +-

    var posplusT1g_array = [0,0,0,0];
    var posminusT1g_array = [0,0,0,0];
    var posplusT2g_array = [0,0,0,0];
    var posminusT2g_array = [0,0,0,0];
    var posplusT1p_array = [0,0,0,0];
    var posminusT1p_array = [0,0,0,0];
    var posplusT2p_array = [0,0,0,0];
    var posminusT2p_array = [0,0,0,0];

    // Time on court by line period/game (in counters)
    // Team 1

    var TocL1p = 0;
    var TocL2p = 0;
    var TocL3p = 0;
    var TocL1g = 0;
    var TocL2g = 0;
    var TocL3g = 0;
    var TocPP1p = 0;
    var TocPP2p = 0;
    var TocSH1p = 0;
    var TocSH2p = 0;
    var TocPP1g = 0;
    var TocPP2g = 0;
    var TocSH1g = 0;
    var TocSH2g = 0;
    var TocTeam_g = 0;
    var TocTeam_p = 0;

    // Team 2

    var TocL1T2p = 0;
    var TocL2T2p = 0;
    var TocL3T2p = 0;
    var TocL1T2g = 0;
    var TocL2T2g = 0;
    var TocL3T2g = 0;
    var TocPP1T2p = 0;
    var TocPP2T2p = 0;
    var TocSH1T2p = 0;
    var TocSH2T2p = 0;
    var TocPP1T2g = 0;
    var TocPP2T2g = 0;
    var TocSH1T2g = 0;
    var TocSH2T2g = 0;
    var TocTeamT2_g = 0;
    var TocTeamT2_p = 0;

    // Number of times with ball (in pcs)
    // Team 1

    var NotL1p = 0;
    var NotL2p = 0;
    var NotL3p = 0;
    var NotL1g = 0;
    var NotL2g = 0;
    var NotL3g = 0;
    var NotPP1p = 0;
    var NotPP2p = 0;
    var NotSH1p = 0;
    var NotSH2p = 0;
    var NotPP1g = 0;
    var NotPP2g = 0;
    var NotSH1g = 0;
    var NotSH2g = 0;
    var NotTeam_g = 0;
    var NotTeam_p = 0;

    // Team 2

    var NotL1T2p = 0;
    var NotL2T2p = 0;
    var NotL3T2p = 0;
    var NotL1T2g = 0;
    var NotL2T2g = 0;
    var NotL3T2g = 0;
    var NotPP1T2p = 0;
    var NotPP2T2p = 0;
    var NotSH1T2p = 0;
    var NotSH2T2p = 0;
    var NotPP1T2g = 0;
    var NotPP2T2g = 0;
    var NotSH1T2g = 0;
    var NotSH2T2g = 0;
    var NotTeamT2_g = 0;
    var NotTeamT2_p = 0;

    // Number of times without ball (in pcs)
    // Team 1

    var NotnoL1p = 0;
    var NotnoL2p = 0;
    var NotnoL3p = 0;
    var NotnoL1g = 0;
    var NotnoL2g = 0;
    var NotnoL3g = 0;
    var NotnoPP1p = 0;
    var NotnoPP2p = 0;
    var NotnoSH1p = 0;
    var NotnoSH2p = 0;
    var NotnoPP1g = 0;
    var NotnoPP2g = 0;
    var NotnoSH1g = 0;
    var NotnoSH2g = 0;
    var NotnoTeam_g = 0;
    var NotnoTeam_p = 0;

    // Team 2

    var NotnoL1T2p = 0;
    var NotnoL2T2p = 0;
    var NotnoL3T2p = 0;
    var NotnoL1T2g = 0;
    var NotnoL2T2g = 0;
    var NotnoL3T2g = 0;
    var NotnoPP1T2p = 0;
    var NotnoPP2T2p = 0;
    var NotnoSH1T2p = 0;
    var NotnoSH2T2p = 0;
    var NotnoPP1T2g = 0;
    var NotnoPP2T2g = 0;
    var NotnoSH1T2g = 0;
    var NotnoSH2T2g = 0;
    var NotnoTeamT2_g = 0;
    var NotnoTeamT2_p = 0;

    // Ball possession by line/team period/game (in counters)
    // Team 1

    var PosL1p = 0;
    var PosL2p = 0;
    var PosL3p = 0;
    var PosTeam_p = 0;
    var PosL1g = 0;
    var PosL2g = 0;
    var PosL3g = 0;
    var PosTeam_g = 0;
    var PosPP1g = 0;
    var PosPP1p = 0;
    var PosSH1p = 0;
    var PosSH1g = 0;
    var PosPP2g = 0;
    var PosPP2p = 0;
    var PosSH2p = 0;
    var PosSH2g = 0;

    // Team 2

    var PosL1T2p = 0;
    var PosL2T2p = 0;
    var PosL3T2p = 0;
    var PosTeamT2_p = 0;
    var PosL1T2g = 0;
    var PosL2T2g = 0;
    var PosL3T2g = 0;
    var PosTeamT2_g = 0;
    var PosPP1T2g = 0;
    var PosPP1T2p = 0;
    var PosSH1T2p = 0;
    var PosSH1T2g = 0;
    var PosPP2T2g = 0;
    var PosPP2T2p = 0;
    var PosSH2T2p = 0;
    var PosSH2T2g = 0;

    // Number of shifts per line period/game (in pcs)
    // Team 1

    var NosL1p = 0;
    var NosL2p = 0;
    var NosL3p = 0;
    var NosTeam_p = 0;
    var NosL1g = 0;
    var NosL2g = 0;
    var NosL3g = 0;
    var NosTeam_g = 0;
    var NosPP1g = 0;
    var NosPP1p = 0;
    var NosSH1p = 0;
    var NosSH1g = 0;
    var NosPP2g = 0;
    var NosPP2p = 0;
    var NosSH2p = 0;
    var NosSH2g = 0;

    // Team 2

    var NosL1T2p = 0;
    var NosL2T2p = 0;
    var NosL3T2p = 0;
    var NosTeamT2_p = 0;
    var NosL1T2g = 0;
    var NosL2T2g = 0;
    var NosL3T2g = 0;
    var NosTeamT2_g = 0;
    var NosPP1T2g = 0;
    var NosPP1T2p = 0;
    var NosSH1T2p = 0;
    var NosSH1T2g = 0;
    var NosPP2T2g = 0;
    var NosPP2T2p = 0;
    var NosSH2T2p = 0;
    var NosSH2T2g = 0;

    // xG values by line/team period/game
    // Team 1

    var xGfL1p = 0;
    var xGfL2p = 0;
    var xGfL3p = 0;
    var xGfTeam_p = 0;
    var xGfL1g = 0;
    var xGfL2g = 0;
    var xGfL3g = 0;
    var xGfTeam_g = 0;
    var xGfPP1g = 0;
    var xGfPP1p = 0;
    var xGfSH1p = 0;
    var xGfSH1g = 0;
    var xGfPP2g = 0;
    var xGfPP2p = 0;
    var xGfSH2p = 0;
    var xGfSH2g = 0;

    var xGaL1p = 0;
    var xGaL2p = 0;
    var xGaL3p = 0;
    var xGaTeam_p = 0;
    var xGaL1g = 0;
    var xGaL2g = 0;
    var xGaL3g = 0;
    var xGaTeam_g = 0;
    var xGaPP1g = 0;
    var xGaPP1p = 0;
    var xGaSH1p = 0;
    var xGaSH1g = 0;
    var xGaPP2g = 0;
    var xGaPP2p = 0;
    var xGaSH2p = 0;
    var xGaSH2g = 0;

    //----

    var xGOTfL1p = 0;
    var xGOTfL2p = 0;
    var xGOTfL3p = 0;
    var xGOTfTeam_p = 0;
    var xGOTfL1g = 0;
    var xGOTfL2g = 0;
    var xGOTfL3g = 0;
    var xGOTfTeam_g = 0;
    var xGOTfPP1g = 0;
    var xGOTfPP1p = 0;
    var xGOTfSH1p = 0;
    var xGOTfSH1g = 0;
    var xGOTfPP2g = 0;
    var xGOTfPP2p = 0;
    var xGOTfSH2p = 0;
    var xGOTfSH2g = 0;

    var xGOTaL1p = 0;
    var xGOTaL2p = 0;
    var xGOTaL3p = 0;
    var xGOTaTeam_p = 0;
    var xGOTaL1g = 0;
    var xGOTaL2g = 0;
    var xGOTaL3g = 0;
    var xGOTaTeam_g = 0;
    var xGOTaPP1g = 0;
    var xGOTaPP1p = 0;
    var xGOTaSH1p = 0;
    var xGOTaSH1g = 0;
    var xGOTaPP2g = 0;
    var xGOTaPP2p = 0;
    var xGOTaSH2p = 0;
    var xGOTaSH2g = 0;

    // Team 2

    var xGfL1T2p = 0;
    var xGfL2T2p = 0;
    var xGfL3T2p = 0;
    var xGfTeamT2_p = 0;
    var xGfL1T2g = 0;
    var xGfL2T2g = 0;
    var xGfL3T2g = 0;
    var xGfTeamT2_g = 0;
    var xGfPP1T2g = 0;
    var xGfPP1T2p = 0;
    var xGfSH1T2p = 0;
    var xGfSH1T2g = 0;
    var xGfPP2T2g = 0;
    var xGfPP2T2p = 0;
    var xGfSH2T2p = 0;
    var xGfSH2T2g = 0;

    var xGaL1T2p = 0;
    var xGaL2T2p = 0;
    var xGaL3T2p = 0;
    var xGaTeamT2_p = 0;
    var xGaL1T2g = 0;
    var xGaL2T2g = 0;
    var xGaL3T2g = 0;
    var xGaTeamT2_g = 0;
    var xGaPP1T2g = 0;
    var xGaPP1T2p = 0;
    var xGaSH1T2p = 0;
    var xGaSH1T2g = 0;
    var xGaPP2T2g = 0;
    var xGaPP2T2p = 0;
    var xGaSH2T2p = 0;
    var xGaSH2T2g = 0;

    //----

    var xGOTfL1T2p = 0;
    var xGOTfL2T2p = 0;
    var xGOTfL3T2p = 0;
    var xGOTfTeamT2_p = 0;
    var xGOTfL1T2g = 0;
    var xGOTfL2T2g = 0;
    var xGOTfL3T2g = 0;
    var xGOTfTeamT2_g = 0;
    var xGOTfPP1T2g = 0;
    var xGOTfPP1T2p = 0;
    var xGOTfSH1T2p = 0;
    var xGOTfSH1T2g = 0;
    var xGOTfPP2T2g = 0;
    var xGOTfPP2T2p = 0;
    var xGOTfSH2T2p = 0;
    var xGOTfSH2T2g = 0;

    var xGOTaL1T2p = 0;
    var xGOTaL2T2p = 0;
    var xGOTaL3T2p = 0;
    var xGOTaTeamT2_p = 0;
    var xGOTaL1T2g = 0;
    var xGOTaL2T2g = 0;
    var xGOTaL3T2g = 0;
    var xGOTaTeamT2_g = 0;
    var xGOTaPP1T2g = 0;
    var xGOTaPP1T2p = 0;
    var xGOTaSH1T2p = 0;
    var xGOTaSH1T2g = 0;
    var xGOTaPP2T2g = 0;
    var xGOTaPP2T2p = 0;
    var xGOTaSH2T2p = 0;
    var xGOTaSH2T2g = 0;

    // Arrays for easy access to variables
    // Team 1

    var Toc_p = [TocL1p, TocL2p, TocL3p, TocPP1p, TocPP2p, TocSH1p, TocSH2p, TocTeam_p];
    var Toc_g = [TocL1g, TocL2g, TocL3g, TocPP1g, TocPP2g, TocSH1g, TocSH2g, TocTeam_g];
    var Pos_p = [PosL1p, PosL2p, PosL3p, PosPP1p, PosPP2p, PosSH1p, PosSH2p, PosTeam_p];
    var Pos_g = [PosL1g, PosL2g, PosL3g, PosPP1g, PosPP2g, PosSH1g, PosSH2g, PosTeam_g];
    var Not_p = [NotL1p, NotL2p, NotL3p, NotPP1p, NotPP2p, NotSH1p, NotSH2p, NotTeam_p];
    var Not_g = [NotL1g, NotL2g, NotL3g, NotPP1g, NotPP2g, NotSH1g, NotSH2g, NotTeam_g];
    var Nos_p = [NosL1p, NosL2p, NosL3p, NosPP1p, NosPP2p, NosSH1p, NosSH2p, NosTeam_p];
    var Nos_g = [NosL1g, NosL2g, NosL3g, NosPP1g, NosPP2g, NosSH1g, NosSH2g, NosTeam_g];
    var Notno_p = [NotnoL1p, NotnoL2p, NotnoL3p, NotnoPP1p, NotnoPP2p, NotnoSH1p, NotnoSH2p, NotnoTeam_p];
    var Notno_g = [NotnoL1g, NotnoL2g, NotnoL3g, NotnoPP1g, NotnoPP2g, NotnoSH1g, NotnoSH2g, NotnoTeam_g];
    var xGf_p = [xGfL1p, xGfL2p, xGfL3p, xGfPP1p, xGfPP2p, xGfSH1p, xGfSH2p, xGfTeam_p];
    var xGf_g = [xGfL1g, xGfL2g, xGfL3g, xGfPP1g, xGfPP2g, xGfSH1g, xGfSH2g, xGfTeam_g];
    var xGa_p = [xGaL1p, xGaL2p, xGaL3p, xGaPP1p, xGaPP2p, xGaSH1p, xGaSH2p, xGaTeam_p];
    var xGa_g = [xGaL1g, xGaL2g, xGaL3g, xGaPP1g, xGaPP2g, xGaSH1g, xGaSH2g, xGaTeam_g];

    //xGOT Team 1

    var xGOTf_g = [xGOTfL1g, xGOTfL2g, xGOTfL3g, xGOTfPP1g, xGOTfPP2g, xGOTfSH1g, xGOTfSH2g, xGOTfTeam_g];
    var xGOTa_g = [xGOTaL1g, xGOTaL2g, xGOTaL3g, xGOTaPP1g, xGOTaPP2g, xGOTaSH1g, xGOTaSH2g, xGOTaTeam_g];
    // Team 2

    var TocT2_p = [TocL1T2p, TocL2T2p, TocL3T2p, TocPP1T2p, TocPP2T2p, TocSH1T2p, TocSH2T2p, TocTeamT2_p];
    var TocT2_g = [TocL1T2g, TocL2T2g, TocL3T2g, TocPP1T2g, TocPP2T2g, TocSH1T2g, TocSH2T2g, TocTeamT2_g];
    var PosT2_p = [PosL1T2p, PosL2T2p, PosL3T2p, PosPP1T2p, PosPP2T2p, PosSH1T2p, PosSH2T2p, PosTeamT2_p];
    var PosT2_g = [PosL1T2g, PosL2T2g, PosL3T2g, PosPP1T2g, PosPP2T2g, PosSH1T2g, PosSH2T2g, PosTeamT2_g];
    var NotT2_p = [NotL1T2p, NotL2T2p, NotL3T2p, NotPP1T2p, NotPP2T2p, NotSH1T2p, NotSH2T2p, NotTeamT2_p];
    var NotT2_g = [NotL1T2g, NotL2T2g, NotL3T2g, NotPP1T2g, NotPP2T2g, NotSH1T2g, NotSH2T2g, NotTeamT2_g];
    var NosT2_p = [NosL1T2p, NosL2T2p, NosL3T2p, NosPP1T2p, NosPP2T2p, NosSH1T2p, NosSH2T2p, NosTeamT2_p];
    var NosT2_g = [NosL1T2g, NosL2T2g, NosL3T2g, NosPP1T2g, NosPP2T2g, NosSH1T2g, NosSH2T2g, NosTeamT2_g];
    var NotnoT2_p = [NotnoL1T2p, NotnoL2T2p, NotnoL3T2p, NotnoPP1T2p, NotnoPP2T2p, NotnoSH1T2p, NotnoSH2T2p, NotnoTeamT2_p];
    var NotnoT2_g = [NotnoL1T2g, NotnoL2T2g, NotnoL3T2g, NotnoPP1T2g, NotnoPP2T2g, NotnoSH1T2g, NotnoSH2T2g, NotnoTeamT2_g];
    var xGfT2_p = [xGfL1T2p, xGfL2T2p, xGfL3T2p, xGfPP1T2p, xGfPP2T2p, xGfSH1T2p, xGfSH2T2p, xGfTeamT2_p];
    var xGfT2_g = [xGfL1T2g, xGfL2T2g, xGfL3T2g, xGfPP1T2g, xGfPP2T2g, xGfSH1T2g, xGfSH2T2g, xGfTeamT2_g];
    var xGaT2_p = [xGaL1T2p, xGaL2T2p, xGaL3T2p, xGaPP1T2p, xGaPP2T2p, xGaSH1T2p, xGaSH2T2p, xGaTeamT2_p];
    var xGaT2_g = [xGaL1T2g, xGaL2T2g, xGaL3T2g, xGaPP1T2g, xGaPP2T2g, xGaSH1T2g, xGaSH2T2g, xGaTeamT2_g];

    // xGOT Team 2

    var xGOTfT2_g = [xGOTfL1T2g, xGOTfL2T2g, xGOTfL3T2g, xGOTfPP1T2g, xGOTfPP2T2g, xGOTfSH1T2g, xGOTfSH2T2g, xGOTfTeamT2_g];
    var xGOTaT2_g = [xGOTaL1T2g, xGOTaL2T2g, xGOTaL3T2g, xGOTaPP1T2g, xGOTaPP2T2g, xGOTaSH1T2g, xGOTaSH2T2g, xGOTaTeamT2_g];

    // html id myCanvas to variable
    var cnvs = document.getElementById("myCanvas");
    var cnvs_1 = document.getElementById("myCanvas_1");
    var cnvs_2 = document.getElementById("myCanvas_2");
    var cnvs_3 = document.getElementById("myCanvas_3");
    var cnvs_4 = document.getElementById("myCanvas_4");
    var cnvs_5 = document.getElementById("myCanvas_5");
    var ctx = cnvs.getContext("2d");
    var ctx1 = cnvs_1.getContext("2d");
    var ctx2 = cnvs_2.getContext("2d");
    var ctx3 = cnvs_3.getContext("2d");
    var ctx4 = cnvs_4.getContext("2d");
    var ctx5 = cnvs_5.getContext("2d");

    // html id shotmenu to variable
    var menu = document.getElementById("shotmenu");
    // html id shottype to variable
    var stype = document.getElementById("shottype");
    // premium html id shooter type to variable
    var shootertype = document.getElementById("shooter");
    // premium html id passer type to variable
    var passertype = document.getElementById("passer");
    // premium html id possession Team 1 menu to variable
    var posT1menu = document.getElementById("posT1menu");
    // premium html id Possession Team 2 menu to variable
    var posT2menu = document.getElementById("posT2menu");
    // home and away team textfields to variables
    var hTeam = document.getElementById("home_team");
    var aTeam = document.getElementById("away_team");
    // Send Data - button element to variable
    var sData = document.getElementById("sData");

    // html ids to variables
    // Shots/goals/misses/blocks/saves for/against, turnovers, plusminus by line/team and period/game
    // Team 1

    var sfL1p = document.getElementById("sfL1");
    var saL1p = document.getElementById("saL1");
    var bfL1p = document.getElementById("bfL1");
    var baL1p = document.getElementById("baL1");
    var gfL1p = document.getElementById("gfL1");
    var gaL1p = document.getElementById("gaL1");
    var pmL1p = document.getElementById("pmL1");
    var mfL1p = document.getElementById("mfL1");
    var maL1p = document.getElementById("maL1");
    var safL1p = document.getElementById("safL1");
    var saaL1p = document.getElementById("saaL1");
    var sfL2p = document.getElementById("sfL2");
    var saL2p = document.getElementById("saL2");
    var bfL2p = document.getElementById("bfL2");
    var baL2p = document.getElementById("baL2");
    var gfL2p = document.getElementById("gfL2");
    var gaL2p = document.getElementById("gaL2");
    var pmL2p = document.getElementById("pmL2");
    var mfL2p = document.getElementById("mfL2");
    var maL2p = document.getElementById("maL2");
    var safL2p = document.getElementById("safL2");
    var saaL2p = document.getElementById("saaL2");
    var sfL3p = document.getElementById("sfL3");
    var saL3p = document.getElementById("saL3");
    var bfL3p = document.getElementById("bfL3");
    var baL3p = document.getElementById("baL3");
    var gfL3p = document.getElementById("gfL3");
    var gaL3p = document.getElementById("gaL3");
    var pmL3p = document.getElementById("pmL3");
    var mfL3p = document.getElementById("mfL3");
    var maL3p = document.getElementById("maL3");
    var safL3p = document.getElementById("safL3");
    var saaL3p = document.getElementById("saaL3");
    var sfPP1p = document.getElementById("sfPP1");
    var saPP1p = document.getElementById("saPP1");
    var bfPP1p = document.getElementById("bfPP1");
    var baPP1p = document.getElementById("baPP1");
    var gfPP1p = document.getElementById("gfPP1");
    var gaPP1p = document.getElementById("gaPP1");
    var pmPP1p = document.getElementById("pmPP1");
    var mfPP1p = document.getElementById("mfPP1");
    var maPP1p = document.getElementById("maPP1");
    var safPP1p = document.getElementById("safPP1");
    var saaPP1p = document.getElementById("saaPP1");
    var sfPP2p = document.getElementById("sfPP2");
    var saPP2p = document.getElementById("saPP2");
    var bfPP2p = document.getElementById("bfPP2");
    var baPP2p = document.getElementById("baPP2");
    var gfPP2p = document.getElementById("gfPP2");
    var gaPP2p = document.getElementById("gaPP2");
    var pmPP2p = document.getElementById("pmPP2");
    var mfPP2p = document.getElementById("mfPP2");
    var maPP2p = document.getElementById("maPP2");
    var safPP2p = document.getElementById("safPP2");
    var saaPP2p = document.getElementById("saaPP2");
    var sfSH1p = document.getElementById("sfSH1");
    var saSH1p = document.getElementById("saSH1");
    var bfSH1p = document.getElementById("bfSH1");
    var baSH1p = document.getElementById("baSH1");
    var gfSH1p = document.getElementById("gfSH1");
    var gaSH1p = document.getElementById("gaSH1");
    var pmSH1p = document.getElementById("pmSH1");
    var mfSH1p = document.getElementById("mfSH1");
    var maSH1p = document.getElementById("maSH1");
    var safSH1p = document.getElementById("safSH1");
    var saaSH1p = document.getElementById("saaSH1");
    var sfSH2p = document.getElementById("sfSH2");
    var saSH2p = document.getElementById("saSH2");
    var bfSH2p = document.getElementById("bfSH2");
    var baSH2p = document.getElementById("baSH2");
    var gfSH2p = document.getElementById("gfSH2");
    var gaSH2p = document.getElementById("gaSH2");
    var pmSH2p = document.getElementById("pmSH2");
    var mfSH2p = document.getElementById("mfSH2");
    var maSH2p = document.getElementById("maSH2");
    var safSH2p = document.getElementById("safSH2");
    var saaSH2p = document.getElementById("saaSH2");
    var sfTeamp = document.getElementById("sfTeam");
    var saTeamp = document.getElementById("saTeam");
    var bfTeamp = document.getElementById("bfTeam");
    var baTeamp = document.getElementById("baTeam");
    var gfTeamp = document.getElementById("gfTeam");
    var gaTeamp = document.getElementById("gaTeam");
    var pmTeamp = document.getElementById("pmTeam");
    var mfTeamp = document.getElementById("mfTeam");
    var maTeamp = document.getElementById("maTeam");
    var safTeamp = document.getElementById("safTeam");
    var saaTeamp = document.getElementById("saaTeam");

    // Team 2

    var sfL1T2p = document.getElementById("sfL1T2");
    var saL1T2p = document.getElementById("saL1T2");
    var bfL1T2p = document.getElementById("bfL1T2");
    var baL1T2p = document.getElementById("baL1T2");
    var gfL1T2p = document.getElementById("gfL1T2");
    var gaL1T2p = document.getElementById("gaL1T2");
    var pmL1T2p = document.getElementById("pmL1T2");
    var mfL1T2p = document.getElementById("mfL1T2");
    var maL1T2p = document.getElementById("maL1T2");
    var safL1T2p = document.getElementById("safL1T2");
    var saaL1T2p = document.getElementById("saaL1T2");
    var sfL2T2p = document.getElementById("sfL2T2");
    var saL2T2p = document.getElementById("saL2T2");
    var bfL2T2p = document.getElementById("bfL2T2");
    var baL2T2p = document.getElementById("baL2T2");
    var gfL2T2p = document.getElementById("gfL2T2");
    var gaL2T2p = document.getElementById("gaL2T2");
    var pmL2T2p = document.getElementById("pmL2T2");
    var mfL2T2p = document.getElementById("mfL2T2");
    var maL2T2p = document.getElementById("maL2T2");
    var safL2T2p = document.getElementById("safL2T2");
    var saaL2T2p = document.getElementById("saaL2T2");
    var sfL3T2p = document.getElementById("sfL3T2");
    var saL3T2p = document.getElementById("saL3T2");
    var bfL3T2p = document.getElementById("bfL3T2");
    var baL3T2p = document.getElementById("baL3T2");
    var gfL3T2p = document.getElementById("gfL3T2");
    var gaL3T2p = document.getElementById("gaL3T2");
    var pmL3T2p = document.getElementById("pmL3T2");
    var mfL3T2p = document.getElementById("mfL3T2");
    var maL3T2p = document.getElementById("maL3T2");
    var safL3T2p = document.getElementById("safL3T2");
    var saaL3T2p = document.getElementById("saaL3T2");
    var sfPP1T2p = document.getElementById("sfPP1T2");
    var saPP1T2p = document.getElementById("saPP1T2");
    var bfPP1T2p = document.getElementById("bfPP1T2");
    var baPP1T2p = document.getElementById("baPP1T2");
    var gfPP1T2p = document.getElementById("gfPP1T2");
    var gaPP1T2p = document.getElementById("gaPP1T2");
    var pmPP1T2p = document.getElementById("pmPP1T2");
    var mfPP1T2p = document.getElementById("mfPP1T2");
    var maPP1T2p = document.getElementById("maPP1T2");
    var safPP1T2p = document.getElementById("safPP1T2");
    var saaPP1T2p = document.getElementById("saaPP1T2");
    var sfPP2T2p = document.getElementById("sfPP2T2");
    var saPP2T2p = document.getElementById("saPP2T2");
    var bfPP2T2p = document.getElementById("bfPP2T2");
    var baPP2T2p = document.getElementById("baPP2T2");
    var gfPP2T2p = document.getElementById("gfPP2T2");
    var gaPP2T2p = document.getElementById("gaPP2T2");
    var pmPP2T2p = document.getElementById("pmPP2T2");
    var mfPP2T2p = document.getElementById("mfPP2T2");
    var maPP2T2p = document.getElementById("maPP2T2");
    var safPP2T2p = document.getElementById("safPP2T2");
    var saaPP2T2p = document.getElementById("saaPP2T2");
    var sfSH1T2p = document.getElementById("sfSH1T2");
    var saSH1T2p = document.getElementById("saSH1T2");
    var bfSH1T2p = document.getElementById("bfSH1T2");
    var baSH1T2p = document.getElementById("baSH1T2");
    var gfSH1T2p = document.getElementById("gfSH1T2");
    var gaSH1T2p = document.getElementById("gaSH1T2");
    var pmSH1T2p = document.getElementById("pmSH1T2");
    var mfSH1T2p = document.getElementById("mfSH1T2");
    var maSH1T2p = document.getElementById("maSH1T2");
    var safSH1T2p = document.getElementById("safSH1T2");
    var saaSH1T2p = document.getElementById("saaSH1T2");
    var sfSH2T2p = document.getElementById("sfSH2T2");
    var saSH2T2p = document.getElementById("saSH2T2");
    var bfSH2T2p = document.getElementById("bfSH2T2");
    var baSH2T2p = document.getElementById("baSH2T2");
    var gfSH2T2p = document.getElementById("gfSH2T2");
    var gaSH2T2p = document.getElementById("gaSH2T2");
    var pmSH2T2p = document.getElementById("pmSH2T2");
    var mfSH2T2p = document.getElementById("mfSH2T2");
    var maSH2T2p = document.getElementById("maSH2T2");
    var safSH2T2p = document.getElementById("safSH2T2");
    var saaSH2T2p = document.getElementById("saaSH2T2");
    var sfTeamT2p = document.getElementById("sfTeamT2");
    var saTeamT2p = document.getElementById("saTeamT2");
    var bfTeamT2p = document.getElementById("bfTeamT2");
    var baTeamT2p = document.getElementById("baTeamT2");
    var gfTeamT2p = document.getElementById("gfTeamT2");
    var gaTeamT2p = document.getElementById("gaTeamT2");
    var pmTeamT2p = document.getElementById("pmTeamT2");
    var mfTeamT2p = document.getElementById("mfTeamT2");
    var maTeamT2p = document.getElementById("maTeamT2");
    var safTeamT2p = document.getElementById("safTeamT2");
    var saaTeamT2p = document.getElementById("saaTeamT2");

    // html ids to variables
    // Possession/Time on Court/AttZone by line/team period/game
    // Team 1

    var pL1p = document.getElementById("pL1");
    var pL2p = document.getElementById("pL2");
    var pL3p = document.getElementById("pL3");
    var pPP1p = document.getElementById("pPP1");
    var pPP2p = document.getElementById("pPP2");
    var pSH1p = document.getElementById("pSH1");
    var pSH2p = document.getElementById("pSH2");
    var pTeamp = document.getElementById("pTeam");
    var tocL1p = document.getElementById("tocL1");
    var tocL2p = document.getElementById("tocL2");
    var tocL3p = document.getElementById("tocL3");
    var tocPP1p = document.getElementById("tocPP1");
    var tocPP2p = document.getElementById("tocPP2");
    var tocSH1p = document.getElementById("tocSH1");
    var tocSH2p = document.getElementById("tocSH2");
    var tocTeamp = document.getElementById("tocTeam");
    var atocL1p = document.getElementById("atocL1");
    var atocL2p = document.getElementById("atocL2");
    var atocL3p = document.getElementById("atocL3");
    var atocPP1p = document.getElementById("atocPP1");
    var atocPP2p = document.getElementById("atocPP2");
    var atocSH1p = document.getElementById("atocSH1");
    var atocSH2p = document.getElementById("atocSH2");
    var atocTeamp = document.getElementById("atocTeam");
    var avgL1p = document.getElementById("avgL1");
    var avgL2p = document.getElementById("avgL2");
    var avgL3p = document.getElementById("avgL3");
    var avgPP1p = document.getElementById("avgPP1");
    var avgPP2p = document.getElementById("avgPP2");
    var avgSH1p = document.getElementById("avgSH1");
    var avgSH2p = document.getElementById("avgSH2");
    var avgTeamp = document.getElementById("avgTeam");
    var avgnoL1p = document.getElementById("avgnoL1");
    var avgnoL2p = document.getElementById("avgnoL2");
    var avgnoL3p = document.getElementById("avgnoL3");
    var avgnoPP1p = document.getElementById("avgnoPP1");
    var avgnoPP2p = document.getElementById("avgnoPP2");
    var avgnoSH1p = document.getElementById("avgnoSH1");
    var avgnoSH2p = document.getElementById("avgnoSH2");
    var avgnoTeamp = document.getElementById("avgnoTeam");
    var xGf_L1p = document.getElementById("xGf_L1");
    var xGf_L2p = document.getElementById("xGf_L2");
    var xGf_L3p = document.getElementById("xGf_L3");
    var xGf_PP1p = document.getElementById("xGf_PP1");
    var xGf_PP2p = document.getElementById("xGf_PP2");
    var xGf_SH1p = document.getElementById("xGf_SH1");
    var xGf_SH2p = document.getElementById("xGf_SH2");
    var xGf_Teamp = document.getElementById("xGf_Team");
    var xGa_L1p = document.getElementById("xGa_L1");
    var xGa_L2p = document.getElementById("xGa_L2");
    var xGa_L3p = document.getElementById("xGa_L3");
    var xGa_PP1p = document.getElementById("xGa_PP1");
    var xGa_PP2p = document.getElementById("xGa_PP2");
    var xGa_SH1p = document.getElementById("xGa_SH1");
    var xGa_SH2p = document.getElementById("xGa_SH2");
    var xGa_Teamp = document.getElementById("xGa_Team");

    // Team 2

    var pL1T2p = document.getElementById("pL1T2");
    var pL2T2p = document.getElementById("pL2T2");
    var pL3T2p = document.getElementById("pL3T2");
    var pPP1T2p = document.getElementById("pPP1T2");
    var pPP2T2p = document.getElementById("pPP2T2");
    var pSH1T2p = document.getElementById("pSH1T2");
    var pSH2T2p = document.getElementById("pSH2T2");
    var pTeamT2p = document.getElementById("pTeamT2");
    var tocL1T2p = document.getElementById("tocL1T2");
    var tocL2T2p = document.getElementById("tocL2T2");
    var tocL3T2p = document.getElementById("tocL3T2");
    var tocPP1T2p = document.getElementById("tocPP1T2");
    var tocPP2T2p = document.getElementById("tocPP2T2");
    var tocSH1T2p = document.getElementById("tocSH1T2");
    var tocSH2T2p = document.getElementById("tocSH2T2");
    var tocTeamT2p = document.getElementById("tocTeamT2");
    var atocL1T2p = document.getElementById("atocL1T2");
    var atocL2T2p = document.getElementById("atocL2T2");
    var atocL3T2p = document.getElementById("atocL3T2");
    var atocPP1T2p = document.getElementById("atocPP1T2");
    var atocPP2T2p = document.getElementById("atocPP2T2");
    var atocSH1T2p = document.getElementById("atocSH1T2");
    var atocSH2T2p = document.getElementById("atocSH2T2");
    var atocTeamT2p = document.getElementById("atocTeamT2");
    var avgL1T2p = document.getElementById("avgL1T2");
    var avgL2T2p = document.getElementById("avgL2T2");
    var avgL3T2p = document.getElementById("avgL3T2");
    var avgPP1T2p = document.getElementById("avgPP1T2");
    var avgPP2T2p = document.getElementById("avgPP2T2");
    var avgSH1T2p = document.getElementById("avgSH1T2");
    var avgSH2T2p = document.getElementById("avgSH2T2");
    var avgTeamT2p = document.getElementById("avgTeamT2");
    var avgnoL1T2p = document.getElementById("avgnoL1T2");
    var avgnoL2T2p = document.getElementById("avgnoL2T2");
    var avgnoL3T2p = document.getElementById("avgnoL3T2");
    var avgnoPP1T2p = document.getElementById("avgnoPP1T2");
    var avgnoPP2T2p = document.getElementById("avgnoPP2T2");
    var avgnoSH1T2p = document.getElementById("avgnoSH1T2");
    var avgnoSH2T2p = document.getElementById("avgnoSH2T2");
    var avgnoTeamT2p = document.getElementById("avgnoTeamT2");
    var xGf_L1T2p = document.getElementById("xGf_L1T2");
    var xGf_L2T2p = document.getElementById("xGf_L2T2");
    var xGf_L3T2p = document.getElementById("xGf_L3T2");
    var xGf_PP1T2p = document.getElementById("xGf_PP1T2");
    var xGf_PP2T2p = document.getElementById("xGf_PP2T2");
    var xGf_SH1T2p = document.getElementById("xGf_SH1T2");
    var xGf_SH2T2p = document.getElementById("xGf_SH2T2");
    var xGf_TeamT2p = document.getElementById("xGf_TeamT2");
    var xGa_L1T2p = document.getElementById("xGa_L1T2");
    var xGa_L2T2p = document.getElementById("xGa_L2T2");
    var xGa_L3T2p = document.getElementById("xGa_L3T2");
    var xGa_PP1T2p = document.getElementById("xGa_PP1T2");
    var xGa_PP2T2p = document.getElementById("xGa_PP2T2");
    var xGa_SH1T2p = document.getElementById("xGa_SH1T2");
    var xGa_SH2T2p = document.getElementById("xGa_SH2T2");
    var xGa_TeamT2p = document.getElementById("xGa_TeamT2");

    // html ids to variables
    // Shots/goals/penalties for/against, Fenwick/ba, plusminus by line/team period/game
    // Team 1

    var sfL1g = document.getElementById("sfL1g");
    var saL1g = document.getElementById("saL1g");
    var bfL1g = document.getElementById("bfL1g");
    var baL1g = document.getElementById("baL1g");
    var gfL1g = document.getElementById("gfL1g");
    var gaL1g = document.getElementById("gaL1g");
    var pmL1g = document.getElementById("pmL1g");
    var mfL1g = document.getElementById("mfL1g");
    var maL1g = document.getElementById("maL1g");
    var safL1g = document.getElementById("safL1g");
    var saaL1g = document.getElementById("saaL1g");
    var sfL2g = document.getElementById("sfL2g");
    var saL2g = document.getElementById("saL2g");
    var bfL2g = document.getElementById("bfL2g");
    var baL2g = document.getElementById("baL2g");
    var gfL2g = document.getElementById("gfL2g");
    var gaL2g = document.getElementById("gaL2g");
    var pmL2g = document.getElementById("pmL2g");
    var mfL2g = document.getElementById("mfL2g");
    var maL2g = document.getElementById("maL2g");
    var safL2g = document.getElementById("safL2g");
    var saaL2g = document.getElementById("saaL2g");
    var sfL3g = document.getElementById("sfL3g");
    var saL3g = document.getElementById("saL3g");
    var bfL3g = document.getElementById("bfL3g");
    var baL3g = document.getElementById("baL3g");
    var gfL3g = document.getElementById("gfL3g");
    var gaL3g = document.getElementById("gaL3g");
    var pmL3g = document.getElementById("pmL3g");
    var mfL3g = document.getElementById("mfL3g");
    var maL3g = document.getElementById("maL3g");
    var safL3g = document.getElementById("safL3g");
    var saaL3g = document.getElementById("saaL3g");
    var sfPP1g = document.getElementById("sfPP1g");
    var saPP1g = document.getElementById("saPP1g");
    var bfPP1g = document.getElementById("bfPP1g");
    var baPP1g = document.getElementById("baPP1g");
    var gfPP1g = document.getElementById("gfPP1g");
    var gaPP1g = document.getElementById("gaPP1g");
    var pmPP1g = document.getElementById("pmPP1g");
    var mfPP1g = document.getElementById("mfPP1g");
    var maPP1g = document.getElementById("maPP1g");
    var safPP1g = document.getElementById("safPP1g");
    var saaPP1g = document.getElementById("saaPP1g");
    var sfPP2g = document.getElementById("sfPP2g");
    var saPP2g = document.getElementById("saPP2g");
    var bfPP2g = document.getElementById("bfPP2g");
    var baPP2g = document.getElementById("baPP2g");
    var gfPP2g = document.getElementById("gfPP2g");
    var gaPP2g = document.getElementById("gaPP2g");
    var pmPP2g = document.getElementById("pmPP2g");
    var mfPP2g = document.getElementById("mfPP2g");
    var maPP2g = document.getElementById("maPP2g");
    var safPP2g = document.getElementById("safPP2g");
    var saaPP2g = document.getElementById("saaPP2g");
    var sfSH1g = document.getElementById("sfSH1g");
    var saSH1g = document.getElementById("saSH1g");
    var bfSH1g = document.getElementById("bfSH1g");
    var baSH1g = document.getElementById("baSH1g");
    var gfSH1g = document.getElementById("gfSH1g");
    var gaSH1g = document.getElementById("gaSH1g");
    var pmSH1g = document.getElementById("pmSH1g");
    var mfSH1g = document.getElementById("mfSH1g");
    var maSH1g = document.getElementById("maSH1g");
    var safSH1g = document.getElementById("safSH1g");
    var saaSH1g = document.getElementById("saaSH1g");
    var sfSH2g = document.getElementById("sfSH2g");
    var saSH2g = document.getElementById("saSH2g");
    var bfSH2g = document.getElementById("bfSH2g");
    var baSH2g = document.getElementById("baSH2g");
    var gfSH2g = document.getElementById("gfSH2g");
    var gaSH2g = document.getElementById("gaSH2g");
    var pmSH2g = document.getElementById("pmSH2g");
    var mfSH2g = document.getElementById("mfSH2g");
    var maSH2g = document.getElementById("maSH2g");
    var safSH2g = document.getElementById("safSH2g");
    var saaSH2g = document.getElementById("saaSH2g");
    var sfTeamg = document.getElementById("sfTeamg");
    var saTeamg = document.getElementById("saTeamg");
    var bfTeamg = document.getElementById("bfTeamg");
    var baTeamg = document.getElementById("baTeamg");
    var gfTeamg = document.getElementById("gfTeamg");
    var gaTeamg = document.getElementById("gaTeamg");
    var pmTeamg = document.getElementById("pmTeamg");
    var mfTeamg = document.getElementById("mfTeamg");
    var maTeamg = document.getElementById("maTeamg");
    var safTeamg = document.getElementById("safTeamg");
    var saaTeamg = document.getElementById("saaTeamg");
    var pL1g = document.getElementById("pL1g");
    var pL2g = document.getElementById("pL2g");
    var pL3g = document.getElementById("pL3g");
    var pPP1g = document.getElementById("pPP1g");
    var pPP2g = document.getElementById("pPP2g");
    var pSH1g = document.getElementById("pSH1g");
    var pSH2g = document.getElementById("pSH2g");
    var pTeamg = document.getElementById("pTeamg");
    var tocL1g = document.getElementById("tocL1g");
    var tocL2g = document.getElementById("tocL2g");
    var tocL3g = document.getElementById("tocL3g");
    var tocPP1g = document.getElementById("tocPP1g");
    var tocPP2g = document.getElementById("tocPP2g");
    var tocSH1g = document.getElementById("tocSH1g");
    var tocSH2g = document.getElementById("tocSH2g");
    var tocTeamg = document.getElementById("tocTeamg");
    var atocL1g = document.getElementById("atocL1g");
    var atocL2g = document.getElementById("atocL2g");
    var atocL3g = document.getElementById("atocL3g");
    var atocPP1g = document.getElementById("atocPP1g");
    var atocPP2g = document.getElementById("atocPP2g");
    var atocSH1g = document.getElementById("atocSH1g");
    var atocSH2g = document.getElementById("atocSH2g");
    var atocTeamg = document.getElementById("atocTeamg");
    var avgL1g = document.getElementById("avgL1g");
    var avgL2g = document.getElementById("avgL2g");
    var avgL3g = document.getElementById("avgL3g");
    var avgPP1g = document.getElementById("avgPP1g");
    var avgPP2g = document.getElementById("avgPP2g");
    var avgSH1g = document.getElementById("avgSH1g");
    var avgSH2g = document.getElementById("avgSH2g");
    var avgTeamg = document.getElementById("avgTeamg");
    var avgnoL1g = document.getElementById("avgnoL1g");
    var avgnoL2g = document.getElementById("avgnoL2g");
    var avgnoL3g = document.getElementById("avgnoL3g");
    var avgnoPP1g = document.getElementById("avgnoPP1g");
    var avgnoPP2g = document.getElementById("avgnoPP2g");
    var avgnoSH1g = document.getElementById("avgnoSH1g");
    var avgnoSH2g = document.getElementById("avgnoSH2g");
    var avgnoTeamg = document.getElementById("avgnoTeamg");
    var xGf_L1g = document.getElementById("xGf_L1g");
    var xGf_L2g = document.getElementById("xGf_L2g");
    var xGf_L3g = document.getElementById("xGf_L3g");
    var xGf_PP1g = document.getElementById("xGf_PP1g");
    var xGf_PP2g = document.getElementById("xGf_PP2g");
    var xGf_SH1g = document.getElementById("xGf_SH1g");
    var xGf_SH2g = document.getElementById("xGf_SH2g");
    var xGf_Teamg = document.getElementById("xGf_Teamg");
    var xGa_L1g = document.getElementById("xGa_L1g");
    var xGa_L2g = document.getElementById("xGa_L2g");
    var xGa_L3g = document.getElementById("xGa_L3g");
    var xGa_PP1g = document.getElementById("xGa_PP1g");
    var xGa_PP2g = document.getElementById("xGa_PP2g");
    var xGa_SH1g = document.getElementById("xGa_SH1g");
    var xGa_SH2g = document.getElementById("xGa_SH2g");
    var xGa_Teamg = document.getElementById("xGa_Teamg");

    // Team 2

    var sfL1T2g = document.getElementById("sfL1T2g");
    var saL1T2g = document.getElementById("saL1T2g");
    var bfL1T2g = document.getElementById("bfL1T2g");
    var baL1T2g = document.getElementById("baL1T2g");
    var gfL1T2g = document.getElementById("gfL1T2g");
    var gaL1T2g = document.getElementById("gaL1T2g");
    var pmL1T2g = document.getElementById("pmL1T2g");
    var mfL1T2g = document.getElementById("mfL1T2g");
    var maL1T2g = document.getElementById("maL1T2g");
    var safL1T2g = document.getElementById("safL1T2g");
    var saaL1T2g = document.getElementById("saaL1T2g");
    var sfL2T2g = document.getElementById("sfL2T2g");
    var saL2T2g = document.getElementById("saL2T2g");
    var bfL2T2g = document.getElementById("bfL2T2g");
    var baL2T2g = document.getElementById("baL2T2g");
    var gfL2T2g = document.getElementById("gfL2T2g");
    var gaL2T2g = document.getElementById("gaL2T2g");
    var pmL2T2g = document.getElementById("pmL2T2g");
    var mfL2T2g = document.getElementById("mfL2T2g");
    var maL2T2g = document.getElementById("maL2T2g");
    var safL2T2g = document.getElementById("safL2T2g");
    var saaL2T2g = document.getElementById("saaL2T2g");
    var sfL3T2g = document.getElementById("sfL3T2g");
    var saL3T2g = document.getElementById("saL3T2g");
    var bfL3T2g = document.getElementById("bfL3T2g");
    var baL3T2g = document.getElementById("baL3T2g");
    var gfL3T2g = document.getElementById("gfL3T2g");
    var gaL3T2g = document.getElementById("gaL3T2g");
    var pmL3T2g = document.getElementById("pmL3T2g");
    var mfL3T2g = document.getElementById("mfL3T2g");
    var maL3T2g = document.getElementById("maL3T2g");
    var safL3T2g = document.getElementById("safL3T2g");
    var saaL3T2g = document.getElementById("saaL3T2g");
    var sfPP1T2g = document.getElementById("sfPP1T2g");
    var saPP1T2g = document.getElementById("saPP1T2g");
    var bfPP1T2g = document.getElementById("bfPP1T2g");
    var baPP1T2g = document.getElementById("baPP1T2g");
    var gfPP1T2g = document.getElementById("gfPP1T2g");
    var gaPP1T2g = document.getElementById("gaPP1T2g");
    var pmPP1T2g = document.getElementById("pmPP1T2g");
    var mfPP1T2g = document.getElementById("mfPP1T2g");
    var maPP1T2g = document.getElementById("maPP1T2g");
    var safPP1T2g = document.getElementById("safPP1T2g");
    var saaPP1T2g = document.getElementById("saaPP1T2g");
    var sfPP2T2g = document.getElementById("sfPP2T2g");
    var saPP2T2g = document.getElementById("saPP2T2g");
    var bfPP2T2g = document.getElementById("bfPP2T2g");
    var baPP2T2g = document.getElementById("baPP2T2g");
    var gfPP2T2g = document.getElementById("gfPP2T2g");
    var gaPP2T2g = document.getElementById("gaPP2T2g");
    var pmPP2T2g = document.getElementById("pmPP2T2g");
    var mfPP2T2g = document.getElementById("mfPP2T2g");
    var maPP2T2g = document.getElementById("maPP2T2g");
    var safPP2T2g = document.getElementById("safPP2T2g");
    var saaPP2T2g = document.getElementById("saaPP2T2g");
    var sfSH1T2g = document.getElementById("sfSH1T2g");
    var saSH1T2g = document.getElementById("saSH1T2g");
    var bfSH1T2g = document.getElementById("bfSH1T2g");
    var baSH1T2g = document.getElementById("baSH1T2g");
    var gfSH1T2g = document.getElementById("gfSH1T2g");
    var gaSH1T2g = document.getElementById("gaSH1T2g");
    var pmSH1T2g = document.getElementById("pmSH1T2g");
    var mfSH1T2g = document.getElementById("mfSH1T2g");
    var maSH1T2g = document.getElementById("maSH1T2g");
    var safSH1T2g = document.getElementById("safSH1T2g");
    var saaSH1T2g = document.getElementById("saaSH1T2g");
    var sfSH2T2g = document.getElementById("sfSH2T2g");
    var saSH2T2g = document.getElementById("saSH2T2g");
    var bfSH2T2g = document.getElementById("bfSH2T2g");
    var baSH2T2g = document.getElementById("baSH2T2g");
    var gfSH2T2g = document.getElementById("gfSH2T2g");
    var gaSH2T2g = document.getElementById("gaSH2T2g");
    var pmSH2T2g = document.getElementById("pmSH2T2g");
    var mfSH2T2g = document.getElementById("mfSH2T2g");
    var maSH2T2g = document.getElementById("maSH2T2g");
    var safSH2T2g = document.getElementById("safSH2T2g");
    var saaSH2T2g = document.getElementById("saaSH2T2g");
    var sfTeamT2g = document.getElementById("sfTeamT2g");
    var saTeamT2g = document.getElementById("saTeamT2g");
    var bfTeamT2g = document.getElementById("bfTeamT2g");
    var baTeamT2g = document.getElementById("baTeamT2g");
    var gfTeamT2g = document.getElementById("gfTeamT2g");
    var gaTeamT2g = document.getElementById("gaTeamT2g");
    var pmTeamT2g = document.getElementById("pmTeamT2g");
    var mfTeamT2g = document.getElementById("mfTeamT2g");
    var maTeamT2g = document.getElementById("maTeamT2g");
    var safTeamT2g = document.getElementById("safTeamT2g");
    var saaTeamT2g = document.getElementById("saaTeamT2g");
    var pL1T2g = document.getElementById("pL1T2g");
    var pL2T2g = document.getElementById("pL2T2g");
    var pL3T2g = document.getElementById("pL3T2g");
    var pPP1T2g = document.getElementById("pPP1T2g");
    var pPP2T2g = document.getElementById("pPP2T2g");
    var pSH1T2g = document.getElementById("pSH1T2g");
    var pSH2T2g = document.getElementById("pSH2T2g");
    var pTeamT2g = document.getElementById("pTeamT2g");
    var tocL1T2g = document.getElementById("tocL1T2g");
    var tocL2T2g = document.getElementById("tocL2T2g");
    var tocL3T2g = document.getElementById("tocL3T2g");
    var tocPP1T2g = document.getElementById("tocPP1T2g");
    var tocPP2T2g = document.getElementById("tocPP2T2g");
    var tocSH1T2g = document.getElementById("tocSH1T2g");
    var tocSH2T2g = document.getElementById("tocSH2T2g");
    var tocTeamT2g = document.getElementById("tocTeamT2g");
    var atocL1T2g = document.getElementById("atocL1T2g");
    var atocL2T2g = document.getElementById("atocL2T2g");
    var atocL3T2g = document.getElementById("atocL3T2g");
    var atocPP1T2g = document.getElementById("atocPP1T2g");
    var atocPP2T2g = document.getElementById("atocPP2T2g");
    var atocSH1T2g = document.getElementById("atocSH1T2g");
    var atocSH2T2g = document.getElementById("atocSH2T2g");
    var atocTeamT2g = document.getElementById("atocTeamT2g");
    var avgL1T2g = document.getElementById("avgL1T2g");
    var avgL2T2g = document.getElementById("avgL2T2g");
    var avgL3T2g = document.getElementById("avgL3T2g");
    var avgPP1T2g = document.getElementById("avgPP1T2g");
    var avgPP2T2g = document.getElementById("avgPP2T2g");
    var avgSH1T2g = document.getElementById("avgSH1T2g");
    var avgSH2T2g = document.getElementById("avgSH2T2g");
    var avgTeamT2g = document.getElementById("avgTeamT2g");
    var avgnoL1T2g = document.getElementById("avgnoL1T2g");
    var avgnoL2T2g = document.getElementById("avgnoL2T2g");
    var avgnoL3T2g = document.getElementById("avgnoL3T2g");
    var avgnoPP1T2g = document.getElementById("avgnoPP1T2g");
    var avgnoPP2T2g = document.getElementById("avgnoPP2T2g");
    var avgnoSH1T2g = document.getElementById("avgnoSH1T2g");
    var avgnoSH2T2g = document.getElementById("avgnoSH2T2g");
    var avgnoTeamT2g = document.getElementById("avgnoTeamT2g");
    var xGf_L1T2g = document.getElementById("xGf_L1T2g");
    var xGf_L2T2g = document.getElementById("xGf_L2T2g");
    var xGf_L3T2g = document.getElementById("xGf_L3T2g");
    var xGf_PP1T2g = document.getElementById("xGf_PP1T2g");
    var xGf_PP2T2g = document.getElementById("xGf_PP2T2g");
    var xGf_SH1T2g = document.getElementById("xGf_SH1T2g");
    var xGf_SH2T2g = document.getElementById("xGf_SH2T2g");
    var xGf_TeamT2g = document.getElementById("xGf_TeamT2g");
    var xGa_L1T2g = document.getElementById("xGa_L1T2g");
    var xGa_L2T2g = document.getElementById("xGa_L2T2g");
    var xGa_L3T2g = document.getElementById("xGa_L3T2g");
    var xGa_PP1T2g = document.getElementById("xGa_PP1T2g");
    var xGa_PP2T2g = document.getElementById("xGa_PP2T2g");
    var xGa_SH1T2g = document.getElementById("xGa_SH1T2g");
    var xGa_SH2T2g = document.getElementById("xGa_SH2T2g");
    var xGa_TeamT2g = document.getElementById("xGa_TeamT2g");

    // Lasketaan joukkueen / ketjun prosentuaalinen xG

    function calcPercent(xGa, xGb) {
        res = Math.round(xGa / (xGa + xGb) * 100);
        return res;
    }

    // Arrays for easy access to variables
    // Team 1

    var sf_p = [sfL1p, sfL2p, sfL3p, sfPP1p, sfPP2p, sfSH1p, sfSH2p, sfTeamp];
    var sa_p = [saL1p, saL2p, saL3p, saPP1p, saPP2p, saSH1p, saSH2p, saTeamp];
    var gf_p = [gfL1p, gfL2p, gfL3p, gfPP1p, gfPP2p, gfSH1p, gfSH2p, gfTeamp];
    var ga_p = [gaL1p, gaL2p, gaL3p, gaPP1p, gaPP2p, gaSH1p, gaSH2p, gaTeamp];
    var pm_p = [pmL1p, pmL2p, pmL3p, pmPP1p, pmPP2p, pmSH1p, pmSH2p, pmTeamp];
    var bf_p = [bfL1p, bfL2p, bfL3p, bfPP1p, bfPP2p, bfSH1p, bfSH2p, bfTeamp];
    var ba_p = [baL1p, baL2p, baL3p, baPP1p, baPP2p, baSH1p, baSH2p, baTeamp];
    var mf_p = [mfL1p, mfL2p, mfL3p, mfPP1p, mfPP2p, mfSH1p, mfSH2p, mfTeamp];
    var ma_p = [maL1p, maL2p, maL3p, maPP1p, maPP2p, maSH1p, maSH2p, maTeamp];
    var saf_p = [safL1p, safL2p, safL3p, safPP1p, safPP2p, safSH1p, safSH2p, safTeamp];
    var saa_p = [saaL1p, saaL2p, saaL3p, saaPP1p, saaPP2p, saaSH1p, saaSH2p, saaTeamp];
    var p_p = [pL1p, pL2p, pL3p, pPP1p, pPP2p, pSH1p, pSH2p, pTeamp];
    var toc_p = [tocL1p, tocL2p, tocL3p, tocPP1p, tocPP2p, tocSH1p, tocSH2p, tocTeamp];
    var atoc_p = [atocL1p, atocL2p, atocL3p, atocPP1p, atocPP2p, atocSH1p, atocSH2p, atocTeamp];
    var avg_p = [avgL1p, avgL2p, avgL3p, avgPP1p, avgPP2p, avgSH1p, avgSH2p, avgTeamp];
    var avgno_p = [avgnoL1p, avgnoL2p, avgnoL3p, avgnoPP1p, avgnoPP2p, avgnoSH1p, avgnoSH2p, avgnoTeamp];
    var xf_p = [xGf_L1p, xGf_L2p, xGf_L3p, xGf_PP1p, xGf_PP2p, xGf_SH1p, xGf_SH2p, xGf_Teamp];
    var xa_p = [xGa_L1p, xGa_L2p, xGa_L3p, xGa_PP1p, xGa_PP2p, xGa_SH1p, xGa_SH2p, xGa_Teamp];

    var sf_g = [sfL1g, sfL2g, sfL3g, sfPP1g, sfPP2g, sfSH1g, sfSH2g, sfTeamg];
    var sa_g = [saL1g, saL2g, saL3g, saPP1g, saPP2g, saSH1g, saSH2g, saTeamg];
    var gf_g = [gfL1g, gfL2g, gfL3g, gfPP1g, gfPP2g, gfSH1g, gfSH2g, gfTeamg];
    var ga_g = [gaL1g, gaL2g, gaL3g, gaPP1g, gaPP2g, gaSH1g, gaSH2g, gaTeamg];
    var pm_g = [pmL1g, pmL2g, pmL3g, pmPP1g, pmPP2g, pmSH1g, pmSH2g, pmTeamg];
    var bf_g = [bfL1g, bfL2g, bfL3g, bfPP1g, bfPP2g, bfSH1g, bfSH2g, bfTeamg];
    var ba_g = [baL1g, baL2g, baL3g, baPP1g, baPP2g, baSH1g, baSH2g, baTeamg];
    var mf_g = [mfL1g, mfL2g, mfL3g, mfPP1g, mfPP2g, mfSH1g, mfSH2g, mfTeamg];
    var ma_g = [maL1g, maL2g, maL3g, maPP1g, maPP2g, maSH1g, maSH2g, maTeamg];
    var saf_g = [safL1g, safL2g, safL3g, safPP1g, safPP2g, safSH1g, safSH2g, safTeamg];
    var saa_g = [saaL1g, saaL2g, saaL3g, saaPP1g, saaPP2g, saaSH1g, saaSH2g, saaTeamg];
    var p_g = [pL1g, pL2g, pL3g, pPP1g, pPP2g, pSH1g, pSH2g, pTeamg];
    var toc_g = [tocL1g, tocL2g, tocL3g, tocPP1g, tocPP2g, tocSH1g, tocSH2g, tocTeamg];
    var atoc_g = [atocL1g, atocL2g, atocL3g, atocPP1g, atocPP2g, atocSH1g, atocSH2g, atocTeamg];
    var avg_g = [avgL1g, avgL2g, avgL3g, avgPP1g, avgPP2g, avgSH1g, avgSH2g, avgTeamg];
    var avgno_g = [avgnoL1g, avgnoL2g, avgnoL3g, avgnoPP1g, avgnoPP2g, avgnoSH1g, avgnoSH2g, avgnoTeamg];
    var xf_g = [xGf_L1g, xGf_L2g, xGf_L3g, xGf_PP1g, xGf_PP2g, xGf_SH1g, xGf_SH2g, xGf_Teamg];
    var xa_g = [xGa_L1g, xGa_L2g, xGa_L3g, xGa_PP1g, xGa_PP2g, xGa_SH1g, xGa_SH2g, xGa_Teamg];

    // Team 2

    var sfT2_p = [sfL1T2p, sfL2T2p, sfL3T2p, sfPP1T2p, sfPP2T2p, sfSH1T2p, sfSH2T2p, sfTeamT2p];
    var saT2_p = [saL1T2p, saL2T2p, saL3T2p, saPP1T2p, saPP2T2p, saSH1T2p, saSH2T2p, saTeamT2p];
    var gfT2_p = [gfL1T2p, gfL2T2p, gfL3T2p, gfPP1T2p, gfPP2T2p, gfSH1T2p, gfSH2T2p, gfTeamT2p];
    var gaT2_p = [gaL1T2p, gaL2T2p, gaL3T2p, gaPP1T2p, gaPP2T2p, gaSH1T2p, gaSH2T2p, gaTeamT2p];
    var pmT2_p = [pmL1T2p, pmL2T2p, pmL3T2p, pmPP1T2p, pmPP2T2p, pmSH1T2p, pmSH2T2p, pmTeamT2p];
    var bfT2_p = [bfL1T2p, bfL2T2p, bfL3T2p, bfPP1T2p, bfPP2T2p, bfSH1T2p, bfSH2T2p, bfTeamT2p];
    var baT2_p = [baL1T2p, baL2T2p, baL3T2p, baPP1T2p, baPP2T2p, baSH1T2p, baSH2T2p, baTeamT2p];
    var mfT2_p = [mfL1T2p, mfL2T2p, mfL3T2p, mfPP1T2p, mfPP2T2p, mfSH1T2p, mfSH2T2p, mfTeamT2p];
    var maT2_p = [maL1T2p, maL2T2p, maL3T2p, maPP1T2p, maPP2T2p, maSH1T2p, maSH2T2p, maTeamT2p];
    var safT2_p = [safL1T2p, safL2T2p, safL3T2p, safPP1T2p, safPP2T2p, safSH1T2p, safSH2T2p, safTeamT2p];
    var saaT2_p = [saaL1T2p, saaL2T2p, saaL3T2p, saaPP1T2p, saaPP2T2p, saaSH1T2p, saaSH2T2p, saaTeamT2p];
    var pT2_p = [pL1T2p, pL2T2p, pL3T2p, pPP1T2p, pPP2T2p, pSH1T2p, pSH2T2p, pTeamT2p];
    var tocT2_p = [tocL1T2p, tocL2T2p, tocL3T2p, tocPP1T2p, tocPP2T2p, tocSH1T2p, tocSH2T2p, tocTeamT2p];
    var atocT2_p = [atocL1T2p, atocL2T2p, atocL3T2p, atocPP1T2p, atocPP2T2p, atocSH1T2p, atocSH2T2p, atocTeamT2p];
    var avgT2_p = [avgL1T2p, avgL2T2p, avgL3T2p, avgPP1T2p, avgPP2T2p, avgSH1T2p, avgSH2T2p, avgTeamT2p];
    var avgnoT2_p = [avgnoL1T2p, avgnoL2T2p, avgnoL3T2p, avgnoPP1T2p, avgnoPP2T2p, avgnoSH1T2p, avgnoSH2T2p, avgnoTeamT2p];
    var xfT2_p = [xGf_L1T2p, xGf_L2T2p, xGf_L3T2p, xGf_PP1T2p, xGf_PP2T2p, xGf_SH1T2p, xGf_SH2T2p, xGf_TeamT2p];
    var xaT2_p = [xGa_L1T2p, xGa_L2T2p, xGa_L3T2p, xGa_PP1T2p, xGa_PP2T2p, xGa_SH1T2p, xGa_SH2T2p, xGa_TeamT2p];

    var sfT2_g = [sfL1T2g, sfL2T2g, sfL3T2g, sfPP1T2g, sfPP2T2g, sfSH1T2g, sfSH2T2g, sfTeamT2g];
    var saT2_g = [saL1T2g, saL2T2g, saL3T2g, saPP1T2g, saPP2T2g, saSH1T2g, saSH2T2g, saTeamT2g];
    var gfT2_g = [gfL1T2g, gfL2T2g, gfL3T2g, gfPP1T2g, gfPP2T2g, gfSH1T2g, gfSH2T2g, gfTeamT2g];
    var gaT2_g = [gaL1T2g, gaL2T2g, gaL3T2g, gaPP1T2g, gaPP2T2g, gaSH1T2g, gaSH2T2g, gaTeamT2g];
    var pmT2_g = [pmL1T2g, pmL2T2g, pmL3T2g, pmPP1T2g, pmPP2T2g, pmSH1T2g, pmSH2T2g, pmTeamT2g];
    var bfT2_g = [bfL1T2g, bfL2T2g, bfL3T2g, bfPP1T2g, bfPP2T2g, bfSH1T2g, bfSH2T2g, bfTeamT2g];
    var baT2_g = [baL1T2g, baL2T2g, baL3T2g, baPP1T2g, baPP2T2g, baSH1T2g, baSH2T2g, baTeamT2g];
    var mfT2_g = [mfL1T2g, mfL2T2g, mfL3T2g, mfPP1T2g, mfPP2T2g, mfSH1T2g, mfSH2T2g, mfTeamT2g];
    var maT2_g = [maL1T2g, maL2T2g, maL3T2g, maPP1T2g, maPP2T2g, maSH1T2g, maSH2T2g, maTeamT2g];
    var safT2_g = [safL1T2g, safL2T2g, safL3T2g, safPP1T2g, safPP2T2g, safSH1T2g, safSH2T2g, safTeamT2g];
    var saaT2_g = [saaL1T2g, saaL2T2g, saaL3T2g, saaPP1T2g, saaPP2T2g, saaSH1T2g, saaSH2T2g, saaTeamT2g];
    var pT2_g = [pL1T2g, pL2T2g, pL3T2g, pPP1T2g, pPP2T2g, pSH1T2g, pSH2T2g, pTeamT2g];
    var tocT2_g = [tocL1T2g, tocL2T2g, tocL3T2g, tocPP1T2g, tocPP2T2g, tocSH1T2g, tocSH2T2g, tocTeamT2g];
    var atocT2_g = [atocL1T2g, atocL2T2g, atocL3T2g, atocPP1T2g, atocPP2T2g, atocSH1T2g, atocSH2T2g, atocTeamT2g];
    var avgT2_g = [avgL1T2g, avgL2T2g, avgL3T2g, avgPP1T2g, avgPP2T2g, avgSH1T2g, avgSH2T2g, avgTeamT2g];
    var avgnoT2_g = [avgnoL1T2g, avgnoL2T2g, avgnoL3T2g, avgnoPP1T2g, avgnoPP2T2g, avgnoSH1T2g, avgnoSH2T2g, avgnoTeamT2g];
    var xfT2_g = [xGf_L1T2g, xGf_L2T2g, xGf_L3T2g, xGf_PP1T2g, xGf_PP2T2g, xGf_SH1T2g, xGf_SH2T2g, xGf_TeamT2g];
    var xaT2_g = [xGa_L1T2g, xGa_L2T2g, xGa_L3T2g, xGa_PP1T2g, xGa_PP2T2g, xGa_SH1T2g, xGa_SH2T2g, xGa_TeamT2g];

    // xG mapping matrix ON Target

    let xGOT_matrix = [           // This is the xGOT matrix

        [ 0.01, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.01, 0.01, 0.01],
        [ 0.01, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.01, 0.01, 0.01],
        [ 2, 2,13,14,15,38,64,38,15,14, 13, 2, 2],
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
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 7, 8, 8, 19, 54, 19, 8, 8, 7, 1, 1],
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





