
s_level = document.getElementById("edit-level");
e_level_name = document.getElementById("edit_level_name");
e_level_id = document.getElementById("edit_level_id");
e_level_delete = document.getElementById("edit_level_delete");
e_level_country = document.getElementById("edit_level_country");
e_level_isSenior = document.getElementById("edit_level_isSenior");
e_level_isMale = document.getElementById("edit_level_isMale");
e_level_isNational = document.getElementById("edit_level_isNational");
e_level_button = document.getElementById("edit_level_button");

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