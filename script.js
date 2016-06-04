var stationKeys;

window.onload = function () {
  //if (localStorage.get("hasCodeRunBefore") === null) {
    d3.csv("ghcnd-stations.csv",function(error,data) {
      console.log(error);
      console.log(data[0]);
      stationKeys = data;
    });
  //  localStorage.setItem("hasCodeRunBefore", true);
  //}
}

var jsonData;

function fahrenheitToCelcius(fahrTemp) {
  return (fahrTemp - 32) * 5 / 9;
}

var mapDataKeysToLabels = {
  "TMAX":"Max temperature / Celcius",
  "TMIN":"Min temperature / Celcius",
  "PRCP":"Precipitation / mm       "
}

 
function updatePlot() {
  //TODO fire when dropdownData is changed
  //TODO clear plot
  //var string = '';
  //string = 'Plotting '+ dropdownData.value + ' data for stations ' + dropdownCity1.value + ' and ' + dropdownCity2.value;
  d3.json('backup.json',draw);
  //draw(jsonData);
  //draw(testData);
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
      jsonData = JSON.parse(xhttp.responseText);
      console.log(jsonData.results[0]);
    }
  };
  console.log(url);
  //get url from dropdownCity1.value and dropdownCity2.value
  xhttp.open("GET", url, false);
  xhttp.setRequestHeader("token",APIkey.trim());
  xhttp.send();
}

function draw(data) {
  //"use strict";
  //which data to plot?
  var dropdownData = document.getElementById("dropdownData");
  var dataKey = dropdownData.value;
  console.log(dataKey);
  var xlabel = "time";
  var ylabel = mapDataKeysToLabels[dataKey];

  //viewport
  var margin = 50,
      width = 700,
      height = 300;
  d3.select("body")
    .append("svg")
      .attr("width",width)
      .attr("height",height)
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle");

  //TODO instead of y use dataKey
  //TODO make extent bigger
  var xExtent = d3.extent(data, function(d){return d.x});
  var xScale = d3.scale.linear()
      .range([margin,width-margin])
      .domain(xExtent);
  var yExtent = d3.extent(data, function(d){return d.y});
  var yScale = d3.scale.linear()
      .range([height-margin,margin])
      .domain(yExtent);

  //points  
  d3.selectAll("circle")
      .attr("cx", function(d){return xScale(d.x)})
      .attr("cy", function(d){return yScale(d.y)})
      .attr("r", 5);

  //lines
  var line = d3.svg.line()
      .x(function(d){return xScale(d.x)})
      .y(function(d){return yScale(d.y)})
  d3.select("svg")
    .append("path")
      .attr("d", line(data))
 
  //axes
  var xAxis = d3.svg.axis().scale(xScale);
  d3.select("svg")
    .append("g")
      .attr("class","x axis")
      .attr("transform", "translate(0," + (height-margin) + ")")
    .call(xAxis);
  d3.select(".x.axis")
    .append("text")
      .text(xlabel)
      .attr("x", (width/2)-margin)
      .attr("y", margin/1.5);
    
  var yAxis = d3.svg.axis().scale(yScale).orient("left");
  d3.select("svg")
    .append("g")
      .attr("class","y axis")
      .attr("transform", "translate(" + margin + ", 0 )")
    .call(yAxis);
  d3.select(".y.axis")
    .append("text")
      .text(ylabel)
      .attr("transform", "rotate (-90, -43, 0) translate(-280)")

}


// ****** NOAA URLs ********** 
var baseUrl = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/'
var endpoint = 'stations'
//var url = baseUrl + endpoint
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?limit=1000'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=50,8,52,10'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations/GHCND:GME00102276'
var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=GHCND:GME00102276&startdate=2010-05-01&enddate=2010-05-01'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:GME00102276'


