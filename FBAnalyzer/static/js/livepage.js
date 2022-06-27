
// This file contains the script for updating the livepage with live game data

const csrftoken = getCookie('csrftoken');

window.onload = function() {

    fetch("https://fbscanner.io/livejson/")
        .then(response => response.json())
        .then(data => {

            let rows = data.length;

            for (let i = 0; i < rows; i++) {

                const div = document.createElement('div');
                div.setAttribute('class', 'row');
                const div2 = document.createElement('div');
                div2.setAttribute('class', 'col-sm-12');
                const h = document.createElement('h1');
                h1.innerText = data[i].nameT1 + " - " + data[i].nameT2;
                document.getElementById("head").appendChild(div);
                div.appendChild(div2);
                div2.appendChild(h1);

            }

            console.log('Success:', data);
        })

        .catch((error) => {
          console.error('Error:', error);
    });

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
