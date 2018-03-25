// functions for controlling dynamic user interface

// function for dynamically populating years in date picker
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date
function populateYears() {
  // get this year as a number
  var date = new Date();
  var year = date.getFullYear();

  var startDateYearSelect = document.querySelector('#startDateYearSelector');
  var endDateYearSelect = document.querySelector('#endDateYearSelector');

  // Make this year, and the 100 years before it available in the year <select>
  for(var i = 0; i <= 50; i++) {
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.textContent = year-i;
    option2.textContent = year-i;
    startDateYearSelect.appendChild(option1);
    endDateYearSelect.appendChild(option2);
  }
}

function updatePlot() {
  draw(weatherData);
}
