
// This file contains the script for updating the livepage with live game data

var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = "";
var matchdate = "";
var today = "";

// Creates the HTML - page when the window is loaded

window.onload = function() {

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=402&group_id=2")
        .then(response => response.json())
        .then(data => {
            const matches = data.matches;
            matches.sort(GetSortOrder("date"));

            matches.forEach(match => {

                // Convert string to Date using the Date constructor
                matchdate = new Date(match.date);
                today = new Date();

                if (areDatesEqual(matchdate, today))  {
                    const row = document.createElement('div');
                    row.setAttribute('class', 'row w-100');

                    const div1 = document.createElement('div');
                    div1.setAttribute('class', 'col-xs-1 px-1 position-relative');

                    const div2 = document.createElement('div');
                    div2.setAttribute('class', 'col-xs-9 px-0 position-relative');

                    const div3 = document.createElement('div');
                    div3.setAttribute('class', 'col-xs-1 px-1 position-relative');

                    const div4 = document.createElement('div');
                    div4.setAttribute('class', 'col-xs-1 px-1 position-relative');

                    const imgcat = document.createElement('img');
                    imgcat.setAttribute('src', match.category_logo);
                    imgcat.setAttribute('width', '30px');
                    imgcat.style.paddingTop = "2px";
                    imgcat.style.paddingLeft = "10px";
                    div1.appendChild(imgcat);

                    const d = document.createElement('p');
                    d.style.paddingLeft = "2px";
                    d.style.paddingRight = "2px";
                    d.style.display = 'block';
                    d.innerText = "P" + match.live_period.toString() + " " + match.live_time.toString() + " "
                                + match.team_A_name + " - "  + match.team_B_name + " "
                                + match.fs_A.toString() + " - " + match.fs_B.toString();
                    d.style.fontSize = 'small';
                    d.style.paddingTop = "2px";

                    const button = document.createElement('a');
                    button.setAttribute('class', 'btn btn-primary');
                    button.setAttribute('href', '/fliigalive/' + match.match_id);
                    button.setAttribute('role', 'button');
                    button.style.paddingTop = "2px";
                    button.innerText = "Open";
                    button.style.paddingBottom = "2px";

                    document.getElementById("head").appendChild(row);
                    row.appendChild(div1);
                    row.appendChild(div2);
                    row.appendChild(div3);
                    row.appendChild(div4);
                    div2.appendChild(d);

                    if (match.live_period != "-1" && match.status != "Played") {
                        const img = document.createElement('img');
                        img.setAttribute('src',"/static/live.png");
                        img.setAttribute('width', '50px');
                        img.style.paddingTop = "2px";
                        div3.appendChild(img);
                    }
                    else if (match.live_period == "-1") {
                        const gametime = document.createElement('p');
                        gametime.style.fontSize = 'small';
                        gametime.innerText = match.time.toString();
                        gametime.style.paddingTop = "2px";
                        gametime.setAttribute('id', 'time' + match.match_id);
                        div3.appendChild(gametime);
                    }
                    else if (match.status == "Played") {

                    }

                    div4.appendChild(button);

                }

            });

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    // Women's F-Liiga

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=384&group_id=1")
        .then(response => response.json())
        .then(data => {
            const matches = data.matches;
            matches.sort(GetSortOrder("date"));

            matches.forEach(match => {

                // Convert string to Date using the Date constructor
                matchdate = new Date(match.date);
                today = new Date();

                if (areDatesEqual(matchdate, today))  {
                    const row = document.createElement('div');
                    row.setAttribute('class', 'row');

                    const div1 = document.createElement('div');
                    div1.setAttribute('class', 'col-xs-1 px-1 translate-middle');

                    const div2 = document.createElement('div');
                    div2.setAttribute('class', 'col-xs-7 px-0 translate-middle');

                    const div3 = document.createElement('div');
                    div3.setAttribute('class', 'col-xs-2 px-1 translate-middle');

                    const div4 = document.createElement('div');
                    div4.setAttribute('class', 'col-xs-2 px-1 translate-middle');

                    const imgcat = document.createElement('img');
                    imgcat.setAttribute('src', match.category_logo);
                    imgcat.setAttribute('width', '30px');
                    imgcat.style.paddingTop = "2px";
                    imgcat.style.paddingLeft = "10px";
                    div1.appendChild(imgcat);

                    const d = document.createElement('p');
                    //d.style.display = 'block';
                    d.innerText = "P" + match.live_period.toString() + " " + match.live_time.toString() + "\n"
                                + match.team_A_name + " - "  + match.team_B_name + "\n"
                                + match.fs_A.toString() + " - " + match.fs_B.toString();
                    d.style.fontSize = 'small';
                    d.style.paddingTop = "2px";

                    const button = document.createElement('a');
                    button.setAttribute('class', 'btn btn-primary');
                    button.setAttribute('href', '/fliigalive/' + match.match_id);
                    button.setAttribute('role', 'button');
                    button.style.paddingTop = "2px";
                    button.innerText = "Open";
                    button.style.paddingBottom = "2px";

                    document.getElementById("head").appendChild(row);
                    row.appendChild(div1);
                    row.appendChild(div2);
                    row.appendChild(div3);
                    row.appendChild(div4);
                    div2.appendChild(d);

                    if (match.live_period != "-1" && match.status != "Played") {
                        const img = document.createElement('img');
                        img.setAttribute('src',"/static/live.png");
                        img.setAttribute('width', '50px');
                        img.style.paddingTop = "2px";
                        div3.appendChild(img);
                    }
                    else if (match.live_period == "-1") {
                        const gametime = document.createElement('p');
                        gametime.style.fontSize = 'small';
                        gametime.innerText = match.time.toString();
                        gametime.style.paddingTop = "2px";
                        gametime.setAttribute('id', 'time' + match.match_id);
                        div3.appendChild(gametime);
                    }
                    else if (match.status == "Played") {

                    }

                    div4.appendChild(button);

                }

            });

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    // Inssidivari

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=444&group_id=1")
        .then(response => response.json())
        .then(data => {
            const matches = data.matches;
            matches.sort(GetSortOrder("date"));

            matches.forEach(match => {

                // Convert string to Date using the Date constructor
                matchdate = new Date(match.date);
                today = new Date();

                if (areDatesEqual(matchdate, today))  {
                    const row = document.createElement('div');
                    row.setAttribute('class', 'row');

                    const div1 = document.createElement('div');
                    div1.setAttribute('class', 'col-xs-1 px-1 translate-middle');

                    const div2 = document.createElement('div');
                    div2.setAttribute('class', 'col-xs-7 px-0 translate-middle');

                    const div3 = document.createElement('div');
                    div3.setAttribute('class', 'col-xs-2 px-1 translate-middle');

                    const div4 = document.createElement('div');
                    div4.setAttribute('class', 'col-xs-2 px-1 translate-middle');

                    const imgcat = document.createElement('img');
                    imgcat.setAttribute('src', match.category_logo);
                    imgcat.setAttribute('width', '30px');
                    imgcat.style.paddingTop = "2px";
                    imgcat.style.paddingLeft = "10px";
                    div1.appendChild(imgcat);

                    const d = document.createElement('p');
                    //d.style.display = 'block';
                    d.innerText = "P" + match.live_period.toString() + " " + match.live_time.toString() + "\n"
                                + match.team_A_name + " - "  + match.team_B_name + "\n"
                                + match.fs_A.toString() + " - " + match.fs_B.toString();
                    d.style.fontSize = 'small';
                    d.style.paddingTop = "2px";

                    const button = document.createElement('a');
                    button.setAttribute('class', 'btn btn-primary');
                    button.setAttribute('href', '/fliigalive/' + match.match_id);
                    button.setAttribute('role', 'button');
                    button.style.paddingTop = "2px";
                    button.innerText = "Open";
                    button.style.paddingBottom = "2px";

                    document.getElementById("head").appendChild(row);
                    row.appendChild(div1);
                    row.appendChild(div2);
                    row.appendChild(div3);
                    row.appendChild(div4);
                    div2.appendChild(d);

                    if (match.live_period != "-1" && match.status != "Played") {
                        const img = document.createElement('img');
                        img.setAttribute('src',"/static/live.png");
                        img.setAttribute('width', '50px');
                        img.style.paddingTop = "2px";
                        div3.appendChild(img);
                    }
                    else if (match.live_period == "-1") {
                        const gametime = document.createElement('p');
                        gametime.style.fontSize = 'small';
                        gametime.innerText = match.time.toString();
                        gametime.style.paddingTop = "2px";
                        gametime.setAttribute('id', 'time' + match.match_id);
                        div3.appendChild(gametime);
                    }
                    else if (match.status == "Played") {

                    }

                    div4.appendChild(button);

                }

            });

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ location.reload(); }, 60000); // Update page every minute
}

// Sort JSON array by date, sorting function

function GetSortOrder(prop) {
    return function(a, b) {
        if (a[prop] < b[prop]) {
            return 1;
        } else if (a[prop] > b[prop]) {
            return -1;
        }
        return 0;
    }
}

// Function to check if two dates are the same
function areDatesEqual(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}