var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
var yBuffers = { //for adding padding on y axis inside plot
  "TMAX":5,
  "TMIN":5,
  "PRCP":5,
  "TPCP":5,
  "MMNT":5,
  "MMXT":5,
}; 

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
        var lheight = legendRectSize + legendSpacing;
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
    .attr('y', legendRectSize)
    .text(function(d) { return d; });

}

