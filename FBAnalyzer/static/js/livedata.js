
// This file contains the script for pushing live data from the app to the live website

const data = { home: 'home',
               away: 'away' };

fetch('https://floorballscanner.herokuapp.com/live/', {

      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
})
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
})
    .catch((error) => {
      console.error('Error:', error);
});