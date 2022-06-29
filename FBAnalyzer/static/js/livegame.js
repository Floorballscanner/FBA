// This file contains the script for updating the live game stream page with live game data

const csrftoken = getCookie('csrftoken');

// Creates the HTML - page when the window is loaded

window.onload = function() {

    // Get the game nr from the url
    var currentLocation = window.location;
    //const locArray = currentLocation.split("/");
    //const nr = locArray[locArray.length-2];

    console.log(currentLocation);
    //console.log(locArray);
    //console.log(nr);

    fetch("https://fbscanner.io/livejson/")
        .then(response => response.json())
        .then(data => {

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

// Function updates the Live page every second

function updatePage() {

    fetch("https://fbscanner.io/livejson/")
        .then(response => response.json())
        .then(data => {

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

    t = setTimeout(function(){ updatePage() }, 1000);
}
