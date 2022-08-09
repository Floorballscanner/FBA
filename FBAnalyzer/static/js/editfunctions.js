

window.onload = function() {


}
function selectLevel() {

    level_id = s_level.options[s_level.selectedIndex].value;
    e_team.disabled = false;
    updateTeams(level_id);
    e_team_name.value = "";
    e_team_id.value = "";
    e_team_level.selectedIndex = "0";
    e_team.selectedIndex = "0";
    e_team_isMale.checked = false
    e_team_isSenior.checked = false
    e_team_isNational.checked = false
    e_team_name.disabled = false;
    e_team_level.disabled = false;
    e_team_delete.disabled = true;
    e_team_button.disabled = false;
}

function editLevel() {

    if (e_level_country.length < 2) {
        for (let i=1;i<countryList.length;i++) {

            var opt = new Option(countryList[i], countryList[i]);
            e_level_country.appendChild(opt);
        }
    }

    // If user wants to create a new level

    if (e_level.options[e_level.selectedIndex].value == "new_level") {

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

       fetch("https://fbscanner.io/apis/levels/" + e_level.options[e_level.selectedIndex].value + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                e_level_name.value = data.name;
                e_level_id.value = data.id;
                e_level_country.value = data.country;
                if (data.isSenior) {e_level_isSenior.checked = true;}
                else {e_level_isSenior.checked = false;}
                if (data.isMale) {e_level_isMale.checked = true;}
                else {e_level_isMale.checked = false;}
                if (data.isNational) {e_level_isNational.checked = true;}
                else {e_level_isNational.checked = false;}
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

        newdata = {
            "name": e_level_name.value,
            "country": e_level_country.value,
            "isSenior": e_level_isSenior.checked,
            "isMale": e_level_isMale.checked,
            "isNational": e_level_isNational.checked,
            "created": user_id,
        }

        // New level - Create new Level - instance
        if (e_level.options[e_level.selectedIndex].value == "new_level") {

            fetch("https://fbscanner.io/apis/levels/", {

              method: 'POST', // or 'PUT'
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
              },
              body: JSON.stringify(newdata),
            })

            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                window.alert("Data saved!");
                e_level_name.value = "";
                e_level_id.value = "";
                e_level_country.selectedIndex = "0";
                e_level_isSenior.checked = false;
                e_level_isMale.checked = false;
                e_level_isNational.checked = false;
                e_level_name.disabled = true;
                e_level_country.disabled = true;
                e_level_isSenior.disabled = true;
                e_level_isMale.disabled = true;
                e_level_isNational.disabled = true;
                e_level_delete.disabled = true;
                e_level_button.disabled = true;
                e_level.selectedIndex = "0";
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
              body: JSON.stringify(newdata),
            })

            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                window.alert("Data saved!");
                e_level_name.value = "";
                e_level_id.value = "";
                e_level_country.selectedIndex = "0";
                e_level_isSenior.checked = false;
                e_level_isMale.checked = false;
                e_level_isNational.checked = false;
                e_level_name.disabled = true;
                e_level_country.disabled = true;
                e_level_isSenior.disabled = true;
                e_level_isMale.disabled = true;
                e_level_isNational.disabled = true;
                e_level_delete.disabled = true;
                e_level_button.disabled = true;
                e_level.selectedIndex = "0";
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
                e_level_isSenior.checked = false;
                e_level_isMale.checked = false;
                e_level_isNational.checked = false;
                e_level_name.disabled = true;
                e_level_country.disabled = true;
                e_level_isSenior.disabled = true;
                e_level_isMale.disabled = true;
                e_level_isNational.disabled = true;
                e_level_delete.disabled = true;
                e_level_button.disabled = true;
                e_level.selectedIndex = "0";
                updateLevels(); // Update Level selection box, remove removed option
            })
            .catch((error) => {
              console.error('Error:', error);
            });
    }

}

function editTeam() {
    
    if (e_team_level.length < 2) {
        fetch("https://fbscanner.io/apis/levels/")
                .then(response => response.json())
                .then(levels => {
                    console.log('Success:', levels);
                    for (let i=0;i<levels.length;i++) {
                        var opt = new Option(levels[i].name, levels[i].id);
                        e_team_level.appendChild(opt);
                    }
                })
            .catch((error) => {
                console.error('Error:', error);
        });
    }

    // If user wants to create a new team

    if (e_team.options[e_team.selectedIndex].value == "new_team") {

            e_team_name.value = "";
            e_team_id.value = "";
            console.log("e_team_level.value " + e_team_level.value)
            console.log("s_level.value " + s_level.value)
            e_team_level.value = s_level.value;
            console.log("After: s_level.value " + s_level.value)
            e_team_isMale.checked = false
            e_team_isSenior.checked = false
            e_team_isNational.checked = false
            e_team_name.disabled = false;
            e_team_level.disabled = false;
            e_team_delete.disabled = true;
            e_team_button.disabled = false;
    }

    // If selected value exists, fetch data for editing

    else {

       fetch("https://fbscanner.io/apis/teams/" + e_team.options[e_team.selectedIndex].value + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                e_team_name.value = data.name;
                e_team_id.value = data.id;
                e_team_level.value = data.level;
                if (data.isSenior) {e_team_isSenior.checked = true;}
                else {e_team_isSenior.checked = false;}
                if (data.isMen) {e_team_isMale.checked = true;}
                else {e_team_isMale.checked = false;}
                if (data.isNational) {e_team_isNational.checked = true;}
                else {e_team_isNational.checked = false;}
                e_team_name.disabled = false;
                e_team_level.disabled = false;
                e_team_delete.disabled = false;
                e_team_button.disabled = false;
        })
            .catch((error) => {
                console.error('Error:', error);
        });

    }
    
}

function editTeamButton() {

    var r = confirm("Do you want to save data?");
    if (r == true) {

        newdata = {
            "name": e_team_name.value,
            "level": e_team_level.value,
            "isSenior": e_team_isSenior.checked,
            "isMale": e_team_isMale.checked,
            "isNational": e_team_isNational.checked,
            "created": user_id,
        }

        // New level - Create new Level - instance
        if (e_team.options[e_team.selectedIndex].value == "new_team") {

            fetch("https://fbscanner.io/apis/teams/", {

              method: 'POST', // or 'PUT'
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
              },
              body: JSON.stringify(newdata),
            })

            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                window.alert("Data saved!");
                e_team_name.value = "";
                e_team_id.value = "";
                e_team_level.selectedIndex = "0";
                e_team_isSenior.checked = false;
                e_team_isMale.checked = false;
                e_team_isNational.checked = false;
                e_team_name.disabled = true;
                e_team_level.disabled = true;
                e_team_isSenior.disabled = true;
                e_team_isMale.disabled = true;
                e_team_isNational.disabled = true;
                e_team_delete.disabled = true;
                e_team_button.disabled = true;
                e_team.selectedIndex = "0";
                level_id = s_level.options[s_level.selectedIndex].value;
                updateTeams(level_id); // Update level option box
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
              body: JSON.stringify(newdata),
            })

            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                window.alert("Data saved!");
                e_team_name.value = "";
                e_team_id.value = "";
                e_team_level.selectedIndex = "0";
                e_team_isSenior.checked = false;
                e_team_isMale.checked = false;
                e_team_isNational.checked = false;
                e_team_name.disabled = true;
                e_team_level.disabled = true;
                e_team_isSenior.disabled = true;
                e_team_isMale.disabled = true;
                e_team_isNational.disabled = true;
                e_team_delete.disabled = true;
                e_team_button.disabled = true;
                e_team.selectedIndex = "0";
                level_id = s_level.options[s_level.selectedIndex].value;
                updateTeams(level_id); // Update level option box
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }
    }

}

function deleteTeamButton() {

    var r = confirm("Are you sure you want to delete Team, all saved information will be lost?");
    if (r == true) {

        fetch("https://fbscanner.io/apis/teams/" + e_team_id.value + "/", {

          method: 'DELETE', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
          },
        })

        .then(() => {
            console.log('removed');
            window.alert("Team deleted.");
            e_team_name.value = "";
            e_team_id.value = "";
            e_team_level.selectedIndex = "0";
            e_team_isSenior.checked = false;
            e_team_isMale.checked = false;
            e_team_isNational.checked = false;
            e_team_name.disabled = true;
            e_team_level.disabled = true;
            e_team_isSenior.disabled = true;
            e_team_isMale.disabled = true;
            e_team_isNational.disabled = true;
            e_team_delete.disabled = true;
            e_team_button.disabled = true;
            e_team.selectedIndex = "0";
            level_id = s_level.options[s_level.selectedIndex].value;
            updateTeams(level_id); // Update level option box
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

}

function changeTeamLevel() {

    fetch("https://fbscanner.io/apis/levels/" + e_team_level.options[e_team_level.selectedIndex].value + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                if (data.isSenior) {e_team_isSenior.checked = true;}
                else {e_team_isSenior.checked = false;}
                if (data.isMale) {e_team_isMale.checked = true;}
                else {e_team_isMale.checked = false;}
                if (data.isNational) {e_team_isNational.checked = true;}
                else {e_team_isNational.checked = false;}

        })
            .catch((error) => {
                console.error('Error:', error);
        });
}

function updateLevels() {

    fetch("https://fbscanner.io/apis/levels/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                for (let i=e_level.length-1;i>1;i--) {
                    e_level.remove(i);
                }
                for (let i=0;i<data.length;i++) {
                    var opt = new Option(data[i].name, data[i].id);
                    e_level.append(opt);
                }

        })
            .catch((error) => {
                console.error('Error:', error);
        });
}

function updateTeams(level_id) {

    fetch("https://fbscanner.io/apis/teams/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                for (let i=e_team.length-1;i>1;i--) {
                    e_team.remove(i);
                }
                for (let i=0;i<data.length;i++) {
                    if (data[i].level == level_id) {
                        var opt = new Option(data[i].name, data[i].id);
                        e_team.append(opt);
                    }
                }

        })
            .catch((error) => {
                console.error('Error:', error);
        });

}