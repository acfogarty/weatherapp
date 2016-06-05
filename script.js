var stationNameToId = {};
var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
var temperatureBuffer = 5; //for adding padding inside plot

window.onload = function () {
  //if (localStorage.get("hasCodeRunBefore") === null) {
    d3.csv("ghcnd-stations.csv",function(error,data) {
      console.log(error);
      for (var i in data) {
        if ((Math.abs(parseFloat(data[i].latitude) - 50.0) < 2.0) && (Math.abs(parseFloat(data[i].longitude) - 10.0) < 2.0)) {
          stationNameToId[data[i].locationname.trim()] = data[i].locationid.trim();
          //console.log(data[i].locationname.trim());
        }
      }
    });
  //  localStorage.setItem("hasCodeRunBefore", true);
  //}
}

var jsonData;

function fahrenheitToCelcius(fahrTemp) {
  return (fahrTemp - 32) * 5 / 9;
}

//units are for output data, not for data read from NOAA
//data must be converted
var mapDataKeysToLabels = {
  "TMAX":"Max temperature / Celcius",
  "TMIN":"Min temperature / Celcius",
  "PRCP":"Precipitation / mm       ",
  "TPCP":"Total precipitation for the month / mm", //inches on NOAA
  "MMNT":"Monthly mean minimum temperature / Celcius", //Fahrenheit on NOAA
  "MMXT":"Monthly mean maximum temperature / Celcius", //Fahrenheit on NOAA
}

 
function updatePlot() {
  //TODO fire when dropdownData is changed
  //TODO clear plot
  //var string = '';
  //string = 'Plotting '+ dropdownData.value + ' data for stations ' + dropdownCity1.value + ' and ' + dropdownCity2.value;
  //d3.json('backup.json',draw);
  draw(jsonData.results);
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
      //console.log(jsonData.results[0]);
      //console.log(jsonData.results[1]);
    }
  };
  url = baseUrl + stationNameToId["KASSEL"] + dateUrl + typeUrl;
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

  //TODO make extent bigger as a function of which data is plotted
  var yBuffer = temperatureBuffer;
  var xExtent = d3.extent(data, function(d){return timeFormat.parse(d.date)});
  //var xExtent = [new Date(2000, 3, 1),new Date(2001, 6, 1)]
  var xScale = d3.time.scale()
      .range([margin,width-margin])
      .domain(xExtent);
  var yExtent = d3.extent(data, function(d){return d.value});
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
      .y(function(d){return yScale(d.value)})
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
var baseUrl = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCNDMS&stationid=GHCND:'
var dateUrl = '&startdate=2000-05-01&enddate=2001-05-01'
var typeUrl = '&datatypeid=MMXT'
var endpoint = 'stations'
//var url = baseUrl + endpoint
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?limit=1000'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=50,8,52,10'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/stations/GHCND:GME00102276'
var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:GME00102276'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=GHCND:GME00102276&startdate=2010-05-01&enddate=2010-05-01'
//var url = 'http://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:GME00102276'


