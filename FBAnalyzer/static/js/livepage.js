
// This file contains the script for updating the livepage with live game data

const csrftoken = getCookie('csrftoken');

window.onload = function() {

    fetch("https://fbscanner.io/livejson/")
        .then(response => response.json())
        .then(data => {

            data.sort(GetSortOrder("date"))
            let rows = data.length;

            for (let i = 0; i < rows ; i++) {

                const div = document.createElement('div');
                div.setAttribute('class', 'row');

                const div2 = document.createElement('div');
                div2.setAttribute('class', 'col-sm-12');

                const h = document.createElement('h1');
                h.innerText = data[i].nameT1 + " - " + data[i].nameT2;
                h.style.paddingTop = "10px";
                h.style.fontWeight = "bold"

                const h2 = document.createElement('h1');
                h2.innerText = data[i].goalsGameT1 + " - " + data[i].goalsGameT2;
                h2.style.paddingTop = "5px";
                h2.setAttribute('id', 'goals' + i);

                const h3 = document.createElement('h5');
                h3.innerText = "Period " + data[i].periodNr;
                h3.style.paddingTop = "5px";
                h3.setAttribute('id', 'period' + i);

                var date = new Date(data[i].periodClock * 1000);
                var display = date.toISOString().substr(11, 8);
                const disp = document.createElement('h3');
                disp.innerText = display;
                disp.style.paddingTop = "5px";
                disp.setAttribute('id', 'time' + i);

                const button = document.createElement('a');
                button.setAttribute('class', 'btn btn-primary');
                button.setAttribute('href', '/live/game');
                button.setAttribute('role', 'button');
                button.style.paddingTop = "5px";
                button.innerText = "Open live";
                button.style.paddingBottom = "5px";


                document.getElementById("head").appendChild(div);
                div.appendChild(div2);

                console.log(Date.now());
                console.log(Date.parse(data[i].date));

                if (Date.now() - Date.parse(data[i].date) <= 3600000) { // max 1 hour from last update
                    const img = document.createElement('img');
                    img.setAttribute('src',"/static/live.png");
                    img.setAttribute('width', '70px');
                    img.style.paddingTop = "55px";
                    div2.appendChild(img);
                }
                else {h.style.paddingTop = "55px";}

                div2.appendChild(h);
                div2.appendChild(h2);
                div2.appendChild(h3);
                div2.appendChild(disp);
                div2.appendChild(button);

            }

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ updatePage() }, 1000);
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

function updatePage() {

    fetch("https://fbscanner.io/livejson/")
        .then(response => response.json())
        .then(data => {

            data.sort(GetSortOrder("date"))
            let rows = data.length;

            for (let i = 0; i < rows ; i++) {

                document.getElementById('goals' + i).innerHTML = data[i].goalsGameT1 + " - " + data[i].goalsGameT2;
                document.getElementById('period' + i).innerHTML = "Period " + data[i].periodNr;

                var date = new Date(data[i].periodClock * 1000);
                var display = date.toISOString().substr(11, 8);
                document.getElementById('time' + i).innerHTML = display;
            }

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ updatePage() }, 1000);
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