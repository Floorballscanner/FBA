
// This file contains the script for pulling and pushing live data from/to the Azure backend

fetch('https://fbscanner.io/live/', {

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