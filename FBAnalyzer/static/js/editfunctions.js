

window.onload = function() {


}


function editLevel() {

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
                else {e_level_isSenior.checked = false};
                if (data.isMale == true) {e_level_isMale.checked = true};
                else {e_level_isMale.checked = false};
                if (data.isNational == true) {e_level_isNational.checked = true};
                else {e_level_isNational.checked = false};
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

        data = {
            "name": e_level_name.value,
            "country": e_level_country.value,
            "isSenior": e_level_isSenior.checked,
            "isMale": e_level_isMale.checked,
            "isNational": e_level_isNational.checked,
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
                s_level.selectedIndex = "0";
                updateLevels(); // Update level option box
            })
            .catch((error) => {
              console.error('Error:', error);
            });

        }
        else {

            fetch("https://fbscanner.io/apis/levels/" + e_level_id.value + "/", {

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
                s_level.selectedIndex = "0";
                updateLevels(); // Update level option box
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

        fetch("https://fbscanner.io/apis/levels/" + e_level_id.value + "/", {

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
                s_level.selectedIndex = "0";
                updateLevels(); // Update Level selection box, remove removed option
            })
            .catch((error) => {
              console.error('Error:', error);
            });
    }

}

function updateLevels() {

    fetch("https://fbscanner.io/apis/levels/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                for (let i=s_level.length-1;i>1;i--) {
                    s_level.remove(i);
                }
                for (let i=0;i<data.length;i++) {
                    var opt = new Option(data[i].name, data[i].id);
                    s_level.append(opt);
                }

        })
            .catch((error) => {
                console.error('Error:', error);
        });
}