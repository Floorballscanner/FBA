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

function editLevel() {

    s_level = document.getElementById("edit-level");
    e_level_name = document.getElementById("edit_level_name");
    e_level_delete = document.getElementById("edit_level_delete");
    e_level_country = document.getElementById("edit_level_country");
    e_level_isSenior = document.getElementById("edit_level_isSenior");
    e_level_isMale = document.getElementById("edit_level_isMale");
    e_level_isNational = document.getElementById("edit_level_isNational");

    // If user wants to create a new level

    if (s_level.options[s_level.selectedIndex].value == "new_level") {

            e_level_name.disabled = false;
            e_level_country.disabled = false;
            e_level_isSenior.disabled = false;
            e_level_isMale.disabled = false;
            e_level_isNational.disabled = false;
            e_level_delete.disabled = true;
    }

    // If selected value exists, fetch data for editing

    else {

       fetch("https://fbscanner.io/apis/levels/" + s_level.options[s_level.selectedIndex].value + "/")
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                e_level_name.value = data.name;
                e_level_country.value = data.country;
                e_level_isSenior = data.isSenior;
                e_level_isMale = data.isMale;
                e_level_isNational = data.isNational;
                e_level_name.disabled = false;
                e_level_country.disabled = false;
                e_level_isSenior.disabled = false;
                e_level_isMale.disabled = false;
                e_level_isNational.disabled = false;
                e_level_delete.disabled = false;

        })
            .catch((error) => {
                console.error('Error:', error);
        });

    }
}

function editLevelButton() {


}

function deleteLevelButton() {

}