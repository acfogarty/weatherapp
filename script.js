//global variables
var weatherData; //data from both stations from request to NOAA API
var stationName1,stationName2;
var stationNameToId = {}; //map name to GHCND ID
var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
var yBuffers = { //for adding padding on y axis inside plot
  "TMAX":5,
  "TMIN":5,
  "PRCP":5,
  "TPCP":5,
  "MMNT":5,
  "MMXT":5,
}; 
var APIkey;

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
 
function updatePlot() {
  //d3.json('backup.json',draw);
  //console.log(weatherData);
  draw(weatherData);
}

// read NOAA API key from plain text file
function getAPIKey() {
  var xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType('text/plain');
  xhttp.open("GET",'APIkey',false);
  xhttp.send();
  return xhttp.responseText;
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

function draw(data) {
  //"use strict";
  d3.selectAll("svg > *").remove();  // for refresh/redraw

  // axis labels
  var dataKey = document.getElementById("dropdownDataKey").value; //TODO maybe make this global
  var xlabel = "time";
  var ylabel = mapDataKeysToLabels[dataKey];

  //viewport
  var margin = 90,
      width = 750,
      height = 350;
  d3.select("body")
    .append("svg")
      .attr("width",width)
      .attr("height",height)
    .append("g")
      .attr("class","chart");

  d3.select("svg")
    .selectAll("circle.station1")
    .data(data.station1.results)
    .enter()
    .append("circle")
      .attr("class","station1");

  d3.select("svg")
    .selectAll("circle.station2")
    .data(data.station2.results)
    .enter()
    .append("circle")
      .attr("class","station2");

  var xExtent = d3.extent(
    data.station1.results.concat(data.station2.results),
    function(d){return timeFormat.parse(d.date)}
  );
  //var xExtent = [new Date(2000, 3, 1),new Date(2001, 6, 1)]
  var xScale = d3.time.scale()
      .range([margin,width-margin])
      .domain(xExtent);

  var yBuffer = yBuffers[dataKey];
  var yExtent = d3.extent(
    data.station1.results.concat(data.station2.results),
    function(d){return d.value}
  );
  var yScale = d3.scale.linear()
      .range([height-margin,margin])
      .domain([yExtent[0]-yBuffer,yExtent[1]+yBuffer]);

  //points  
  d3.selectAll("circle")
      .attr("cx", function(d){return xScale(timeFormat.parse(d.date))})
      .attr("cy", function(d){return yScale(d.value)})
      .attr("r", 5);

  //lines
  var line = d3.svg.line()
      .x(function(d){return xScale(timeFormat.parse(d.date))})
      .y(function(d){return yScale(d.value)});
  d3.select("svg")
    .append("path")
      .attr("d", line(data.station1.results))
      .attr("class", "station1");
  d3.select("svg")
    .append("path")
      .attr("d", line(data.station2.results))
      .attr("class", "station2");
 
  //axes
  var xAxis = d3.svg.axis().scale(xScale);
  d3.select("svg")
    .append("g")
      .attr("class","x axis")
      .attr("transform", "translate(0," + (height-margin) + ")")
    .call(xAxis)
    // rotate x-axis tick labels
    .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");
//  d3.select(".x.axis")
//    .append("text")
//      .text(xlabel)
//      .attr("x", (width/2)-margin)
//      .attr("y", margin/1.5);
    
  var yAxis = d3.svg.axis().scale(yScale).orient("left");
  d3.select("svg")
    .append("g")
      .attr("class","y axis")
      .attr("transform", "translate(" + margin + ", 0 )")
    .call(yAxis);
  d3.select(".y.axis")
    .append("text")
      .text(ylabel)
      .attr("transform", "rotate (-90, -43, 0) translate(-340)")

  var color = d3.scale.ordinal()
    .domain([stationName1,stationName2])
    .range(["RoyalBlue", "MediumSeaGreen"]);
 
  // legend 
  legendRectSize=10
  legendSpacing=10
  var legend = d3.select('svg')
    .append("g")
    .selectAll("g")
    .data(color.domain())
    .enter()
    .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var lheight = legendRectSize;
          var x = width/2;
          var y = i * lheight + height/3;
          return 'translate(' + x + ',' + y + ')';
      });
  
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color);
   
  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d; });

}


// ****** NOAA URLs ********** 
var baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCNDMS&stationid=GHCND:'
//var dateUrl = '&startdate=2000-05-01&enddate=2001-05-01'
var typeUrl = '&datatypeid='
var endpoint = 'stations'
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


