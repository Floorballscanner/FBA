
function editLevel() {

    s_level = document.getElementById("edit-level");

    // If user wants to create a new level

    if (s_level.options[s_level.selectedIndex].value == "new_level") {


    }

    // If selected value exists, fetch data for editing

    else {

       /* fetch("https://fbscanner.io/apis/teamlist/?level_id=" + s_Level_T1.options[s_Level_T1.selectedIndex].value)
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);

                removeOptions(s_T1);

                for (let i=0; i<data.length; i++) {
                    var opt = new Option(data[i].name, data[i].id);
                    s_T1.appendChild(opt);
                }

        })
            .catch((error) => {
                console.error('Error:', error);
        });*/

    }
}