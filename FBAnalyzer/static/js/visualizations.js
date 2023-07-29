
    var s_game = document.getElementById("select-game");
    var game_delete = document.getElementById("analyse_delete");
    var img = new Image();
    var cnvs = document.getElementById("stmyCanvas");
    var ctx = cnvs.getContext("2d");
    var fWidth = 300; // Width of the shotmap field in pixels
    var fLength = 500; // Length of the shotmap field in pixels

    // Function for Analysis.html - game chart visualization

    function changeGame() {

        // Set Game Stats

        game_id = s_game.options[s_game.selectedIndex].value;
        team_1 = 0;
        team_2 = 0;

        fetch("https://fbscanner.io/apis/games/" + game_id + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                window.location.reload();
                gd = data.game_data;
                game_delete.disabled = false;
                document.getElementById('stdate').innerHTML = data.date;
                team_1 = data.teams[0];
                team_2 = data.teams[1];
                document.getElementById('sttotg_1').innerHTML = gd.tgt_1;
                document.getElementById('sttotg_2').innerHTML = gd.tgt_2;
                document.getElementById('sttotxG_1').innerHTML = gd.txG_1;
                document.getElementById('sttotxG_2').innerHTML = gd.txG_2;

                var date = new Date(gd.gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                document.getElementById('stlabel').innerHTML = display;
                document.getElementById('stperiodNr').innerHTML = "Period " + gd.periodN;

                fetch("https://fbscanner.io/apis/teams/" + team_1+ "/")
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('stteam_1').innerHTML = data.name;
                        document.getElementById('stt1name1').innerHTML = data.name;
                        document.getElementById('stt1name2').innerHTML = data.name;
                        gd.xGTeam_array[0][1] = 'xG ' + data.name;
                        gd.xGTeam_array[0][3] = 'Goal ' + data.name;
                })

                fetch("https://fbscanner.io/apis/teams/" + team_2+ "/")
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('stteam_2').innerHTML = data.name;
                        document.getElementById('stt2name1').innerHTML = data.name;
                        document.getElementById('stt2name2').innerHTML = data.name;
                        gd.xGTeam_array[0][2] = 'xG ' + data.name;
                        gd.xGTeam_array[0][4] = 'Goal ' + data.name;
                })

                img.src = gd.cnvs_url;
                img.onload = function() {
                    ctx.drawImage(img,0,0,fWidth,fLength);
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
                pldata.addColumn('number', 'Goals');
                pldata.addColumn('number', 'Ass.');
                pldata.addColumn('number', 'Shots');
                pldata.addColumn('number', 'Shotass.');

                for(i = 1; i < gd.plT1_array.length; i++){
                    pldata.addRow([gd.plT1_array[i][1], gd.plT1_array[i][2], gd.plT1_array[i][3], gd.plT1_array[i][4], gd.plT1_array[i][5], gd.plT1_array[i][6], gd.plT1_array[i][7]]);
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
                pldata.addColumn('number', 'Goals');
                pldata.addColumn('number', 'Ass.');
                pldata.addColumn('number', 'Shots');
                pldata.addColumn('number', 'Shotass.');

                for(i = 1; i < gd.plT2_array.length; i++){
                    pldata.addRow([gd.plT2_array[i][1], gd.plT2_array[i][2], gd.plT2_array[i][3], gd.plT2_array[i][4], gd.plT2_array[i][5], gd.plT2_array[i][6], gd.plT2_array[i][7]]);
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
                window.location.reload();

            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }

    }