function updatePlot() {
  var string = '';
  string = 'Plotting '+ dropdownData.value + ' data for stations ' + dropdownCity1.value + ' and ' + dropdownCity2.value;
  textarea1.textContent = string;
}

function getAPIKey() {
  var xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType('text/plain');
  xhttp.open("GET",'APIkey',false);
  xhttp.send();
  return xhttp.responseText;
}

function requestData() {
  var APIkey = getAPIKey();
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      document.getElementById("demo").innerHTML = xhttp.responseText;
      var results = JSON.parse(xhttp.responseText);
      console.log(results.results[0]);
    }
  };
  console.log(url);
  xhttp.open("GET", url, false);
  xhttp.setRequestHeader("token",APIkey.trim());
  xhttp.send();
}

// ****** event listeners ********

var dropdownData = document.getElementById("dropdownData");
var textarea1 = document.querySelector("textarea");
 

// ****** NOAA URLs ********** 
var baseUrl = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/'
var endpoint = 'stations'
//var url = baseUrl + endpoint
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?limit=1000'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=50,8,52,10'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations/GHCND:GME00102276'
var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=GHCND:GME00102276&startdate=2010-05-01&enddate=2010-05-01'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:GME00102276'


