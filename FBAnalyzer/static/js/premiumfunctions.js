
    // Load and draw the shot map image when the html-page is loaded
    window.onload = function() {
        ctx.drawImage(myImg,0,0,fWidth,fLength);
        ctx1.drawImage(myImg,0,0,fWidth,fLength);
        ctx2.drawImage(myImg,0,0,fWidth,fLength);
        ctx3.drawImage(myImg,0,0,fWidth,fLength);
        ctx4.drawImage(myImg,0,0,fWidth,fLength);
        ctx5.drawImage(myImg,0,0,fWidth,fLength);
        document.getElementById('select-date').value = new Date().toISOString().slice(0, 10);

        fetch("https://fbscanner.io/apis/gamelist?user_id=" + user_id)
            .then(response => response.json())
            .then(games => {
                console.log('Success:', games);
                for (let i=0;i<games.length;i++) {
                    if (games[i].user == user_id) {
                        if (typeof games[i].game_data.name_t1 !== "undefined") {
                            var opt = new Option(games[i].date + " | " + games[i].game_data.name_t1 + " - " + games[i].game_data.name_t2, games[i].id);
                            load_game.appendChild(opt);
                        }
                    }
                }
            })
        .catch((error) => {
            console.error('Error:', error);
    });

    }
    window.onbeforeunload = function() {
      return "Dude, are you sure you want to leave? Think of the kittens!";
    }

    // When the change team order button is changed, the teams switch sides
    function ChangeOrder() {
        if (Order == 1) { // Team 1 is moved as the upper one, defence zone is up
            document.getElementById("TeamL").innerHTML = name_t2;
            document.getElementById("TeamR").innerHTML = name_t1;
            document.getElementById("name_t1_21").innerHTML = name_t2 + " attack";
            document.getElementById("name_t2_21").innerHTML = name_t1 + " attack";
            Order = 2;
        }
        else { // Team 1 is moved as the bottom one, defence zone is down
            document.getElementById("TeamL").innerHTML = name_t1;
            document.getElementById("TeamR").innerHTML = name_t2;
            document.getElementById("name_t1_21").innerHTML = name_t1 + " attack";
            document.getElementById("name_t2_21").innerHTML = name_t2 + " attack";
            Order = 1;
        }
    }

    // When the ball team left button is pressed the button colors and the variable are changed
    // If game is on, them one number is added to number of times with ball
    function BallTeamL() {
        document.getElementById("TeamR").style.background='#002072';
        document.getElementById("TeamL").style.background='#3046FB';
        if (Order == 1) {
            Ball_pos = 1;
            if (started == 1 && PosTime > 0) {
                Not_p[line_on - 1]++;
                Not_g[line_on - 1]++;
                if (line_on < 4) {
                    Not_p[7]++;
                    Not_g[7]++;
                }
            }
            PosTime = 0;

        } else {
            Ball_pos = 2;
            if (started == 1 && PosTime > 0) {
                Notno_p[line_on - 1]++;
                Notno_g[line_on - 1]++;
                if (line_on < 4) {
                    Notno_p[7]++;
                    Notno_g[7]++;
                }
            }
            PosTime = 0;
        }
    }

    // When the ball team right button is pressed
    function BallTeamR() {
        document.getElementById("TeamR").style.background='#3046FB';
        document.getElementById("TeamL").style.background='#002072';
        if (Order == 1) {
            Ball_pos = 2;
            if (started == 1 && PosTime > 0) {
                Notno_p[line_on - 1]++;
                Notno_g[line_on - 1]++;
                if (line_on < 4) {
                    Notno_p[7]++;
                    Notno_g[7]++;
                }
            }
            PosTime = 0;
        }

        else {
            Ball_pos = 1;
            if (started == 1 && PosTime > 0) {
                Not_p[line_on - 1]++;
                Not_g[line_on - 1]++;
                if (line_on < 4) {
                    Not_p[7]++;
                    Not_g[7]++;
                }
            }
            PosTime = 0;
        }
    }

    // When the line is changed by pressing any of the line on court buttons except the one that is on
    // Team 1 line change functionality
    function Line_change(line) {
        console.log(lines); // debugging
        document.getElementById(lines[line_on-1]).style.background='#002072';
        document.getElementById(lines[line-1]).style.background='#3046FB';
        old_line = line_on;
        line_on = line;
        if (LineTime > 0) {
            if (Ball_pos == 1) {
                Not_p[line_on - 1]++;
                Not_g[line_on - 1]++;
                if (line_on < 4) {
                    Not_p[7]++;
                    Not_g[7]++;
                }
            }
            if (Ball_pos == 2) {
                Notno_p[line_on - 1]++;
                Notno_g[line_on - 1]++;
                if (line_on < 4) {
                    Notno_p[7]++;
                    Notno_g[7]++;
                }
            }
            Nos_p[line_on - 1]++;
            Nos_g[line_on - 1]++;
            if (line_on < 4) {
                Nos_p[7]++;
                Nos_g[7]++;
            }

            if (old_line == 1) {
                shiftP = Math.round(100 * shiftPos / LineTime);
                posT = Pos_g[0] + Pos_g[1] + Pos_g[2] + Pos_g[3] + Pos_g[4] + Pos_g[5] + Pos_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * Pos_p[line_on - 1] / Toc_p[line_on - 1]);

                posTeam_array.push([shiftNo, shiftP, 0, 0, 0, 0, teamPos]);
            }
            if (old_line == 2) {
                shiftP = Math.round(100 * shiftPos / LineTime);
                posT = Pos_g[0] + Pos_g[1] + Pos_g[2] + Pos_g[3] + Pos_g[4] + Pos_g[5] + Pos_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * Pos_p[line_on - 1] / Toc_p[line_on - 1]);

                posTeam_array.push([shiftNo, 0, shiftP, 0, 0, 0, teamPos]);
            }
            if (old_line == 3) {
                shiftP = Math.round(100 * shiftPos / LineTime);
                posT = Pos_g[0] + Pos_g[1] + Pos_g[2] + Pos_g[3] + Pos_g[4] + Pos_g[5] + Pos_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * Pos_p[line_on - 1] / Toc_p[line_on - 1]);

                posTeam_array.push([shiftNo, 0, 0, shiftP, 0, 0, teamPos]);
            }
            if (old_line == 4 || old_line == 5) {
                shiftP = Math.round(100 * shiftPos / LineTime);
                posT = Pos_g[0] + Pos_g[1] + Pos_g[2] + Pos_g[3] + Pos_g[4] + Pos_g[5] + Pos_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * Pos_p[line_on - 1] / Toc_p[line_on - 1]);

                posTeam_array.push([shiftNo, 0, 0, 0, shiftP, 0, teamPos]);
            }
            if (old_line == 6 || old_line == 7) {
                shiftP = Math.round(100 * shiftPos / LineTime);
                posT = Pos_g[0] + Pos_g[1] + Pos_g[2] + Pos_g[3] + Pos_g[4] + Pos_g[5] + Pos_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * Pos_p[line_on - 1] / Toc_p[line_on - 1]);

                posTeam_array.push([shiftNo, 0, 0, 0, 0, shiftP, teamPos]);
            }
        }
        console.log("Shift Possession: " + shiftP);
        console.log("Team Possession: " + teamPos);
        PosTime = 0;
        LineTime = 0;
        shiftNo++;
        shiftPos = 0;
        console.log(line_on); // debugging
        // Automatic line change for Team 2
        if (line < 4) {
            Line_change_2(line);
        }
        if (line == 4) {
            Line_change_2(6);
        }
        if (line == 5) {
            Line_change_2(7);
        }
        if (line == 6) {
            Line_change_2(4);
        }
        if (line == 7) {
            Line_change_2(5);
        }
    }

    // Team 2 line change functionality
    function Line_change_2(line) {
        console.log(lines_2); // debugging
        document.getElementById(lines_2[line_on_2-1]).style.background='#002072';
        document.getElementById(lines_2[line-1]).style.background='#3046FB';
        old_line = line_on_2;
        line_on_2 = line;
        if (LineTime_2 > 0) {
            if (Ball_pos == 2) {
                NotT2_p[line_on_2 - 1]++;
                NotT2_g[line_on_2 - 1]++;
                if (line_on_2 < 4) {
                    NotT2_p[7]++;
                    NotT2_g[7]++;
                }
            }
            if (Ball_pos == 1) {
                NotnoT2_p[line_on_2 - 1]++;
                NotnoT2_g[line_on_2 - 1]++;
                if (line_on_2 < 4) {
                    NotnoT2_p[7]++;
                    NotnoT2_g[7]++;
                }
            }
            NosT2_p[line_on_2 - 1]++;
            NosT2_g[line_on_2 - 1]++;
            if (line_on_2 < 4) {
                NosT2_p[7]++;
                NosT2_g[7]++;
            }

            if (old_line == 1) {
                shiftP = Math.round(100 * shiftPos_2 / LineTime_2);
                posT = PosT2_g[0] + PosT2_g[1] + PosT2_g[2] + PosT2_g[3] + PosT2_g[4] + PosT2_g[5] + PosT2_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * PosT2_p[line_on_2 - 1] / TocT2_p[line_on_2 - 1]);

                posTeamT2_array.push([shiftNo_2, shiftP, 0, 0, 0, 0, teamPos]);
            }
            if (old_line == 2) {
                shiftP = Math.round(100 * shiftPos_2 / LineTime_2);
                posT = PosT2_g[0] + PosT2_g[1] + PosT2_g[2] + PosT2_g[3] + PosT2_g[4] + PosT2_g[5] + PosT2_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * PosT2_p[line_on_2 - 1] / TocT2_p[line_on_2 - 1]);

                posTeamT2_array.push([shiftNo_2, 0, shiftP, 0, 0, 0, teamPos]);
            }
            if (old_line == 3) {
                shiftP = Math.round(100 * shiftPos_2 / LineTime_2);
                posT = PosT2_g[0] + PosT2_g[1] + PosT2_g[2] + PosT2_g[3] + PosT2_g[4] + PosT2_g[5] + PosT2_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * PosT2_p[line_on_2 - 1] / TocT2_p[line_on_2 - 1]);

                posTeamT2_array.push([shiftNo_2, 0, 0, shiftP, 0, 0, teamPos]);
            }
            if (old_line == 4 || old_line == 5) {
                shiftP = Math.round(100 * shiftPos_2 / LineTime_2);
                posT = PosT2_g[0] + PosT2_g[1] + PosT2_g[2] + PosT2_g[3] + PosT2_g[4] + PosT2_g[5] + PosT2_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * PosT2_p[line_on_2 - 1] / TocT2_p[line_on_2 - 1]);

                posTeamT2_array.push([shiftNo_2, 0, 0, 0, shiftP, 0, teamPos]);
            }
            if (old_line == 6 || old_line == 7) {
                shiftP = Math.round(100 * shiftPos_2 / LineTime_2);
                posT = PosT2_g[0] + PosT2_g[1] + PosT2_g[2] + PosT2_g[3] + PosT2_g[4] + PosT2_g[5] + PosT2_g[6];
                teamPos = Math.round(100 * posT / gameCounter);
                Math.round(100 * PosT2_p[line_on_2 - 1] / TocT2_p[line_on_2 - 1]);

                posTeamT2_array.push([shiftNo_2, 0, 0, 0, 0, shiftP, teamPos]);
            }
        }
        console.log("Shift Possession: " + shiftP);
        console.log("Team Possession: " + teamPos);
        PosTime_2 = 0;
        LineTime_2 = 0;
        shiftNo_2++;
        shiftPos_2 = 0;
        console.log(line_on); // debugging
    }

    // Start game or start/stop game clock
    function Start() {
        // If the game has not started
        if (started == 0) {   // Start game and disable teams etc.
            var r = confirm("Do you want to start the game,\n changing teams will be disabled?");
            if (r == true) {
                document.getElementById("select-level-t1").disabled = true;
                document.getElementById("select-level-t2").disabled = true;
                document.getElementById("select-team-1").disabled = true;
                document.getElementById("select-team-2").disabled = true;
                document.getElementById("select-date").disabled = true;
                document.getElementById("period").disabled = false;
                document.getElementById("reset").disabled = false;
                document.getElementById("ck1a").disabled = true;
                document.getElementById("load-game").disabled = true;
                started = 1;
                sData.style.display = "block";

                name_t1 = s_T1.options[s_T1.selectedIndex].text
                set_t1_names();

                name_t2 = s_T2.options[s_T2.selectedIndex].text;
                set_t2_names();

                // Initialize the API and gain the URL for the Live Data instance.

                if (document.getElementById("ck1a").checked) {
                    initializeLive()
                }

            } else {
            }
        }
        // Game has already started, then start/stop the game clock
        else {
            if (is_on == 0) {    // Start game clock
                if (counter == 0 && Ball_pos == 1) {
                    Not_p[line_on - 1]++;
                    Not_g[line_on - 1]++;
                    Not_p[7]++;
                    Not_g[7]++;

                    NotnoT2_p[line_on_2 - 1]++;
                    NotnoT2_g[line_on_2 - 1]++;
                    NotnoT2_p[7]++;
                    NotnoT2_g[7]++;
                }
                if (counter == 0 && Ball_pos == 2) {
                    Notno_p[line_on - 1]++;
                    Notno_g[line_on - 1]++;
                    Notno_p[7]++;
                    Notno_g[7]++;

                    NotT2_p[line_on_2 - 1]++;
                    NotT2_g[line_on_2 - 1]++;
                    NotT2_p[7]++;
                    NotT2_g[7]++;

                }
                if (counter == 0) {
                    Nos_p[line_on - 1]++;
                    Nos_g[line_on - 1]++;
                    Nos_p[7]++;
                    Nos_g[7]++;

                    NosT2_p[line_on_2 - 1]++;
                    NosT2_g[line_on_2 - 1]++;
                    NosT2_p[7]++;
                    NosT2_g[7]++;

                }
                document.getElementById("start").innerHTML = "Stop";
                document.getElementById("start").style.background='#3046FB';
                is_on = 1;
                Counter();
            }
            else if (is_on == 1) {  // Stop game clock
                document.getElementById("start").innerHTML = "Start";
                document.getElementById("start").style.background='#002072';
                is_on = 0;
                drawChart(); // Update charts

                 if (document.getElementById("ck1a").checked) {
                    updateLive(); // Update the API
                 }
            }
        }
    }
    // Press the Reset button
    function Reset() {

    }
    // Press the Period button
    function Period() {
        var r = confirm("Changing period will reset clock and statistics,\nand save data, are you sure?");
            if (r == true) {
                periodN++
                counter = 0;
                shotCounter = 0;
                document.getElementById("periodNr").innerHTML = "Period " + periodN;
                document.getElementById("label").innerHTML = "00:00:00";
                tgtp_2.innerHTML = "0";
                tgtp_1.innerHTML = "0";
                txGp_1.innerHTML = "0";
                txGp_2.innerHTML = "0";
                txGOTp_1.innerHTML = "0";
                txGOTp_2.innerHTML = "0";

                var ctx = cnvs.getContext("2d");
                ctx.drawImage(myImg,0,0,fWidth,fLength);
                PosTime = 0;
                LineTime = 0;
                dataShot = 0;
                dataRes = 0;
                dataxG = 0;
                shiftPos = 0;
                PosTime_2 = 0;
                LineTime_2 = 0;
                dataShot = 0;
                dataRes = 0;
                dataxG = 0;
                dataxGOT = 0;
                shiftPos_2 = 0;
                stT1Teamp_array = [0,0,0,0,0];
                stT2Teamp_array = [0,0,0,0,0];
                stT1L1p_array = [0,0,0,0,0];
                stT2L1p_array = [0,0,0,0,0];
                stT1L2p_array = [0,0,0,0,0];
                stT2L2p_array = [0,0,0,0,0];
                stT1L3p_array = [0,0,0,0,0];
                stT2L3p_array = [0,0,0,0,0];
                plT1p_array = [['ID', 'Name', 'Shot_xG','Passed_xG','Goals','Assists','Shots', 'Shot Assists']];
                plT2p_array = [['ID','Name', 'Shot_xG','Passed_xG','Goals','Assists','Shots', 'Shot Assists']];

                for (let i = 0; i < 8; i++) {

                    sf_p[i].innerHTML = 0;
                    sa_p[i].innerHTML = 0;
                    gf_p[i].innerHTML = 0;
                    ga_p[i].innerHTML = 0;
                    pm_p[i].innerHTML = 0;
                    bf_p[i].innerHTML = 0;
                    ba_p[i].innerHTML = 0;
                    mf_p[i].innerHTML = 0;
                    ma_p[i].innerHTML = 0;
                    saf_p[i].innerHTML = 0;
                    saa_p[i].innerHTML = 0;
                    xf_p[i].innerHTML = 0;
                    xa_p[i].innerHTML = 0;

                    Pos_p[i] = 0;
                    Toc_p[i] = 0;
                    xGf_p[i] = 0;
                    xGa_p[i] = 0;
                    Not_p[i] = 0;
                    Nos_p[i] = 0;
                    Notno_p[i] = 0;

                    p_p[i].innerHTML = 0;
                    toc_p[i].innerHTML = "00:00";
                    atoc_p[i].innerHTML = "00:00";
                    avg_p[i].innerHTML = "00:00";
                    avgno_p[i].innerHTML = "00:00";
                    
                    sfT2_p[i].innerHTML = 0;
                    saT2_p[i].innerHTML = 0;
                    gfT2_p[i].innerHTML = 0;
                    gaT2_p[i].innerHTML = 0;
                    pmT2_p[i].innerHTML = 0;
                    bfT2_p[i].innerHTML = 0;
                    baT2_p[i].innerHTML = 0;
                    mfT2_p[i].innerHTML = 0;
                    maT2_p[i].innerHTML = 0;
                    safT2_p[i].innerHTML = 0;
                    saaT2_p[i].innerHTML = 0;
                    xfT2_p[i].innerHTML = 0;
                    xaT2_p[i].innerHTML = 0;

                    PosT2_p[i] = 0;
                    TocT2_p[i] = 0;
                    xGfT2_p[i] = 0;
                    xGaT2_p[i] = 0;
                    NotT2_p[i] = 0;
                    NosT2_p[i] = 0;
                    NotnoT2_p[i] = 0;

                    pT2_p[i].innerHTML = 0;
                    tocT2_p[i].innerHTML = "00:00";
                    atocT2_p[i].innerHTML = "00:00";
                    avgT2_p[i].innerHTML = "00:00";
                    avgnoT2_p[i].innerHTML = "00:00";
                }
                if (document.getElementById("ck1a").checked) {
                    updateLive(); // Update the API
                }
                document.getElementById("undo").disabled = true;

            } else {
            }
    }
    function Counter() {
        t = setTimeout(function(){ Count() }, 1000);
    }

    function Count() {
         if (is_on == 1) {

             Toc_p[line_on - 1]++;
             Toc_g[line_on - 1]++;
             Toc_p[7]++;
             Toc_g[7]++;
             
             TocT2_p[line_on_2 - 1]++;
             TocT2_g[line_on_2 - 1]++;
             TocT2_p[7]++;
             TocT2_g[7]++;

             if (Ball_pos == 1) {
                Pos_p[line_on - 1]++;
                Pos_g[line_on - 1]++;
                shiftPos++;
                Pos_g[7]++;
                Pos_p[7]++;
            }
             
             if (Ball_pos == 2) {
                PosT2_p[line_on_2 - 1]++;
                PosT2_g[line_on_2 - 1]++;
                shiftPos_2++;
                PosT2_g[7]++;
                PosT2_p[7]++;
             }

         else {

         }

             // Possession

             p_p[line_on - 1].innerHTML = Math.round(100 * Pos_p[line_on - 1] / Toc_p[line_on - 1]);
             p_p[7].innerHTML = Math.round(100 * Pos_p[7] / Toc_p[7]);

             p_g[line_on - 1].innerHTML = Math.round(100 * Pos_g[line_on - 1] / Toc_g[line_on - 1]);
             p_g[7].innerHTML = Math.round(100 * Pos_g[7] / Toc_g[7]);
             
             pT2_p[line_on_2 - 1].innerHTML = Math.round(100 * PosT2_p[line_on_2 - 1] / TocT2_p[line_on_2 - 1]);
             pT2_p[7].innerHTML = Math.round(100 * PosT2_p[7] / TocT2_p[7]);

             pT2_g[line_on_2 - 1].innerHTML = Math.round(100 * PosT2_g[line_on_2 - 1] / TocT2_g[line_on_2 - 1]);
             pT2_g[7].innerHTML = Math.round(100 * PosT2_g[7] / TocT2_g[7]);

             // Time on Court

             var toc = new Date(Toc_p[line_on - 1] * 1000);
             var d = toc.toISOString().substr(14, 5);
             toc_p[line_on - 1].innerHTML = d;

             var toc = new Date(Toc_g[line_on - 1] * 1000);
             var d = toc.toISOString().substr(14, 5);
             toc_g[line_on - 1].innerHTML = d;

             var toc = new Date(Toc_p[7] * 1000);
             var d = toc.toISOString().substr(14, 5);
             toc_p[7].innerHTML = d;

             var toc = new Date(Toc_g[7] * 1000);
             var d = toc.toISOString().substr(14, 5);
             toc_g[7].innerHTML = d;
             
             var toc = new Date(TocT2_p[line_on_2 - 1] * 1000);
             var d = toc.toISOString().substr(14, 5);
             tocT2_p[line_on_2 - 1].innerHTML = d;

             var toc = new Date(TocT2_g[line_on_2 - 1] * 1000);
             var d = toc.toISOString().substr(14, 5);
             tocT2_g[line_on_2 - 1].innerHTML = d;

             var toc = new Date(TocT2_p[7] * 1000);
             var d = toc.toISOString().substr(14, 5);
             tocT2_p[7].innerHTML = d;

             var toc = new Date(TocT2_g[7] * 1000);
             var d = toc.toISOString().substr(14, 5);
             tocT2_g[7].innerHTML = d;

             // Average Time on Ball

             if (Not_p[line_on - 1] > 0) {
                var avg = new Date(Math.round(Pos_p[line_on - 1] / Not_p[line_on - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avg_p[line_on - 1].innerHTML = a;
             }
             if (Not_p[7] > 0) {
                var avg = new Date(Math.round(Pos_p[7] / Not_p[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avg_p[7].innerHTML = a;
             }
             if (Not_g[line_on - 1] > 0) {
                var avg = new Date(Math.round(Pos_g[line_on - 1] / Not_g[line_on - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avg_g[line_on - 1].innerHTML = a;
             }
             if (Not_g[7] > 0) {
                var avg = new Date(Math.round(Pos_g[7] / Not_g[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avg_g[7].innerHTML = a;
             }
             
             if (NotT2_p[line_on_2 - 1] > 0) {
                var avg = new Date(Math.round(PosT2_p[line_on_2 - 1] / NotT2_p[line_on_2 - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgT2_p[line_on_2 - 1].innerHTML = a;
             }
             if (NotT2_p[7] > 0) {
                var avg = new Date(Math.round(PosT2_p[7] / NotT2_p[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgT2_p[7].innerHTML = a;
             }
             if (NotT2_g[line_on_2 - 1] > 0) {
                var avg = new Date(Math.round(PosT2_g[line_on_2 - 1] / NotT2_g[line_on_2 - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgT2_g[line_on_2 - 1].innerHTML = a;
             }
             if (NotT2_g[7] > 0) {
                var avg = new Date(Math.round(PosT2_g[7] / NotT2_g[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgT2_g[7].innerHTML = a;
             }

             // Average Time without Ball

             if (Notno_p[line_on - 1] > 0) {
                var avg = new Date(Math.round((Toc_p[line_on - 1] - Pos_p[line_on - 1]) / Notno_p[line_on - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgno_p[line_on - 1].innerHTML = a;
             }
             if (Notno_p[7] > 0) {
                var avg = new Date(Math.round((Toc_p[7] - Pos_p[7]) / Notno_p[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgno_p[7].innerHTML = a;
             }
             if (Notno_g[line_on - 1] > 0) {
                var avg = new Date(Math.round((Toc_g[line_on - 1] - Pos_g[line_on - 1]) / Notno_g[line_on - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgno_g[line_on - 1].innerHTML = a;
             }
             if (Notno_g[7] > 0) {
                var avg = new Date(Math.round((Toc_g[7] - Pos_g[7]) / Notno_g[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgno_g[7].innerHTML = a;
             }
             
             if (NotnoT2_p[line_on_2 - 1] > 0) {
                var avg = new Date(Math.round((TocT2_p[line_on_2 - 1] - PosT2_p[line_on_2 - 1]) / NotnoT2_p[line_on_2 - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgnoT2_p[line_on_2 - 1].innerHTML = a;
             }
             if (NotnoT2_p[7] > 0) {
                var avg = new Date(Math.round((TocT2_p[7] - PosT2_p[7]) / NotnoT2_p[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgnoT2_p[7].innerHTML = a;
             }
             if (NotnoT2_g[line_on_2 - 1] > 0) {
                var avg = new Date(Math.round((TocT2_g[line_on_2 - 1] - PosT2_g[line_on_2 - 1]) / NotnoT2_g[line_on_2 - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgnoT2_g[line_on_2 - 1].innerHTML = a;
             }
             if (NotnoT2_g[7] > 0) {
                var avg = new Date(Math.round((TocT2_g[7] - PosT2_g[7]) / NotnoT2_g[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                avgnoT2_g[7].innerHTML = a;
             }

             // Average Time on Court

             if (Nos_p[line_on - 1] > 0) {
                var avg = new Date(Math.round(Toc_p[line_on - 1] / Nos_p[line_on - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                atoc_p[line_on - 1].innerHTML = a;
             }
             if (Nos_p[7] > 0) {
                var avg = new Date(Math.round(Toc_p[7] / Nos_p[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                atoc_p[7].innerHTML = a;
             }
             if (Nos_g[line_on - 1] > 0) {
                var avg = new Date(Math.round(Toc_g[line_on - 1] / Nos_g[line_on - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                atoc_g[line_on - 1].innerHTML = a;
             }
             if (Nos_g[7] > 0) {
                var avg = new Date(Math.round(Toc_g[7] / Nos_g[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                atoc_g[7].innerHTML = a;
             }
             
             if (NosT2_p[line_on_2 - 1] > 0) {
                var avg = new Date(Math.round(TocT2_p[line_on_2 - 1] / NosT2_p[line_on_2 - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                atocT2_p[line_on_2 - 1].innerHTML = a;
             }
             if (NosT2_p[7] > 0) {
                var avg = new Date(Math.round(TocT2_p[7] / NosT2_p[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                atocT2_p[7].innerHTML = a;
             }
             if (NosT2_g[line_on_2 - 1] > 0) {
                var avg = new Date(Math.round(TocT2_g[line_on_2 - 1] / NosT2_g[line_on_2 - 1]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                atocT2_g[line_on_2 - 1].innerHTML = a;
             }
             if (NosT2_g[7] > 0) {
                var avg = new Date(Math.round(TocT2_g[7] / NosT2_g[7]) * 1000);
                var a = avg.toISOString().substr(14, 5);
                atocT2_g[7].innerHTML = a;
             }

            if (line_on <= 3) {
                p_T1LW = document.getElementById("sT1L"+line_on+"LW").options
                [document.getElementById("sT1L"+line_on+"LW").selectedIndex].value;
                p_T1C = document.getElementById("sT1L"+line_on+"C").options
                [document.getElementById("sT1L"+line_on+"C").selectedIndex].value;
                p_T1RW = document.getElementById("sT1L"+line_on+"RW").options
                [document.getElementById("sT1L"+line_on+"RW").selectedIndex].value;
                p_T1LD = document.getElementById("sT1L"+line_on+"LD").options
                [document.getElementById("sT1L"+line_on+"LD").selectedIndex].value;
                p_T1RD = document.getElementById("sT1L"+line_on+"RD").options
                [document.getElementById("sT1L"+line_on+"RD").selectedIndex].value;
                p_T1G = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].value;
            }

            else if (line_on > 3) {
                p_T1LW = p_T1C = p_T1RW = p_T1LD = p_T1RD = "";
                p_T1G = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].value;
            }

            if (line_on_2 <= 3) {
                p_T2LW = document.getElementById("sT2L"+line_on_2+"LW").options
                [document.getElementById("sT2L"+line_on_2+"LW").selectedIndex].value;
                p_T2C = document.getElementById("sT2L"+line_on_2+"C").options
                [document.getElementById("sT2L"+line_on_2+"C").selectedIndex].value;
                p_T2RW = document.getElementById("sT2L"+line_on_2+"RW").options
                [document.getElementById("sT2L"+line_on_2+"RW").selectedIndex].value;
                p_T2LD = document.getElementById("sT2L"+line_on_2+"LD").options
                [document.getElementById("sT2L"+line_on_2+"LD").selectedIndex].value;
                p_T2RD = document.getElementById("sT2L"+line_on_2+"RD").options
                [document.getElementById("sT2L"+line_on_2+"RD").selectedIndex].value;
                p_T2G = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].value;
            }

            else if (line_on_2 > 3) {
                p_T2LW = p_T2C = p_T2RW = p_T2LD = p_T2RD = "";
                p_T2G = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].value;
            }

             // Add one row to timeData - array
             counter++;
             gameCounter++;
             timeData.push([user_id, game_id, gameCounter, Ball_pos, line_on+1, line_on_2+1]);
             premTimeData.push([user_id, game_id, gameCounter, Ball_pos, line_on+1, line_on_2+1, p_T1LW, p_T1C, p_T1RW,
                        p_T1LD, p_T1RD, p_T1G, p_T2LW, p_T2C, p_T2RW, p_T2LD, p_T2RD, p_T2G]);

             // Add one row to the xG arrays every minute
             if (gameCounter % 60 == 0) {

                 var date = new Date(gameCounter * 1000);
                 var display = date.toISOString().substr(11, 8);
                 xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                 xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                 xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                 xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                 xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                 xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                 xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                 xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
             }

             PosTime++;
             LineTime++;
             PosTime_2++;
             LineTime_2++;

             var date = new Date(counter * 1000);
             var display = date.toISOString().substr(11, 8);
             document.getElementById("label").innerHTML = display;

             // Update the API data every 10 seconds
             if (gameCounter % 10 == 0 && document.getElementById("ck1a").checked) {
                updateLive();
             }

             t = setTimeout(function(){ Count() }, 1000);
         }
    }

    function FindPosition(oElement)
    {
      if(typeof( oElement.offsetParent ) != "undefined")
      {
        for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
        {
          posX += oElement.offsetLeft;
          posY += oElement.offsetTop;
        }
          return [ posX, posY ];
        }
        else
        {
          return [ oElement.x, oElement.y ];
        }
    }

    function GetCoordinates(e)
    {
        if (shot_on == 0) { // If shot tag process is not on

            shot_on = 1; // Shot tag process on
            var ImgPos;
            ImgPos = FindPosition(cnvs);
            if (!e) var e = window.event;
            if (e.pageX || e.pageY)
            {
            PosX = e.pageX;
            PosY = e.pageY;
            }
            else if (e.clientX || e.clientY)
            {
              PosX = e.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
              PosY = e.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
            }

            stype.style.display = "block";
            if (PosY <= 4*fLength/5)
            {
                stype.style.top = PosY + "px";
            }
            else
            {
                stype.style.top = (PosY-(fLength/4)) + "px";
            }
            stype.style.left = PosX + "px";

            PosX = PosX - ImgPos[0];
            PosY = PosY - ImgPos[1];
        }
    }

    function shotMissed() {

        var dx = PosX / fWidth;
        var dy = PosY / fLength;
        var dxGOT = 0;
        var dxG = 0;

        if (Order == 1 && Ball_pos == 1) { // Team 1 shot, Team 1 lower side

            if (dy < 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;

                if (dataType == 0) { // Turnover one-timer x 2 xG
                    dxG = dxG * 2.0;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                }
                if (dataType == 2) { // onetimer x 2 xG
                    dxG = dxG * 2.0;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                }

                xGf_p[line_on - 1] = Math.round((xGf_p[line_on - 1] + dxG) * 100) / 100;

                xGf_p[7] = Math.round((xGf_p[7] + dxG) * 100) / 100;

                xGf_g[line_on - 1] = Math.round((xGf_g[line_on - 1] + dxG) * 100) / 100;

                xGf_g[7] = Math.round((xGf_g[7] + dxG) * 100) / 100;

                xGaT2_p[line_on_2 - 1] = Math.round((xGaT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_p[7] = Math.round((xGaT2_p[7] + dxG) * 100) / 100;

                xGaT2_g[line_on_2 - 1] = Math.round((xGaT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_g[7] = Math.round((xGaT2_g[7] + dxG) * 100) / 100;

                xf_p[line_on - 1].innerHTML = xGf_p[line_on - 1];

                xf_p[7].innerHTML = xGf_p[7];

                xf_g[line_on - 1].innerHTML = xGf_g[line_on - 1];

                xf_g[7].innerHTML = xGf_g[7];

                xaT2_p[line_on_2 - 1].innerHTML = xGaT2_p[line_on_2 - 1];

                xaT2_p[7].innerHTML = xGaT2_p[7];

                xaT2_g[line_on_2 - 1].innerHTML = xGaT2_g[line_on_2 - 1];;

                xaT2_g[7].innerHTML = xGaT2_g[7];


                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_1.innerHTML = a;

                b = Number(txGp_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_1.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;


            }
        }

        if (Order == 2 && Ball_pos == 1) { // Team 1 shot, Team 1 upper side

            if (dy > 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;

                if (dataType == 0) { // Turnover one-timer x 2 xG
                    dxG = dxG * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                }
                if (dataType == 2) { // onetimer x 2 xG
                    dxG = dxG * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                }

                xGf_p[line_on - 1] = Math.round((xGf_p[line_on - 1] + dxG) * 100) / 100;

                xGf_p[7] = Math.round((xGf_p[7] + dxG) * 100) / 100;

                xGf_g[line_on - 1] = Math.round((xGf_g[line_on - 1] + dxG) * 100) / 100;

                xGf_g[7]= Math.round((xGf_g[7] + dxG) * 100) / 100;


                xGaT2_p[line_on_2 - 1] = Math.round((xGaT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_p[7] = Math.round((xGaT2_p[7] + dxG) * 100) / 100;

                xGaT2_g[line_on_2 - 1] = Math.round((xGaT2_g[line_on_2 - 1] + dxG) * 100) / 100;
                // undo_array.push([xGaT2_g[line_on_2 - 1],dxG])

                 xGaT2_g[7]= Math.round((xGaT2_g[7] + dxG) * 100) / 100;


                xf_p[line_on - 1].innerHTML = xGf_p[line_on - 1];

                xf_p[7].innerHTML = xGf_p[7];

                xf_g[line_on - 1].innerHTML = xGf_g[line_on - 1];

                xf_g[7].innerHTML = xGf_g[7];

                xaT2_p[line_on_2 - 1].innerHTML = xGaT2_p[line_on_2 - 1];

                xaT2_p[7].innerHTML = xGaT2_p[7];

                xaT2_g[line_on_2 - 1].innerHTML = xGaT2_g[line_on_2 - 1];;

                xaT2_g[7].innerHTML = xGaT2_g[7];


                dataxG = dxG;
                dataxGOT = dxGOT;
                console.log(dataxG)
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_1.innerHTML = a;

                b = Number(txGp_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_1.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;
            }
        }

        if (Order == 1 && Ball_pos == 2) { // Team 2 shot, Team 2 upper side

            if (dy > 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;

                if (dataType == 0) { // Turnover one-timer x 2 xG
                    dxG = dxG * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,25 xG
                    dxG = dxG * 1.2;
                }
                if (dataType == 2) { // onetimer x 2 xG
                    dxG = dxG * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                }

                xGa_p[line_on - 1] = Math.round((xGa_p[line_on - 1] + dxG) * 100) / 100;

                xGa_p[7] = Math.round((xGa_p[7] + dxG) * 100) / 100;

                xGa_g[line_on - 1] = Math.round((xGa_g[line_on - 1] + dxG) * 100) / 100;

                xGa_g[7]= Math.round((xGa_g[7] + dxG) * 100) / 100;


                xGfT2_p[line_on_2 - 1] = Math.round((xGfT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_p[7] = Math.round((xGfT2_p[7] + dxG) * 100) / 100;

                xGfT2_g[line_on_2 - 1] = Math.round((xGfT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_g[7]= Math.round((xGfT2_g[7] + dxG) * 100) / 100;


                xa_p[line_on - 1].innerHTML = xGa_p[line_on - 1];

                xa_p[7].innerHTML = xGa_p[7];

                xa_g[line_on - 1].innerHTML = xGa_g[line_on - 1];

                xa_g[7].innerHTML = xGa_g[7];


                xfT2_p[line_on_2 - 1].innerHTML = xGfT2_p[line_on_2 - 1];

                xfT2_p[7].innerHTML = xGfT2_p[7];

                xfT2_g[line_on_2 - 1].innerHTML = xGfT2_g[line_on_2 - 1];;

                xfT2_g[7].innerHTML = xGfT2_g[7];


                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_2.innerHTML = a;

                b = Number(txGp_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_2.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on_2 < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on_2+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on_2+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

            }
        }

        if (Order == 2 && Ball_pos == 2) { // Team 2 shot, Team 2 lower side

            if (dy < 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                }

                xGa_p[line_on - 1] = Math.round((xGa_p[line_on - 1] + dxG) * 100) / 100;

                xGa_p[7] = Math.round((xGa_p[7] + dxG) * 100) / 100;

                xGa_g[line_on - 1] = Math.round((xGa_g[line_on - 1] + dxG) * 100) / 100;

                xGa_g[7]= Math.round((xGa_g[7] + dxG) * 100) / 100;


                xGfT2_p[line_on_2 - 1] = Math.round((xGfT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_p[7] = Math.round((xGfT2_p[7] + dxG) * 100) / 100;

                xGfT2_g[line_on_2 - 1] = Math.round((xGfT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_g[7]= Math.round((xGfT2_g[7] + dxG) * 100) / 100;


                xa_p[line_on - 1].innerHTML = xGa_p[line_on - 1];

                xa_p[7].innerHTML = xGa_p[7];

                xa_g[line_on - 1].innerHTML = xGa_g[line_on - 1];

                xa_g[7].innerHTML = xGa_g[7];


                xfT2_p[line_on_2 - 1].innerHTML = xGfT2_p[line_on_2 - 1];

                xfT2_p[7].innerHTML = xGfT2_p[7];

                xfT2_g[line_on_2 - 1].innerHTML = xGfT2_g[line_on_2 - 1];;

                xfT2_g[7].innerHTML = xGfT2_g[7];

                dataxG = dxG;
                dataxGOT = dxGOT;
                console.log(dataxG)
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_2.innerHTML = a;

                b = Number(txGp_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_2.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on_2 < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on_2+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on_2+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;
            }
        }

        Draw(PosX,PosY,1);
    }

    function shotBlocked() {

        var dx = PosX / fWidth;
        var dy = PosY / fLength;
        var dxGOT = 0;
        var dxG = 0;

        if (Order == 1 && Ball_pos == 1) { // Team 1 shot, Team 1 lower side

            if (dy < 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                }

                xGf_p[line_on - 1] = Math.round((xGf_p[line_on - 1] + dxG) * 100) / 100;

                xGf_p[7] = Math.round((xGf_p[7] + dxG) * 100) / 100;

                xGf_g[line_on - 1] = Math.round((xGf_g[line_on - 1] + dxG) * 100) / 100;

                xGf_g[7] = Math.round((xGf_g[7] + dxG) * 100) / 100;

                xGaT2_p[line_on_2 - 1] = Math.round((xGaT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_p[7] = Math.round((xGaT2_p[7] + dxG) * 100) / 100;

                xGaT2_g[line_on_2 - 1] = Math.round((xGaT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_g[7] = Math.round((xGaT2_g[7] + dxG) * 100) / 100;

                xf_p[line_on - 1].innerHTML = xGf_p[line_on - 1];

                xf_p[7].innerHTML = xGf_p[7];

                xf_g[line_on - 1].innerHTML = xGf_g[line_on - 1];

                xf_g[7].innerHTML = xGf_g[7];

                xaT2_p[line_on_2 - 1].innerHTML = xGaT2_p[line_on_2 - 1];

                xaT2_p[7].innerHTML = xGaT2_p[7];

                xaT2_g[line_on_2 - 1].innerHTML = xGaT2_g[line_on_2 - 1];;

                xaT2_g[7].innerHTML = xGaT2_g[7];


                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_1.innerHTML = a;

                b = Number(txGp_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_1.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

            }
        }

        if (Order == 2 && Ball_pos == 1) { // Team 1 shot, Team 1 upper side

            if (dy > 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                }

                xGf_p[line_on - 1] = Math.round((xGf_p[line_on - 1] + dxG) * 100) / 100;

                xGf_p[7] = Math.round((xGf_p[7] + dxG) * 100) / 100;

                xGf_g[line_on - 1] = Math.round((xGf_g[line_on - 1] + dxG) * 100) / 100;

                xGf_g[7]= Math.round((xGf_g[7] + dxG) * 100) / 100;


                xGaT2_p[line_on_2 - 1] = Math.round((xGaT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_p[7] = Math.round((xGaT2_p[7] + dxG) * 100) / 100;

                xGaT2_g[line_on_2 - 1] = Math.round((xGaT2_g[line_on_2 - 1] + dxG) * 100) / 100;
                // undo_array.push([xGaT2_g[line_on_2 - 1],dxG])

                 xGaT2_g[7]= Math.round((xGaT2_g[7] + dxG) * 100) / 100;


                xf_p[line_on - 1].innerHTML = xGf_p[line_on - 1];

                xf_p[7].innerHTML = xGf_p[7];

                xf_g[line_on - 1].innerHTML = xGf_g[line_on - 1];

                xf_g[7].innerHTML = xGf_g[7];

                xaT2_p[line_on_2 - 1].innerHTML = xGaT2_p[line_on_2 - 1];

                xaT2_p[7].innerHTML = xGaT2_p[7];

                xaT2_g[line_on_2 - 1].innerHTML = xGaT2_g[line_on_2 - 1];;

                xaT2_g[7].innerHTML = xGaT2_g[7];


                dataxG = dxG;
                dataxGOT = dxGOT;
                console.log(dataxG)
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_1.innerHTML = a;

                b = Number(txGp_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_1.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;
            }
        }

        if (Order == 1 && Ball_pos == 2) { // Team 2 shot, Team 2 upper side

            if (dy > 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,25 xG
                    dxG = dxG * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,5 xG
                    dxG = dxG * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                }

                xGa_p[line_on - 1] = Math.round((xGa_p[line_on - 1] + dxG) * 100) / 100;

                xGa_p[7] = Math.round((xGa_p[7] + dxG) * 100) / 100;

                xGa_g[line_on - 1] = Math.round((xGa_g[line_on - 1] + dxG) * 100) / 100;

                xGa_g[7]= Math.round((xGa_g[7] + dxG) * 100) / 100;


                xGfT2_p[line_on_2 - 1] = Math.round((xGfT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_p[7] = Math.round((xGfT2_p[7] + dxG) * 100) / 100;

                xGfT2_g[line_on_2 - 1] = Math.round((xGfT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_g[7]= Math.round((xGfT2_g[7] + dxG) * 100) / 100;


                xa_p[line_on - 1].innerHTML = xGa_p[line_on - 1];

                xa_p[7].innerHTML = xGa_p[7];

                xa_g[line_on - 1].innerHTML = xGa_g[line_on - 1];

                xa_g[7].innerHTML = xGa_g[7];


                xfT2_p[line_on_2 - 1].innerHTML = xGfT2_p[line_on_2 - 1];

                xfT2_p[7].innerHTML = xGfT2_p[7];

                xfT2_g[line_on_2 - 1].innerHTML = xGfT2_g[line_on_2 - 1];;

                xfT2_g[7].innerHTML = xGfT2_g[7];


                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_2.innerHTML = a;

                b = Number(txGp_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_2.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on_2 < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on_2+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on_2+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

            }
        }

        if (Order == 2 && Ball_pos == 2) { // Team 2 shot, Team 2 lower side

            if (dy < 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                }

                xGa_p[line_on - 1] = Math.round((xGa_p[line_on - 1] + dxG) * 100) / 100;

                xGa_p[7] = Math.round((xGa_p[7] + dxG) * 100) / 100;

                xGa_g[line_on - 1] = Math.round((xGa_g[line_on - 1] + dxG) * 100) / 100;

                xGa_g[7]= Math.round((xGa_g[7] + dxG) * 100) / 100;


                xGfT2_p[line_on_2 - 1] = Math.round((xGfT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_p[7] = Math.round((xGfT2_p[7] + dxG) * 100) / 100;

                xGfT2_g[line_on_2 - 1] = Math.round((xGfT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_g[7]= Math.round((xGfT2_g[7] + dxG) * 100) / 100;


                xa_p[line_on - 1].innerHTML = xGa_p[line_on - 1];

                xa_p[7].innerHTML = xGa_p[7];

                xa_g[line_on - 1].innerHTML = xGa_g[line_on - 1];

                xa_g[7].innerHTML = xGa_g[7];


                xfT2_p[line_on_2 - 1].innerHTML = xGfT2_p[line_on_2 - 1];

                xfT2_p[7].innerHTML = xGfT2_p[7];

                xfT2_g[line_on_2 - 1].innerHTML = xGfT2_g[line_on_2 - 1];;

                xfT2_g[7].innerHTML = xGfT2_g[7];

                dataxG = dxG;
                dataxGOT = dxGOT;
                console.log(dataxG)
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_2.innerHTML = a;

                b = Number(txGp_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_2.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on_2 < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on_2+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on_2+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;
            }
        }

        Draw(PosX,PosY,3);
    }

    function shotSaved() {

        var dx = PosX / fWidth;
        var dy = PosY / fLength;
        var dxGOT = 0;
        var dxG = 0;

        if (Order == 1 && Ball_pos == 1) { // Team 1 shot, Team 1 lower side

            if (dy < 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;
                var dxGOT = xGOT_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                    dxGOT = dxGOT * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                    dxGOT = dxGOT * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                    dxGOT = dxGOT * 0.85;
                }

                xGf_p[line_on - 1] = Math.round((xGf_p[line_on - 1] + dxG) * 100) / 100;

                xGf_p[7] = Math.round((xGf_p[7] + dxG) * 100) / 100;

                xGf_g[line_on - 1] = Math.round((xGf_g[line_on - 1] + dxG) * 100) / 100;

                xGf_g[7] = Math.round((xGf_g[7] + dxG) * 100) / 100;
                
                xGaT2_p[line_on_2 - 1] = Math.round((xGaT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_p[7] = Math.round((xGaT2_p[7] + dxG) * 100) / 100;

                xGaT2_g[line_on_2 - 1] = Math.round((xGaT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_g[7] = Math.round((xGaT2_g[7] + dxG) * 100) / 100;

                xf_p[line_on - 1].innerHTML = xGf_p[line_on - 1];

                xf_p[7].innerHTML = xGf_p[7];

                xf_g[line_on - 1].innerHTML = xGf_g[line_on - 1];

                xf_g[7].innerHTML = xGf_g[7];
                
                xaT2_p[line_on_2 - 1].innerHTML = xGaT2_p[line_on_2 - 1];

                xaT2_p[7].innerHTML = xGaT2_p[7];

                xaT2_g[line_on_2 - 1].innerHTML = xGaT2_g[line_on_2 - 1];;

                xaT2_g[7].innerHTML = xGaT2_g[7];

                
                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_1.innerHTML = a;

                b = Number(txGOT_1.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOT_1.innerHTML = a;

                b = Number(txGp_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_1.innerHTML = a;

                b = Number(txGOTp_1.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOTp_1.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

            }
        }

        if (Order == 2 && Ball_pos == 1) { // Team 1 shot, Team 1 upper side

            if (dy > 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;
                var dxGOT = xGOT_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                    dxGOT = dxGOT * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                    dxGOT = dxGOT * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                    dxGOT = dxGOT * 0.85;
                }

                xGf_p[line_on - 1] = Math.round((xGf_p[line_on - 1] + dxG) * 100) / 100;

                xGf_p[7] = Math.round((xGf_p[7] + dxG) * 100) / 100;

                xGf_g[line_on - 1] = Math.round((xGf_g[line_on - 1] + dxG) * 100) / 100;

                xGf_g[7]= Math.round((xGf_g[7] + dxG) * 100) / 100;

                
                xGaT2_p[line_on_2 - 1] = Math.round((xGaT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_p[7] = Math.round((xGaT2_p[7] + dxG) * 100) / 100;

                xGaT2_g[line_on_2 - 1] = Math.round((xGaT2_g[line_on_2 - 1] + dxG) * 100) / 100;
                // undo_array.push([xGaT2_g[line_on_2 - 1],dxG])

                 xGaT2_g[7]= Math.round((xGaT2_g[7] + dxG) * 100) / 100;

                
                xf_p[line_on - 1].innerHTML = xGf_p[line_on - 1];

                xf_p[7].innerHTML = xGf_p[7];

                xf_g[line_on - 1].innerHTML = xGf_g[line_on - 1];

                xf_g[7].innerHTML = xGf_g[7];
                
                xaT2_p[line_on_2 - 1].innerHTML = xGaT2_p[line_on_2 - 1];

                xaT2_p[7].innerHTML = xGaT2_p[7];

                xaT2_g[line_on_2 - 1].innerHTML = xGaT2_g[line_on_2 - 1];;

                xaT2_g[7].innerHTML = xGaT2_g[7];

                
                dataxG = dxG;
                dataxGOT = dxGOT;
                console.log(dataxG)
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_1.innerHTML = a;

                b = Number(txGOT_1.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOT_1.innerHTML = a;

                b = Number(txGp_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_1.innerHTML = a;

                b = Number(txGOTp_1.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOTp_1.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;
            }
        }

        if (Order == 1 && Ball_pos == 2) { // Team 2 shot, Team 2 upper side

            if (dy > 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;
                var dxGOT = xGOT_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                    dxGOT = dxGOT * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                    dxGOT = dxGOT * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                    dxGOT = dxGOT * 0.85;
                }

                xGa_p[line_on - 1] = Math.round((xGa_p[line_on - 1] + dxG) * 100) / 100;

                xGa_p[7] = Math.round((xGa_p[7] + dxG) * 100) / 100;

                xGa_g[line_on - 1] = Math.round((xGa_g[line_on - 1] + dxG) * 100) / 100;

                xGa_g[7]= Math.round((xGa_g[7] + dxG) * 100) / 100;

                
                xGfT2_p[line_on_2 - 1] = Math.round((xGfT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_p[7] = Math.round((xGfT2_p[7] + dxG) * 100) / 100;

                xGfT2_g[line_on_2 - 1] = Math.round((xGfT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_g[7]= Math.round((xGfT2_g[7] + dxG) * 100) / 100;

                
                xa_p[line_on - 1].innerHTML = xGa_p[line_on - 1];

                xa_p[7].innerHTML = xGa_p[7];

                xa_g[line_on - 1].innerHTML = xGa_g[line_on - 1];

                xa_g[7].innerHTML = xGa_g[7];

                
                xfT2_p[line_on_2 - 1].innerHTML = xGfT2_p[line_on_2 - 1];

                xfT2_p[7].innerHTML = xGfT2_p[7];

                xfT2_g[line_on_2 - 1].innerHTML = xGfT2_g[line_on_2 - 1];;

                xfT2_g[7].innerHTML = xGfT2_g[7];

                
                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_2.innerHTML = a;

                b = Number(txGOT_2.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOT_2.innerHTML = a;

                b = Number(txGp_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_2.innerHTML = a;

                b = Number(txGOTp_2.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOTp_2.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on_2 < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on_2+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on_2+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

            }
        }

        if (Order == 2 && Ball_pos == 2) { // Team 2 shot, Team 2 lower side

            if (dy < 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;
                var dxGOT = xGOT_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                    dxGOT = dxGOT * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                    dxGOT = dxGOT * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                    dxGOT = dxGOT * 0.85;
                }

                xGa_p[line_on - 1] = Math.round((xGa_p[line_on - 1] + dxG) * 100) / 100;

                xGa_p[7] = Math.round((xGa_p[7] + dxG) * 100) / 100;

                xGa_g[line_on - 1] = Math.round((xGa_g[line_on - 1] + dxG) * 100) / 100;

                xGa_g[7]= Math.round((xGa_g[7] + dxG) * 100) / 100;

                
                xGfT2_p[line_on_2 - 1] = Math.round((xGfT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_p[7] = Math.round((xGfT2_p[7] + dxG) * 100) / 100;

                xGfT2_g[line_on_2 - 1] = Math.round((xGfT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_g[7]= Math.round((xGfT2_g[7] + dxG) * 100) / 100;

                
                xa_p[line_on - 1].innerHTML = xGa_p[line_on - 1];

                xa_p[7].innerHTML = xGa_p[7];

                xa_g[line_on - 1].innerHTML = xGa_g[line_on - 1];

                xa_g[7].innerHTML = xGa_g[7];

                
                xfT2_p[line_on_2 - 1].innerHTML = xGfT2_p[line_on_2 - 1];

                xfT2_p[7].innerHTML = xGfT2_p[7];

                xfT2_g[line_on_2 - 1].innerHTML = xGfT2_g[line_on_2 - 1];;

                xfT2_g[7].innerHTML = xGfT2_g[7];

                dataxG = dxG;
                console.log(dataxG)
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, 0]);
                xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, 0]);
                xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);

                b = Number(txG_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_2.innerHTML = a;

                b = Number(txGOT_2.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOT_2.innerHTML = a;

                b = Number(txGp_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_2.innerHTML = a;

                b = Number(txGOTp_2.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOTp_2.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on_2 < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on_2+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on_2+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;
            }
        }

        Draw(PosX,PosY,2);
    }

    function shotGoal() {

        var dx = PosX / fWidth;
        var dy = PosY / fLength;
        var dxGOT = 0;
        var dxG = 0;

        if (Order == 1 && Ball_pos == 1) { // Team 1 shot, Team 1 lower side

            if (dy < 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;
                var dxGOT = xGOT_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                    dxGOT = dxGOT * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                    dxGOT = dxGOT * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                    dxGOT = dxGOT * 0.85;
                }

                xGf_p[line_on - 1] = Math.round((xGf_p[line_on - 1] + dxG) * 100) / 100;

                xGf_p[7] = Math.round((xGf_p[7] + dxG) * 100) / 100;
                // undo_array.push([xGf_p[7],dxG])

                xGf_g[line_on - 1] = Math.round((xGf_g[line_on - 1] + dxG) * 100) / 100;
                // undo_array.push([xGf_g[line_on - 1],dxG])

                xGf_g[7] = Math.round((xGf_g[7] + dxG) * 100) / 100;
                // undo_array.push([xGf_g[7],dxG])
                
                xGaT2_p[line_on_2 - 1] = Math.round((xGaT2_p[line_on_2 - 1] + dxG) * 100) / 100;
                // undo_array.push([xGaT2_p[line_on_2 - 1],dxG])

                xGaT2_p[7] = Math.round((xGaT2_p[7] + dxG) * 100) / 100;
                // undo_array.push([xGaT2_p[7],dxG])

                xGaT2_g[line_on_2 - 1] = Math.round((xGaT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_g[7]= Math.round((xGaT2_g[7] + dxG) * 100) / 100;


                xf_p[line_on - 1].innerHTML = xGf_p[line_on - 1];

                xf_p[7].innerHTML = xGf_p[7];

                xf_g[line_on - 1].innerHTML = xGf_g[line_on - 1];

                xf_g[7].innerHTML = xGf_g[7];

                
                xaT2_p[line_on_2 - 1].innerHTML = xGaT2_p[line_on_2 - 1];

                xaT2_p[7].innerHTML = xGaT2_p[7];

                xaT2_g[line_on_2 - 1].innerHTML = xGaT2_g[line_on_2 - 1];;

                xaT2_g[7].innerHTML = xGaT2_g[7];
                
                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], xGf_g[7], 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], xGfT2_g[7], 0]);

                b = Number(txG_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_1.innerHTML = a;

                b = Number(txGOT_1.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOT_1.innerHTML = a;

                b = Number(txGp_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_1.innerHTML = a;

                b = Number(txGOTp_1.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOTp_1.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

                if (line_on == 1) {
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], xGf_g[0], 0]);
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                }

                if (line_on == 2) {
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], xGf_g[1], 0]);
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                }

                if (line_on == 3) {
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], xGf_g[2], 0]);
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                }

                if (line_on_2 == 1) {
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], xGfT2_g[0], 0]);
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
                }

                if (line_on_2 == 2) {
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], xGfT2_g[1], 0]);
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
                }

                if (line_on_2 == 3) {
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], xGfT2_g[2], 0]);
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                }
            }
        }

        if (Order == 2 && Ball_pos == 1) { // Team 1 shot, Team 1 upper side

            if (dy > 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;
                var dxGOT = xGOT_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                    dxGOT = dxGOT * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                    dxGOT = dxGOT * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                    dxGOT = dxGOT * 0.85;
                }

                xGf_p[line_on - 1] = Math.round((xGf_p[line_on - 1] + dxG) * 100) / 100;

                xGf_p[7] = Math.round((xGf_p[7] + dxG) * 100) / 100;

                xGf_g[line_on - 1] = Math.round((xGf_g[line_on - 1] + dxG) * 100) / 100;

                xGf_g[7]= Math.round((xGf_g[7] + dxG) * 100) / 100;

                xGaT2_p[line_on_2 - 1] = Math.round((xGaT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_p[7] = Math.round((xGaT2_p[7] + dxG) * 100) / 100;

                xGaT2_g[line_on_2 - 1] = Math.round((xGaT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGaT2_g[7] = Math.round((xGaT2_g[7] + dxG) * 100) / 100;
                // undo_array.push([xGaT2_g[7],dxG])

                xf_p[line_on - 1].innerHTML = xGf_p[line_on - 1];

                xf_p[7].innerHTML = xGf_p[7];

                xf_g[line_on - 1].innerHTML = xGf_g[line_on - 1];

                xf_g[7].innerHTML = xGf_g[7];

                xaT2_p[line_on_2 - 1].innerHTML = xGaT2_p[line_on_2 - 1];

                xaT2_p[7].innerHTML = xGaT2_p[7];

                xaT2_g[line_on_2 - 1].innerHTML = xGaT2_g[line_on_2 - 1];;

                xaT2_g[7].innerHTML = xGaT2_g[7];

                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], xGf_g[7], 0]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], xGfT2_g[7], 0]);

                b = Number(txG_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_1.innerHTML = a;

                b = Number(txGOT_1.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOT_1.innerHTML = a;

                b = Number(txGp_1.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_1.innerHTML = a;

                b = Number(txGOTp_1.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOTp_1.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

                if (line_on == 1) {
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], xGf_g[0], 0]);
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                }

                if (line_on == 2) {
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], xGf_g[1], 0]);
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                }

                if (line_on == 3) {
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], xGf_g[2], 0]);
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                }

                if (line_on_2 == 1) {
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], xGfT2_g[0], 0]);
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
                }

                if (line_on_2 == 2) {
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], xGfT2_g[1], 0]);
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
                }

                if (line_on_2 == 3) {
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], xGfT2_g[2], 0]);
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                }
            }
        }

        if (Order == 1 && Ball_pos == 2) { // Team 2 shot, Team 2 upper side

            if (dy > 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;
                var dxGOT = xGOT_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                    dxGOT = dxGOT * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                    dxGOT = dxGOT * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                    dxGOT = dxGOT * 0.85;
                }

                xGa_p[line_on - 1] = Math.round((xGa_p[line_on - 1] + dxG) * 100) / 100;

                xGa_p[7] = Math.round((xGa_p[7] + dxG) * 100) / 100;

                xGa_g[line_on - 1] = Math.round((xGa_g[line_on - 1] + dxG) * 100) / 100;

                xGa_g[7]= Math.round((xGa_g[7] + dxG) * 100) / 100;

                xGfT2_p[line_on_2 - 1] = Math.round((xGfT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_p[7] = Math.round((xGfT2_p[7] + dxG) * 100) / 100;

                xGfT2_g[line_on_2 - 1] = Math.round((xGfT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_g[7]= Math.round((xGfT2_g[7] + dxG) * 100) / 100;

                xa_p[line_on - 1].innerHTML = xGa_p[line_on - 1];

                xa_p[7].innerHTML = xGa_p[7];

                xa_g[line_on - 1].innerHTML = xGa_g[line_on - 1];

                xa_g[7].innerHTML = xGa_g[7];

                xfT2_p[line_on_2 - 1].innerHTML = xGfT2_p[line_on_2 - 1];

                xfT2_p[7].innerHTML = xGfT2_p[7];

                xfT2_g[line_on_2 - 1].innerHTML = xGfT2_g[line_on_2 - 1];;

                xfT2_g[7].innerHTML = xGfT2_g[7];

                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, xGa_g[7]]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, xGaT2_g[7]]);

                b = Number(txG_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_2.innerHTML = a;

                b = Number(txGOT_2.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOT_2.innerHTML = a;

                b = Number(txGp_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_2.innerHTML = a;

                b = Number(txGOTp_2.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOTp_2.innerHTML = a;

                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on_2 < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on_2+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on_2+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

                if (line_on == 1) {
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, xGa_g[0]]);
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                }

                if (line_on == 2) {
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, xGa_g[1]]);
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                }

                if (line_on == 3) {
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, xGf_g[2]]);
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                }

                if (line_on_2 == 1) {
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], xGfT2_g[0], 0]);
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
                }

                if (line_on_2 == 2) {
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], xGfT2_g[1], 0]);
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
                }

                if (line_on_2 == 3) {
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], xGfT2_g[2], 0]);
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                }
            }
        }

        if (Order == 2 && Ball_pos == 2) { // Team 2 shot, Team 2 lower side

            if (dy < 0.5) { // Ball on the attack zone
                var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;
                var dxGOT = xGOT_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;

                if (dataType == 0) { // Turnover one-timer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 1) { // Turnover direct x 1,2 xG
                    dxG = dxG * 1.2;
                    dxGOT = dxGOT * 1.2;
                }
                if (dataType == 2) { // onetimer x 1,45 xG
                    dxG = dxG * 2;
                    dxGOT = dxGOT * 2;
                }
                if (dataType == 3) { // rebound x 1,1 xG
                    dxG = dxG * 1.1;
                    dxGOT = dxGOT * 1.1;
                }
                if (dataType == 4) { //direct x 0,85 xg
                    dxG = dxG * 0.85;
                    dxGOT = dxGOT * 0.85;
                }

                xGa_p[line_on - 1] = Math.round((xGa_p[line_on - 1] + dxG) * 100) / 100;

                xGa_p[7] = Math.round((xGa_p[7] + dxG) * 100) / 100;

                xGa_g[line_on - 1] = Math.round((xGa_g[line_on - 1] + dxG) * 100) / 100;

                xGa_g[7]= Math.round((xGa_g[7] + dxG) * 100) / 100;


                xGfT2_p[line_on_2 - 1] = Math.round((xGfT2_p[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_p[7] = Math.round((xGfT2_p[7] + dxG) * 100) / 100;

                xGfT2_g[line_on_2 - 1] = Math.round((xGfT2_g[line_on_2 - 1] + dxG) * 100) / 100;

                xGfT2_g[7]= Math.round((xGfT2_g[7] + dxG) * 100) / 100;


                xa_p[line_on - 1].innerHTML = xGa_p[line_on - 1];

                xa_p[7].innerHTML = xGa_p[7];

                xa_g[line_on - 1].innerHTML = xGa_g[line_on - 1];

                xa_g[7].innerHTML = xGa_g[7];


                xfT2_p[line_on_2 - 1].innerHTML = xGfT2_p[line_on_2 - 1];

                xfT2_p[7].innerHTML = xGfT2_p[7];

                xfT2_g[line_on_2 - 1].innerHTML = xGfT2_g[line_on_2 - 1];;

                xfT2_g[7].innerHTML = xGfT2_g[7];


                dataxG = dxG;
                dataxGOT = dxGOT;
                var date = new Date(gameCounter * 1000);
                var display = date.toISOString().substr(11, 8);
                xGTeam_array.push([display, xGf_g[7], xGa_g[7], 0, xGa_g[7]]);
                xGTeamT2_array.push([display, xGfT2_g[7], xGaT2_g[7], 0, xGaT2_g[7]]);

                b = Number(txG_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txG_2.innerHTML = a;

                b = Number(txGOT_2.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOT_2.innerHTML = a;

                b = Number(txGp_2.innerHTML);
                a = Math.round((b + dxG) * 100) / 100;
                txGp_2.innerHTML = a;

                b = Number(txGOTp_2.innerHTML);
                a = Math.round((b + dxGOT) * 100) / 100;
                txGOTp_2.innerHTML = a;


                window["stxGT"+Ball_pos+"Teamg_array"][dataType] += dataxG;
                if (line_on_2 < 4) {
                    window["stxGT"+Ball_pos+"L"+line_on_2+"g_array"][dataType] += dataxG;
                    window["stxGT"+Ball_pos+"L"+line_on_2+"p_array"][dataType] += dataxG;
                }
                window["stxGT"+Ball_pos+"Teamp_array"][dataType] += dataxG;

                if (line_on == 1) {
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, xGa_g[0]]);
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                }

                if (line_on == 2) {
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, xGa_g[1]]);
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, 0]);
                }

                if (line_on == 3) {
                    xGL3_array.push([display, xGf_g[2], xGa_g[2], 0, xGa_g[2]]);
                    xGL1_array.push([display, xGf_g[0], xGa_g[0], 0, 0]);
                    xGL2_array.push([display, xGf_g[1], xGa_g[1], 0, 0]);
                }

                if (line_on_2 == 1) {
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], xGfT2_g[0], 0]);
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
                }

                if (line_on_2 == 2) {
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], xGfT2_g[1], 0]);
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], 0, 0]);
                }

                if (line_on_2 == 3) {
                    xGL3T2_array.push([display, xGfT2_g[2], xGaT2_g[2], xGfT2_g[2], 0]);
                    xGL1T2_array.push([display, xGfT2_g[0], xGaT2_g[0], 0, 0]);
                    xGL2T2_array.push([display, xGfT2_g[1], xGaT2_g[1], 0, 0]);
                }
            }
        }

        Draw(PosX,PosY,4);
    }

    function Draw(x,y,type) {
        if (periodN == 1) {ctx_p = cnvs_1.getContext("2d");}
        else if (periodN == 2) {ctx_p = cnvs_2.getContext("2d");}
        else if (periodN == 3) {ctx_p = cnvs_3.getContext("2d");}
        else if (periodN == 4) {ctx_p = cnvs_4.getContext("2d");}
        ctx_g = cnvs_5.getContext("2d");
        menu.style.display = "none";
        ctx.font = "12px Arial";
        ctx_p.font = "12px Arial";
        ctx_g.font = "12px Arial";
        shooter_id = "";
        passer_id = "";
        passer_str = "";
        shooter_str = "";
        
        if (type == 1) {
            dataRes_str = "Missed";
        }
        else if (type == 2) {
            dataRes_str = "Saved";
        }
        else if (type == 3) {
            dataRes_str = "Blocked";
        }
        else if (type == 4) {
            dataRes_str = "Goal";
        }

        if (dataType == 0) { // Turnover one-timer
            dataType_str = "Turnover | One-timer";
        }
        else if (dataType == 1) { // Turnover direct
            dataType_str = "Turnover | Direct";
        }
        else if (dataType == 2) { // onetimer
            dataType_str = "One-timer";
        }
        else if (dataType == 3) { // rebound
            dataType_str = "Rebound";
        }
        else if (dataType == 4) { //direct
            dataType_str = "Direct";
        }

        if (Ball_pos === 1) {
            shooting_team = name_t1;

            if (dataType === 0) {
                ctx.fillStyle = "darkgreen";
                ctx_p.fillStyle = "darkgreen";
                ctx_g.fillStyle = "darkgreen";
            } else if (dataType === 1) {
                ctx.fillStyle = "lawngreen";
                ctx_p.fillStyle = "lawngreen";
                ctx_g.fillStyle = "lawngreen";
            } else if (dataType === 2) {
                ctx.fillStyle = "black";
                ctx_p.fillStyle = "black";
                ctx_g.fillStyle = "black";
            } else if (dataType === 3) {
                ctx.fillStyle = "blue";
                ctx_p.fillStyle = "blue";
                ctx_g.fillStyle = "blue";
            } else if (dataType === 4) {
                ctx.fillStyle = "blue";
                ctx_p.fillStyle = "blue";
                ctx_g.fillStyle = "blue";
            }


            dataShot = 1;

            if (type == 1) {    // Shot Missed
                ctx.fillText("M", x, y);
                ctx_p.fillText("M", x, y);
                ctx_g.fillText("M", x, y);
                dataRes = 1;

                sf_p[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sf_p[7].innerHTML++;
                }
                sf_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sf_g[7].innerHTML++;
                }
                mf_p[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    mf_p[7].innerHTML++;
                }
                mf_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    mf_g[7].innerHTML++;
                }

                saT2_p[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    saT2_p[7].innerHTML++;
                }
                saT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    saT2_g[7].innerHTML++;
                }
                maT2_p[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    maT2_p[7].innerHTML++;
                }
                maT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    maT2_g[7].innerHTML++;
                }
            }
            else if (type == 3) {   // Shot Blocked
                ctx.fillText("B", x, y);
                ctx_p.fillText("B", x, y);
                ctx_g.fillText("B", x, y);
                dataRes = 3;

                sf_p[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sf_p[7].innerHTML++;
                }
                sf_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sf_g[7].innerHTML++;
                }
                ba_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    ba_g[7].innerHTML++;
                }
                ba_p[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    ba_p[7].innerHTML++;
                }

                saT2_p[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    saT2_p[7].innerHTML++;
                }
                saT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    saT2_g[7].innerHTML++;
                }
                bfT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    bfT2_g[7].innerHTML++;
                }
                bfT2_p[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    bfT2_p[7].innerHTML++;
                }
            }
            else if (type == 2) {   // Shot Saved
                ctx.fillText("S", x, y);
                ctx_p.fillText("S", x, y);
                ctx_g.fillText("S", x, y);
                dataRes = 2;

                sf_p[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sf_p[7].innerHTML++;
                }
                sf_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sf_g[7].innerHTML++;
                }
                saf_p[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    saf_p[7].innerHTML++;
                }
                saf_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    saf_g[7].innerHTML++;
                }

                saT2_p[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    saT2_p[7].innerHTML++;
                }
                saT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    saT2_g[7].innerHTML++;
                }
                saaT2_p[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    saaT2_p[7].innerHTML++;
                }
                saaT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    saaT2_g[7].innerHTML++;
                }
            }
            else if (type == 4) {   // Shot Goal
                ctx.fillText("G", x, y);
                ctx_p.fillText("G", x, y);
                ctx_g.fillText("G", x, y);
                dataRes = 4;

                sf_p[line_on - 1].innerHTML++;
                gf_p[line_on - 1].innerHTML++;
                pm_p[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sf_p[7].innerHTML++;
                    gf_p[7].innerHTML++;
                    pm_p[7].innerHTML++;
                }

                sf_g[line_on - 1].innerHTML++;
                gf_g[line_on - 1].innerHTML++;
                pm_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sf_g[7].innerHTML++;
                    gf_g[7].innerHTML++;
                    pm_g[7].innerHTML++;
                }

                saT2_p[line_on_2 - 1].innerHTML++;
                gaT2_p[line_on_2 - 1].innerHTML++;
                pmT2_p[line_on_2 - 1].innerHTML--;
                if (line_on_2 < 4) {
                    saT2_p[7].innerHTML++;
                    gaT2_p[7].innerHTML++;
                    pmT2_p[7].innerHTML--;
                }

                saT2_g[line_on_2 - 1].innerHTML++;
                gaT2_g[line_on_2 - 1].innerHTML++;
                pmT2_g[line_on_2 - 1].innerHTML--;
                if (line_on_2 < 4) {
                    saT2_g[7].innerHTML++;
                    gaT2_g[7].innerHTML++;
                    pmT2_g[7].innerHTML--;
                }

                tgt_1.innerHTML++;
                tgtp_1.innerHTML++;
            }
        }
        else if (Ball_pos == 2) {
            shooting_team = name_t2;

            if (dataType === 0) {
                ctx.fillStyle = "saddlebrown";
                ctx_p.fillStyle = "saddlebrown";
                ctx_g.fillStyle = "saddlebrown";
            } else if (dataType === 1) {
                ctx.fillStyle = "orange";
                ctx_p.fillStyle = "orange";
                ctx_g.fillStyle = "orange";
            } else if (dataType === 2) {
                ctx.fillStyle = "darkred";
                ctx_p.fillStyle = "darkred";
                ctx_g.fillStyle = "darkred";
            } else if (dataType === 3) {
                ctx.fillStyle = "orangered";
                ctx_p.fillStyle = "orangered";
                ctx_g.fillStyle = "orangered";
            } else if (dataType === 4) {
                ctx.fillStyle = "orangered";
                ctx_p.fillStyle = "orangered";
                ctx_g.fillStyle = "orangered";
            }

            dataShot = 2;

            if (type == 1) {    // Shot Missed
                ctx.fillText("M", x, y);
                ctx_p.fillText("M", x, y);
                ctx_g.fillText("M", x, y);
                dataRes = 1;

                sa_p[line_on - 1].innerHTML++;
                sa_g[line_on - 1].innerHTML++;
                ma_p[line_on - 1].innerHTML++;
                ma_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sa_g[7].innerHTML++;
                    sa_p[7].innerHTML++;
                    ma_p[7].innerHTML++;
                    ma_g[7].innerHTML++;
                }

                sfT2_p[line_on_2 - 1].innerHTML++;
                sfT2_g[line_on_2 - 1].innerHTML++;
                mfT2_p[line_on_2 - 1].innerHTML++;
                mfT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    sfT2_g[7].innerHTML++;
                    sfT2_p[7].innerHTML++;
                    mfT2_p[7].innerHTML++;
                    mfT2_g[7].innerHTML++;
                }
            }
            else if (type == 3) {   // Shot Blocked
                ctx.fillText("B", x, y);
                ctx_p.fillText("B", x, y);
                ctx_g.fillText("B", x, y);
                dataRes = 3;

                sa_p[line_on - 1].innerHTML++;
                bf_p[line_on - 1].innerHTML++;
                sa_g[line_on - 1].innerHTML++;
                bf_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sa_g[7].innerHTML++;
                    bf_g[7].innerHTML++;
                    sa_p[7].innerHTML++;
                    bf_p[7].innerHTML++;
                }

                sfT2_p[line_on_2 - 1].innerHTML++;
                baT2_p[line_on_2 - 1].innerHTML++;
                sfT2_g[line_on_2 - 1].innerHTML++;
                baT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    sfT2_g[7].innerHTML++;
                    baT2_g[7].innerHTML++;
                    sfT2_p[7].innerHTML++;
                    baT2_p[7].innerHTML++;
                }
            }
            else if (type == 2) {   // Shot Saved
                ctx.fillText("S", x, y);
                ctx_p.fillText("S", x, y);
                ctx_g.fillText("S", x, y);
                dataRes = 2;

                sa_p[line_on - 1].innerHTML++;
                sa_g[line_on - 1].innerHTML++;
                saa_p[line_on - 1].innerHTML++;
                saa_g[line_on - 1].innerHTML++;
                if (line_on < 4) {
                    sa_p[7].innerHTML++;
                    sa_g[7].innerHTML++;
                    saa_p[7].innerHTML++;
                    saa_g[7].innerHTML++;
                }

                sfT2_p[line_on_2 - 1].innerHTML++;
                sfT2_g[line_on_2 - 1].innerHTML++;
                safT2_p[line_on_2 - 1].innerHTML++;
                safT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    sfT2_p[7].innerHTML++;
                    sfT2_g[7].innerHTML++;
                    safT2_p[7].innerHTML++;
                    safT2_g[7].innerHTML++;
                }
            }
            else if (type == 4) {   // Shot Goal
                ctx.fillText("G", x, y);
                ctx_p.fillText("G", x, y);
                ctx_g.fillText("G", x, y);
                dataRes = 4;

                sa_p[line_on - 1].innerHTML++;
                ga_p[line_on - 1].innerHTML++;
                pm_p[line_on - 1].innerHTML--;
                if (line_on < 4) {
                    sa_p[7].innerHTML++;
                    ga_p[7].innerHTML++;
                    pm_p[7].innerHTML--;
                }

                sa_g[line_on - 1].innerHTML++;
                ga_g[line_on - 1].innerHTML++;
                pm_g[line_on - 1].innerHTML--;
                if (line_on < 4) {
                    sa_g[7].innerHTML++;
                    ga_g[7].innerHTML++;
                    pm_g[7].innerHTML--;
                }

                sfT2_p[line_on_2 - 1].innerHTML++;
                gfT2_p[line_on_2 - 1].innerHTML++;
                pmT2_p[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    sfT2_p[7].innerHTML++;
                    gfT2_p[7].innerHTML++;
                    pmT2_p[7].innerHTML++;
                }

                sfT2_g[line_on_2 - 1].innerHTML++;
                gfT2_g[line_on_2 - 1].innerHTML++;
                pmT2_g[line_on_2 - 1].innerHTML++;
                if (line_on_2 < 4) {
                    sfT2_g[7].innerHTML++;
                    gfT2_g[7].innerHTML++;
                    pmT2_g[7].innerHTML++;
                }

                tgt_2.innerHTML++;
                tgtp_2.innerHTML++;
            }
        }

        // Shot Angle and Distance calculation
        // Goal place(s) y=50/450, x=150 (x = 10%/90% of length, y=50% of width)
        // Field dimensions = 20m x 40m (fWidth x fLength)
        // Shot Angle in respect to reference line (line from the center of the goal line to the
        // left goal post from the goalie's perspective)

        var b = (150 - x) * 20 / fWidth;

        if (Ball_pos == 1) {
            if (Order == 1) {
                var a = (50 - y) * 40 / fLength;
                dataDis = Math.sqrt( a*a + b*b );

                var dAy = 50 - 50; // Reference line
                var dAx = 300 - 150;
                var dBy = y - 50; // Line from the shot position to the center of the goal line
                var dBx = x - 150;

                var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
                if (angle < 0) {angle = angle * -1;}
                dataAngle = angle * (180 / Math.PI);

            }
        }
        if (Ball_pos == 1) {
            if (Order == 2) {
                var a = (450 - y) * 40 / fLength;
                dataDis = Math.sqrt( a*a + b*b );

                var dAy = 450 - 450; // Reference line
                var dAx = 0 - 150;
                var dBy = y - 450; // Line from the shot position to the center of the goal line
                var dBx = x - 150;

                var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
                if (angle < 0) {angle = angle * -1;}
                dataAngle = angle * (180 / Math.PI);
            }
        }
        if (Ball_pos == 2) {
            if (Order == 1) {
                var a = (450 - y) * 40 / fLength;
                dataDis = Math.sqrt( a*a + b*b );

                var dAy = 450 - 450; // Reference line
                var dAx = 0 - 150;
                var dBy = y - 450; // Line from the shot position to the center of the goal line
                var dBx = x - 150;

                var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
                if (angle < 0) {angle = angle * -1;}
                dataAngle = angle * (180 / Math.PI);
            }
        }
        if (Ball_pos == 2) {
            if (Order == 2) {
                var a = (50 - y) * 40 / fLength;
                dataDis = Math.sqrt( a*a + b*b );

                var dAy = 50 - 50; // Reference line
                var dAx = 300 - 150;
                var dBy = y - 50; // Line from the shot position to the center of the goal line
                var dBx = x - 150;

                var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
                if (angle < 0) {angle = angle * -1;}
                dataAngle = angle * (180 / Math.PI);
            }
        }
        if (Ball_pos == 1) {
            if (line_on < 4) {
                dataPp = 0;
                dataSh = 0;
            }
            if (line_on == 4 || line_on == 5) {
                dataPp = 1;
                dataSh = 0;
            }
            if (line_on == 6 || line_on == 7) {
                dataSh = 1;
                dataPp = 0;
            }
        }
        if (Ball_pos == 2) {
            if (line_on_2 < 4) {
                dataPp = 0;
                dataSh = 0;
            }
            if (line_on_2 == 4 || line_on_2 == 5) {
                dataPp = 1;
                dataSh = 0;
            }
            if (line_on_2 == 6 || line_on_2 == 7) {
                dataSh = 1;
                dataPp = 0;
            }
        }

        // Shot menu hidden, shooter menu visible
        menu.style.display = "none";
        shotData.push([user_id, game_id, gameCounter, Ball_pos, dataRes, dataType, dataDis.toFixed(2), dataAngle.toFixed(2), dataxG.toFixed(2), dataPp, dataSh]);

        if (shooter_select == 1) { // If Shooter tagging is on

            if ((Ball_pos == 1 && line_on <= 3) || (Ball_pos == 2 && line_on_2 <= 3)) {
                // Set menu items according to players on field
                if (Ball_pos == 1) {
                    l = line_on;
                }
                else if (Ball_pos == 2) {
                    l = line_on_2;
                }
                document.getElementById("shooter-1").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"LW").options
                                                    [document.getElementById("sT"+Ball_pos+"L"+l+"LW").selectedIndex].text;
                document.getElementById("shooter-2").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"C").options
                                                    [document.getElementById("sT"+Ball_pos+"L"+l+"C").selectedIndex].text;
                document.getElementById("shooter-3").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"RW").options
                                                    [document.getElementById("sT"+Ball_pos+"L"+l+"RW").selectedIndex].text;
                document.getElementById("shooter-4").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"LD").options
                                                    [document.getElementById("sT"+Ball_pos+"L"+l+"LD").selectedIndex].text;
                document.getElementById("shooter-5").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"RD").options
                                                    [document.getElementById("sT"+Ball_pos+"L"+l+"RD").selectedIndex].text;
                shootertype.style.display = "block";
                shootertype.style.left = stype.style.left;
                shootertype.style.top = stype.style.top;
                console.log("Shooter menu open")

            }
            if ((Ball_pos == 1 && line_on > 3) || (Ball_pos == 2 && line_on_2 > 3)) {
                p_T1LW = p_T1C = p_T1RW = p_T1LD = p_T1RD = "";
                p_T1LW_str = p_T1C_str = p_T1RW_str = p_T1LD_str = p_T1RD_str = "";
                p_T1G = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].value;
                p_T1G_str = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].text;
                p_T2LW = p_T2C = p_T2RW = p_T2LD = p_T2RD = "";
                p_T2LW_str = p_T2C_str = p_T2RW_str = p_T2LD_str = p_T2RD_str = "";
                p_T2G = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].value;
                p_T2G_str = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].text;

                premShotData.push([user_id, game_id, gameCounter, Ball_pos, dataRes, dataType, dataDis.toFixed(2),
                            dataAngle.toFixed(2), dataxG.toFixed(2), shooter_id, passer_id, p_T1LW, p_T1C, p_T1RW, p_T1LD, p_T1RD, p_T1G,
                            p_T2LW, p_T2C, p_T2RW, p_T2LD, p_T2RD, p_T2G, dataPp, dataSh]);

                printShotData.push([document.getElementById("select-date").value, name_t1, name_t2, gameCounter, shooting_team, dataRes_str, dataType_str, dataxG.toFixed(2), dataxGOT.toFixed(2), shooter_str,
                            passer_str, p_T1LW_str, p_T1C_str, p_T1RW_str, p_T1LD_str, p_T1RD_str, p_T1G_str, p_T2LW_str, p_T2C_str,
                            p_T2RW_str, p_T2LD_str, p_T2RD_str, p_T2G_str, dataPp, dataSh]);

                if (shotCounter > 1) {
                    document.getElementById("undo").disabled = false;
                }
                shot_on = 0; // End the shot tag process
                shotCounter++;
                updateSaveData();
            }
        }
        else if (shooter_select == 0) {

            if (line_on <= 3) {
                p_T1LW = document.getElementById("sT1L"+line_on+"LW").options
                [document.getElementById("sT1L"+line_on+"LW").selectedIndex].value;
                p_T1C = document.getElementById("sT1L"+line_on+"C").options
                [document.getElementById("sT1L"+line_on+"C").selectedIndex].value;
                p_T1RW = document.getElementById("sT1L"+line_on+"RW").options
                [document.getElementById("sT1L"+line_on+"RW").selectedIndex].value;
                p_T1LD = document.getElementById("sT1L"+line_on+"LD").options
                [document.getElementById("sT1L"+line_on+"LD").selectedIndex].value;
                p_T1RD = document.getElementById("sT1L"+line_on+"RD").options
                [document.getElementById("sT1L"+line_on+"RD").selectedIndex].value;
                p_T1G = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].value;
                
                p_T1LW_str = document.getElementById("sT1L"+line_on+"LW").options
                [document.getElementById("sT1L"+line_on+"LW").selectedIndex].text;
                p_T1C_str = document.getElementById("sT1L"+line_on+"C").options
                [document.getElementById("sT1L"+line_on+"C").selectedIndex].text;
                p_T1RW_str = document.getElementById("sT1L"+line_on+"RW").options
                [document.getElementById("sT1L"+line_on+"RW").selectedIndex].text;
                p_T1LD_str = document.getElementById("sT1L"+line_on+"LD").options
                [document.getElementById("sT1L"+line_on+"LD").selectedIndex].text;
                p_T1RD_str = document.getElementById("sT1L"+line_on+"RD").options
                [document.getElementById("sT1L"+line_on+"RD").selectedIndex].text;
                p_T1G_str = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].text;
            }

            else if (line_on > 3) {
                p_T1LW = p_T1C = p_T1RW = p_T1LD = p_T1RD = "";
                p_T1G = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].value;
                
                p_T1LW_str = p_T1C_str = p_T1RW_str = p_T1LD_str = p_T1RD_str = "";
                p_T1G_str = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].text;
            }

            if (line_on_2 <= 3) {
                p_T2LW = document.getElementById("sT2L"+line_on_2+"LW").options
                [document.getElementById("sT2L"+line_on_2+"LW").selectedIndex].value;
                p_T2C = document.getElementById("sT2L"+line_on_2+"C").options
                [document.getElementById("sT2L"+line_on_2+"C").selectedIndex].value;
                p_T2RW = document.getElementById("sT2L"+line_on_2+"RW").options
                [document.getElementById("sT2L"+line_on_2+"RW").selectedIndex].value;
                p_T2LD = document.getElementById("sT2L"+line_on_2+"LD").options
                [document.getElementById("sT2L"+line_on_2+"LD").selectedIndex].value;
                p_T2RD = document.getElementById("sT2L"+line_on_2+"RD").options
                [document.getElementById("sT2L"+line_on_2+"RD").selectedIndex].value;
                p_T2G = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].value;
                
                p_T2LW_str = document.getElementById("sT2L"+line_on_2+"LW").options
                [document.getElementById("sT2L"+line_on_2+"LW").selectedIndex].text;
                p_T2C_str = document.getElementById("sT2L"+line_on_2+"C").options
                [document.getElementById("sT2L"+line_on_2+"C").selectedIndex].text;
                p_T2RW_str = document.getElementById("sT2L"+line_on_2+"RW").options
                [document.getElementById("sT2L"+line_on_2+"RW").selectedIndex].text;
                p_T2LD_str = document.getElementById("sT2L"+line_on_2+"LD").options
                [document.getElementById("sT2L"+line_on_2+"LD").selectedIndex].text;
                p_T2RD_str = document.getElementById("sT2L"+line_on_2+"RD").options
                [document.getElementById("sT2L"+line_on_2+"RD").selectedIndex].text;
                p_T2G_str = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].text;
            }

            else if (line_on_2 > 3) {
                p_T2LW = p_T2C = p_T2RW = p_T2LD = p_T2RD = "";
                p_T2G = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].value;

                p_T2LW_str = p_T2C_str = p_T2RW_str = p_T2LD_str = p_T2RD_str = "";
                p_T2G_str = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].text;
            }

            premShotData.push([user_id, game_id, gameCounter, Ball_pos, dataRes, dataType, dataDis.toFixed(2),
                            dataAngle.toFixed(2), dataxG.toFixed(2), shooter_id, passer_id, p_T1LW, p_T1C, p_T1RW, p_T1LD, p_T1RD, p_T1G,
                            p_T2LW, p_T2C, p_T2RW, p_T2LD, p_T2RD, p_T2G, dataPp, dataSh]);

            printShotData.push([document.getElementById("select-date").value, name_t1, name_t2, gameCounter, shooting_team, dataRes_str, dataType_str, dataxG.toFixed(2), dataxGOT.toFixed(2), shooter_str,
                            passer_str, p_T1LW_str, p_T1C_str, p_T1RW_str, p_T1LD_str, p_T1RD_str, p_T1G_str, p_T2LW_str, p_T2C_str,
                            p_T2RW_str, p_T2LD_str, p_T2RD_str, p_T2G_str, dataPp, dataSh]);

            if (shotCounter > 1) {
                document.getElementById("undo").disabled = false;
            }
            shot_on = 0; // End the shot tag process
            shotCounter++;
            updateSaveData();
        }

    }

    function shotTaker(s_position) {

        if (Ball_pos == 1) {
            l = line_on;
        }
        else if (Ball_pos == 2) {
            l = line_on_2;
        }

        if (s_position == "1") {
            shooter_id = document.getElementById("sT"+Ball_pos+"L"+l+"LW").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"LW").selectedIndex].value;
            shooter_str = document.getElementById("sT"+Ball_pos+"L"+l+"LW").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"LW").selectedIndex].text;
        }
        else if (s_position == "2") {
            shooter_id = document.getElementById("sT"+Ball_pos+"L"+l+"C").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"C").selectedIndex].value;
            shooter_str = document.getElementById("sT"+Ball_pos+"L"+l+"C").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"C").selectedIndex].text;
        }
        else if (s_position == "3") {
            shooter_id = document.getElementById("sT"+Ball_pos+"L"+l+"RW").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"RW").selectedIndex].value;
            shooter_str = document.getElementById("sT"+Ball_pos+"L"+l+"RW").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"RW").selectedIndex].text;
        }
        else if (s_position == "4") {
            shooter_id = document.getElementById("sT"+Ball_pos+"L"+l+"LD").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"LD").selectedIndex].value;
            shooter_str = document.getElementById("sT"+Ball_pos+"L"+l+"LD").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"LD").selectedIndex].text;
        }
        else if (s_position == "5") {
            shooter_id = document.getElementById("sT"+Ball_pos+"L"+l+"RD").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"RD").selectedIndex].value;
            shooter_str = document.getElementById("sT"+Ball_pos+"L"+l+"RD").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"RD").selectedIndex].text;
        }

        shootertype.style.display = "none";

        // Set menu items according to players on field
        document.getElementById("passer-1").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"LW").options
                                                [document.getElementById("sT"+Ball_pos+"L"+l+"LW").selectedIndex].text;
        document.getElementById("passer-2").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"C").options
                                                [document.getElementById("sT"+Ball_pos+"L"+l+"C").selectedIndex].text;
        document.getElementById("passer-3").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"RW").options
                                                [document.getElementById("sT"+Ball_pos+"L"+l+"RW").selectedIndex].text;
        document.getElementById("passer-4").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"LD").options
                                                [document.getElementById("sT"+Ball_pos+"L"+l+"LD").selectedIndex].text;
        document.getElementById("passer-5").innerHTML = document.getElementById("sT"+Ball_pos+"L"+l+"RD").options
                                                [document.getElementById("sT"+Ball_pos+"L"+l+"RD").selectedIndex].text;
        document.getElementById("passer-6").innerHTML = document.getElementById("sT"+Ball_pos+"G").options
                                                [document.getElementById("sT"+Ball_pos+"G").selectedIndex].text;
        passertype.style.display = "block";
        passertype.style.left = stype.style.left;
        passertype.style.top = stype.style.top;

    }

    function shotPasser(p_position) {

        if (Ball_pos == 1) {
            l = line_on;
        }
        else if (Ball_pos == 2) {
            l = line_on_2;
        }

        if (p_position == "1") {
            passer_id = document.getElementById("sT"+Ball_pos+"L"+l+"LW").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"LW").selectedIndex].value;
            passer_str = document.getElementById("sT"+Ball_pos+"L"+l+"LW").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"LW").selectedIndex].text;
        }
        else if (p_position == "2") {
            passer_id = document.getElementById("sT"+Ball_pos+"L"+l+"C").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"C").selectedIndex].value;
            passer_str = document.getElementById("sT"+Ball_pos+"L"+l+"C").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"C").selectedIndex].text;
        }
        else if (p_position == "3") {
            passer_id = document.getElementById("sT"+Ball_pos+"L"+l+"RW").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"RW").selectedIndex].value;
            passer_str = document.getElementById("sT"+Ball_pos+"L"+l+"RW").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"RW").selectedIndex].text;
        }
        else if (p_position == "4") {
            passer_id = document.getElementById("sT"+Ball_pos+"L"+l+"LD").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"LD").selectedIndex].value;
            passer_str = document.getElementById("sT"+Ball_pos+"L"+l+"LD").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"LD").selectedIndex].text;
        }
        else if (p_position == "5") {
            passer_id = document.getElementById("sT"+Ball_pos+"L"+l+"RD").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"RD").selectedIndex].value;
            passer_str = document.getElementById("sT"+Ball_pos+"L"+l+"RD").options
                        [document.getElementById("sT"+Ball_pos+"L"+l+"RD").selectedIndex].text;
        }
        else if (p_position == "6") {
            passer_id = document.getElementById("sT"+Ball_pos+"G").options
                        [document.getElementById("sT"+Ball_pos+"G").selectedIndex].value;
            passer_str = document.getElementById("sT"+Ball_pos+"G").options
                        [document.getElementById("sT"+Ball_pos+"G").selectedIndex].text;
        }
        else if (p_position == "7") {
            passer_id = "";
            passer_str = "";
        }

        p_T1LW = document.getElementById("sT1L"+line_on+"LW").options
                [document.getElementById("sT1L"+line_on+"LW").selectedIndex].value;
        p_T1C = document.getElementById("sT1L"+line_on+"C").options
                [document.getElementById("sT1L"+line_on+"C").selectedIndex].value;
        p_T1RW = document.getElementById("sT1L"+line_on+"RW").options
                [document.getElementById("sT1L"+line_on+"RW").selectedIndex].value;
        p_T1LD = document.getElementById("sT1L"+line_on+"LD").options
                [document.getElementById("sT1L"+line_on+"LD").selectedIndex].value;
        p_T1RD = document.getElementById("sT1L"+line_on+"RD").options
                [document.getElementById("sT1L"+line_on+"RD").selectedIndex].value;
        p_T1G = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].value;

        p_T2LW = document.getElementById("sT2L"+line_on_2+"LW").options
                [document.getElementById("sT2L"+line_on_2+"LW").selectedIndex].value;
        p_T2C = document.getElementById("sT2L"+line_on_2+"C").options
                [document.getElementById("sT2L"+line_on_2+"C").selectedIndex].value;
        p_T2RW = document.getElementById("sT2L"+line_on_2+"RW").options
                [document.getElementById("sT2L"+line_on_2+"RW").selectedIndex].value;
        p_T2LD = document.getElementById("sT2L"+line_on_2+"LD").options
                [document.getElementById("sT2L"+line_on_2+"LD").selectedIndex].value;
        p_T2RD = document.getElementById("sT2L"+line_on_2+"RD").options
                [document.getElementById("sT2L"+line_on_2+"RD").selectedIndex].value;
        p_T2G = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].value;
                
        p_T1LW_str = document.getElementById("sT1L"+line_on+"LW").options
                [document.getElementById("sT1L"+line_on+"LW").selectedIndex].text;
        p_T1C_str = document.getElementById("sT1L"+line_on+"C").options
                [document.getElementById("sT1L"+line_on+"C").selectedIndex].text;
        p_T1RW_str = document.getElementById("sT1L"+line_on+"RW").options
                [document.getElementById("sT1L"+line_on+"RW").selectedIndex].text;
        p_T1LD_str = document.getElementById("sT1L"+line_on+"LD").options
                [document.getElementById("sT1L"+line_on+"LD").selectedIndex].text;
        p_T1RD_str = document.getElementById("sT1L"+line_on+"RD").options
                [document.getElementById("sT1L"+line_on+"RD").selectedIndex].text;
        p_T1G_str = document.getElementById("sT1G").options
                [document.getElementById("sT1G").selectedIndex].text;

        p_T2LW_str = document.getElementById("sT2L"+line_on_2+"LW").options
                [document.getElementById("sT2L"+line_on_2+"LW").selectedIndex].text;
        p_T2C_str = document.getElementById("sT2L"+line_on_2+"C").options
                [document.getElementById("sT2L"+line_on_2+"C").selectedIndex].text;
        p_T2RW_str = document.getElementById("sT2L"+line_on_2+"RW").options
                [document.getElementById("sT2L"+line_on_2+"RW").selectedIndex].text;
        p_T2LD_str = document.getElementById("sT2L"+line_on_2+"LD").options
                [document.getElementById("sT2L"+line_on_2+"LD").selectedIndex].text;
        p_T2RD_str = document.getElementById("sT2L"+line_on_2+"RD").options
                [document.getElementById("sT2L"+line_on_2+"RD").selectedIndex].text;
        p_T2G_str = document.getElementById("sT2G").options
                [document.getElementById("sT2G").selectedIndex].text;
        
        passertype.style.display = "none";
        premShotData.push([user_id, game_id, gameCounter, Ball_pos, dataRes, dataType, dataDis.toFixed(2),
                            dataAngle.toFixed(2), dataxG.toFixed(2), shooter_id, passer_id, p_T1LW, p_T1C, p_T1RW, p_T1LD, p_T1RD, p_T1G,
                            p_T2LW, p_T2C, p_T2RW, p_T2LD, p_T2RD, p_T2G, dataPp, dataSh]);

        printShotData.push([document.getElementById("select-date").value, name_t1, name_t2, gameCounter, shooting_team, dataRes_str, dataType_str, dataxG.toFixed(2), dataxGOT.toFixed(2), shooter_str,
                            passer_str, p_T1LW_str, p_T1C_str, p_T1RW_str, p_T1LD_str, p_T1RD_str, p_T1G_str, p_T2LW_str, p_T2C_str,
                            p_T2RW_str, p_T2LD_str, p_T2RD_str, p_T2G_str, dataPp, dataSh]);

        shot_on = 0; // End the shot tag process

        // Add shot xG and passed xG to player charts

        found_s = 0;
        found_p = 0;
        if (Ball_pos == 1) {
            for (let i=0;i<plT1_array.length;i++) {
                if (shooter_id == plT1_array[i][0]) {
                    plT1_array[i][2] = plT1_array[i][2] + dataxG; // Add xG to shooter id
                    plT1_array[i][6]++;
                    found_s = 1;
                    if (dataRes == 4) { // if Goal
                        plT1_array[i][4]++;
                    }
                }
                if (passer_id == plT1_array[i][0]) {
                    plT1_array[i][3] = plT1_array[i][3] + dataxG; // Add xG to passer id
                    plT1_array[i][7]++;
                    found_p = 1;
                    if (dataRes == 4) { // if Goal
                        plT1_array[i][5]++;
                    }
                }
            }
            if (found_s == 0) { // Shooter not found, adding new row to the array
                gxG = 0;
                if (dataRes == 4) {gxG = 1};
                plT1_array.push([shooter_id, shooter_str, dataxG, 0, gxG, 0, 1, 0]);
            }
            if (found_p == 0) { // Passer not found, adding new row to the array
                pxG = 0;
                if (dataRes == 4) {pxG = 1};
                plT1_array.push([passer_id, passer_str, 0, dataxG, 0, pxG, 0, 1]);
            }
            plT1_array = plT1_array.sort((a, b) => b[1] - a[1]) // Sort the array
        }
        else if (Ball_pos == 2) {
            for (let i=0;i<plT2_array.length;i++) {
                if (shooter_id == plT2_array[i][0]) {
                    plT2_array[i][2] = plT2_array[i][2] + dataxG; // Add xG to shooter id
                    plT2_array[i][6]++;
                    found_s = 1;
                    if (dataRes == 4) { // if Goal
                        plT2_array[i][4]++;
                    }
                }
                if (passer_id == plT2_array[i][0]) {
                    plT2_array[i][3] = plT2_array[i][3] + dataxG; // Add xG to passer id
                    plT2_array[i][7]++;
                    found_p = 1;
                    if (dataRes == 4) { // if Goal
                        plT2_array[i][5]++;
                    }
                }
            }
            if (found_s == 0) { // Shooter not found, adding new row to the array
                gxG = 0;
                if (dataRes == 4) {gxG = 1};
                plT2_array.push([shooter_id, shooter_str, dataxG, 0, gxG, 0, 1, 0]);
            }
            if (found_p == 0) { // Passer not found, adding new row to the array
                pxG = 0;
                if (dataRes == 4) {pxG = 1};
                plT2_array.push([passer_id, passer_str, 0, dataxG, 0, pxG, 0, 1]);
            }
            plT2_array = plT2_array.sort((a, b) => b[1] - a[1]) // Sort the array
        }
        
        // Add shot xG and passed xG to player period charts
        
        found_s = 0;
        found_p = 0;
        if (Ball_pos == 1) {
            for (let i=0;i<plT1p_array.length;i++) {
                if (shooter_id == plT1p_array[i][0]) {
                    plT1p_array[i][2] = plT1p_array[i][2] + dataxG; // Add xG to shooter id
                    plT1p_array[i][6]++;
                    found_s = 1;
                    if (dataRes == 4) { // if Goal
                        plT1p_array[i][4]++;
                    }
                }
                if (passer_id == plT1p_array[i][0]) {
                    plT1p_array[i][3] = plT1p_array[i][3] + dataxG; // Add xG to passer id
                    plT1p_array[i][7]++;
                    found_p = 1;
                    if (dataRes == 4) { // if Goal
                        plT1p_array[i][5]++;
                    }
                }
            }
            if (found_s == 0) { // Shooter not found, adding new row to the array
                gxG = 0;
                if (dataRes == 4) {gxG = 1};
                plT1p_array.push([shooter_id, shooter_str, dataxG, 0, gxG, 0, 1, 0]);
            }
            if (found_p == 0) { // Passer not found, adding new row to the array
                pxG = 0;
                if (dataRes == 4) {pxG = 1};
                plT1p_array.push([passer_id, passer_str, 0, dataxG, 0, pxG, 0, 1]);
            }
            plT1p_array = plT1p_array.sort((a, b) => b[1] - a[1]) // Sort the array
        }
        else if (Ball_pos == 2) {
            for (let i=0;i<plT2p_array.length;i++) {
                if (shooter_id == plT2p_array[i][0]) {
                    plT2p_array[i][2] = plT2p_array[i][2] + dataxG; // Add xG to shooter id
                    plT2p_array[i][6]++;
                    found_s = 1;
                    if (dataRes == 4) { // if Goal
                        plT2p_array[i][4]++;
                    }
                }
                if (passer_id == plT2p_array[i][0]) {
                    plT2p_array[i][3] = plT2p_array[i][3] + dataxG; // Add xG to passer id
                    plT2p_array[i][7]++;
                    found_p = 1;
                    if (dataRes == 4) { // if Goal
                        plT2p_array[i][5]++;
                    }
                }
            }
            if (found_s == 0) { // Shooter not found, adding new row to the array
                gxG = 0;
                if (dataRes == 4) {gxG = 1};
                plT2p_array.push([shooter_id, shooter_str, dataxG, 0, gxG, 0, 1, 0]);
            }
            if (found_p == 0) { // Passer not found, adding new row to the array
                pxG = 0;
                if (dataRes == 4) {pxG = 1};
                plT2p_array.push([passer_id, passer_str, 0, dataxG, 0, pxG, 0, 1]);
            }
            plT2p_array = plT2p_array.sort((a, b) => b[1] - a[1]) // Sort the array
        }

        if (shotCounter > 1) {
            document.getElementById("undo").disabled = false;
        }
        shotCounter++;
        updateSaveData();
    }

    function shotTOnetimer() {
        dataType = 0;
        if (line_on < 4 && line_on_2 < 4) {
            eval("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"g_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamp_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"p_array["+dataType+"]++;");
        }
        stype.style.display = "none";
        menu.style.display = "block";
        menu.style.left = stype.style.left;
        menu.style.top = stype.style.top;
        // shotData.push([gameCounter, Ball_pos, dataRes, dataType, dataDis, dataAngle, dataPp, dataSh]);
        // console.log(shotData);
    }

    function shotTDirect() {
        dataType = 1;
        if (line_on < 4 && line_on_2 < 4) {
            console.log("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"g_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamp_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"p_array["+dataType+"]++;");

        }
        stype.style.display = "none";
        menu.style.display = "block";
        menu.style.left = stype.style.left;
        menu.style.top = stype.style.top;
        // shotData.push([gameCounter, Ball_pos, dataRes, dataType, dataDis, dataAngle, dataPp, dataSh]);
        // console.log(shotData);
    }

    function shotOnetimer() {
        dataType = 2;
        if (line_on < 4 && line_on_2 < 4) {
            console.log("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"g_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamp_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"p_array["+dataType+"]++;");

        }
        stype.style.display = "none";
        menu.style.display = "block";
        menu.style.left = stype.style.left;
        menu.style.top = stype.style.top;
        // shotData.push([gameCounter, Ball_pos, dataRes, dataType, dataDis, dataAngle, dataPp, dataSh]);
        // console.log(shotData);
    }

    function shotRebound() {
        dataType = 3;
        if (line_on < 4 && line_on_2 < 4) {
            console.log("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"g_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamp_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"p_array["+dataType+"]++;");

        }
        stype.style.display = "none";
        menu.style.display = "block";
        menu.style.left = stype.style.left;
        menu.style.top = stype.style.top;
        // shotData.push([gameCounter, Ball_pos, dataRes, dataType, dataDis, dataAngle, dataPp, dataSh]);
        // console.log(shotData);
    }

    function shotDirect() {
        dataType = 4;
        if (line_on < 4 && line_on_2 < 4) {
            console.log("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamg_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"g_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"Teamp_array["+dataType+"]++;");
            eval("stT"+Ball_pos+"L"+line_on+"p_array["+dataType+"]++;");

        }
        stype.style.display = "none";
        menu.style.display = "block";
        menu.style.left = stype.style.left;
        menu.style.top = stype.style.top;
        // shotData.push([gameCounter, Ball_pos, dataRes, dataType, dataDis, dataAngle, dataPp, dataSh]);
        // console.log(shotData);
    }

    function saveData() {

        var conf_save = confirm("Are you sure you want to save data,\n do this when your game is over?");

        if (conf_save == true) {

            // Shot data

            i = 1;
            saveNextS(i);

            function saveNextS(i) {
                if (i<premShotData.length) {
                    s_data = {
                        "user" : premShotData[i][0],
                        "game" : premShotData[i][1],
                        "time" : premShotData[i][2],
                        "position" : premShotData[i][3],
                        "result" : premShotData[i][4],
                        "type" : premShotData[i][5],
                        "distance" : premShotData[i][6],
                        "angle" : premShotData[i][7],
                        "xG" : premShotData[i][8],
                        "shooter" : premShotData[i][9],
                        "passer" : premShotData[i][10],
                        "T1LW" : premShotData[i][11],
                        "T1C" : premShotData[i][12],
                        "T1RW" : premShotData[i][13],
                        "T1LD" : premShotData[i][14],
                        "T1RD" : premShotData[i][15],
                        "T1G" : premShotData[i][16],
                        "T2LW" : premShotData[i][17],
                        "T2C" : premShotData[i][18],
                        "T2RW" : premShotData[i][19],
                        "T2LD" : premShotData[i][20],
                        "T2RD" : premShotData[i][21],
                        "T2G" : premShotData[i][22],
                        "isPP" : premShotData[i][23],
                        "isSH" : premShotData[i][24],
                    }
                    // Save data to database
                    fetch('https://fbscanner.io/apis/shots/', {

                    method: 'POST', // or 'PUSH'
                    headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify(s_data),
                    })

                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        i++;
                        saveNextS(i);
                    })
                    .catch((error) => {
                    console.error('Error:', error);
                    console.log("Erroria pukkaa");
                    });
                }
            }

            // Crate a new Game instance

            data = { "date" : document.getElementById("select-date").value,
                    "user" : user_id,
                    "teams" : [s_T1.value, s_T2.value],
                    "game_data" : data_object,
            };

            // Crate a new Game instance

            if (game_id == 0) {

                fetch("https://fbscanner.io/apis/games/" , {

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
                    console.log("New Game instance created")
                    game_id = data.id;
                    updateSaveData();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            }

            // Update the saved game instance

            else {

                fetch("https://fbscanner.io/apis/games/" + game_id + "/", {

                      method: 'PATCH', // or 'PUSH'
                      mode: 'cors',
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

        }

        var conf_pr = confirm("Press OK to print results in a PDF-file");

        if (conf_pr == true) {
            Print()
        }

        var conf_csv = confirm("Press OK to download shots in a csv-file");

        if (conf_csv == true) {
            downloadCsv()
        }
    }

    function set_t1_names() {

        for (let i = 0; i < 21; i++) {
            name_t1_id[i].innerHTML = name_t1;
        }
        document.getElementById("TeamL").innerHTML = name_t1;
    }

    function set_t2_names() {

        for (let i = 0; i < 21; i++) {
            name_t2_id[i].innerHTML = name_t2;
        }
        document.getElementById("TeamR").innerHTML = name_t2;
    }

    function checkLive() {

        if (!document.getElementById("ck1a").disabled) {
            if (live == 1) {live = 0;}

            else if (live == 0) {live = 1;}
        }
    }

    function checkShooter() {

        if (!document.getElementById("ck2a").disabled) {
            if (shooter_select == 1) {shooter_select= 0;}

            else if (shooter_select == 0) {shooter_select = 1;}
        }
    }

    function changeLevel(t) {

        if (t == "T1") {
            // Deselect Teams and Positions
            s_T1.selectedIndex = "0";

            for (let i = 0; i < s_T1_p.length; i++) {
                s_T1_p[i].selectedIndex = "0";
                s_T1_p[i].disabled = true;
            }

            s_T1.disabled = false;

            fetch("https://fbscanner.io/apis/teamlist/?level_id=" + s_Level_T1.options[s_Level_T1.selectedIndex].value)
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);

                    removeOptions(s_T1);

                    for (let i=0; i<data.length; i++) {
                        var opt = new Option(data[i].name, data[i].id);
                        s_T1.appendChild(opt);
                    }

            })
                .catch((error) => {
                    console.error('Error:', error);
            });
        }

        if (t == "T2") {

            // Deselect Teams and Positions
            s_T2.selectedIndex = "0";

            for (let i = 0; i < s_T2_p.length; i++) {
                s_T2_p[i].selectedIndex = "0";
                s_T2_p[i].disabled = true;
            }

            s_T2.disabled = false;

            fetch("https://fbscanner.io/apis/teamlist/?level_id=" + s_Level_T2.options[s_Level_T2.selectedIndex].value)
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);

                    removeOptions(s_T2);

                    for (let i=0; i<data.length; i++) {
                        var opt = new Option(data[i].name, data[i].id);
                        s_T2.appendChild(opt);
                    }

            })
                .catch((error) => {
                    console.error('Error:', error);
            });
        }

    }

    function changeTeam1() {

        for (let i = 0; i < s_T1_p.length; i++) {
            s_T1_p[i].selectedIndex = "0";
            s_T1_p[i].disabled = false;
        }

        fetch("https://fbscanner.io/apis/playerlist/?team_id=" + s_T1.options[s_T1.selectedIndex].value)
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);

                for (let i=0; i<s_T1_p.length; i++) {
                    removeOptions(s_T1_p[i]);
                }

                for (let i=0; i<data.length; i++) {

                    for (let j=0; j<s_T1_p.length; j++) {
                        opt = new Option("#" + data[i].jersey_number + " " + data[i].last_name, data[i].id);
                        s_T1_p[j].appendChild(opt);
                    }

                    var pos = convPos(data[i].position);
                    var line = convLine(data[i].line);

                    if (typeof pos !== 'undefined' && typeof line !== 'undefined') {
                        document.getElementById("sT1"+line+pos).value = data[i].id;
                    }
                    else if (pos == "G") {
                        document.getElementById("sT1G").value = data[i].id;
                    }
                    else {}
                }

        })
            .catch((error) => {
                console.error('Error:', error);
        });

    }

    function changeTeam2() {

        for (let i = 0; i < s_T2_p.length; i++) {
            s_T2_p[i].selectedIndex = "0";
            s_T2_p[i].disabled = false;
        }

        fetch("https://fbscanner.io/apis/playerlist/?team_id=" + s_T2.options[s_T2.selectedIndex].value)
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);

                for (let i=0; i<s_T2_p.length; i++) {
                    removeOptions(s_T2_p[i]);
                }

                for (let i=0; i<data.length; i++) {

                    for (let j=0; j<s_T2_p.length; j++) {
                        opt = new Option("#" + data[i].jersey_number + " " + data[i].last_name, data[i].id);
                        s_T2_p[j].appendChild(opt);
                    }

                    var pos = convPos(data[i].position);
                    var line = convLine(data[i].line);

                    if (typeof pos !== 'undefined' && typeof line !== 'undefined') {
                        document.getElementById("sT2"+line+pos).value = data[i].id;

                    }
                    else if (pos == "G") {
                        document.getElementById("sT2G").value = data[i].id;
                    }
                    else {}
                }

        })
            .catch((error) => {
                console.error('Error:', error);
        });

    }

    function changePlayer(position, l, p) {

        var player_id = document.getElementById(position).options
                        [document.getElementById(position).selectedIndex].value;
        var pos = p;
        var line = l;
        var old_pos;
        var old_line;
        var old_id;
        var s_team = position.substring(1, 3);

        // GET all players from the team, empty position of the previous player
        fetch("https://fbscanner.io/apis/playerlist/?team_id=" + eval("s_"+s_team+".options[s_"+s_team+".selectedIndex].value"))
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data)
            console.log("Looking if there is a player with same position and line")
            for (let i=0;i<data.length;i++) {
                console.log("Player: "+ data[i].last_name +" line: "+data[i].line+" position: "+data[i].position)
                console.log("Comparing with: "+ line + " ," + pos)
                if (data[i].position == pos && data[i].line == line) {
                    old_id = data[i].id; // Player found
                    console.log("Found a player: " + data[i].last_name)
                }
                else if (pos == 8 && data[i].position == 8) {
                    old_id = data[i].id; // Goalie
                    console.log("Found a goalie: " + data[i].last_name)
                }
            }
            if (typeof old_id !== 'undefined') {
                data = {"line" : [],
                        "position" : [],};
                console.log("Setting old player line and position as zero")
                fetch("https://fbscanner.io/apis/players/" + old_id + "/", {

                  method: 'PATCH', // or 'PUT'
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                  },
                  body: JSON.stringify(data),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    console.log("Previous player data emptied")
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        // GET the new player old line and position, if on the roster then the position is zeroed
        console.log("Find the new player old line and set the old position to zero")
        fetch("https://fbscanner.io/apis/players/" + player_id + "/")
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            old_pos = convPos(data.position);
            old_line = convLine(data.line);
            console.log("Old line: "+old_line+" Old position: "+old_pos)
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        if (line == 0) {
            data = {"line" : [],
                "position" : [pos],
            };
        }
        else {
            data = {"line" : [line],
                    "position" : [pos],
            };
        }

        console.log("Set the new player line and position")
        fetch("https://fbscanner.io/apis/players/" + player_id + "/", {

          method: 'PATCH', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          body: JSON.stringify(data),
        })

        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            if (typeof old_line !== 'undefined' && typeof old_pos !== 'undefined') {
                console.log("Player has old line and position")
                document.getElementById("s"+s_team+old_line+old_pos).selectedIndex = "0";
            }
        })
        .catch((error) => {
          console.error('Error:', error);
        });

    }

    function removeOptions(selectElement) {
       var i, L = selectElement.options.length - 1;
       for(i = L; i > 0; i--) {
          selectElement.remove(i);
       }
    }

    function convLine(line) {
        if (line == 2) {
            return "L1"
        }
        else if (line == 3) {
            return "L2"
        }
        else if (line == 4) {
            return "L3"
        }
    }

    function convPos(pos) {
        if (pos == 3) {
            return "LW"
        }
        else if (pos == 4) {
            return "C"
        }
        else if (pos == 5) {
            return "RW"
        }
        else if (pos == 6) {
            return "LD"
        }
        else if (pos == 7) {
            return "RD"
        }
        else if (pos == 8) {
            return "G"
        }

    }

    /** Convert a 2D array into a CSV string
     */
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
        name_shot = name_t1+"_"+name_t2+"_shots.csv";
        name_shot = name_shot.replace(/\s/g, "");
/*        name_time = name_t1+"_"+name_t2+"_positions.csv";
        name_time = name_time.replace(/\s/g, "");*/

        csv_shot = arrayToCsv(printShotData);
        downloadBlob(csv_shot, name_shot, 'text/csv;charset=utf-8;');

/*        csv_time = arrayToCsv(premTimeData);
        downloadBlob(csv_time, name_time, 'text/csv;charset=utf-8;');*/
    }

    function t1n() {
        document.write(name_t1);
    }
    function t2n() {
        document.write(name_t2);
    }
    function Print() {
        window.print();
    }
    function printPdf() {
        // Create a new window for printing
        const printWindow = window.open('', '', 'width=600,height=600');

        // Add the content to be printed to the new window
        printWindow.document.write(`
            $({% load static %})
            <html>
            <head>
                <title>${document.getElementById("select-date").value} | ${name_t1} - ${name_t2}</title>
            </head>
            <body>
                <img src="{% static 'symbol_transparent.png' %}" width="40px" height="40px"><br>
                <div class="container" style="Padding-top: 20px;text-align: center;">
                    <div class="row justify-content-center">
                        <div class="col-sm-12">
                        <h5>${document.getElementById("select-date").value}</h5>
                        <h3>${name_t1} - ${name_t2}</h3></br>
                        <h3>${tgt_1.innerHTML} - ${tgt_2.innerHTML}</h3>
                        <h5>xG ${txG_1.innerHTML} - ${txG_2.innerHTML}</h5>
                        <h5>xGOT ${txGOT_1.innerHTML} - ${txGOT_2.innerHTML}</h5>
                        </div>
                    </div>
                    <div class="row justify-content-center" style="Padding-top: 10px;">
                        <h4>Game statistics</h4>
                    </div>
                    <div class="row justify-content-center" style="Padding-top: 10px;">
                        <div class="col-sm-4">
                            <div class="shot-map">
                                <h5>Game shotmap</h5>
                                <canvas id="printCanvas" width="300" height="500"></canvas></div>
                            </div>
                        <div class="col-sm-4">
                            <div class="linestats">
                                <div id="printT1_typechart" style="height: 200px"></div>
                            </div>
                            <div class="linestats" style="Padding-top: 50px">
                                <div  id="printT1_st_piechart" style="height: 250px"></div>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <div class="linestats">
                                <div id="printT2_typechart" style="height: 200px"></div>
                            </div>
                            <div class="linestats" style="Padding-top: 50px">
                                <div  id="printT2_st_piechart" style="height: 250px"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            <script>
                window.onload = function() {
                    var print_cnvs = document.getElementById("printCanvas");
                    var print_ctx = print_cnvs.getContext("2d");
                    print_img.src = undo_object.cnvs_5_url;
                    print_img.onload = function() {
                    print_ctx.drawImage(print_img,0,0,fWidth,fLength);
                    };
                }
            </script>
        `);

        /*// Close the document after printing
        printWindow.document.close();

        // Trigger the print dialog
        printWindow.print();

        // Close the print window
        printWindow.close();*/

    }
    function updateSaveData() {

        console.log("updateSaveData()")
        undo_object = JSON.parse(JSON.stringify(data_object_stringified));

        data_object = {

            "created": user_id,
            "tgt_1" : tgt_1.innerHTML,
            "tgt_2" : tgt_2.innerHTML,
            "txG_1" : txG_1.innerHTML,
            "txG_2" : txG_2.innerHTML,
            "txGOT_1" : txGOT_1.innerHTML,
            "txGOT_2" : txGOT_2.innerHTML,
            "tgtp_1" : tgtp_1.innerHTML,
            "tgtp_2" : tgtp_2.innerHTML,
            "txGp_1" : txGp_1.innerHTML,
            "txGp_2" : txGp_2.innerHTML,
            "txGOTp_1" : txGOTp_1.innerHTML,
            "txGOTp_2" : txGOTp_2.innerHTML,
            "line_on" : line_on,
            "line_on_2" : line_on_2,
            "started" : started,
            "is_on" : is_on,
            "counter" : counter,
            "gameCounter" : gameCounter,
            "periodN" : periodN,
            "Ball_pos" : Ball_pos,
            "Order" : Order,
            "PosTime" : PosTime,
            "PosTime_2" : PosTime_2,
            "LineTime" : LineTime,
            "LineTime_2" : LineTime_2,
            "shiftNo" : shiftNo,
            "shiftNo_2" : shiftNo_2,
            "shiftPos" : shiftPos,
            "shiftPos_2" : shiftPos_2,
            "data_url" : data_url,
            "today" : today,
            "live" : live,
            "shooter_select" : shooter_select,
            "user_id" : user_id,
            "game_id" : game_id,
            "shot_on" : shot_on,
            "name_t1" : name_t1,
            "name_t2" : name_t2,
            "shotData" : shotData,
            "premShotData" : premShotData,
            "printShotData" : printShotData,
            "dataShot" : dataShot,
            "dataRes" : dataRes,
            "dataRes_str" : dataRes_str,
            "dataxG" : dataxG,
            "dataType" : dataType,
            "dataType_str" : dataType_str,
            "dataDis" : dataDis,
            "dataAngle" : dataAngle,
            "dataPp" : dataPp,
            "dataSh" : dataSh,
            "shooter_id" : shooter_id,
            "passer_id" : passer_id,
            "shooter_str" : shooter_str,
            "passer_str" : passer_str,
            "shooting_team" : shooting_team,
            "xGTeam_array" : xGTeam_array,
            "xGL1_array" : xGL1_array,
            "xGL2_array" : xGL2_array,
            "xGL3_array" : xGL3_array,
            "xGTeamT2_array" : xGTeamT2_array,
            "xGL1T2_array" : xGL1T2_array,
            "xGL2T2_array" : xGL2T2_array,
            "xGL3T2_array" : xGL3T2_array,
            "posTeam_array" : posTeam_array,
            "posTeamT2_array" : posTeamT2_array,
            "plT1_array" : plT1_array,
            "plT2_array" : plT2_array,
            "plT1p_array" : plT1p_array,
            "plT2p_array" : plT2p_array,
            "stT1Teamg_array" : stT1Teamg_array,
            "stT2Teamg_array" : stT2Teamg_array,
            "stT1Teamp_array" : stT1Teamp_array,
            "stT2Teamp_array" : stT2Teamp_array,
            "stT1L1g_array" : stT1L1g_array,
            "stT2L1g_array" : stT2L1g_array,
            "stT1L1p_array" : stT1L1p_array,
            "stT2L1p_array" : stT2L1p_array,
            "stT1L2g_array" : stT1L2g_array,
            "stT2L2g_array" : stT2L2g_array,
            "stT1L2p_array" : stT1L2p_array,
            "stT2L2p_array" : stT2L2p_array,
            "stT1L3g_array" : stT1L3g_array,
            "stT2L3g_array" : stT2L3g_array,
            "stT1L3p_array" : stT1L3p_array,
            "stT2L3p_array" : stT2L3p_array,
            "stxGT1Teamg_array" : stxGT1Teamg_array,
            "stxGT2Teamg_array" : stxGT2Teamg_array,
            "stxGT1Teamp_array" : stxGT1Teamp_array,
            "stxGT2Teamp_array" : stxGT2Teamp_array,
            "stxGT1L1g_array" : stxGT1L1g_array,
            "stxGT2L1g_array" : stxGT2L1g_array,
            "stxGT1L1p_array" : stxGT1L1p_array,
            "stxGT2L1p_array" : stxGT2L1p_array,
            "stxGT1L2g_array" : stxGT1L2g_array,
            "stxGT2L2g_array" : stxGT2L2g_array,
            "stxGT1L2p_array" : stxGT1L2p_array,
            "stxGT2L2p_array" : stxGT2L2p_array,
            "stxGT1L3g_array" : stxGT1L3g_array,
            "stxGT2L3g_array" : stxGT2L3g_array,
            "stxGT1L3p_array" : stxGT1L3p_array,
            "stxGT2L3p_array" : stxGT2L3p_array,
            "staT1Teamg_array" : staT1Teamg_array,
            "staT2Teamg_array" : staT2Teamg_array,
            "staT1Teamp_array" : staT1Teamp_array,
            "staT2Teamp_array" : staT2Teamp_array,
            "staT1L1g_array" : staT1L1g_array,
            "staT2L1g_array" : staT2L1g_array,
            "staT1L1p_array" : staT1L1p_array,
            "staT2L1p_array" : staT2L1p_array,
            "staT1L2g_array" : staT1L2g_array,
            "staT2L2g_array" : staT2L2g_array,
            "staT1L2p_array" : staT1L2p_array,
            "staT2L2p_array" : staT2L2p_array,
            "staT1L3g_array" : staT1L3g_array,
            "staT2L3g_array" : staT2L3g_array,
            "staT1L3p_array" : staT1L3p_array,
            "staT2L3p_array" : staT2L3p_array,
            "staxGT1Teamg_array" : staxGT1Teamg_array,
            "staxGT2Teamg_array" : staxGT2Teamg_array,
            "staxGT1Teamp_array" : staxGT1Teamp_array,
            "staxGT2Teamp_array" : staxGT2Teamp_array,
            "staxGT1L1g_array" : staxGT1L1g_array,
            "staxGT2L1g_array" : staxGT2L1g_array,
            "staxGT1L1p_array" : staxGT1L1p_array,
            "staxGT2L1p_array" : staxGT2L1p_array,
            "staxGT1L2g_array" : staxGT1L2g_array,
            "staxGT2L2g_array" : staxGT2L2g_array,
            "staxGT1L2p_array" : staxGT1L2p_array,
            "staxGT2L2p_array" : staxGT2L2p_array,
            "staxGT1L3g_array" : staxGT1L3g_array,
            "staxGT2L3g_array" : staxGT2L3g_array,
            "staxGT1L3p_array" : staxGT1L3p_array,
            "staxGT2L3p_array" : staxGT2L3p_array,
            "Toc_p" : Toc_p,
            "Toc_g" : Toc_g,
            "Pos_p" : Pos_p,
            "Pos_g" : Pos_g,
            "Not_p" : Not_p,
            "Not_g" : Not_g,
            "Nos_p" : Nos_p,
            "Nos_g" : Nos_g,
            "Notno_p" : Notno_p,
            "Notno_g" : Notno_g,
            "xGf_p" : xGf_p,
            "xGf_g" : xGf_g,
            "xGa_p" : xGa_p,
            "xGa_g" : xGa_g,
            "TocT2_p" : TocT2_p,
            "TocT2_g" : TocT2_g,
            "PosT2_p" : PosT2_p,
            "PosT2_g" : PosT2_g,
            "NotT2_p" : NotT2_p,
            "NotT2_g" : NotT2_g,
            "NosT2_p" : NosT2_p,
            "NosT2_g" : NosT2_g,
            "NotnoT2_p" : NotnoT2_p,
            "NotnoT2_g" : NotnoT2_g,
            "xGfT2_p" : xGfT2_p,
            "xGfT2_g" : xGfT2_g,
            "xGaT2_p" : xGaT2_p,
            "xGaT2_g" : xGaT2_g,
            "cnvs_url" : cnvs.toDataURL(),
            "cnvs_1_url" : cnvs_1.toDataURL(),
            "cnvs_2_url" : cnvs_2.toDataURL(),
            "cnvs_3_url" : cnvs_3.toDataURL(),
            "cnvs_4_url" : cnvs_4.toDataURL(),
            "cnvs_5_url" : cnvs_5.toDataURL(),
            "sf_p" : [sf_p[0].innerHTML, sf_p[1].innerHTML, sf_p[2].innerHTML, sf_p[3].innerHTML, sf_p[4].innerHTML, sf_p[5].innerHTML, sf_p[6].innerHTML, sf_p[7].innerHTML],
            "sa_p" : [sa_p[0].innerHTML, sa_p[1].innerHTML, sa_p[2].innerHTML, sa_p[3].innerHTML, sa_p[4].innerHTML, sa_p[5].innerHTML, sa_p[6].innerHTML, sa_p[7].innerHTML],
            "gf_p" : [gf_p[0].innerHTML, gf_p[1].innerHTML, gf_p[2].innerHTML, gf_p[3].innerHTML, gf_p[4].innerHTML, gf_p[5].innerHTML, gf_p[6].innerHTML, gf_p[7].innerHTML],
            "ga_p" : [ga_p[0].innerHTML, ga_p[1].innerHTML, ga_p[2].innerHTML, ga_p[3].innerHTML, ga_p[4].innerHTML, ga_p[5].innerHTML, ga_p[6].innerHTML, ga_p[7].innerHTML],
            "pm_p" : [pm_p[0].innerHTML, pm_p[1].innerHTML, pm_p[2].innerHTML, pm_p[3].innerHTML, pm_p[4].innerHTML, pm_p[5].innerHTML, pm_p[6].innerHTML, pm_p[7].innerHTML],
            "bf_p" : [bf_p[0].innerHTML, bf_p[1].innerHTML, bf_p[2].innerHTML, bf_p[3].innerHTML, bf_p[4].innerHTML, bf_p[5].innerHTML, bf_p[6].innerHTML, bf_p[7].innerHTML],
            "ba_p" : [ba_p[0].innerHTML, ba_p[1].innerHTML, ba_p[2].innerHTML, ba_p[3].innerHTML, ba_p[4].innerHTML, ba_p[5].innerHTML, ba_p[6].innerHTML, ba_p[7].innerHTML],
            "mf_p" : [mf_p[0].innerHTML, mf_p[1].innerHTML, mf_p[2].innerHTML, mf_p[3].innerHTML, mf_p[4].innerHTML, mf_p[5].innerHTML, mf_p[6].innerHTML, mf_p[7].innerHTML],
            "ma_p" : [ma_p[0].innerHTML, ma_p[1].innerHTML, ma_p[2].innerHTML, ma_p[3].innerHTML, ma_p[4].innerHTML, ma_p[5].innerHTML, ma_p[6].innerHTML, ma_p[7].innerHTML],
            "saf_p" : [saf_p[0].innerHTML, saf_p[1].innerHTML, saf_p[2].innerHTML, saf_p[3].innerHTML, saf_p[4].innerHTML, saf_p[5].innerHTML, saf_p[6].innerHTML, saf_p[7].innerHTML],
            "saa_p" : [saa_p[0].innerHTML, saa_p[1].innerHTML, saa_p[2].innerHTML, saa_p[3].innerHTML, saa_p[4].innerHTML, saa_p[5].innerHTML, saa_p[6].innerHTML, saa_p[7].innerHTML],
            "p_p" : [p_p[0].innerHTML, p_p[1].innerHTML, p_p[2].innerHTML, p_p[3].innerHTML, p_p[4].innerHTML, p_p[5].innerHTML, p_p[6].innerHTML, p_p[7].innerHTML],
            "toc_p" : [toc_p[0].innerHTML, toc_p[1].innerHTML, toc_p[2].innerHTML, toc_p[3].innerHTML, toc_p[4].innerHTML, toc_p[5].innerHTML, toc_p[6].innerHTML, toc_p[7].innerHTML],
            "atoc_p" : [atoc_p[0].innerHTML, atoc_p[1].innerHTML, atoc_p[2].innerHTML, atoc_p[3].innerHTML, atoc_p[4].innerHTML, atoc_p[5].innerHTML, atoc_p[6].innerHTML, atoc_p[7].innerHTML],
            "avg_p" : [avg_p[0].innerHTML, avg_p[1].innerHTML, avg_p[2].innerHTML, avg_p[3].innerHTML, avg_p[4].innerHTML, avg_p[5].innerHTML, avg_p[6].innerHTML, avg_p[7].innerHTML],
            "avgno_p" : [avgno_p[0].innerHTML, avgno_p[1].innerHTML, avgno_p[2].innerHTML, avgno_p[3].innerHTML, avgno_p[4].innerHTML, avgno_p[5].innerHTML, avgno_p[6].innerHTML, avgno_p[7].innerHTML],
            "xf_p" : [xf_p[0].innerHTML, xf_p[1].innerHTML, xf_p[2].innerHTML, xf_p[3].innerHTML, xf_p[4].innerHTML, xf_p[5].innerHTML, xf_p[6].innerHTML, xf_p[7].innerHTML],
            "xa_p" : [xa_p[0].innerHTML, xa_p[1].innerHTML, xa_p[2].innerHTML, xa_p[3].innerHTML, xa_p[4].innerHTML, xa_p[5].innerHTML, xa_p[6].innerHTML, xa_p[7].innerHTML],
            "sf_g" : [sf_g[0].innerHTML, sf_g[1].innerHTML, sf_g[2].innerHTML, sf_g[3].innerHTML, sf_g[4].innerHTML, sf_g[5].innerHTML, sf_g[6].innerHTML, sf_g[7].innerHTML],
            "sa_g" : [sa_g[0].innerHTML, sa_g[1].innerHTML, sa_g[2].innerHTML, sa_g[3].innerHTML, sa_g[4].innerHTML, sa_g[5].innerHTML, sa_g[6].innerHTML, sa_g[7].innerHTML],
            "gf_g" : [gf_g[0].innerHTML, gf_g[1].innerHTML, gf_g[2].innerHTML, gf_g[3].innerHTML, gf_g[4].innerHTML, gf_g[5].innerHTML, gf_g[6].innerHTML, gf_g[7].innerHTML],
            "ga_g" : [ga_g[0].innerHTML, ga_g[1].innerHTML, ga_g[2].innerHTML, ga_g[3].innerHTML, ga_g[4].innerHTML, ga_g[5].innerHTML, ga_g[6].innerHTML, ga_g[7].innerHTML],
            "pm_g" : [pm_g[0].innerHTML, pm_g[1].innerHTML, pm_g[2].innerHTML, pm_g[3].innerHTML, pm_g[4].innerHTML, pm_g[5].innerHTML, pm_g[6].innerHTML, pm_g[7].innerHTML],
            "bf_g" : [bf_g[0].innerHTML, bf_g[1].innerHTML, bf_g[2].innerHTML, bf_g[3].innerHTML, bf_g[4].innerHTML, bf_g[5].innerHTML, bf_g[6].innerHTML, bf_g[7].innerHTML],
            "ba_g" : [ba_g[0].innerHTML, ba_g[1].innerHTML, ba_g[2].innerHTML, ba_g[3].innerHTML, ba_g[4].innerHTML, ba_g[5].innerHTML, ba_g[6].innerHTML, ba_g[7].innerHTML],
            "mf_g" : [mf_g[0].innerHTML, mf_g[1].innerHTML, mf_g[2].innerHTML, mf_g[3].innerHTML, mf_g[4].innerHTML, mf_g[5].innerHTML, mf_g[6].innerHTML, mf_g[7].innerHTML],
            "ma_g" : [ma_g[0].innerHTML, ma_g[1].innerHTML, ma_g[2].innerHTML, ma_g[3].innerHTML, ma_g[4].innerHTML, ma_g[5].innerHTML, ma_g[6].innerHTML, ma_g[7].innerHTML],
            "saf_g" : [saf_g[0].innerHTML, saf_g[1].innerHTML, saf_g[2].innerHTML, saf_g[3].innerHTML, saf_g[4].innerHTML, saf_g[5].innerHTML, saf_g[6].innerHTML, saf_g[7].innerHTML],
            "saa_g" : [saa_g[0].innerHTML, saa_g[1].innerHTML, saa_g[2].innerHTML, saa_g[3].innerHTML, saa_g[4].innerHTML, saa_g[5].innerHTML, saa_g[6].innerHTML, saa_g[7].innerHTML],
            "p_g" : [p_g[0].innerHTML, p_g[1].innerHTML, p_g[2].innerHTML, p_g[3].innerHTML, p_g[4].innerHTML, p_g[5].innerHTML, p_g[6].innerHTML, p_g[7].innerHTML],
            "toc_g" : [toc_g[0].innerHTML, toc_g[1].innerHTML, toc_g[2].innerHTML, toc_g[3].innerHTML, toc_g[4].innerHTML, toc_g[5].innerHTML, toc_g[6].innerHTML, toc_g[7].innerHTML],
            "atoc_g" : [atoc_g[0].innerHTML, atoc_g[1].innerHTML, atoc_g[2].innerHTML, atoc_g[3].innerHTML, atoc_g[4].innerHTML, atoc_g[5].innerHTML, atoc_g[6].innerHTML, atoc_g[7].innerHTML],
            "avg_g" : [avg_g[0].innerHTML, avg_g[1].innerHTML, avg_g[2].innerHTML, avg_g[3].innerHTML, avg_g[4].innerHTML, avg_g[5].innerHTML, avg_g[6].innerHTML, avg_g[7].innerHTML],
            "avgno_g" : [avgno_g[0].innerHTML, avgno_g[1].innerHTML, avgno_g[2].innerHTML, avgno_g[3].innerHTML, avgno_g[4].innerHTML, avgno_g[5].innerHTML, avgno_g[6].innerHTML, avgno_g[7].innerHTML],
            "xf_g" : [xf_g[0].innerHTML, xf_g[1].innerHTML, xf_g[2].innerHTML, xf_g[3].innerHTML, xf_g[4].innerHTML, xf_g[5].innerHTML, xf_g[6].innerHTML, xf_g[7].innerHTML],
            "xa_g" : [xa_g[0].innerHTML, xa_g[1].innerHTML, xa_g[2].innerHTML, xa_g[3].innerHTML, xa_g[4].innerHTML, xa_g[5].innerHTML, xa_g[6].innerHTML, xa_g[7].innerHTML],
            "sfT2_p" : [sfT2_p[0].innerHTML, sfT2_p[1].innerHTML, sfT2_p[2].innerHTML, sfT2_p[3].innerHTML, sfT2_p[4].innerHTML, sfT2_p[5].innerHTML, sfT2_p[6].innerHTML, sfT2_p[7].innerHTML],
            "saT2_p" : [saT2_p[0].innerHTML, saT2_p[1].innerHTML, saT2_p[2].innerHTML, saT2_p[3].innerHTML, saT2_p[4].innerHTML, saT2_p[5].innerHTML, saT2_p[6].innerHTML, saT2_p[7].innerHTML],
            "gfT2_p" : [gfT2_p[0].innerHTML, gfT2_p[1].innerHTML, gfT2_p[2].innerHTML, gfT2_p[3].innerHTML, gfT2_p[4].innerHTML, gfT2_p[5].innerHTML, gfT2_p[6].innerHTML, gfT2_p[7].innerHTML],
            "gaT2_p" : [gaT2_p[0].innerHTML, gaT2_p[1].innerHTML, gaT2_p[2].innerHTML, gaT2_p[3].innerHTML, gaT2_p[4].innerHTML, gaT2_p[5].innerHTML, gaT2_p[6].innerHTML, gaT2_p[7].innerHTML],
            "pmT2_p" : [pmT2_p[0].innerHTML, pmT2_p[1].innerHTML, pmT2_p[2].innerHTML, pmT2_p[3].innerHTML, pmT2_p[4].innerHTML, pmT2_p[5].innerHTML, pmT2_p[6].innerHTML, pmT2_p[7].innerHTML],
            "bfT2_p" : [bfT2_p[0].innerHTML, bfT2_p[1].innerHTML, bfT2_p[2].innerHTML, bfT2_p[3].innerHTML, bfT2_p[4].innerHTML, bfT2_p[5].innerHTML, bfT2_p[6].innerHTML, bfT2_p[7].innerHTML],
            "baT2_p" : [baT2_p[0].innerHTML, baT2_p[1].innerHTML, baT2_p[2].innerHTML, baT2_p[3].innerHTML, baT2_p[4].innerHTML, baT2_p[5].innerHTML, baT2_p[6].innerHTML, baT2_p[7].innerHTML],
            "mfT2_p" : [mfT2_p[0].innerHTML, mfT2_p[1].innerHTML, mfT2_p[2].innerHTML, mfT2_p[3].innerHTML, mfT2_p[4].innerHTML, mfT2_p[5].innerHTML, mfT2_p[6].innerHTML, mfT2_p[7].innerHTML],
            "maT2_p" : [maT2_p[0].innerHTML, maT2_p[1].innerHTML, maT2_p[2].innerHTML, maT2_p[3].innerHTML, maT2_p[4].innerHTML, maT2_p[5].innerHTML, maT2_p[6].innerHTML, maT2_p[7].innerHTML],
            "safT2_p" : [safT2_p[0].innerHTML, safT2_p[1].innerHTML, safT2_p[2].innerHTML, safT2_p[3].innerHTML, safT2_p[4].innerHTML, safT2_p[5].innerHTML, safT2_p[6].innerHTML, safT2_p[7].innerHTML],
            "saaT2_p" : [saaT2_p[0].innerHTML, saaT2_p[1].innerHTML, saaT2_p[2].innerHTML, saaT2_p[3].innerHTML, saaT2_p[4].innerHTML, saaT2_p[5].innerHTML, saaT2_p[6].innerHTML, saaT2_p[7].innerHTML],
            "pT2_p" : [pT2_p[0].innerHTML, pT2_p[1].innerHTML, pT2_p[2].innerHTML, pT2_p[3].innerHTML, pT2_p[4].innerHTML, pT2_p[5].innerHTML, pT2_p[6].innerHTML, pT2_p[7].innerHTML],
            "tocT2_p" : [tocT2_p[0].innerHTML, tocT2_p[1].innerHTML, tocT2_p[2].innerHTML, tocT2_p[3].innerHTML, tocT2_p[4].innerHTML, tocT2_p[5].innerHTML, tocT2_p[6].innerHTML, tocT2_p[7].innerHTML],
            "atocT2_p" : [atocT2_p[0].innerHTML, atocT2_p[1].innerHTML, atocT2_p[2].innerHTML, atocT2_p[3].innerHTML, atocT2_p[4].innerHTML, atocT2_p[5].innerHTML, atocT2_p[6].innerHTML, atocT2_p[7].innerHTML],
            "avgT2_p" : [avgT2_p[0].innerHTML, avgT2_p[1].innerHTML, avgT2_p[2].innerHTML, avgT2_p[3].innerHTML, avgT2_p[4].innerHTML, avgT2_p[5].innerHTML, avgT2_p[6].innerHTML, avgT2_p[7].innerHTML],
            "avgnoT2_p" : [avgnoT2_p[0].innerHTML, avgnoT2_p[1].innerHTML, avgnoT2_p[2].innerHTML, avgnoT2_p[3].innerHTML, avgnoT2_p[4].innerHTML, avgnoT2_p[5].innerHTML, avgnoT2_p[6].innerHTML, avgnoT2_p[7].innerHTML],
            "xfT2_p" : [xfT2_p[0].innerHTML, xfT2_p[1].innerHTML, xfT2_p[2].innerHTML, xfT2_p[3].innerHTML, xfT2_p[4].innerHTML, xfT2_p[5].innerHTML, xfT2_p[6].innerHTML, xfT2_p[7].innerHTML],
            "xaT2_p" : [xaT2_p[0].innerHTML, xaT2_p[1].innerHTML, xaT2_p[2].innerHTML, xaT2_p[3].innerHTML, xaT2_p[4].innerHTML, xaT2_p[5].innerHTML, xaT2_p[6].innerHTML, xaT2_p[7].innerHTML],
            "sfT2_g" : [sfT2_g[0].innerHTML, sfT2_g[1].innerHTML, sfT2_g[2].innerHTML, sfT2_g[3].innerHTML, sfT2_g[4].innerHTML, sfT2_g[5].innerHTML, sfT2_g[6].innerHTML, sfT2_g[7].innerHTML],
            "saT2_g" : [saT2_g[0].innerHTML, saT2_g[1].innerHTML, saT2_g[2].innerHTML, saT2_g[3].innerHTML, saT2_g[4].innerHTML, saT2_g[5].innerHTML, saT2_g[6].innerHTML, saT2_g[7].innerHTML],
            "gfT2_g" : [gfT2_g[0].innerHTML, gfT2_g[1].innerHTML, gfT2_g[2].innerHTML, gfT2_g[3].innerHTML, gfT2_g[4].innerHTML, gfT2_g[5].innerHTML, gfT2_g[6].innerHTML, gfT2_g[7].innerHTML],
            "gaT2_g" : [gaT2_g[0].innerHTML, gaT2_g[1].innerHTML, gaT2_g[2].innerHTML, gaT2_g[3].innerHTML, gaT2_g[4].innerHTML, gaT2_g[5].innerHTML, gaT2_g[6].innerHTML, gaT2_g[7].innerHTML],
            "pmT2_g" : [pmT2_g[0].innerHTML, pmT2_g[1].innerHTML, pmT2_g[2].innerHTML, pmT2_g[3].innerHTML, pmT2_g[4].innerHTML, pmT2_g[5].innerHTML, pmT2_g[6].innerHTML, pmT2_g[7].innerHTML],
            "bfT2_g" : [bfT2_g[0].innerHTML, bfT2_g[1].innerHTML, bfT2_g[2].innerHTML, bfT2_g[3].innerHTML, bfT2_g[4].innerHTML, bfT2_g[5].innerHTML, bfT2_g[6].innerHTML, bfT2_g[7].innerHTML],
            "baT2_g" : [baT2_g[0].innerHTML, baT2_g[1].innerHTML, baT2_g[2].innerHTML, baT2_g[3].innerHTML, baT2_g[4].innerHTML, baT2_g[5].innerHTML, baT2_g[6].innerHTML, baT2_g[7].innerHTML],
            "mfT2_g" : [mfT2_g[0].innerHTML, mfT2_g[1].innerHTML, mfT2_g[2].innerHTML, mfT2_g[3].innerHTML, mfT2_g[4].innerHTML, mfT2_g[5].innerHTML, mfT2_g[6].innerHTML, mfT2_g[7].innerHTML],
            "maT2_g" : [maT2_g[0].innerHTML, maT2_g[1].innerHTML, maT2_g[2].innerHTML, maT2_g[3].innerHTML, maT2_g[4].innerHTML, maT2_g[5].innerHTML, maT2_g[6].innerHTML, maT2_g[7].innerHTML],
            "safT2_g" : [safT2_g[0].innerHTML, safT2_g[1].innerHTML, safT2_g[2].innerHTML, safT2_g[3].innerHTML, safT2_g[4].innerHTML, safT2_g[5].innerHTML, safT2_g[6].innerHTML, safT2_g[7].innerHTML],
            "saaT2_g" : [saaT2_g[0].innerHTML, saaT2_g[1].innerHTML, saaT2_g[2].innerHTML, saaT2_g[3].innerHTML, saaT2_g[4].innerHTML, saaT2_g[5].innerHTML, saaT2_g[6].innerHTML, saaT2_g[7].innerHTML],
            "pT2_g" : [pT2_g[0].innerHTML, pT2_g[1].innerHTML, pT2_g[2].innerHTML, pT2_g[3].innerHTML, pT2_g[4].innerHTML, pT2_g[5].innerHTML, pT2_g[6].innerHTML, pT2_g[7].innerHTML],
            "tocT2_g" : [tocT2_g[0].innerHTML, tocT2_g[1].innerHTML, tocT2_g[2].innerHTML, tocT2_g[3].innerHTML, tocT2_g[4].innerHTML, tocT2_g[5].innerHTML, tocT2_g[6].innerHTML, tocT2_g[7].innerHTML],
            "atocT2_g" : [atocT2_g[0].innerHTML, atocT2_g[1].innerHTML, atocT2_g[2].innerHTML, atocT2_g[3].innerHTML, atocT2_g[4].innerHTML, atocT2_g[5].innerHTML, atocT2_g[6].innerHTML, atocT2_g[7].innerHTML],
            "avgT2_g" : [avgT2_g[0].innerHTML, avgT2_g[1].innerHTML, avgT2_g[2].innerHTML, avgT2_g[3].innerHTML, avgT2_g[4].innerHTML, avgT2_g[5].innerHTML, avgT2_g[6].innerHTML, avgT2_g[7].innerHTML],
            "avgnoT2_g" : [avgnoT2_g[0].innerHTML, avgnoT2_g[1].innerHTML, avgnoT2_g[2].innerHTML, avgnoT2_g[3].innerHTML, avgnoT2_g[4].innerHTML, avgnoT2_g[5].innerHTML, avgnoT2_g[6].innerHTML, avgnoT2_g[7].innerHTML],
            "xfT2_g" : [xfT2_g[0].innerHTML, xfT2_g[1].innerHTML, xfT2_g[2].innerHTML, xfT2_g[3].innerHTML, xfT2_g[4].innerHTML, xfT2_g[5].innerHTML, xfT2_g[6].innerHTML, xfT2_g[7].innerHTML],
            "xaT2_g" : [xaT2_g[0].innerHTML, xaT2_g[1].innerHTML, xaT2_g[2].innerHTML, xaT2_g[3].innerHTML, xaT2_g[4].innerHTML, xaT2_g[5].innerHTML, xaT2_g[6].innerHTML, xaT2_g[7].innerHTML],
        }

        data_object_stringified = JSON.parse(JSON.stringify(data_object));

/*        data = {"game_data" : data_object}

        fetch("https://fbscanner.io/apis/games/" + game_id + "/", {

          method: 'PATCH', // or 'PUSH'
          mode: 'cors',
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
    });*/
    
    }
    function undoButton() {

        // Redraw shotmaps
        img.src = undo_object.cnvs_url;
        img.onload = function() {
            ctx.drawImage(img,0,0,fWidth,fLength);
        };
        img1.src = undo_object.cnvs_1_url;
        img1.onload = function() {
            ctx1.drawImage(img1,0,0,fWidth,fLength);
        };
        img2.src = undo_object.cnvs_2_url;
        img2.onload = function() {
            ctx2.drawImage(img2,0,0,fWidth,fLength);
        };
        img3.src = undo_object.cnvs_3_url;
        img3.onload = function() {
            ctx3.drawImage(img3,0,0,fWidth,fLength);
        };
        img4.src = undo_object.cnvs_4_url;
        img4.onload = function() {
            ctx4.drawImage(img4,0,0,fWidth,fLength);
        };
        img5.src = undo_object.cnvs_5_url;
        img5.onload = function() {
            ctx5.drawImage(img5,0,0,fWidth,fLength);
        };

        tgt_1.innerHTML = undo_object.tgt_1;
        tgt_2.innerHTML = undo_object.tgt_2;
        txG_1.innerHTML = undo_object.txG_1;
        txG_2.innerHTML = undo_object.txG_2;
        if (typeof undo_object.txGOT_1 != "undefined") {txGOT_1.innerHTML = undo_object.txGOT_1;}
        if (typeof undo_object.txGOT_2 != "undefined") {txGOT_2.innerHTML = undo_object.txGOT_2;}

        tgtp_1.innerHTML = undo_object.tgtp_1;
        tgtp_2.innerHTML = undo_object.tgtp_2;
        txGp_1.innerHTML = undo_object.txGp_1;
        txGp_2.innerHTML = undo_object.txGp_2;
        if (typeof undo_object.txGOTp_1 != "undefined") {txGOTp_1.innerHTML = undo_object.txGOTp_1;}
        if (typeof undo_object.txGOTp_2 != "undefined") {txGOTp_2.innerHTML = undo_object.txGOTp_2;}
        
        shotData = undo_object.shotData;
        premShotData = undo_object.premShotData;
        if (typeof undo_object.printShotData != "undefined") {printShotData = undo_object.printShotData;}
        dataShot = undo_object.dataShot;
        dataRes = undo_object.dataRes;
        dataRes_str = undo_object.dataRes_str;
        dataxG = undo_object.dataxG;
        dataType = undo_object.dataType;
        dataType_str = undo_object.dataType_str;
        dataDis = undo_object.dataDis;
        dataAngle = undo_object.dataAngle;
        dataPp = undo_object.dataPp;
        dataSh = undo_object.dataSh;
        
        shooter_id = undo_object.shooter_id;
        passer_id = undo_object.passer_id;
        shooter_str = undo_object.shooter_str;
        passer_str = undo_object.passer_str;
        shooting_team = undo_object.shooting_team;

        xGTeam_array = undo_object.xGTeam_array;
        xGL1_array = undo_object.xGL1_array;
        xGL2_array = undo_object.xGL2_array;
        xGL3_array = undo_object.xGL3_array;
        xGTeamT2_array = undo_object.xGTeamT2_array;
        xGL1T2_array = undo_object.xGL1T2_array;
        xGL2T2_array = undo_object.xGL2T2_array;
        xGL3T2_array = undo_object.xGL3T2_array;
        posTeam_array = undo_object.posTeam_array;
        posTeamT2_array = undo_object.posTeamT2_array;
        plT1_array = undo_object.plT1_array;
        plT2_array = undo_object.plT2_array;
        plT1p_array = undo_object.plT1p_array;
        plT2p_array = undo_object.plT2p_array;
        
        stT1Teamg_array = undo_object.stT1Teamg_array;
        stT2Teamg_array = undo_object.stT2Teamg_array;
        stT1Teamp_array = undo_object.stT1Teamp_array;
        stT2Teamp_array = undo_object.stT2Teamp_array;
        stT1L1g_array = undo_object.stT1L1g_array;
        stT2L1g_array = undo_object.stT2L1g_array;
        stT1L1p_array = undo_object.stT1L1p_array;
        stT2L1p_array = undo_object.stT2L1p_array;
        stT1L2g_array = undo_object.stT1L2g_array;
        stT2L2g_array = undo_object.stT2L2g_array;
        stT1L2p_array = undo_object.stT1L2p_array;
        stT2L2p_array = undo_object.stT2L2p_array;
        stT1L3g_array = undo_object.stT1L3g_array;
        stT2L3g_array = undo_object.stT2L3g_array;
        stT1L3p_array = undo_object.stT1L3p_array;
        stT2L3p_array = undo_object.stT2L3p_array;
        
        stxGT1Teamg_array = undo_object.stxGT1Teamg_array;
        stxGT2Teamg_array = undo_object.stxGT2Teamg_array;
        stxGT1Teamp_array = undo_object.stxGT1Teamp_array;
        stxGT2Teamp_array = undo_object.stxGT2Teamp_array;
        stxGT1L1g_array = undo_object.stxGT1L1g_array;
        stxGT2L1g_array = undo_object.stxGT2L1g_array;
        stxGT1L1p_array = undo_object.stxGT1L1p_array;
        stxGT2L1p_array = undo_object.stxGT2L1p_array;
        stxGT1L2g_array = undo_object.stxGT1L2g_array;
        stxGT2L2g_array = undo_object.stxGT2L2g_array;
        stxGT1L2p_array = undo_object.stxGT1L2p_array;
        stxGT2L2p_array = undo_object.stxGT2L2p_array;
        stxGT1L3g_array = undo_object.stxGT1L3g_array;
        stxGT2L3g_array = undo_object.stxGT2L3g_array;
        stxGT1L3p_array = undo_object.stxGT1L3p_array;
        stxGT2L3p_array = undo_object.stxGT2L3p_array;
        staT1Teamg_array = undo_object.staT1Teamg_array;
        staT2Teamg_array = undo_object.staT2Teamg_array;
        staT1Teamp_array = undo_object.staT1Teamp_array;
        staT2Teamp_array = undo_object.staT2Teamp_array;
        staT1L1g_array = undo_object.staT1L1g_array;
        staT2L1g_array = undo_object.staT2L1g_array;
        staT1L1p_array = undo_object.staT1L1p_array;
        staT2L1p_array = undo_object.staT2L1p_array;
        staT1L2g_array = undo_object.staT1L2g_array;
        staT2L2g_array = undo_object.staT2L2g_array;
        staT1L2p_array = undo_object.staT1L2p_array;
        staT2L2p_array = undo_object.staT2L2p_array;
        staT1L3g_array = undo_object.staT1L3g_array;
        staT2L3g_array = undo_object.staT2L3g_array;
        staT1L3p_array = undo_object.staT1L3p_array;
        staT2L3p_array = undo_object.staT2L3p_array;
        staxGT1Teamg_array = undo_object.staxGT1Teamg_array;
        staxGT2Teamg_array = undo_object.staxGT2Teamg_array;
        staxGT1Teamp_array = undo_object.staxGT1Teamp_array;
        staxGT2Teamp_array = undo_object.staxGT2Teamp_array;
        staxGT1L1g_array = undo_object.staxGT1L1g_array;
        staxGT2L1g_array = undo_object.staxGT2L1g_array;
        staxGT1L1p_array = undo_object.staxGT1L1p_array;
        staxGT2L1p_array = undo_object.staxGT2L1p_array;
        staxGT1L2g_array = undo_object.staxGT1L2g_array;
        staxGT2L2g_array = undo_object.staxGT2L2g_array;
        staxGT1L2p_array = undo_object.staxGT1L2p_array;
        staxGT2L2p_array = undo_object.staxGT2L2p_array;
        staxGT1L3g_array = undo_object.staxGT1L3g_array;
        staxGT2L3g_array = undo_object.staxGT2L3g_array;
        staxGT1L3p_array = undo_object.staxGT1L3p_array;
        staxGT2L3p_array = undo_object.staxGT2L3p_array;
        
        Toc_p = undo_object.Toc_p;
        Toc_g = undo_object.Toc_g;
        Pos_p = undo_object.Pos_p;
        Pos_g = undo_object.Pos_g;
        Not_p = undo_object.Not_p;
        Not_g = undo_object.Not_g;
        Nos_p = undo_object.Nos_p;
        Nos_g = undo_object.Nos_g;
        Notno_p = undo_object.Notno_p;
        Notno_g = undo_object.Notno_g;
        xGf_p = undo_object.xGf_p;
        xGf_g = undo_object.xGf_g;
        xGa_p = undo_object.xGa_p;
        xGa_g = undo_object.xGa_g;
        TocT2_p = undo_object.TocT2_p;
        TocT2_g = undo_object.TocT2_g;
        PosT2_p = undo_object.PosT2_p;
        PosT2_g = undo_object.PosT2_g;
        NotT2_p = undo_object.NotT2_p;
        NotT2_g = undo_object.NotT2_g;
        NosT2_p = undo_object.NosT2_p;
        NosT2_g = undo_object.NosT2_g;
        NotnoT2_p = undo_object.NotnoT2_p;
        NotnoT2_g = undo_object.NotnoT2_g;
        xGfT2_p = undo_object.xGfT2_p;
        xGfT2_g = undo_object.xGfT2_g;
        xGaT2_p = undo_object.xGaT2_p;
        xGaT2_g = undo_object.xGaT2_g;
        
        for (let i=0;i<=7;i++) {
            
            sf_p[i].innerHTML = undo_object.sf_p[i];
            sa_p[i].innerHTML = undo_object.sa_p[i];
            gf_p[i].innerHTML = undo_object.gf_p[i];
            ga_p[i].innerHTML = undo_object.ga_p[i];
            pm_p[i].innerHTML = undo_object.pm_p[i];
            bf_p[i].innerHTML = undo_object.bf_p[i];
            ba_p[i].innerHTML = undo_object.ba_p[i];
            mf_p[i].innerHTML = undo_object.mf_p[i];
            ma_p[i].innerHTML = undo_object.ma_p[i];
            saf_p[i].innerHTML = undo_object.saf_p[i];
            saa_p[i].innerHTML = undo_object.saa_p[i];
            xf_p[i].innerHTML = undo_object.xf_p[i];
            xa_p[i].innerHTML = undo_object.xa_p[i];
            sf_g[i].innerHTML = undo_object.sf_g[i];
            sa_g[i].innerHTML = undo_object.sa_g[i];
            gf_g[i].innerHTML = undo_object.gf_g[i];
            ga_g[i].innerHTML = undo_object.ga_g[i];
            pm_g[i].innerHTML = undo_object.pm_g[i];
            bf_g[i].innerHTML = undo_object.bf_g[i];
            ba_g[i].innerHTML = undo_object.ba_g[i];
            mf_g[i].innerHTML = undo_object.mf_g[i];
            ma_g[i].innerHTML = undo_object.ma_g[i];
            saf_g[i].innerHTML = undo_object.saf_g[i];
            saa_g[i].innerHTML = undo_object.saa_g[i];
            xf_g[i].innerHTML = undo_object.xf_g[i];
            xa_g[i].innerHTML = undo_object.xa_g[i];
    
            sfT2_p[i].innerHTML = undo_object.sfT2_p[i];
            saT2_p[i].innerHTML = undo_object.saT2_p[i];
            gfT2_p[i].innerHTML = undo_object.gfT2_p[i];
            gaT2_p[i].innerHTML = undo_object.gaT2_p[i];
            pmT2_p[i].innerHTML = undo_object.pmT2_p[i];
            bfT2_p[i].innerHTML = undo_object.bfT2_p[i];
            baT2_p[i].innerHTML = undo_object.baT2_p[i];
            mfT2_p[i].innerHTML = undo_object.mfT2_p[i];
            maT2_p[i].innerHTML = undo_object.maT2_p[i];
            safT2_p[i].innerHTML = undo_object.safT2_p[i];
            saaT2_p[i].innerHTML = undo_object.saaT2_p[i];
            xfT2_p[i].innerHTML = undo_object.xfT2_p[i];
            xaT2_p[i].innerHTML = undo_object.xaT2_p[i];
            sfT2_g[i].innerHTML = undo_object.sfT2_g[i];
            saT2_g[i].innerHTML = undo_object.saT2_g[i];
            gfT2_g[i].innerHTML = undo_object.gfT2_g[i];
            gaT2_g[i].innerHTML = undo_object.gaT2_g[i];
            pmT2_g[i].innerHTML = undo_object.pmT2_g[i];
            bfT2_g[i].innerHTML = undo_object.bfT2_g[i];
            baT2_g[i].innerHTML = undo_object.baT2_g[i];
            mfT2_g[i].innerHTML = undo_object.mfT2_g[i];
            maT2_g[i].innerHTML = undo_object.maT2_g[i];
            safT2_g[i].innerHTML = undo_object.safT2_g[i];
            saaT2_g[i].innerHTML = undo_object.saaT2_g[i];
            xfT2_g[i].innerHTML = undo_object.xfT2_g[i];
            xaT2_g[i].innerHTML = undo_object.xaT2_g[i];
        }

        document.getElementById("undo").disabled = true; // Disable Undo-button
    }

    function drawChart() {

        // xG Game Chart

        var chartData = google.visualization.arrayToDataTable([
             ['Line', name_t1, { role: 'style' }, { role: 'annotation' }, name_t2, { role: 'style' }, { role: 'annotation' } ],
             ['Line 1', Number(xGf_g[0]), 'color: #002072', Number(xGf_g[0]), Number(xGfT2_g[0]), 'color: #59D9EB', Number(xGfT2_g[0]) ],
             ['Line 2', Number(xGf_g[1]), 'color: #002072', Number(xGf_g[1]), Number(xGfT2_g[1]), 'color: #59D9EB', Number(xGfT2_g[1]) ],
             ['Line 3', Number(xGf_g[2]), 'color: #002072', Number(xGf_g[2]), Number(xGfT2_g[2]), 'color: #59D9EB', Number(xGfT2_g[2]) ],
             ['PP', Number(xGf_g[3]) + Number(xGf_g[4]), 'color: #002072', Number(xGf_g[3]) + Number(xGf_g[4]), Number(xGfT2_g[3]) + Number(xGfT2_g[4]), 'color: #59D9EB', Number(xGfT2_g[3]) + Number(xGfT2_g[4]) ],
             ['SH', Number(xGf_g[5]) + Number(xGf_g[6]), 'color: #002072', Number(xGf_g[5]) + Number(xGf_g[6]), Number(xGfT2_g[5]) + Number(xGfT2_g[6]), 'color: #59D9EB', Number(xGfT2_g[5]) + Number(xGfT2_g[6]) ]
          ]);

        // Period data
        var chartData_p = google.visualization.arrayToDataTable([
             ['Line', name_t1, { role: 'style' }, { role: 'annotation' }, name_t2, { role: 'style' }, { role: 'annotation' } ],
             ['Line 1', Number(xGf_p[0]), 'color: #002072', Number(xGf_p[0]), Number(xGfT2_p[0]), 'color: #59D9EB', Number(xGfT2_p[0]) ],
             ['Line 2', Number(xGf_p[1]), 'color: #002072', Number(xGf_p[1]), Number(xGfT2_p[1]), 'color: #59D9EB', Number(xGfT2_p[1]) ],
             ['Line 3', Number(xGf_p[2]), 'color: #002072', Number(xGf_p[2]), Number(xGfT2_p[2]), 'color: #59D9EB', Number(xGfT2_p[2]) ],
             ['PP', Number(xGf_p[3]) + Number(xGf_p[4]), 'color: #002072', Number(xGf_p[3]) + Number(xGf_p[4]), Number(xGfT2_p[3]) + Number(xGfT2_p[4]), 'color: #59D9EB', Number(xGfT2_p[3]) + Number(xGfT2_p[4]) ],
             ['SH', Number(xGf_p[5]) + Number(xGf_p[6]), 'color: #002072', Number(xGf_p[5]) + Number(xGf_p[6]), Number(xGfT2_p[5]) + Number(xGfT2_p[6]), 'color: #59D9EB', Number(xGfT2_p[5]) + Number(xGfT2_p[6]) ]
          ]);

        var options = {
            title: 'xG by Line',
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        var chart = new google.visualization.BarChart(document.getElementById('xGGame_chart'));
        chart.draw(chartData, options);

        var chart_per = new google.visualization.BarChart(document.getElementById('xGGame_chart_' + periodN));
        chart_per.draw(chartData_p, options);

        //xG% GameChart

        xGL1T1 = calcPercent(Number(xGf_g[0]), Number(xGa_g[0]));
        xGL1T2 = calcPercent(Number(xGfT2_g[0]), Number(xGaT2_g[0]));
        xGL2T1 = calcPercent(Number(xGf_g[1]), Number(xGa_g[1]));
        xGL2T2 = calcPercent(Number(xGfT2_g[1]), Number(xGaT2_g[1]));
        xGL3T1 = calcPercent(Number(xGf_g[2]), Number(xGa_g[2]));
        xGL3T2 = calcPercent(Number(xGfT2_g[2]), Number(xGaT2_g[2]));

        var chartData = google.visualization.arrayToDataTable([
             ['Line', name_t1, { role: 'style' }, { role: 'annotation' }, name_t2, { role: 'style' }, { role: 'annotation' } ],
             ['Line 1', xGL1T1, 'color: #002072', xGL1T1 + "%", xGL1T2, 'color: #59D9EB', xGL1T2 + "%" ],
             ['Line 2', xGL2T1, 'color: #002072', xGL2T1 + "%", xGL2T2, 'color: #59D9EB', xGL2T2 + "%" ],
             ['Line 3', xGL3T1, 'color: #002072', xGL3T1 + "%", xGL3T2, 'color: #59D9EB', xGL3T2 + "%" ]
        ]);

        // Period data
        xGL1T1 = calcPercent(Number(xGf_p[0]), Number(xGa_p[0]));
        xGL1T2 = calcPercent(Number(xGfT2_p[0]), Number(xGaT2_p[0]));
        xGL2T1 = calcPercent(Number(xGf_p[1]), Number(xGa_p[1]));
        xGL2T2 = calcPercent(Number(xGfT2_p[1]), Number(xGaT2_p[1]));
        xGL3T1 = calcPercent(Number(xGf_p[2]), Number(xGa_p[2]));
        xGL3T2 = calcPercent(Number(xGfT2_p[2]), Number(xGaT2_p[2]));

        var chartData_p = google.visualization.arrayToDataTable([
             ['Line', name_t1, { role: 'style' }, { role: 'annotation' }, name_t2, { role: 'style' }, { role: 'annotation' } ],
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

        var chart = new google.visualization.BarChart(document.getElementById('xG%Game_chart'));
        chart.draw(chartData, options);

        var chart_per = new google.visualization.BarChart(document.getElementById('xG%Game_chart_' + periodN));
        chart_per.draw(chartData_p, options);

        // Team 1 Player xG chart

        var pldata = new google.visualization.DataTable();
        pldata.addColumn('string', 'Name');
        pldata.addColumn('number', 'Shot xG');
        pldata.addColumn('number', 'Pass xG');
        pldata.addColumn('number', 'Goals');
        pldata.addColumn('number', 'Ass.');
        pldata.addColumn('number', 'Shots');
        pldata.addColumn('number', 'Shotass.');

        for(i = 1; i < plT1_array.length; i++){
            pldata.addRow([plT1_array[i][1], plT1_array[i][2], plT1_array[i][3], plT1_array[i][4], plT1_array[i][5], plT1_array[i][6], plT1_array[i][7]]);
        }

        var pldata_p = new google.visualization.DataTable();
        pldata_p.addColumn('string', 'Name');
        pldata_p.addColumn('number', 'Shot xG');
        pldata_p.addColumn('number', 'Pass xG');
        pldata_p.addColumn('number', 'Goals');
        pldata_p.addColumn('number', 'Ass.');
        pldata_p.addColumn('number', 'Shots');
        pldata_p.addColumn('number', 'Shotass.');

        for(i = 1; i < plT1p_array.length; i++){
            pldata_p.addRow([plT1p_array[i][1], plT1p_array[i][2], plT1p_array[i][3], plT1p_array[i][4], plT1p_array[i][5], plT1p_array[i][6], plT1p_array[i][7]]);
        }

        var options = {
            title: 'Individual stats Team 1',
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };


        // Create and draw the visualization.
        var chart = new google.visualization.Table(document.getElementById('T1plstats'));
        chart.draw(pldata, options);

        var chart_per = new google.visualization.Table(document.getElementById('T1plstats_' + periodN));
        chart_per.draw(pldata_p, options);

        // Add sort listener

        google.visualization.events.addListener(chart, 'sort',
        function(event) {
            pldata.sort([{column: event.column, desc: event.ascending}]);
            chart.draw(pldata, options);
        });

        google.visualization.events.addListener(chart_per, 'sort',
        function(event) {
            pldata_p.sort([{column: event.column, desc: event.ascending}]);
            chart_per.draw(pldata_p, options);
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

        for(i = 1; i < plT2_array.length; i++){
            pldata.addRow([plT2_array[i][1], plT2_array[i][2], plT2_array[i][3], plT2_array[i][4], plT2_array[i][5],plT2_array[i][6], plT2_array[i][7]]);
        }

        var pldata_p = new google.visualization.DataTable();
        pldata_p.addColumn('string', 'Name');
        pldata_p.addColumn('number', 'Shot xG');
        pldata_p.addColumn('number', 'Pass xG');
        pldata_p.addColumn('number', 'Goals');
        pldata_p.addColumn('number', 'Ass.');
        pldata_p.addColumn('number', 'Shots');
        pldata_p.addColumn('number', 'Shotass.');

        for(i = 1; i < plT2p_array.length; i++){
            pldata_p.addRow([plT2p_array[i][1], plT2p_array[i][2], plT2p_array[i][3], plT2p_array[i][4], plT2p_array[i][5], plT2p_array[i][6], plT2p_array[i][7]]);
        }

        var options = {
            title: 'Individual stats Team 2',
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        // Create and draw the visualization.
        var chart = new google.visualization.Table(document.getElementById('T2plstats'));
        chart.draw(pldata, options);

        var chart_per = new google.visualization.Table(document.getElementById('T2plstats_' + periodN));
        chart_per.draw(pldata_p, options);

        // Add sort listener

        google.visualization.events.addListener(chart, 'sort',
        function(event) {
            pldata.sort([{column: event.column, desc: event.ascending}]);
            chart.draw(pldata, options);
        });

        google.visualization.events.addListener(chart_per, 'sort',
        function(event) {
            pldata_p.sort([{column: event.column, desc: event.ascending}]);
            chart_per.draw(pldata_p, options);
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
            ['Line 1', toc_g[0].innerHTML, Number(xf_g[0].textContent), Number(xa_g[0]. textContent), Number(gf_g[0].textContent), Number(ga_g[0]. textContent), Number(sf_g[0].textContent), Number(sa_g[0].textContent), Number(p_g[0].textContent), stxGT1L1g_array[0] + stxGT1L1g_array[1], stxGT1L1g_array[2] + stxGT1L1g_array[3] + stxGT1L1g_array[4]],
            ['Line 2', toc_g[1].innerHTML, Number(xf_g[1].textContent), Number(xa_g[1]. textContent), Number(gf_g[1].textContent), Number(ga_g[1]. textContent), Number(sf_g[1].textContent), Number(sa_g[1].textContent), Number(p_g[1].textContent), stxGT1L2g_array[0] + stxGT1L2g_array[1], stxGT1L2g_array[2] + stxGT1L2g_array[3] + stxGT1L2g_array[4]],
            ['Line 3', toc_g[2].innerHTML, Number(xf_g[2].textContent), Number(xa_g[2]. textContent), Number(gf_g[2].textContent), Number(ga_g[2]. textContent), Number(sf_g[2].textContent), Number(sa_g[2].textContent), Number(p_g[2].textContent), stxGT1L3g_array[0] + stxGT1L3g_array[1], stxGT1L3g_array[2] + stxGT1L3g_array[3] + stxGT1L3g_array[4]],
            ['Powerplay', toc_g[3].innerHTML, Number(xf_g[3].textContent), Number(xa_g[3]. textContent), Number(gf_g[3].textContent), Number(ga_g[3]. textContent), Number(sf_g[3].textContent), Number(sa_g[3].textContent), Number(p_g[3].textContent), 0, 0],
            ['Pen. Kill', toc_g[4].innerHTML, Number(xf_g[5].textContent), Number(xa_g[5]. textContent), Number(gf_g[5].textContent), Number(ga_g[5]. textContent), Number(sf_g[5].textContent), Number(sa_g[5].textContent), Number(p_g[5].textContent), 0, 0],
            ['6vs5', toc_g[5].innerHTML, Number(xf_g[4].textContent), Number(xa_g[4]. textContent), Number(gf_g[4].textContent), Number(ga_g[4].textContent), Number(sf_g[4].textContent), Number(sa_g[4].textContent), Number(p_g[4].textContent), 0, 0],
            ['5vs6', toc_g[6].innerHTML, Number(xf_g[6].textContent), Number(xa_g[6]. textContent), Number(gf_g[6].textContent), Number(ga_g[6].textContent), Number(sf_g[6].textContent), Number(sa_g[6].textContent), Number(p_g[6].textContent), 0, 0],
            ['Team', toc_g[7].innerHTML, Number(xf_g[7].textContent), Number(xa_g[7]. textContent), Number(gf_g[7].textContent), Number(ga_g[7].textContent), Number(sf_g[7].textContent), Number(sa_g[7].textContent), Number(p_g[7].textContent), stxGT1Teamg_array[0] + stxGT1Teamg_array[1], stxGT1Teamg_array[2] + stxGT1Teamg_array[3] + stxGT1Teamg_array[4]],

            ]);

        var pldata1_p = new google.visualization.DataTable();
        pldata1_p.addColumn('string', 'Line');
        pldata1_p.addColumn('string', 'ToC');
        pldata1_p.addColumn('number', 'xG for');
        pldata1_p.addColumn('number', 'xG ag.');
        pldata1_p.addColumn('number', 'Plus');
        pldata1_p.addColumn('number', 'Minus');
        pldata1_p.addColumn('number', 'CF');
        pldata1_p.addColumn('number', 'CA');
        pldata1_p.addColumn('number', 'Pos%');
        pldata1_p.addColumn('number', 'xG Turnov.');
        pldata1_p.addColumn('number', 'xG org.att. ');

        pldata1_p.addRows([
            ['Line 1', toc_p[0].innerHTML, Number(xf_p[0].textContent), Number(xa_p[0]. textContent), Number(gf_p[0].textContent), Number(ga_p[0]. textContent), Number(sf_p[0].textContent), Number(sa_p[0].textContent), Number(p_p[0].textContent), stxGT1L1g_array[0] + stxGT1L1g_array[1], stxGT1L1g_array[2] + stxGT1L1g_array[3] + stxGT1L1g_array[4]],
            ['Line 2', toc_p[1].innerHTML, Number(xf_p[1].textContent), Number(xa_p[1]. textContent), Number(gf_p[1].textContent), Number(ga_p[1]. textContent), Number(sf_p[1].textContent), Number(sa_p[1].textContent), Number(p_p[1].textContent), stxGT1L2g_array[0] + stxGT1L2g_array[1], stxGT1L2g_array[2] + stxGT1L2g_array[3] + stxGT1L2g_array[4]],
            ['Line 3', toc_p[2].innerHTML, Number(xf_p[2].textContent), Number(xa_p[2]. textContent), Number(gf_p[2].textContent), Number(ga_p[2]. textContent), Number(sf_p[2].textContent), Number(sa_p[2].textContent), Number(p_p[2].textContent), stxGT1L3g_array[0] + stxGT1L3g_array[1], stxGT1L3g_array[2] + stxGT1L3g_array[3] + stxGT1L3g_array[4]],
            ['Powerplay', toc_p[3].innerHTML, Number(xf_p[3].textContent), Number(xa_p[3]. textContent), Number(gf_p[3].textContent), Number(ga_p[3]. textContent), Number(sf_p[3].textContent), Number(sa_p[3].textContent), Number(p_p[3].textContent), 0, 0],
            ['Pen. Kill', toc_p[4].innerHTML, Number(xf_p[5].textContent), Number(xa_p[5]. textContent), Number(gf_p[5].textContent), Number(ga_p[5]. textContent), Number(sf_p[5].textContent), Number(sa_p[5].textContent), Number(p_p[5].textContent), 0, 0],
            ['6vs5', toc_p[5].innerHTML, Number(xf_p[4].textContent), Number(xa_p[4]. textContent), Number(gf_p[4].textContent), Number(ga_p[4].textContent), Number(sf_p[4].textContent), Number(sa_p[4].textContent), Number(p_p[4].textContent), 0, 0],
            ['5vs6', toc_p[6].innerHTML, Number(xf_p[6].textContent), Number(xa_p[6]. textContent), Number(gf_p[6].textContent), Number(ga_p[6].textContent), Number(sf_p[6].textContent), Number(sa_p[6].textContent), Number(p_p[6].textContent), 0, 0],
            ['Team', toc_p[7].innerHTML, Number(xf_p[7].textContent), Number(xa_p[7]. textContent), Number(gf_p[7].textContent), Number(ga_p[7].textContent), Number(sf_p[7].textContent), Number(sa_p[7].textContent), Number(p_p[7].textContent), stxGT1Teamg_array[0] + stxGT1Teamg_array[1], stxGT1Teamg_array[2] + stxGT1Teamg_array[3] + stxGT1Teamg_array[4]],

            ]);


        var options = {
            title: 'Line stats, Team 1',
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        // Create and draw the visualization.
        var chart = new google.visualization.Table(document.getElementById('T1linestats'));
        chart.draw(pldata1, options);

        var chart_per = new google.visualization.Table(document.getElementById('T1linestats_' + periodN));
        chart_per.draw(pldata1_p, options);

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
            ['Line 1', tocT2_g[0].innerHTML, Number(xfT2_g[0].textContent), Number(xaT2_g[0]. textContent), Number(gfT2_g[0].textContent), Number(gaT2_g[0]. textContent), Number(sfT2_g[0].textContent), Number(saT2_g[0].textContent), Number(pT2_g[0].textContent), stxGT2L1g_array[0] + stxGT2L1g_array[1], stxGT2L1g_array[2] + stxGT2L1g_array[3] + stxGT2L1g_array[4]],
            ['Line 2', tocT2_g[1].innerHTML, Number(xfT2_g[1].textContent), Number(xaT2_g[1]. textContent), Number(gfT2_g[1].textContent), Number(gaT2_g[1]. textContent), Number(sfT2_g[1].textContent), Number(saT2_g[1].textContent), Number(pT2_g[1].textContent), stxGT2L2g_array[0] + stxGT2L2g_array[1], stxGT2L2g_array[2] + stxGT2L2g_array[3] + stxGT2L2g_array[4]],
            ['Line 3', tocT2_g[2].innerHTML, Number(xfT2_g[2].textContent), Number(xaT2_g[2]. textContent), Number(gfT2_g[2].textContent), Number(gaT2_g[2]. textContent), Number(sfT2_g[2].textContent), Number(saT2_g[2].textContent), Number(pT2_g[2].textContent), stxGT2L3g_array[0] + stxGT2L3g_array[1], stxGT2L3g_array[2] + stxGT2L3g_array[3] + stxGT2L3g_array[4]],
            ['Powerplay', tocT2_g[3].innerHTML, Number(xfT2_g[3].textContent), Number(xaT2_g[3]. textContent), Number(gfT2_g[3].textContent), Number(gaT2_g[3]. textContent), Number(sfT2_g[3].textContent), Number(saT2_g[3].textContent), Number(pT2_g[3].textContent), 0, 0],
            ['Pen. Kill', tocT2_g[4].innerHTML, Number(xfT2_g[5].textContent), Number(xaT2_g[5]. textContent), Number(gfT2_g[5].textContent), Number(gaT2_g[5]. textContent), Number(sfT2_g[5].textContent), Number(saT2_g[5].textContent), Number(pT2_g[5].textContent), 0, 0],
            ['6vs5', tocT2_g[5].innerHTML, Number(xfT2_g[4].textContent), Number(xaT2_g[4]. textContent), Number(gfT2_g[4].textContent), Number(gaT2_g[4].textContent), Number(sfT2_g[4].textContent), Number(saT2_g[4].textContent), Number(pT2_g[4].textContent), 0, 0],
            ['5vs6', tocT2_g[6].innerHTML, Number(xfT2_g[6].textContent), Number(xaT2_g[6]. textContent), Number(gfT2_g[6].textContent), Number(gaT2_g[6].textContent), Number(sfT2_g[6].textContent), Number(saT2_g[6].textContent), Number(pT2_g[6].textContent), 0, 0],
            ['Team', tocT2_g[7].innerHTML, Number(xfT2_g[7].textContent), Number(xaT2_g[7]. textContent), Number(gfT2_g[7].textContent), Number(gaT2_g[7].textContent), Number(sfT2_g[7].textContent), Number(saT2_g[7].textContent), Number(pT2_g[7].textContent), stxGT2Teamg_array[0] + stxGT2Teamg_array[1], stxGT2Teamg_array[2] + stxGT2Teamg_array[3] + stxGT2Teamg_array[4]]

            ]);

        var pldata2_p = new google.visualization.DataTable();
        pldata2_p.addColumn('string', 'Line');
        pldata2_p.addColumn('string', 'ToC');
        pldata2_p.addColumn('number', 'xG for');
        pldata2_p.addColumn('number', 'xG ag.');
        pldata2_p.addColumn('number', 'Plus');
        pldata2_p.addColumn('number', 'Minus');
        pldata2_p.addColumn('number', 'CF');
        pldata2_p.addColumn('number', 'CA');
        pldata2_p.addColumn('number', 'Pos%');
        pldata2_p.addColumn('number', 'xG Turnov.');
        pldata2_p.addColumn('number', 'xG org.att. ');

        pldata2_p.addRows([
            ['Line 1', tocT2_p[0].innerHTML, Number(xfT2_p[0].textContent), Number(xaT2_p[0]. textContent), Number(gfT2_p[0].textContent), Number(gaT2_p[0]. textContent), Number(sfT2_p[0].textContent), Number(saT2_p[0].textContent), Number(pT2_p[0].textContent), stxGT2L1g_array[0] + stxGT2L1g_array[1], stxGT2L1g_array[2] + stxGT2L1g_array[3] + stxGT2L1g_array[4]],
            ['Line 2', tocT2_p[1].innerHTML, Number(xfT2_p[1].textContent), Number(xaT2_p[1]. textContent), Number(gfT2_p[1].textContent), Number(gaT2_p[1]. textContent), Number(sfT2_p[1].textContent), Number(saT2_p[1].textContent), Number(pT2_p[1].textContent), stxGT2L2g_array[0] + stxGT2L2g_array[1], stxGT2L2g_array[2] + stxGT2L2g_array[3] + stxGT2L2g_array[4]],
            ['Line 3', tocT2_p[2].innerHTML, Number(xfT2_p[2].textContent), Number(xaT2_p[2]. textContent), Number(gfT2_p[2].textContent), Number(gaT2_p[2]. textContent), Number(sfT2_p[2].textContent), Number(saT2_p[2].textContent), Number(pT2_p[2].textContent), stxGT2L3g_array[0] + stxGT2L3g_array[1], stxGT2L3g_array[2] + stxGT2L3g_array[3] + stxGT2L3g_array[4]],
            ['Powerplay', tocT2_p[3].innerHTML, Number(xfT2_p[3].textContent), Number(xaT2_p[3]. textContent), Number(gfT2_p[3].textContent), Number(gaT2_p[3]. textContent), Number(sfT2_p[3].textContent), Number(saT2_p[3].textContent), Number(pT2_p[3].textContent), 0, 0],
            ['Pen. Kill', tocT2_p[4].innerHTML, Number(xfT2_p[5].textContent), Number(xaT2_p[5]. textContent), Number(gfT2_p[5].textContent), Number(gaT2_p[5]. textContent), Number(sfT2_p[5].textContent), Number(saT2_p[5].textContent), Number(pT2_p[5].textContent), 0, 0],
            ['6vs5', tocT2_p[5].innerHTML, Number(xfT2_p[4].textContent), Number(xaT2_p[4]. textContent), Number(gfT2_p[4].textContent), Number(gaT2_p[4].textContent), Number(sfT2_p[4].textContent), Number(saT2_p[4].textContent), Number(pT2_p[4].textContent), 0, 0],
            ['5vs6', tocT2_p[6].innerHTML, Number(xfT2_p[6].textContent), Number(xaT2_p[6]. textContent), Number(gfT2_p[6].textContent), Number(gaT2_p[6].textContent), Number(sfT2_p[6].textContent), Number(saT2_p[6].textContent), Number(pT2_p[6].textContent), 0, 0],
            ['Team', tocT2_p[7].innerHTML, Number(xfT2_p[7].textContent), Number(xaT2_p[7]. textContent), Number(gfT2_p[7].textContent), Number(gaT2_p[7].textContent), Number(sfT2_p[7].textContent), Number(saT2_p[7].textContent), Number(pT2_p[7].textContent), stxGT2Teamg_array[0] + stxGT2Teamg_array[1], stxGT2Teamg_array[2] + stxGT2Teamg_array[3] + stxGT2Teamg_array[4]]

            ]);

        var options = {
            title: 'Line stats, Team 2',
            bar: {groupWidth: "95%"},
            legend: { position: 'bottom'},
            colors: ['#002072', '#59D9EB'],
            hAxis: { textPosition: 'none' }
            };

        // Create and draw the visualization.
        var chart2 = new google.visualization.Table(document.getElementById('T2linestats'));
        chart2.draw(pldata2, options);

        var chart2_per = new google.visualization.Table(document.getElementById('T2linestats_' + periodN));
        chart2_per.draw(pldata2_p, options);

        // Pie Chart, xG per type Team 1

        var data = new google.visualization.arrayToDataTable([
        ['Type', 'xG'],
        ['Turnovers, one-timer', stxGT1Teamg_array[0]],
        ['Turnovers, direct', stxGT1Teamg_array[1]],
        ['Org.attack, one-timer', stxGT1Teamg_array[2]],
        ['Org.attack, direct', stxGT1Teamg_array[4]],
        ['Rebounds',  stxGT1Teamg_array[3]]

        ]);

        var data_p = new google.visualization.arrayToDataTable([
        ['Type', 'xG'],
        ['Turnovers, one-timer', stxGT1Teamp_array[0]],
        ['Turnovers, direct', stxGT1Teamp_array[1]],
        ['Org.attack, one-timer', stxGT1Teamp_array[2]],
        ['Org.attack, direct', stxGT1Teamp_array[4]],
        ['Rebounds',  stxGT1Teamp_array[3]]

        ]);

        var options2 = {
        title: 'Share of xG by attack types',
        colors: ['#006400', '#7CFC00','#000000','#0000FF','#D3D3D3'],
        is3D: true,
        };

        var chart = new google.visualization.PieChart(document.getElementById('T1_st_piechart'));
        chart.draw(data, options2);

        var chart_per = new google.visualization.PieChart(document.getElementById('T1_st_piechart_' + periodN));
        chart_per.draw(data_p, options2);

        // Pie Chart, xG per type Team 2

        var data2 = new google.visualization.arrayToDataTable([
        ['Type', 'xG'],
        ['Turnover, one-timer', stxGT2Teamg_array[0]],
        ['Turnover, direct', + stxGT2Teamg_array[1]],
        ['Org. attack, one-timer', stxGT2Teamg_array[2]],
        ['Org. attack, direct', stxGT2Teamg_array[4]],
        ['Rebound', stxGT2Teamg_array[3]]

        ]);

        var data2_p = new google.visualization.arrayToDataTable([
        ['Type', 'xG'],
        ['Turnover, one-timer', stxGT2Teamp_array[0]],
        ['Turnover, direct', + stxGT2Teamp_array[1]],
        ['Org. attack, one-timer', stxGT2Teamp_array[2]],
        ['Org. attack, direct', stxGT2Teamp_array[4]],
        ['Rebounds', stxGT2Teamp_array[3]]

        ]);

        var options2 = {
        title: 'Share of xG by attack/shot types',
        colors: ['#8B4513', '#FFA500','#8B0000','#FF4500', '#D3D3D3'],
        is3D: true,
        };

        var chart = new google.visualization.PieChart(document.getElementById('T2_st_piechart'));
        chart.draw(data2, options2);

        var chart_per = new google.visualization.PieChart(document.getElementById('T2_st_piechart_' + periodN));
        chart_per.draw(data2_p, options2);

        // Team xG Chart
        var data = google.visualization.arrayToDataTable(xGTeam_array);

        var options = {
          title: 'xG by Team',
          curveType: 'function',
          legend: { position: 'bottom' },
          seriesType: 'lines',
          series: {
              2:{type: 'bars', color: 'blue'},
              3:{type: 'bars', color: 'red'}}
        };

        var chart = new google.visualization.ComboChart(document.getElementById('xGTeam_chart'));
        chart.draw(data, options);

        // Line 1 xG Chart
        var data = google.visualization.arrayToDataTable(xGL1_array);

        var options = {
          title: 'xG by Line 1',
          curveType: 'function',
          legend: { position: 'bottom' },
          seriesType: 'lines',
          series: {
              2:{type: 'bars', color: 'blue'},
              3:{type: 'bars', color: 'red'}}
        };

        var chart = new google.visualization.ComboChart(document.getElementById('xGL1_chart'));
        chart.draw(data, options);

        // Line 2 xG Chart
        var data = google.visualization.arrayToDataTable(xGL2_array);

        var options = {
          title: 'xG by Line 2',
          curveType: 'function',
          legend: { position: 'bottom' },
          seriesType: 'lines',
          series: {
              2:{type: 'bars', color: 'blue'},
              3:{type: 'bars', color: 'red'}}
        };

        var chart = new google.visualization.ComboChart(document.getElementById('xGL2_chart'));
        chart.draw(data, options);

        // Line 3 xG Chart
        var data = google.visualization.arrayToDataTable(xGL3_array);

        var options1 = {
          title: 'xG by Line 3',
          curveType: 'function',
          legend: { position: 'bottom' },
          seriesType: 'lines',
          series: {
              2:{type: 'bars', color: 'blue'},
              3:{type: 'bars', color: 'red'}}
        };

        var chart = new google.visualization.ComboChart(document.getElementById('xGL3_chart'));
        chart.draw(data, options1);

        // Turnover chart

         var chartData = google.visualization.arrayToDataTable([
             ['Line', name_t1, { role: 'style' }, { role: 'annotation' }, name_t2, { role: 'style' }, { role: 'annotation' } ],
             ['Line 1', stT1L1g_array[0] + stT1L1g_array[1], 'color: #002072', stT1L1g_array[0] + stT1L1g_array[1], stT2L1g_array[0] + stT2L1g_array[1], 'color: #0000FF', stT2L1g_array[0] + stT2L1g_array[1]],
             ['Line 2', stT1L2g_array[0] + stT1L2g_array[1], 'color: #002072', stT1L2g_array[0] + stT1L2g_array[1], stT2L2g_array[0] + stT2L2g_array[1], 'color: #0000FF', stT2L2g_array[0] + stT2L2g_array[1]],
             ['Line 3', stT1L3g_array[0] + stT1L3g_array[1], 'color: #002072', stT1L3g_array[0] + stT1L3g_array[1], stT2L3g_array[0] + stT2L3g_array[1], 'color: #0000FF', stT2L3g_array[0] + stT2L3g_array[1]
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


       // Team 1 typechart

        var chartDataX = google.visualization.arrayToDataTable([
            ['Type', 'TO One-timer', {role: 'style'}, {role: 'annotation'}, 'TO Direct', {role:'style'}, {role: 'annotation '}, 'One-timer', {role: 'style'}, {role: 'annotation'}, 'Direct', {role: 'style'}, {role: 'annotation'}],
            ['Line1', stT1L1g_array[0], 'color: #006400', stT1L1g_array[0], stT1L1g_array[1], 'color: #7CFC00', stT1L1g_array[1], stT1L1g_array[2], 'color: #000000', stT1L1g_array[2], stT1L1g_array[4], 'color: #0000FF', stT1L1g_array[4]],
            ['Line2', stT1L2g_array[0], 'color: #006400', stT1L2g_array[0], stT1L2g_array[1], 'color: #7CFC00', stT1L2g_array[1], stT1L2g_array[2], 'color: #000000', stT1L2g_array[2], stT1L2g_array[4], 'color: #0000FF', stT1L2g_array[4]],
            ['Line3', stT1L3g_array[0], 'color: #006400', stT1L3g_array[0], stT1L3g_array[1], 'color: #7CFC00', stT1L3g_array[1], stT1L3g_array[2], 'color: #000000', stT1L3g_array[2], stT1L3g_array[4], 'color: #0000FF', stT1L3g_array[4]
            ]
         ]);

        var chartDataX_p = google.visualization.arrayToDataTable([
            ['Type', 'TO One-timer', {role: 'style'}, {role: 'annotation'}, 'TO Direct', {role:'style'}, {role: 'annotation '}, 'One-timer', {role: 'style'}, {role: 'annotation'}, 'Direct', {role: 'style'}, {role: 'annotation'}],
            ['Line1', stT1L1p_array[0], 'color: #006400', stT1L1p_array[0], stT1L1p_array[1], 'color: #7CFC00', stT1L1p_array[1], stT1L1p_array[2], 'color: #000000', stT1L1p_array[2], stT1L1p_array[4], 'color: #0000FF', stT1L1p_array[4]],
            ['Line2', stT1L2p_array[0], 'color: #006400', stT1L2p_array[0], stT1L2p_array[1], 'color: #7CFC00', stT1L2p_array[1], stT1L2p_array[2], 'color: #000000', stT1L2p_array[2], stT1L2p_array[4], 'color: #0000FF', stT1L2p_array[4]],
            ['Line3', stT1L3p_array[0], 'color: #006400', stT1L3p_array[0], stT1L3p_array[1], 'color: #7CFC00', stT1L3p_array[1], stT1L3p_array[2], 'color: #000000', stT1L3p_array[2], stT1L3p_array[4], 'color: #0000FF', stT1L3p_array[4]
            ]
         ]);

        var options = {
            title: 'Shot types, Team 1',
            bar: {groupWidth: "75%"},
            legend: { position: 'bottom'},
            colors: ['#006400', '#7CFC00','#000000','#0000FF'],
            hAxis: { textPosition: 'none' }
            };

        var chart2 = new google.visualization.ColumnChart(document.getElementById('T1_typechart'));
        chart2.draw(chartDataX, options);

        var chart2_per = new google.visualization.ColumnChart(document.getElementById('T1_typechart_' + periodN));
        chart2_per.draw(chartDataX_p, options);

        // Team 2 typechart

        var chartDataY = google.visualization.arrayToDataTable([
            ['Type', 'TO One-timer', {role: 'style'}, {role: 'annotation'}, 'TO Direct', {role:'style'}, {role: 'annotation '}, 'One-timer', {role: 'style'}, {role: 'annotation'}, 'Direct', {role: 'style'}, {role: 'annotation'}],
            ['Line1', stT2L1g_array[0], 'color: #8B4513', stT2L1g_array[0], stT2L1g_array[1], 'color: #FFA500', stT2L1g_array[1], stT2L1g_array[2], 'color: #8B0000', stT2L1g_array[2], stT2L1g_array[4], 'color: #FF4500', stT2L1g_array[4]],
            ['Line2', stT2L2g_array[0], 'color: #8B4513', stT2L2g_array[0], stT2L2g_array[1], 'color: #FFA500', stT2L2g_array[1], stT2L2g_array[2], 'color: #8B0000', stT2L2g_array[2], stT2L2g_array[4], 'color: #FF4500', stT2L2g_array[4]],
            ['Line3', stT2L3g_array[0], 'color: #8B4513', stT2L3g_array[0], stT2L3g_array[1], 'color: #FFA500', stT2L3g_array[1], stT2L3g_array[2], 'color: #8B0000', stT2L3g_array[2], stT2L3g_array[4], 'color: #FF4500', stT2L3g_array[4]
            ]
         ]);

        var chartDataY_p = google.visualization.arrayToDataTable([
            ['Type', 'TO One-timer', {role: 'style'}, {role: 'annotation'}, 'TO Direct', {role:'style'}, {role: 'annotation '}, 'One-timer', {role: 'style'}, {role: 'annotation'}, 'Direct', {role: 'style'}, {role: 'annotation'}],
            ['Line1', stT2L1p_array[0], 'color: #8B4513', stT2L1p_array[0], stT2L1p_array[1], 'color: #FFA500', stT2L1p_array[1], stT2L1p_array[2], 'color: #8B0000', stT2L1p_array[2], stT2L1p_array[4], 'color: #FF4500', stT2L1p_array[4]],
            ['Line2', stT2L2p_array[0], 'color: #8B4513', stT2L2p_array[0], stT2L2p_array[1], 'color: #FFA500', stT2L2p_array[1], stT2L2p_array[2], 'color: #8B0000', stT2L2p_array[2], stT2L2p_array[4], 'color: #FF4500', stT2L2p_array[4]],
            ['Line3', stT2L3p_array[0], 'color: #8B4513', stT2L3p_array[0], stT2L3p_array[1], 'color: #FFA500', stT2L3p_array[1], stT2L3p_array[2], 'color: #8B0000', stT2L3p_array[2], stT2L3p_array[4], 'color: #FF4500', stT2L3p_array[4]
            ]
         ]);

        var options = {
            title: 'Shot types, Team 2',
            bar: {groupWidth: "75%"},
            legend: { position: 'bottom'},
            colors: ['#8B4513', '#FFA500','#8B0000','#FF4500'],
            hAxis: { textPosition: 'none' }
            };

        var chartX = new google.visualization.ColumnChart(document.getElementById('T2_typechart'));
        chartX.draw(chartDataY, options);

        var chartX_per = new google.visualization.ColumnChart(document.getElementById('T2_typechart_' + periodN));
        chartX_per.draw(chartDataY_p, options);

    }

    function loadGame() {

        game_id = load_game.options[load_game.selectedIndex].value;

        fetch("https://fbscanner.io/apis/games/" + game_id + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                undo_object = data.game_data;
                data_object = data.game_data;
                undoButton()
                name_t1 = data.game_data.name_t1;
                name_t2 = data.game_data.name_t2;
                set_t1_names()
                set_t2_names()
                live = data.game_data.live;
                if (live == 0) {document.getElementById("ck1a").checked = false;}
                document.getElementById("ck1a").disabled = true;
                document.getElementById('select-date').value = data.date;
                counter = data.game_data.counter;
                gameCounter = data.game_data.gameCounter;
                var date = new Date(counter * 1000);
                var display = date.toISOString().substr(11, 8);
                document.getElementById("label").innerHTML = display;
                periodN = data.game_data.periodN;
                document.getElementById("periodNr").innerHTML = "Period " + periodN;
                started = 0;
                sData.style.display = "block";
                var opt = new Option(name_t1, data.teams[0]);
                s_T1.appendChild(opt);
                s_T1.selectedIndex = s_T1.length - 1;
                changeTeam1()
                var opt = new Option(name_t2, data.teams[1]);
                s_T2.appendChild(opt);
                s_T2.selectedIndex = s_T1.length - 1;
                changeTeam2()
                drawChart(); // Update charts
            })

        .catch((error) => {
            console.error('Error:', error);
        });
    }