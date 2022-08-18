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

e_level = document.getElementById("edit-level");
s_team_level = document.getElementById("select-team-level");
s_player_level = document.getElementById("select-player-level");
e_level_name = document.getElementById("edit_level_name");
e_level_id = document.getElementById("edit_level_id");
e_level_delete = document.getElementById("edit_level_delete");
e_level_country = document.getElementById("edit_level_country");
e_level_isSenior = document.getElementById("edit_level_isSenior");
e_level_isMale = document.getElementById("edit_level_isMale");
e_level_isNational = document.getElementById("edit_level_isNational");
e_level_button = document.getElementById("edit_level_button");

e_team = document.getElementById("edit-team");
s_team = document.getElementById("select-team");
e_team_name = document.getElementById("edit_team_name");
e_team_id = document.getElementById("edit_team_id");
e_team_delete = document.getElementById("edit_team_delete");
e_team_level = document.getElementById("edit_team_level");
e_team_isSenior = document.getElementById("edit_team_isSenior");
e_team_isMale = document.getElementById("edit_team_isMale");
e_team_isNational = document.getElementById("edit_team_isNational");
e_team_button = document.getElementById("edit_team_button");

e_player = document.getElementById("edit-player");
e_player_firstname = document.getElementById("edit_player_firstname");
e_player_lastname = document.getElementById("edit_player_lastname");
e_player_number = document.getElementById("edit_player_number");
e_player_id = document.getElementById("edit_player_id");
e_player_level = document.getElementById("edit_player_level");
e_player_team = document.getElementById("edit_player_team");
e_player_button = document.getElementById("edit_player_button");
e_player_delete = document.getElementById("edit_player_delete");


var user_id = JSON.parse(document.getElementById('user_id').textContent); // user id number

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