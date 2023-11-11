
// This file contains the script for updating the livepage with live game data

var api_key = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk';
var matches = "";

// Creates the HTML - page when the window is loaded

window.onload = function() {

    fetch("https://salibandy.api.torneopal.com/taso/rest/getMatches?api_key="+api_key+"&season_id=2023-2024&competition_id=sb2023&category_id=444&group_id=1")
        .then(response => response.json())
        .then(data => {
            const matches = data.matches;
            matches.sort(GetSortOrder("date"));

            imgcat.src = matches[0].category_logo;

            matches.forEach(match => {

                // Convert string to Date using the Date constructor
                matchdate = new Date(match.date);
                today = new Date();
                today.setHours(0, 0, 0, 0);

                if (matchdate == today) {
                    const div = document.createElement('div');
                    div.setAttribute('class', 'row');

                    const div2 = document.createElement('div');
                    div2.setAttribute('class', 'col-sm-12');

                    const d = document.createElement('h5');
                    d.innerText = match.date;
                    d.style.paddingTop = "50px";

                    const h = document.createElement('h1');
                    h.innerText = match.team_A_name + " - " + match.team_B_name;
                    h.style.paddingTop = "5px";
                    h.style.fontWeight = "bold"

                    const h2 = document.createElement('h1');
                    h2.innerText = match.fs_A.toString() + " - " + match.fs_B.toString();
                    h2.style.paddingTop = "5px";
                    h2.setAttribute('id', 'goals' + match.match_id);

                    const h3 = document.createElement('h5');
                    h3.innerText = "Period " + match.live_period.toString();
                    h3.style.paddingTop = "5px";
                    h3.setAttribute('id', 'period' + match.match_id);

                    const disp = document.createElement('h3');
                    disp.innerText = match.live_time.toString();
                    disp.style.paddingTop = "5px";
                    disp.setAttribute('id', 'time' + match.match_id);

                    const button = document.createElement('a');
                    button.setAttribute('class', 'btn btn-primary');
                    button.setAttribute('href', '/fliigalive/' + match.match_id);
                    button.setAttribute('role', 'button');
                    button.style.paddingTop = "5px";
                    button.innerText = "Open live";
                    button.style.paddingBottom = "5px";

                    document.getElementById("head").appendChild(div);
                    div.appendChild(div2);
                    div2.appendChild(d);

                    const img = document.createElement('img');
                    img.setAttribute('src',"/static/live.png");
                    img.setAttribute('width', '70px');
                    img.style.paddingTop = "5px";
                    div2.appendChild(img);

                    div2.appendChild(h);
                    div2.appendChild(h2);
                    div2.appendChild(h3);
                    div2.appendChild(disp);
                    div2.appendChild(button);
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
