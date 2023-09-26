
    var s_game = document.getElementById("select-game");
    var game_delete = document.getElementById("analyse_delete");
    var img1 = new Image();
    var img2 = new Image();
    var img3 = new Image();
    var img4 = new Image();
    var cnvs1 = document.getElementById("stmyCanvas_p1");
    var ctx1 = cnvs1.getContext("2d");
    var cnvs2 = document.getElementById("stmyCanvas_p2");
    var ctx2 = cnvs2.getContext("2d");
    var cnvs3 = document.getElementById("stmyCanvas_p3");
    var ctx3 = cnvs3.getContext("2d");
    var cnvs4 = document.getElementById("stmyCanvas_p4");
    var ctx4 = cnvs4.getContext("2d");
    var csvButton = document.getElementById("dl_csv");
    var fWidth = 200; // Width of the shotmap field in pixels
    var fLength = 332; // Length of the shotmap field in pixels
    var myImg = new Image();
    myImg.src = "/static/field-new.png";
    printShotData = [];
    name_t1 = "";
    name_t2 = "";


    // Function for Analysis.html - game chart visualization

    window.onload = function() {

        initializePage()
    }

    function changeGame() {

        // Set Game Stats

        game_id = s_game.options[s_game.selectedIndex].value;
        team_1 = 0;
        team_2 = 0;

        fetch("https://fbscanner.io/apis/games/" + game_id + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                initializePage()
                gd = data.game_data;
                if (Object.keys(gd).length > 0) { // If game data is not empty
                    game_delete.disabled = false;
                    document.getElementById('stdate').innerHTML = data.date;
                    team_1 = gd.name_t1;
                    team_2 = gd.name_t2;
                    name_t1 = team_1;
                    name_t2 = team_2;
                    printShotData = gd.printShotData;
                    document.getElementById('sttotg_1').innerHTML = gd.tgt_1;
                    document.getElementById('sttotg_2').innerHTML = gd.tgt_2;
                    document.getElementById('sttotxG_1').innerHTML = gd.txG_1;
                    document.getElementById('sttotxG_2').innerHTML = gd.txG_2;
                    document.getElementById('sttotxGOT_1').innerHTML = gd.txGOT_1;
                    document.getElementById('sttotxGOT_2').innerHTML = gd.txGOT_2;
                    csvButton.disabled = "false";

                    var date = new Date(gd.gameCounter * 1000);
                    var display = date.toISOString().substr(11, 8);
                    document.getElementById('stlabel').innerHTML = display;
                    document.getElementById('stperiodNr').innerHTML = "Period " + gd.periodN;
                    document.getElementById('stteam_1').innerHTML = team_1;
                    document.getElementById('stt1name1').innerHTML = team_1;
                    document.getElementById('stt1name2').innerHTML = team_1;
                    gd.xGTeam_array[0][1] = 'xG ' + team_1;
                    gd.xGTeam_array[0][3] = 'Goal ' + team_1;

                    document.getElementById('stteam_2').innerHTML = team_2;
                    document.getElementById('stt2name1').innerHTML = team_2;
                    document.getElementById('stt2name2').innerHTML = team_2;
                    gd.xGTeam_array[0][2] = 'xG ' + team_2;
                    gd.xGTeam_array[0][4] = 'Goal ' + team_2;

                    img1.src = gd.cnvs_1_url;
                    img1.onload = function() {
                        ctx1.drawImage(img1,0,0,fWidth,fLength);
                     };
                    img2.src = gd.cnvs_2_url;
                    img2.onload = function() {
                        ctx2.drawImage(img2,0,0,fWidth,fLength);
                     };
                    img3.src = gd.cnvs_3_url;
                    img3.onload = function() {
                        ctx3.drawImage(img3,0,0,fWidth,fLength);
                     };
                    img4.src = gd.cnvs_4_url;
                    img4.onload = function() {
                        ctx4.drawImage(img4,0,0,fWidth,fLength);
                     };

                    // xG Game Chart

                    var chartData = google.visualization.arrayToDataTable([
                         ['Line', gd.name_t1, { role: 'style' }, { role: 'annotation' }, gd.name_t2, { role: 'style' }, { role: 'annotation' } ],
                         ['Line 1', Number(gd.xGf_g[0]), 'color: #002072', Number(gd.xGf_g[0]), Number(gd.xGfT2_g[0]), 'color: #59D9EB', Number(gd.xGfT2_g[0]) ],
                         ['Line 2', Number(gd.xGf_g[1]), 'color: #002072', Number(gd.xGf_g[1]), Number(gd.xGfT2_g[1]), 'color: #59D9EB', Number(gd.xGfT2_g[1]) ],
                         ['Line 3', Number(gd.xGf_g[2]), 'color: #002072', Number(gd.xGf_g[2]), Number(gd.xGfT2_g[2]), 'color: #59D9EB', Number(gd.xGfT2_g[2]) ],
                         ['PP', Number(gd.xGf_g[3]) + Number(gd.xGf_g[4]), 'color: #002072', Number(gd.xGf_g[3]) + Number(gd.xGf_g[4]), Number(gd.xGfT2_g[3]) + Number(gd.xGfT2_g[4]), 'color: #59D9EB', Number(gd.xGfT2_g[3]) + Number(gd.xGfT2_g[4]) ],
                         ['SH', Number(gd.xGf_g[5]) + Number(gd.xGf_g[6]), 'color: #002072', Number(gd.xGf_g[5]) + Number(gd.xGf_g[6]), Number(gd.xGfT2_g[5]) + Number(gd.xGfT2_g[6]), 'color: #59D9EB', Number(gd.xGfT2_g[5]) + Number(gd.xGfT2_g[6]) ]
                      ]);

                    var options = {
                        title: 'xG by Line',
                        bar: {groupWidth: "95%"},
                        legend: { position: 'bottom'},
                        colors: ['#002072', '#59D9EB'],
                        hAxis: { textPosition: 'none' }
                        };

                    var chart = new google.visualization.BarChart(document.getElementById('stxGGame_chart'));
                    chart.draw(chartData, options);

                    //xG% GameChart

                    xGL1T1 = calcPercent(Number(gd.xGf_g[0]), Number(gd.xGa_g[0]));
                    xGL1T2 = calcPercent(Number(gd.xGfT2_g[0]), Number(gd.xGaT2_g[0]));
                    xGL2T1 = calcPercent(Number(gd.xGf_g[1]), Number(gd.xGa_g[1]));
                    xGL2T2 = calcPercent(Number(gd.xGfT2_g[1]), Number(gd.xGaT2_g[1]));
                    xGL3T1 = calcPercent(Number(gd.xGf_g[2]), Number(gd.xGa_g[2]));
                    xGL3T2 = calcPercent(Number(gd.xGfT2_g[2]), Number(gd.xGaT2_g[2]));

                    var chartData = google.visualization.arrayToDataTable([
                         ['Line', gd.name_t1, { role: 'style' }, { role: 'annotation' }, gd.name_t2, { role: 'style' }, { role: 'annotation' } ],
                         ['Line 1', xGL1T1, 'color: #002072', xGL1T1 + "%", xGL1T2, 'color: #59D9EB', xGL1T2 + "%" ],
                         ['Line 2', xGL2T1, 'color: #002072', xGL2T1 + "%", xGL2T2, 'color: #59D9EB', xGL2T2 + "%" ],
                         ['Line 3', xGL3T1, 'color: #002072', xGL3T1 + "%", xGL3T2, 'color: #59D9EB', xGL3T2 + "%" ]
                    ]);

                    var options = {
                        title: 'xG% by Line',
                        bar: {groupWidth: "95%"},
                        legend: { position: 'bottom'},
                        colors: ['#002072', '#59D9EB'],
                        hAxis: {
                            viewWindowMode:'explicit',
                            textPosition: 'none',
                            viewWindow: {
                              max:100,
                              min:0
                            }
                        },
                        };

                    var chart = new google.visualization.BarChart(document.getElementById('stxG%Game_chart'));
                    chart.draw(chartData, options);

                    // Team 1 typechart

                    var chartDataX = google.visualization.arrayToDataTable([
                        ['Type', 'TO One-timer', {role: 'style'}, {role: 'annotation'}, 'TO Direct', {role:'style'}, {role: 'annotation '}, 'One-timer', {role: 'style'}, {role: 'annotation'}, 'Direct', {role: 'style'}, {role: 'annotation'}],
                        ['Line1', gd.stT1L1g_array[0], 'color: #20AB4E', gd.stT1L1g_array[0], gd.stT1L1g_array[1], 'color: #295738', gd.stT1L1g_array[1], gd.stT1L1g_array[2], 'color: #002072', gd.stT1L1g_array[2], gd.stT1L1g_array[4], 'color: #59D9EB', gd.stT1L1g_array[4]],
                        ['Line2', gd.stT1L2g_array[0], 'color: #20AB4E', gd.stT1L2g_array[0], gd.stT1L2g_array[1], 'color: #295738', gd.stT1L2g_array[1], gd.stT1L2g_array[2], 'color: #002072', gd.stT1L2g_array[2], gd.stT1L2g_array[4], 'color: #59D9EB', gd.stT1L2g_array[4]],
                        ['Line3', gd.stT1L3g_array[0], 'color: #20AB4E', gd.stT1L3g_array[0], gd.stT1L3g_array[1], 'color: #295738', gd.stT1L3g_array[1], gd.stT1L3g_array[2], 'color: #002072', gd.stT1L3g_array[2], gd.stT1L3g_array[4], 'color: #59D9EB', gd.stT1L3g_array[4]
                        ]
                     ]);

                    var options = {
                        title: 'Shot types, ' + gd.name_t1,
                        bar: {groupWidth: "75%"},
                        legend: { position: 'bottom'},
                        colors: ['#20AB4E', '#295738','#002072','#59D9EB'],
                        hAxis: { textPosition: 'none' }
                        };

                    var chart2 = new google.visualization.BarChart(document.getElementById('stT1_typechart'));
                    chart2.draw(chartDataX, options);

                    // Team 2 typechart

                    var chartDataY = google.visualization.arrayToDataTable([
                        ['Type', 'TO One-timer', {role: 'style'}, {role: 'annotation'}, 'TO Direct', {role:'style'}, {role: 'annotation '}, 'One-timer', {role: 'style'}, {role: 'annotation'}, 'Direct', {role: 'style'}, {role: 'annotation'}],
                        ['Line1', gd.stT2L1g_array[0], 'color: #EDA137', gd.stT2L1g_array[0], gd.stT2L1g_array[1], 'color: #EB4F07', gd.stT2L1g_array[1], gd.stT2L1g_array[2], 'color: #D10808', gd.stT2L1g_array[2], gd.stT2L1g_array[4], 'color: #663D3D', gd.stT2L1g_array[4]],
                        ['Line2', gd.stT2L2g_array[0], 'color: #EDA137', gd.stT2L2g_array[0], gd.stT2L2g_array[1], 'color: #EB4F07', gd.stT2L2g_array[1], gd.stT2L2g_array[2], 'color: #D10808', gd.stT2L2g_array[2], gd.stT2L2g_array[4], 'color: #663D3D', gd.stT2L2g_array[4]],
                        ['Line3', gd.stT2L3g_array[0], 'color: #EDA137', gd.stT2L3g_array[0], gd.stT2L3g_array[1], 'color: #EB4F07', gd.stT2L3g_array[1], gd.stT2L3g_array[2], 'color: #D10808', gd.stT2L3g_array[2], gd.stT2L3g_array[4], 'color: #663D3D', gd.stT2L3g_array[4]
                        ]
                     ]);

                    var options = {
                        title: 'Shot types, ' + gd.name_t2,
                        bar: {groupWidth: "75%"},
                        legend: { position: 'bottom'},
                        colors: ['#EDA137', '#EB4F07','#D10808','#663D3D'],
                        hAxis: { textPosition: 'none' }
                        };

                    var chartX = new google.visualization.BarChart(document.getElementById('stT2_typechart'));
                    chartX.draw(chartDataY, options);

                    // Team 1 Player xG chart

                    var pldata = new google.visualization.DataTable();
                    pldata.addColumn('string', 'Name');
                    pldata.addColumn('number', 'Shot xG');
                    pldata.addColumn('number', 'Pass xG');
                    pldata.addColumn('number', 'Shot xG PP');
                    pldata.addColumn('number', 'Pass xG PP');
                    pldata.addColumn('number', 'Goals');
                    pldata.addColumn('number', 'Ass.');
                    pldata.addColumn('number', 'Shots');
                    pldata.addColumn('number', 'Shotass.');
                    pldata.addColumn('number', 'Possession +');
                    pldata.addColumn('number', 'Possession -');

                    for(i = 1; i < gd.plT1_array.length; i++){
                        pldata.addRow([gd.plT1_array[i][1], gd.plT1_array[i][2], gd.plT1_array[i][3], gd.plT1_array[i][4], gd.plT1_array[i][5], gd.plT1_array[i][6], gd.plT1_array[i][7], gd.plT1_array[i][8], gd.plT1_array[i][9], gd.plT1_array[i][10], gd.plT1_array[i][11]]);
                    }

                    var options = {
                        title: 'Individual stats '+ gd.name_t1,
                        bar: {groupWidth: "95%"},
                        legend: { position: 'bottom'},
                        colors: ['#002072', '#59D9EB'],
                        hAxis: { textPosition: 'none' }
                        };


                    // Create and draw the visualization.
                    var chart = new google.visualization.Table(document.getElementById('stT1plstats'));
                    chart.draw(pldata, options);

                    // Add sort listener

                    google.visualization.events.addListener(chart, 'sort',
                    function(event) {
                        pldata.sort([{column: event.column, desc: event.ascending}]);
                        chart.draw(pldata, options);
                    });

                    // Team 2 Player xG chart

                    var pldata = new google.visualization.DataTable();
                    pldata.addColumn('string', 'Name');
                    pldata.addColumn('number', 'Shot xG');
                    pldata.addColumn('number', 'Pass xG');
                    pldata.addColumn('number', 'Shot xG PP');
                    pldata.addColumn('number', 'Pass xG PP');
                    pldata.addColumn('number', 'Goals');
                    pldata.addColumn('number', 'Ass.');
                    pldata.addColumn('number', 'Shots');
                    pldata.addColumn('number', 'Shotass.');
                    pldata.addColumn('number', 'Possession +');
                    pldata.addColumn('number', 'Possession -');

                    for(i = 1; i < gd.plT2_array.length; i++){
                        pldata.addRow([gd.plT2_array[i][1], gd.plT2_array[i][2], gd.plT2_array[i][3], gd.plT2_array[i][4], gd.plT2_array[i][5], gd.plT2_array[i][6], gd.plT2_array[i][7], gd.plT2_array[i][8], gd.plT2_array[i][9], gd.plT2_array[i][10], gd.plT2_array[i][11]]);
                    }

                    var options = {
                        title: 'Individual stats '+ gd.name_t2,
                        bar: {groupWidth: "95%"},
                        legend: { position: 'bottom'},
                        colors: ['#002072', '#59D9EB'],
                        hAxis: { textPosition: 'none' }
                        };

                    // Create and draw the visualization.
                    var chart = new google.visualization.Table(document.getElementById('stT2plstats'));
                    chart.draw(pldata, options);

                    // Add sort listener

                    google.visualization.events.addListener(chart, 'sort',
                    function(event) {
                        pldata.sort([{column: event.column, desc: event.ascending}]);
                        chart.draw(pldata, options);
                    });

                    // Linechart Team 1

                    var pldata1 = new google.visualization.DataTable();
                    pldata1.addColumn('string', 'Line');
                    pldata1.addColumn('string', 'ToC');
                    pldata1.addColumn('number', 'xG for');
                    pldata1.addColumn('number', 'xG ag.');
                    pldata1.addColumn('number', 'Plus');
                    pldata1.addColumn('number', 'Minus');
                    pldata1.addColumn('number', 'CF');
                    pldata1.addColumn('number', 'CA');
                    pldata1.addColumn('number', 'Pos%');
                    pldata1.addColumn('number', 'xG Turnov.');
                    pldata1.addColumn('number', 'xG org.att. ');

                    pldata1.addRows([
                        ['Line 1', gd.toc_g[0], Number(gd.xf_g[0]), Number(gd.xa_g[0]), Number(gd.gf_g[0]), Number(gd.ga_g[0]), Number(gd.sf_g[0]), Number(gd.sa_g[0]), Number(gd.p_g[0]), gd.stxGT1L1g_array[0] + gd.stxGT1L1g_array[1], gd.stxGT1L1g_array[2] + gd.stxGT1L1g_array[3] + gd.stxGT1L1g_array[4]],
                        ['Line 2', gd.toc_g[1], Number(gd.xf_g[1]), Number(gd.xa_g[1]), Number(gd.gf_g[1]), Number(gd.ga_g[1]), Number(gd.sf_g[1]), Number(gd.sa_g[1]), Number(gd.p_g[1]), gd.stxGT1L2g_array[0] + gd.stxGT1L2g_array[1], gd.stxGT1L2g_array[2] + gd.stxGT1L2g_array[3] + gd.stxGT1L2g_array[4]],
                        ['Line 3', gd.toc_g[2], Number(gd.xf_g[2]), Number(gd.xa_g[2]), Number(gd.gf_g[2]), Number(gd.ga_g[2]), Number(gd.sf_g[2]), Number(gd.sa_g[2]), Number(gd.p_g[2]), gd.stxGT1L3g_array[0] + gd.stxGT1L3g_array[1], gd.stxGT1L3g_array[2] + gd.stxGT1L3g_array[3] + gd.stxGT1L3g_array[4]],
                        ['Powerplay', gd.toc_g[3], Number(gd.xf_g[3]), Number(gd.xa_g[3]), Number(gd.gf_g[3]), Number(gd.ga_g[3]), Number(gd.sf_g[3]), Number(gd.sa_g[3]), Number(gd.p_g[3]), 0, 0],
                        ['Pen. Kill', gd.toc_g[5], Number(gd.xf_g[5]), Number(gd.xa_g[5]), Number(gd.gf_g[5]), Number(gd.ga_g[5]), Number(gd.sf_g[5]), Number(gd.sa_g[5]), Number(gd.p_g[5]), 0, 0],
                        ['6vs5', gd.toc_g[4], Number(gd.xf_g[4]), Number(gd.xa_g[4]), Number(gd.gf_g[4]), Number(gd.ga_g[4]), Number(gd.sf_g[4]), Number(gd.sa_g[4]), Number(gd.p_g[4]), 0, 0],
                        ['5vs6', gd.toc_g[6], Number(gd.xf_g[6]), Number(gd.xa_g[6]), Number(gd.gf_g[6]), Number(gd.ga_g[6]), Number(gd.sf_g[6]), Number(gd.sa_g[6]), Number(gd.p_g[6]), 0, 0],
                        ['Team', gd.toc_g[7], Number(gd.xf_g[7]), Number(gd.xa_g[7]), Number(gd.gf_g[7]), Number(gd.ga_g[7]), Number(gd.sf_g[7]), Number(gd.sa_g[7]), Number(gd.p_g[7]), gd.stxGT1Teamg_array[0] + gd.stxGT1Teamg_array[1], gd.stxGT1Teamg_array[2] + gd.stxGT1Teamg_array[3] + gd.stxGT1Teamg_array[4]],

                        ]);

                    var options = {
                        title: 'Line stats, ' + gd.name_t1,
                        bar: {groupWidth: "95%"},
                        legend: { position: 'bottom'},
                        colors: ['#002072', '#59D9EB'],
                        hAxis: { textPosition: 'none' }
                        };

                    // Create and draw the visualization.
                    var chart = new google.visualization.Table(document.getElementById('stT1linestats'));
                    chart.draw(pldata1, options);

                    // Linestats T2

                    var pldata2 = new google.visualization.DataTable();
                    pldata2.addColumn('string', 'Line');
                    pldata2.addColumn('string', 'ToC');
                    pldata2.addColumn('number', 'xG for');
                    pldata2.addColumn('number', 'xG ag.');
                    pldata2.addColumn('number', 'Plus');
                    pldata2.addColumn('number', 'Minus');
                    pldata2.addColumn('number', 'CF');
                    pldata2.addColumn('number', 'CA');
                    pldata2.addColumn('number', 'Pos%');
                    pldata2.addColumn('number', 'xG Turnov.');
                    pldata2.addColumn('number', 'xG org.att. ');

                    pldata2.addRows([
                        ['Line 1', gd.tocT2_g[0], Number(gd.xfT2_g[0]), Number(gd.xaT2_g[0]), Number(gd.gfT2_g[0]), Number(gd.gaT2_g[0]), Number(gd.sfT2_g[0]), Number(gd.saT2_g[0]), Number(gd.pT2_g[0]), gd.stxGT2L1g_array[0] + gd.stxGT2L1g_array[1], gd.stxGT2L1g_array[2] + gd.stxGT2L1g_array[3] + gd.stxGT2L1g_array[4]],
                        ['Line 2', gd.tocT2_g[1], Number(gd.xfT2_g[1]), Number(gd.xaT2_g[1]), Number(gd.gfT2_g[1]), Number(gd.gaT2_g[1]), Number(gd.sfT2_g[1]), Number(gd.saT2_g[1]), Number(gd.pT2_g[1]), gd.stxGT2L2g_array[0] + gd.stxGT2L2g_array[1], gd.stxGT2L2g_array[2] + gd.stxGT2L2g_array[3] + gd.stxGT2L2g_array[4]],
                        ['Line 3', gd.tocT2_g[2], Number(gd.xfT2_g[2]), Number(gd.xaT2_g[2]), Number(gd.gfT2_g[2]), Number(gd.gaT2_g[2]), Number(gd.sfT2_g[2]), Number(gd.saT2_g[2]), Number(gd.pT2_g[2]), gd.stxGT2L3g_array[0] + gd.stxGT2L3g_array[1], gd.stxGT2L3g_array[2] + gd.stxGT2L3g_array[3] + gd.stxGT2L3g_array[4]],
                        ['Powerplay', gd.tocT2_g[3], Number(gd.xfT2_g[3]), Number(gd.xaT2_g[3]), Number(gd.gfT2_g[3]), Number(gd.gaT2_g[3]), Number(gd.sfT2_g[3]), Number(gd.saT2_g[3]), Number(gd.pT2_g[3]), 0, 0],
                        ['Pen. Kill', gd.tocT2_g[5], Number(gd.xfT2_g[5]), Number(gd.xaT2_g[5]), Number(gd.gfT2_g[5]), Number(gd.gaT2_g[5]), Number(gd.sfT2_g[5]), Number(gd.saT2_g[5]), Number(gd.pT2_g[5]), 0, 0],
                        ['6vs5', gd.tocT2_g[4], Number(gd.xfT2_g[4]), Number(gd.xaT2_g[4]), Number(gd.gfT2_g[4]), Number(gd.gaT2_g[4]), Number(gd.sfT2_g[4]), Number(gd.saT2_g[4]), Number(gd.pT2_g[4]), 0, 0],
                        ['5vs6', gd.tocT2_g[6], Number(gd.xfT2_g[6]), Number(gd.xaT2_g[6]), Number(gd.gfT2_g[6]), Number(gd.gaT2_g[6]), Number(gd.sfT2_g[6]), Number(gd.saT2_g[6]), Number(gd.pT2_g[6]), 0, 0],
                        ['Team', gd.tocT2_g[7], Number(gd.xfT2_g[7]), Number(gd.xaT2_g[7]), Number(gd.gfT2_g[7]), Number(gd.gaT2_g[7]), Number(gd.sfT2_g[7]), Number(gd.saT2_g[7]), Number(gd.pT2_g[7]), gd.stxGT2Teamg_array[0] + gd.stxGT2Teamg_array[1], gd.stxGT2Teamg_array[2] + gd.stxGT2Teamg_array[3] + gd.stxGT2Teamg_array[4]],

                        ]);

                    var options = {
                        title: 'Line stats, ' + gd.name_t2,
                        bar: {groupWidth: "95%"},
                        legend: { position: 'bottom'},
                        colors: ['#002072', '#59D9EB'],
                        hAxis: { textPosition: 'none' }
                        };

                    // Create and draw the visualization.
                    var chart2 = new google.visualization.Table(document.getElementById('stT2linestats'));
                    chart2.draw(pldata2, options);

                    // Pie Chart, xG per type Team 1

                    var data = new google.visualization.arrayToDataTable([
                    ['Type', 'xG'],
                    ['Turnovers, one-timer', gd.stxGT1Teamg_array[0]],
                    ['Turnovers, direct', gd.stxGT1Teamg_array[1]],
                    ['Org.attack, one-timer', gd.stxGT1Teamg_array[2]],
                    ['Org.attack, direct', gd.stxGT1Teamg_array[4]],
                    ['Others',  gd.stxGT1Teamg_array[3]]

                    ]);

                    var options2 = {
                    title: 'Share of xG by attack types',
                    colors: ['#20AB4E', '#295738','#002072','#59D9EB','#F7FAFA'],
                    is3D: true,
                    };

                    var chart = new google.visualization.PieChart(document.getElementById('stT1_st_piechart'));
                    chart.draw(data, options2);

                    // Pie Chart, xG per type Team 2

                    var data2 = new google.visualization.arrayToDataTable([
                    ['Type', 'xG'],
                    ['Turnover, one-timer', gd.stxGT2Teamg_array[0]],
                    ['Turnover, direct', + gd.stxGT2Teamg_array[1]],
                    ['Org. attack, one-timer', gd.stxGT2Teamg_array[2]],
                    ['Org. attack, direct', gd.stxGT2Teamg_array[4]],
                    ['Other', gd.stxGT2Teamg_array[3]]

                    ]);

                    var options2 = {
                    title: 'Share of xG by attack/shot types',
                    colors: ['#EDA137', '#EB4F07','#D10808','#663D3D', '#F7FAFA'],
                    is3D: true,
                    };

                    var chart = new google.visualization.PieChart(document.getElementById('stT2_st_piechart'));
                    chart.draw(data2, options2);

                    // Team xG Chart
                    var data = google.visualization.arrayToDataTable(gd.xGTeam_array);

                    var options = {
                      title: 'xG by Team',
                      curveType: 'function',
                      legend: { position: 'bottom' },
                      seriesType: 'lines',
                      series: {
                          2:{type: 'bars', color: 'blue'},
                          3:{type: 'bars', color: 'red'}}
                    };

                    var chart = new google.visualization.ComboChart(document.getElementById('stxGTeam_chart'));
                    chart.draw(data, options);

                    // Turnover chart

                     var chartData = google.visualization.arrayToDataTable([
                         ['Line', gd.name_t1, { role: 'style' }, { role: 'annotation' }, gd.name_t2, { role: 'style' }, { role: 'annotation' } ],
                         ['Line 1', gd.stT1L1g_array[0] + gd.stT1L1g_array[1], 'color: #002072', gd.stT1L1g_array[0] + gd.stT1L1g_array[1], gd.stT2L1g_array[0] + gd.stT2L1g_array[1], 'color: #59D9EB', gd.stT2L1g_array[0] + gd.stT2L1g_array[1]],
                         ['Line 2', gd.stT1L2g_array[0] + gd.stT1L2g_array[1], 'color: #002072', gd.stT1L2g_array[0] + gd.stT1L2g_array[1], gd.stT2L2g_array[0] + gd.stT2L2g_array[1], 'color: #59D9EB', gd.stT2L2g_array[0] + gd.stT2L2g_array[1]],
                         ['Line 3', gd.stT1L3g_array[0] + gd.stT1L3g_array[1], 'color: #002072', gd.stT1L3g_array[0] + gd.stT1L3g_array[1], gd.stT2L3g_array[0] + gd.stT2L3g_array[1], 'color: #59D9EB', gd.stT2L3g_array[0] + gd.stT2L3g_array[1]
                         ]
                      ]);

                    var options = {
                        title: 'Turnovers by Line',
                        bar: {groupWidth: "95%"},
                        legend: { position: 'bottom'},
                        colors: ['#002072', '#59D9EB'],
                        hAxis: { textPosition: 'none' }
                        };

                    // var chart1 = new google.visualization.BarChart(document.getElementById('toGame_chart'));
                     // chart1.draw(chartData, options);
            }

        })
            .catch((error) => {
                console.error('Error:', error);
        });

    }

    function calcPercent(xGa, xGb) {
        res = Math.round(xGa / (xGa + xGb) * 100);
        return res;
    }

    function deleteGameButton() {

        var r = confirm("Are you sure you want to delete game data, all saved information will be lost?");
        if (r == true) {

            fetch("https://fbscanner.io/apis/games/" + s_game.options[s_game.selectedIndex].value + "/", {

              method: 'DELETE', // or 'PUT'
              headers: {
                'Content-Type': 'application/json',
              },
            })

            .then(() => {
                console.log('removed');
                window.alert("Game data deleted.");
                game_delete.disabled = true;
                s_game.selectedIndex = "0";
                initializePage()

            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }

    }

    function initializePage() { // Empty values and charts

        document.getElementById('stdate').innerHTML = ""
        document.getElementById('sttotg_1').innerHTML = "0"
        document.getElementById('sttotg_2').innerHTML = "0"
        document.getElementById('sttotxG_1').innerHTML = "0"
        document.getElementById('sttotxG_2').innerHTML = "0"
        document.getElementById('sttotxGOT_1').innerHTML = "0"
        document.getElementById('sttotxGOT_2').innerHTML = "0"
        document.getElementById('stlabel').innerHTML = "00:00:00"
        document.getElementById('stperiodNr').innerHTML = "Period 1"
        document.getElementById('stteam_1').innerHTML = ""
        document.getElementById('stt1name1').innerHTML = ""
        document.getElementById('stt1name2').innerHTML = ""
        document.getElementById('stteam_2').innerHTML = ""
        document.getElementById('stt2name1').innerHTML = ""
        document.getElementById('stt2name2').innerHTML = ""
        csvButton.disabled = 'true';

        ctx1.drawImage(myImg,0,0,fWidth,fLength);
        ctx2.drawImage(myImg,0,0,fWidth,fLength);
        ctx3.drawImage(myImg,0,0,fWidth,fLength);
        ctx4.drawImage(myImg,0,0,fWidth,fLength);

        printShotData = [];
        name_t1 = "";
        name_t2 = "";

        // xG Game Chart

        var chartData = google.visualization.arrayToDataTable([
             ['Line', "", { role: 'style' }, { role: 'annotation' }, "", { role: 'style' }, { role: 'annotation' } ],
             ['Line 1', 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0 ],
             ['Line 2', 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0 ],
             ['Line 3', 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0 ],
             ['PP', 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0 ],
             ['SH', 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0 ]
          ]);

        var options = {
            title: 'xG by Line',
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        var chart = new google.visualization.BarChart(document.getElementById('stxGGame_chart'));
        chart.draw(chartData, options);

        //xG% GameChart

        xGL1T1 = 0;
        xGL1T2 = 0;
        xGL2T1 = 0;
        xGL2T2 = 0;
        xGL3T1 = 0;
        xGL3T2 = 0;

        var chartData = google.visualization.arrayToDataTable([
             ['Line', "", { role: 'style' }, { role: 'annotation' }, "", { role: 'style' }, { role: 'annotation' } ],
             ['Line 1', xGL1T1, 'color: #002072', xGL1T1 + "%", xGL1T2, 'color: #59D9EB', xGL1T2 + "%" ],
             ['Line 2', xGL2T1, 'color: #002072', xGL2T1 + "%", xGL2T2, 'color: #59D9EB', xGL2T2 + "%" ],
             ['Line 3', xGL3T1, 'color: #002072', xGL3T1 + "%", xGL3T2, 'color: #59D9EB', xGL3T2 + "%" ]
        ]);

        var options = {
            title: 'xG% by Line',
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: {
                viewWindowMode:'explicit',
                textPosition: 'none',
                viewWindow: {
                  max:100,
                  min:0
                }
            },
            };

        var chart = new google.visualization.BarChart(document.getElementById('stxG%Game_chart'));
        chart.draw(chartData, options);

        // Team 1 typechart

        var chartDataX = google.visualization.arrayToDataTable([
            ['Type', 'TO One-timer', {role: 'style'}, {role: 'annotation'}, 'TO Direct', {role:'style'}, {role: 'annotation '}, 'One-timer', {role: 'style'}, {role: 'annotation'}, 'Direct', {role: 'style'}, {role: 'annotation'}],
            ['Line1', 0, 'color: #20AB4E', 0, 0, 'color: #295738', 0, 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0],
            ['Line2', 0, 'color: #20AB4E', 0, 0, 'color: #295738', 0, 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0],
            ['Line3', 0, 'color: #20AB4E', 0, 0, 'color: #295738', 0, 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0]
         ]);

        var options = {
            title: 'Shot types, ' + "",
            bar: {groupWidth: "75%"},
            legend: { position: 'bottom'},
            colors: ['#20AB4E', '#295738','#002072','#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        var chart2 = new google.visualization.BarChart(document.getElementById('stT1_typechart'));
        chart2.draw(chartDataX, options);

        // Team 2 typechart

        var chartDataY = google.visualization.arrayToDataTable([
            ['Type', 'TO One-timer', {role: 'style'}, {role: 'annotation'}, 'TO Direct', {role:'style'}, {role: 'annotation '}, 'One-timer', {role: 'style'}, {role: 'annotation'}, 'Direct', {role: 'style'}, {role: 'annotation'}],
            ['Line1', 0, 'color: #EDA137', 0, 0, 'color: #EB4F07', 0, 0, 'color: #D10808', 0, 0, 'color: #663D3D', 0],
            ['Line2', 0, 'color: #EDA137', 0, 0, 'color: #EB4F07', 0, 0, 'color: #D10808', 0, 0, 'color: #663D3D', 0],
            ['Line3', 0, 'color: #EDA137', 0, 0, 'color: #EB4F07', 0, 0, 'color: #D10808', 0, 0, 'color: #663D3D', 0
            ]
         ]);

        var options = {
            title: 'Shot types, ' + "",
            bar: {groupWidth: "75%"},
            legend: { position: 'bottom'},
            colors: ['#EDA137', '#EB4F07','#D10808','#663D3D'],
            hAxis: { textPosition: 'none' }
            };

        var chartX = new google.visualization.BarChart(document.getElementById('stT2_typechart'));
        chartX.draw(chartDataY, options);

        // Team 1 Player xG chart

        var pldata = new google.visualization.DataTable();
        pldata.addColumn('string', 'Name');
        pldata.addColumn('number', 'Shot xG');
        pldata.addColumn('number', 'Pass xG');
        pldata.addColumn('number', 'Goals');
        pldata.addColumn('number', 'Ass.');
        pldata.addColumn('number', 'Shots');
        pldata.addColumn('number', 'Shotass.');

        var options = {
            title: 'Individual stats '+ "",
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };


        // Create and draw the visualization.
        var chart = new google.visualization.Table(document.getElementById('stT1plstats'));
        chart.draw(pldata, options);

        // Add sort listener

        google.visualization.events.addListener(chart, 'sort',
        function(event) {
            pldata.sort([{column: event.column, desc: event.ascending}]);
            chart.draw(pldata, options);
        });

        // Team 2 Player xG chart

        var pldata = new google.visualization.DataTable();
        pldata.addColumn('string', 'Name');
        pldata.addColumn('number', 'Shot xG');
        pldata.addColumn('number', 'Pass xG');
        pldata.addColumn('number', 'Goals');
        pldata.addColumn('number', 'Ass.');
        pldata.addColumn('number', 'Shots');
        pldata.addColumn('number', 'Shotass.');

        var options = {
            title: 'Individual stats '+ "",
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        // Create and draw the visualization.
        var chart = new google.visualization.Table(document.getElementById('stT2plstats'));
        chart.draw(pldata, options);

        // Add sort listener

        google.visualization.events.addListener(chart, 'sort',
        function(event) {
            pldata.sort([{column: event.column, desc: event.ascending}]);
            chart.draw(pldata, options);
        });

        // Linechart Team 1

        var pldata1 = new google.visualization.DataTable();
        pldata1.addColumn('string', 'Line');
        pldata1.addColumn('string', 'ToC');
        pldata1.addColumn('number', 'xG for');
        pldata1.addColumn('number', 'xG ag.');
        pldata1.addColumn('number', 'Plus');
        pldata1.addColumn('number', 'Minus');
        pldata1.addColumn('number', 'CF');
        pldata1.addColumn('number', 'CA');
        pldata1.addColumn('number', 'Pos%');
        pldata1.addColumn('number', 'xG Turnov.');
        pldata1.addColumn('number', 'xG org.att. ');

        var options = {
            title: 'Line stats, ' + "",
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        // Create and draw the visualization.
        var chart = new google.visualization.Table(document.getElementById('stT1linestats'));
        chart.draw(pldata1, options);

        // Linestats T2

        var pldata2 = new google.visualization.DataTable();
        pldata2.addColumn('string', 'Line');
        pldata2.addColumn('string', 'ToC');
        pldata2.addColumn('number', 'xG for');
        pldata2.addColumn('number', 'xG ag.');
        pldata2.addColumn('number', 'Plus');
        pldata2.addColumn('number', 'Minus');
        pldata2.addColumn('number', 'CF');
        pldata2.addColumn('number', 'CA');
        pldata2.addColumn('number', 'Pos%');
        pldata2.addColumn('number', 'xG Turnov.');
        pldata2.addColumn('number', 'xG org.att. ');

        var options = {
            title: 'Line stats, ' + "",
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        // Create and draw the visualization.
        var chart2 = new google.visualization.Table(document.getElementById('stT2linestats'));
        chart2.draw(pldata2, options);

        // Pie Chart, xG per type Team 1

        var data = new google.visualization.arrayToDataTable([
        ['Type', 'xG'],
        ['Turnovers, one-timer', 0],
        ['Turnovers, direct', 0],
        ['Org.attack, one-timer', 0],
        ['Org.attack, direct', 0],
        ['Others',  0]

        ]);

        var options2 = {
        title: 'Share of xG by attack types',
        colors: ['#20AB4E', '#295738','#002072','#59D9EB','#F7FAFA'],
        is3D: true,
        };

        var chart = new google.visualization.PieChart(document.getElementById('stT1_st_piechart'));
        chart.draw(data, options2);

        // Pie Chart, xG per type Team 2

        var data2 = new google.visualization.arrayToDataTable([
        ['Type', 'xG'],
        ['Turnover, one-timer', 0],
        ['Turnover, direct', + 0],
        ['Org. attack, one-timer', 0],
        ['Org. attack, direct', 0],
        ['Other', 0]

        ]);

        var options2 = {
        title: 'Share of xG by attack/shot types',
        colors: ['#EDA137', '#EB4F07','#D10808','#663D3D', '#F7FAFA'],
        is3D: true,
        };

        var chart = new google.visualization.PieChart(document.getElementById('stT2_st_piechart'));
        chart.draw(data2, options2);

        // Team xG Chart
        var data = google.visualization.arrayToDataTable([['Time','xG Team 1','xG Team 2','Goal Team 1','Goal Team 2'],["",0,0,0,0]]);

        var options = {
          title: 'xG by Team',
          curveType: 'function',
          legend: { position: 'bottom' },
          seriesType: 'lines',
          series: {
              2:{type: 'bars', color: 'blue'},
              3:{type: 'bars', color: 'red'}}
        };

        var chart = new google.visualization.ComboChart(document.getElementById('stxGTeam_chart'));
        chart.draw(data, options);

        // Turnover chart

         var chartData = google.visualization.arrayToDataTable([
             ['Line', "", { role: 'style' }, { role: 'annotation' }, "", { role: 'style' }, { role: 'annotation' } ],
             ['Line 1', 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0],
             ['Line 2', 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0],
             ['Line 3', 0, 'color: #002072', 0, 0, 'color: #59D9EB', 0
             ]
          ]);

        var options = {
            title: 'Turnovers by Line',
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        // var chart1 = new google.visualization.BarChart(document.getElementById('toGame_chart'));
        // chart1.draw(chartData, options);

    }

    function arrayToCsv(data){
      return data.map(row =>
        row
        .map(String)  // convert every value to String
        .map(v => v.replaceAll('"', '""'))  // escape double colons
        .map(v => `"${v}"`)  // quote it
        .join(',')  // comma-separated
      ).join('\r\n');  // rows starting on new lines
    }

    /** Download contents as a file
     * Source: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
     */
    function downloadBlob(content, filename, contentType) {
      // Create a blob
      var blob = new Blob([content], { type: contentType });
      var url = URL.createObjectURL(blob);

      // Create a link to download it
      var pom = document.createElement('a');
      pom.href = url;
      pom.setAttribute('download', filename);
      pom.click();
    }

    function downloadCsv() {

        var conf_csv = confirm("Press OK to download shots in a csv-file");

            if (conf_csv == true) {
                name_shot = name_t1+"_"+name_t2+"_shots.csv";
                name_shot = name_shot.replace(/\s/g, "");
                csv_shot = arrayToCsv(printShotData);
                downloadBlob(csv_shot, name_shot, 'text/csv;charset=utf-8;');
            }

    }