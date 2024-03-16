
// This file contains the script for updating the livepage with live game data

var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = [];
var matchdate = "";
var today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format

// Creates the HTML - page when the window is loaded

window.onload = function() {

    // Men's F-Liiga

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=402&group_id=3")
        .then(response => response.json())
        .then(data => {
            matches = data.matches;
            console.log('Success:', data);

            // Women's F-Liiga

            fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=384&group_id=2")
                .then(response => response.json())
                .then(data => {
                    matches = matches.concat(data.matches);
                    console.log('Success:', data);

                    // Inssidivari

                    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=402&group_id=4")
                        .then(response => response.json())
                        .then(data => {
                            matches = matches.concat(data.matches);
                            matches = matches.filter(match => match.date === today);
                            matches.sort(GetSortOrderRev("time"));

                            matches.forEach(match => {

                                const row = document.createElement('div');
                                row.setAttribute('class', 'row w-100');
                                row.style.marginTop = "10px";
                                row.style.marginBottom = "0px";
                                row.style.paddingTop = "0px";
                                row.style.paddingBottom = "0px";

                                const div1 = document.createElement('div');
                                div1.setAttribute('class', 'col-1 px-1');

                                const div2 = document.createElement('div');
                                div2.setAttribute('class', 'col-7 px-0');

                                const div3 = document.createElement('div');
                                div3.setAttribute('class', 'col-2 px-1');

                                const div4 = document.createElement('div');
                                div4.setAttribute('class', 'col-2 px-1');

                                document.getElementById("head").appendChild(row);
                                row.appendChild(div1);
                                row.appendChild(div2);
                                row.appendChild(div3);
                                row.appendChild(div4);

                                const imgcat = document.createElement('img');
                                imgcat.setAttribute('src', match.category_logo);
                                imgcat.setAttribute('width', '30px');
                                imgcat.style.paddingLeft = "5px";
                                div1.appendChild(imgcat);

                                const button = document.createElement('a');
                                button.setAttribute('class', 'btn btn-primary btn-sm');
                                button.setAttribute('href', '/fliigalive/' + match.match_id);
                                button.setAttribute('role', 'button');
                                button.style.fontSize = "small"
                                button.innerText = "Open";
                                div4.appendChild(button);

                                if (match.live_period != "-1" && match.status != "Played") {
                                    const img = document.createElement('img');
                                    img.setAttribute('src',"/static/live.png");
                                    img.setAttribute('width', '50px');
                                    div3.appendChild(img);

                                    const d = document.createElement('p');
                                    d.style.paddingLeft = "10px";
                                    d.style.paddingRight = "2px";
                                    d.style.paddingTop = "5px";
                                    d.style.display = 'block';
                                    per = Number(match.live_period);
                                    min = Number(match.live_time.slice(0,2));
                                    min = min + 20*(per-1);
                                    if (min < 10) {min = "0" + min.toString()}
                                    sec = match.live_time.slice(3,5);

                                    d.innerText = min.toString() + ":" + sec + "  "
                                                + match.team_A_name + " - "  + match.team_B_name + "  "
                                                + match.fs_A.toString() + " - " + match.fs_B.toString();
                                    d.style.fontSize = 'small';

                                    div2.appendChild(d);
                                }
                                else if (match.live_period == "-1") {
                                    const gametime = document.createElement('p');
                                    gametime.style.fontSize = 'small';
                                    temp = match.time.toString();
                                    gametime.innerText = temp.slice(0,5);
                                    gametime.style.paddingTop = "5px";
                                    gametime.setAttribute('id', 'time' + match.match_id);
                                    div3.appendChild(gametime);

                                    const d = document.createElement('p');
                                    d.style.paddingLeft = "10px";
                                    d.style.paddingRight = "2px";
                                    d.style.paddingTop = "5px";
                                    d.style.display = 'block';
                                    d.innerText = match.team_A_name + " - "  + match.team_B_name;
                                    d.style.fontSize = 'small';
                                    div2.appendChild(d);

                                }
                                else if (match.status == "Played") {
                                    const gametime = document.createElement('p');
                                    gametime.style.fontSize = 'small';
                                    gametime.innerText = "Played";
                                    gametime.style.paddingTop = "5px";
                                    gametime.setAttribute('id', 'time' + match.match_id);
                                    div3.appendChild(gametime);

                                    const d = document.createElement('p');
                                    d.style.paddingLeft = "10px";
                                    d.style.paddingRight = "2px";
                                    d.style.paddingTop = "5px";
                                    d.style.display = 'block';
                                    d.innerText = match.team_A_name + " - "  + match.team_B_name + " "
                                                + match.fs_A.toString() + " - " + match.fs_B.toString();
                                    d.style.fontSize = 'small';
                                    div2.appendChild(d);

                                }

                                // Set attributes for the <hr> element
                                var hrElement = document.createElement("hr");
                                hrElement.setAttribute("width", "100%");
                                hrElement.setAttribute("size", "2");
                                hrElement.setAttribute("align", "center");
                                hrElement.setAttribute("color", "#F5F5F5");
                                hrElement.setAttribute("noshade", "");
                                row.appendChild(hrElement);

                            });

                            console.log('Success:', data);
                        })

                    .catch((error) => {
                      console.error('Error:', error);
                    });
                })

                .catch((error) => {
                  console.error('Error:', error);
                });

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

function GetSortOrderRev(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
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