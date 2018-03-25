//global variables
var weatherData = {}; //data from both stations from request to NOAA API
var stationName1, stationName2;
var stationNameToId = {}; //map name to GHCND ID
var APIkey; // for NOAA API, read from external file

// ****** NOAA URLs ********** 
var baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCNDMS&stationid=GHCND:'
var typeUrl = '&datatypeid='
var endpoint = 'stations'

//units are for output data, not for data read from NOAA
//data must be converted after reading
var mapDataKeysToLabels = {
  "TMAX":"Max temperature / Celcius",
  "TMIN":"Min temperature / Celcius",
  "PRCP":"Precipitation / mm       ",
  "TPCP":"Total precipitation for the month / mm", //0.1 mm NOAA
  "MMNT":"Monthly mean minimum temperature / Celcius", //0.1 degree Celcius NOAA
  "MMXT":"Monthly mean maximum temperature / Celcius", //0.1 degree Celcius NOAA
}

// function which runs once page has fully loaded
window.onload = function () {
  //if (localStorage.get("hasCodeRunBefore") === null) {
    d3.csv("ghcnd-stations.csv",function(error,data) {
      for (var i in data) {
        //get stations with coordinates centered around central Germany
        if ((Math.abs(parseFloat(data[i].latitude) - 50.0) < 20.0) && (Math.abs(parseFloat(data[i].longitude) - 10.0) < 20.0)) {
          stationNameToId[data[i].locationname.trim()] = data[i].locationid.trim();
        }
      }
    });
    populateYears();
    APIkey = getAPIKey();
  //  localStorage.setItem("hasCodeRunBefore", true);
  //}
}

function correctUnits() {
  //converting from NOAA units to display units
  //NOAA units: 0.1 mm, 0.1 degrees Celcius
  for (var i in weatherData.station1.results) {
    weatherData.station1.results[i].value = weatherData.station1.results[i].value/10.0;
  }
  for (var i in weatherData.station2.results) {
    weatherData.station2.results[i].value = weatherData.station2.results[i].value/10.0;
  }
}

// read NOAA API key from plain text file
function getAPIKey() {
  var xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType('text/plain');
  xhttp.open("GET",'APIkey',false);
  xhttp.send();
  return xhttp.responseText;
}

function firstPlot() {
  // TODO check if dropdown entries still match contents of weatherData
  if (Object.keys(weatherData).length == 0) {
    requestData();
  }
  updatePlot();
}

function requestData() {
  // get values selected in web form
  var dataKey = document.getElementById("dropdownDataKey").value; //TODO maybe make this global
  stationName1 = document.getElementById("dropdownStation1").value;
  stationName2 = document.getElementById("dropdownStation2").value;
  var startMonth = document.getElementById("startDateMonthSelector").value;
  var endMonth = document.getElementById("endDateMonthSelector").value;
  var startYear = document.getElementById("startDateYearSelector").value;
  var endYear = document.getElementById("endDateYearSelector").value;

  if (endYear < startYear) {
    alert('Error! Start year is later than end year');
  }

  if ((endYear == startYear) && (endMonth <= startMonth)) {
    alert('Error! Start month is later than or equal to end month');
  }

  var dateUrl = '&startdate=' + startYear + '-' + startMonth + '-01&enddate=' + endYear + '-' + endMonth + '-01';
  
  // download data for the two stations
  var responseData1 = getDataOneStation(stationName1, dateUrl, typeUrl, dataKey);
  var responseData2 = getDataOneStation(stationName2, dateUrl, typeUrl, dataKey);
  weatherData = {"station1":responseData1,"station2":responseData2};

  // NOAA units to display units
  correctUnits();
}

function getDataOneStation(stationName, dateUrl, typeUrl, dataKey) {
  var url = baseUrl + stationNameToId[stationName] + dateUrl + typeUrl + dataKey;
  var responseData = makeHttpRequest(url, APIkey);
  console.log(Object.keys(responseData).length);
  if (Object.keys(responseData).length == 0) {
    alert('No NOAA data for ' + stationName + ' station for those dates');
  }
  console.log(responseData);
  return responseData;
}

function makeHttpRequest(url, APIkey) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) { // readyState == DONE and status == OK
      //document.getElementById("debug").innerHTML = xhttp.responseText; //for debugging
      responseData = JSON.parse(xhttp.responseText);
    }
  };
  xhttp.open("GET", url, false);
  xhttp.setRequestHeader("token", APIkey.trim());
  xhttp.send();
  return responseData;
}

//var urlcheck = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCNDMS&stationid=GHCND:USR0000VASH&startdate=2000-05-01&enddate=2001-05-01'
//var urlcheck = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes/MMXT'
//var urlcheck = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCNDMS&stationid=GHCND:GME00102244&startdate=2000-05-01&enddate=2001-05-01'
//var url = baseUrl + endpoint
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?limit=1000'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=50,8,52,10'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations/GHCND:GME00102276'
//var urlcheck = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:GME00035010'
//var urlcheck = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=50.5204,8.0047,52.6139,10.1065&datasetid=GHCNDMS'
//var urlcheck = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:GME00102276'
//var urlcheck = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:GME00102244'
