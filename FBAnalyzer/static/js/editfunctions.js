const countryList = [
	"Albania",
	"Argentina",
	"Armenia",
	"Australia",
	"Austria",
	"Azerbaijan",
	"Belarus",
	"Belgium",
	"Bosnia and Herzegovina",
	"Brazil",
	"Bulgaria",
	"Canada",
	"China",
	"Costa Rica",
	"Croatia",
	"Cyprus",
	"Czech",
	"Denmark",
	"Estonia",
	"Finland",
	"France",
	"Georgia",
	"Germany",
	"Greece",
	"Greenland",
	"Hong Kong",
	"Hungary",
	"India",
	"Indonesia",
	"International",
	"Ireland",
	"Italy",
	"Japan",
	"South Korea",
	"Latvia",
	"Liechtenstein",
	"Lithuania",
	"Malaysia",
	"Malta",
	"Mexico",
	"Netherlands",
	"Norway",
	"Poland",
	"Portugal",
	"Republic of North Macedonia",
	"Romania",
	"Russian Federation",
	"Serbia",
	"Singapore",
	"Slovakia",
	"Slovenia",
	"South Africa",
	"Spain",
	"Sri Lanka",
	"Sweden",
	"Switzerland",
	"Taiwan",
	"Thailand",
	"Ukraine",
	"United Kingdom",
	"United States of America",
	"Viet Nam",
];

window.onload = function() {


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
const csrftoken = getCookie('csrftoken');
var user_id = JSON.parse(document.getElementById('user_id').textContent); // user id number

function editLevel() {

    s_level = document.getElementById("edit-level");
    e_level_name = document.getElementById("edit_level_name");
    e_level_id = document.getElementById("edit_level_id");
    e_level_delete = document.getElementById("edit_level_delete");
    e_level_country = document.getElementById("edit_level_country");
    e_level_isSenior = document.getElementById("edit_level_isSenior");
    e_level_isMale = document.getElementById("edit_level_isMale");
    e_level_isNational = document.getElementById("edit_level_isNational");
    e_level_button = document.getElementById("edit_level_button");

    if (e_level_country.length < 2) {
        for (let i=1;i<countryList.length;i++) {

            var opt = new Option(countryList[i], countryList[i]);
            e_level_country.appendChild(opt);
        }
    }

    // If user wants to create a new level

    if (s_level.options[s_level.selectedIndex].value == "new_level") {

            e_level_name.value = "";
            e_level_id.value = "";
            e_level_country.selectedIndex = "0";
            e_level_isMale.checked = false
            e_level_isSenior.checked = false
            e_level_isNational.checked = false
            e_level_name.disabled = false;
            e_level_country.disabled = false;
            e_level_isSenior.disabled = false;
            e_level_isMale.disabled = false;
            e_level_isNational.disabled = false;
            e_level_delete.disabled = true;
            e_level_button.disabled = false;
    }

    // If selected value exists, fetch data for editing

    else {

       fetch("https://fbscanner.io/apis/levels/" + s_level.options[s_level.selectedIndex].value + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                e_level_name.value = data.name;
                e_level_id.value = data.id;
                e_level_country.value = data.country;
                if (data.isSenior == true) {e_level_isSenior.checked = true};
                if (data.isMale == true) {e_level_isMale.checked = true};
                if (data.isNational == true) {e_level_isNational.checked = true};
                e_level_name.disabled = false;
                e_level_country.disabled = false;
                e_level_isSenior.disabled = false;
                e_level_isMale.disabled = false;
                e_level_isNational.disabled = false;
                e_level_delete.disabled = false;
                e_level_button.disabled = false;

        })
            .catch((error) => {
                console.error('Error:', error);
        });

    }
}

function editLevelButton() {

    var r = confirm("Do you want to save data?");
    if (r == true) {

        isS = e_level.isSenior.checked;
        isM = e_level_isMale.checked;
        isN = e_level_isNational.checked;

        data = {
            "name": e_level_name.value,
            "country": e_level_country.value,
            "isSenior": isS,
            "isMale": isM,
            "isNational": isN,
            "created": user_id,
        }

        // New level - Create new Level - instance
        if (s_level.options[s_level.selectedIndex].value == "new_level") {

            fetch("https://fbscanner.io/apis/levels/", {

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
                window.alert("Data saved!");
                e_level_name.value = "";
                e_level_id.value = "";
                e_level_country.selectedIndex = "0";
                e_level_isSenior = false;
                e_level_isMale = false;
                e_level_isNational = false;
                e_level_name.disabled = true;
                e_level_country.disabled = true;
                e_level_isSenior.disabled = true;
                e_level_isMale.disabled = true;
                e_level_isNational.disabled = true;
                e_level_delete.disabled = true;
                e_level_button.disabled = true;
            })
            .catch((error) => {
              console.error('Error:', error);
            });

        }
        else {

            fetch("https://fbscanner.io/apis/levels/" + e_level_id + "/", {

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
                window.alert("Data saved!");
                e_level_name.value = "";
                e_level_id.value = "";
                e_level_country.selectedIndex = "0";
                e_level_isSenior = false;
                e_level_isMale = false;
                e_level_isNational = false;
                e_level_name.disabled = true;
                e_level_country.disabled = true;
                e_level_isSenior.disabled = true;
                e_level_isMale.disabled = true;
                e_level_isNational.disabled = true;
                e_level_delete.disabled = true;
                e_level_button.disabled = true;
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }
    }

}

function deleteLevelButton() {

    var r = confirm("Are you sure you want to delete Level, all saved information will be lost?");
    if (r == true) {

        fetch("https://fbscanner.io/apis/levels/" + e_level_id + "/", {

              method: 'DELETE', // or 'PUT'
              headers: {
                'Content-Type': 'application/json',
              },
            })

            .then(() => {
                console.log('removed');
                window.alert("Level deleted.");
                e_level_name.value = "";
                e_level_id.value = "";
                e_level_country.selectedIndex = "0";
                e_level_isSenior = false;
                e_level_isMale = false;
                e_level_isNational = false;
                e_level_name.disabled = true;
                e_level_country.disabled = true;
                e_level_isSenior.disabled = true;
                e_level_isMale.disabled = true;
                e_level_isNational.disabled = true;
                e_level_delete.disabled = true;
                e_level_button.disabled = true;
            })
            .catch((error) => {
              console.error('Error:', error);
            });
    }

}