    // Variables file for New Game - html

    var tgt_1 = document.getElementById("totg_1");
    var tgt_2 = document.getElementById("totg_2");
    var txG_1 = document.getElementById("totxG_1");
    var txG_2 = document.getElementById("totxG_2");
    var line_on = 1; // Line on court
    var started = 0; // Game started 0/1
    var lines = ["L1", "L2", "L3", "Pp1", "Pp2", "Sh1", "Sh2"]; // Line array
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
    myImg.src = "/static/field.png";
    var PosTime = 0; // Possession time in counters
    var LineTime = 0; // Line on court time in counters
    var fWidth = 300; // Width of the shotmap field in pixels
    var fLength = 500; // Length of the shotmap field in pixels
    var shiftNo = 1; // Number of shifts in numbers
    var shiftPos = 0; // Possession time in shift in counters

    // Google charts

    google.charts.load('current', {'packages':['corechart']});

    // Data arrays for shots and seconds

    var shotData = [['Time', 'Team', 'Result', 'Type', 'Distance', 'Angle', 'PP', 'SH']];
    var timeData = [['Time', 'Ball_pos', 'Line_on', 'Shot', 'Result', 'xG']];
    var dataShot = 0;
    var dataRes = 0;
    var dataxG = 0;
    var dataType = 0;
    var dataDis = 0;
    var dataAngle = 0;
    var dataPp = 0;
    var dataSh = 0;

    // Data arrays for xG charts

    var xGTeam_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL1_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL2_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];
    var xGL3_array = [['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2']];

    // Data arrays for line shift charts

    var posTeam_array = [['Shift nr','Line 1','Line 2','Line 3','PP Line','SH Line', 'Team']];

    // Time on court by line period/game (in counters)

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

    // Number of times with ball (in pcs)

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

    // Number of times without ball (in pcs)

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

    // Ball possession by line/team period/game (in counters)

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

    // Number of shifts per line period/game (in pcs)

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

    // xG values by line/team period/game

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

    // Arrays for easy access to variables
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

    // html id myCanvas to variable
    var cnvs = document.getElementById("myCanvas");
    // html id shotmenu to variable
    var menu = document.getElementById("shotmenu");
    // html id shottype to variable
    var stype = document.getElementById("shottype");
    // home and away team textfields to variables
    var hTeam = document.getElementById("home_team");
    var aTeam = document.getElementById("away_team");
    // Send Data - button element to variable
    var sData = document.getElementById("sData");

    // html ids to variables
    // Shots/goals/misses/blocks/saves for/against, turnovers, plusminus by line/team and period/game

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

    // html ids to variables
    // Possession/Time on Court/AttZone by line/team period/game

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

    // html ids to variables
    // Shots/goals/penalties for/against, Fenwick/ba, plusminus by line/team period/game

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

    // Arrays for easy access to variables

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

    // xG mapping matrix

    let xG_matrix = [

        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 2, 2,13,14,15,35,99,35,15,14, 13, 2, 2],
        [ 4, 5,15,19,29,54,55,54,29,19,15, 5, 4],
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