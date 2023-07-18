
    // Load and draw the shot map image when the html-page is loaded
    window.onload = function() {
    var ctx = cnvs.getContext("2d");
    ctx.drawImage(myImg,0,0,fWidth,fLength);
    }
    window.onbeforeunload = function() {
      return "Dude, are you sure you want to leave? Think of the kittens!";
    }

    // Variables

    let xG_matrix = [

    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 16.67, 0.0, 16.67, 40.0, 0.0, 22.22, 54.55, 0.0, 25.0, 0.0, 0.0],
    [0.0, 21.43, 16.67, 0.0, 11.88, 41.79, 60.71, 31.39, 10.25, 10.39, 0.0, 7.89, 0.0],
    [3.0, 4.0, 13.24, 13.9, 19.26, 38.28, 42.19, 31.88, 15.53, 12.96, 8.57, 4.29, 3.0],
    [4.0, 7.14, 12.7, 14.29, 17.87, 26.11, 28.17, 23.4, 13.77, 11.86, 8.72, 6.75, 4.0],
    [3.45, 7.51, 9.2, 11.76, 16.45, 21.8, 24.47, 19.66, 14.41, 9.27, 6.43, 5.71, 5.56],
    [5.86, 6.29, 8.86, 11.95, 15.53, 18.56, 20.68, 15.78, 11.88, 9.12, 6.01, 6.65, 5.0],
    [5.03, 6.9, 7.48, 9.75, 13.65, 16.0, 15.29, 13.7, 8.85, 6.38, 6.25, 7.56, 4.55],
    [4.02, 6.16, 6.15, 9.64, 8.85, 12.64, 12.73, 10.48, 8.68, 5.59, 5.29, 5.33, 5.41],
    [3.16, 4.88, 5.34, 5.56, 7.28, 9.76, 9.65, 9.82, 6.25, 6.18, 3.52, 6.16, 5.5],
    [2.69, 4.91, 4.57, 5.44, 5.7, 7.35, 7.15, 6.38, 5.29, 4.39, 2.5, 5.76, 4.33],
    [1.89, 2.41, 3.3, 3.55, 4.77, 5.24, 5.28, 5.98, 5.32, 4.31, 3.84, 3.93, 3.33],
    [1.86, 3.33, 1.29, 3.27, 3.31, 5.03, 5.74, 4.76, 3.2, 2.83, 4.64, 4.55, 2.0],
    [1.56, 1.98, 2.72, 2.32, 3.88, 4.38, 4.9, 4.03, 2.67, 2.05, 2.39, 1.22, 1.09],

    ];
    var PosX = 0;
    var PosY = 0;
    var myImg = new Image();
    myImg.src = "/static/field-new.png";
    var fWidth = 300; // Width of the shotmap field in pixels
    var fLength = 500; // Length of the shotmap field in pixels
    var name_t1 = document.getElementById("T1name"); // Team 1 name variable
    var name_t2 = document.getElementById("T2name"); // Team 2 name variable
    var cnvs = document.getElementById("myCanvas");
    var ctx = cnvs.getContext("2d");
    var menu = document.getElementById("shotmenu");
    var goals_t1 = document.getElementById("goals_1");
    var goals_t2 = document.getElementById("goals_2");
    var xG_t1 = document.getElementById("xG_1");
    var xG_t2 = document.getElementById("xG_2");
    var shots_t1 = document.getElementById("shots_1");
    var shots_t2 = document.getElementById("shots_2");
    var sog_t1 = document.getElementById("sog_1");
    var sog_t2 = document.getElementById("sog_2");


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

        menu.style.display = "block";
        if (PosY <= 4*fLength/5)
        {
            menu.style.top = PosY + "px";
        }
        else
        {
            menu.style.top = (PosY-(fLength/4)) + "px";
        }
        menu.style.left = (fWidth / 3) + "px";

        PosX = PosX - ImgPos[0];
        PosY = PosY - ImgPos[1];

        console.log("PosX: " + PosX)
        console.log("PosY: " + PosY)
        console.log(fWidth)
        console.log(fLength)
    }

    function shotMissed() {
        Draw(PosX,PosY,1);

        var dx = PosX / fWidth;
        var dy = PosY / fLength;

        if (dy > 0.5) { // Team 2 shot

            // Update xG
            var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;
            b = Number(xG_t2.innerHTML);
            a = Math.round((b + dxG) * 100) / 100;
            xG_t2.innerHTML = a;

            // Update shots
            b = Number(shots_t2.innerHTML);
            a = b + 1;
            shots_t2.innerHTML = a;
        }
        else { // Team 1 shot

            // Update xG
            var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;
            b = Number(xG_t1.innerHTML);
            a = Math.round((b + dxG) * 100) / 100;
            xG_t1.innerHTML = a;

            // Update shots
            b = Number(shots_t1.innerHTML);
            a = b + 1;
            shots_t1.innerHTML = a;
        }
    }

    function shotBlocked() {
        Draw(PosX,PosY,3);

        var dx = PosX / fWidth;
        var dy = PosY / fLength;

        if (dy > 0.5) { // Team 2 shot

            // Update xG
            var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;
            b = Number(xG_t2.innerHTML);
            a = Math.round((b + dxG) * 100) / 100;
            xG_t2.innerHTML = a;

            // Update shots
            b = Number(shots_t2.innerHTML);
            a = b + 1;
            shots_t2.innerHTML = a;
        }
        else { // Team 1 shot

            // Update xG
            var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;
            b = Number(xG_t1.innerHTML);
            a = Math.round((b + dxG) * 100) / 100;
            xG_t1.innerHTML = a;

            // Update shots
            b = Number(shots_t1.innerHTML);
            a = b + 1;
            shots_t1.innerHTML = a;
        }
    }

    function shotSaved() {
        Draw(PosX,PosY,2);

        var dx = PosX / fWidth;
        var dy = PosY / fLength;

        if (dy > 0.5) { // Team 2 shot

            // Update xG
            var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;
            b = Number(xG_t2.innerHTML);
            a = Math.round((b + dxG) * 100) / 100;
            xG_t2.innerHTML = a;

            // Update shots
            b = Number(shots_t2.innerHTML);
            a = b + 1;
            shots_t2.innerHTML = a;

            // Update shots on goal
            b = Number(sog_t2.innerHTML);
            a = b + 1;
            sog_t2.innerHTML = a;

        }
        else { // Team 1 shot

            // Update xG
            var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;
            b = Number(xG_t1.innerHTML);
            a = Math.round((b + dxG) * 100) / 100;
            xG_t1.innerHTML = a;

            // Update shots
            b = Number(shots_t1.innerHTML);
            a = b + 1;
            shots_t1.innerHTML = a;

            // Update shots on goal
            b = Number(sog_t1.innerHTML);
            a = b + 1;
            sog_t1.innerHTML = a;
        }
    }

    function shotGoal() {
        Draw(PosX,PosY,4);

        var dx = PosX / fWidth;
        var dy = PosY / fLength;

        if (dy > 0.5) { // Team 2 shot

            // Update xG
            var dxG = xG_matrix[13-Math.floor((dy-0.5)*2*13)][12-Math.floor(dx*12)] / 100;
            b = Number(xG_t2.innerHTML);
            a = Math.round((b + dxG) * 100) / 100;
            xG_t2.innerHTML = a;

            // Update shots
            b = Number(shots_t2.innerHTML);
            a = b + 1;
            shots_t2.innerHTML = a;

            // Update shots on goal
            b = Number(sog_t2.innerHTML);
            a = b + 1;
            sog_t2.innerHTML = a;

            // Update goals
            b = Number(goals_t2.innerHTML);
            a = b + 1;
            goals_t2.innerHTML = a;
        }
        else { // Team 1 shot

            // Update xG
            var dxG = xG_matrix[Math.floor(dy*2*14)][Math.floor(dx*13)] / 100;
            b = Number(xG_t1.innerHTML);
            a = Math.round((b + dxG) * 100) / 100;
            xG_t1.innerHTML = a;

            // Update shots
            b = Number(shots_t1.innerHTML);
            a = b + 1;
            shots_t1.innerHTML = a;

            // Update shots on goal
            b = Number(sog_t1.innerHTML);
            a = b + 1;
            sog_t1.innerHTML = a;

            // Update goals
            b = Number(goals_t1.innerHTML);
            a = b + 1;
            goals_t1.innerHTML = a;
        }
    }

    function Draw(x,y,type)
    {
        var ctx = cnvs.getContext("2d");
        menu.style.display = "none";
        ctx.font = "12px Arial";
        var dy = y / fLength;

        if (dy < 0.5) {
            ctx.fillStyle = "blue";

            if (type == 1) {    // Shot Missed
                ctx.fillText("M", x, y);
            }
            else if (type == 3) {   // Shot Blocked
                ctx.fillText("B", x, y);
            }
            else if (type == 2) {   // Shot Saved
                ctx.fillText("S", x, y);
            }
            else if (type == 4) {   // Shot Goal
                ctx.fillText("G", x, y);
            }
        }
        else {
            ctx.fillStyle = "red";

            if (type == 1) {    // Shot Missed
                ctx.fillText("M", x, y);
            }
            else if (type == 3) {   // Shot Blocked
                ctx.fillText("B", x, y);
            }
            else if (type == 2) {   // Shot Saved
                ctx.fillText("S", x, y);
            }
            else if (type == 4) {   // Shot Goal
                ctx.fillText("G", x, y);
            }
        }
    }
