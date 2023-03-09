const main = d3.select("main").node();
const width = main.clientWidth;
const height = main.clientHeight;

const svg = d3
  .select("main")
  .append("svg")
  .attr("viewbox", `0 0 ${width} ${height}`);
const map = svg.append("g");

const colors = [
  "rgb(255, 215, 0)",
  "rgb(255, 255, 0)",
  "rgb(173, 255, 47)",
  "rgb(69, 171, 47)",
  "rgb(34, 139, 34)",
  "rgb(0, 128, 0)",
];

let counties; // Need to be accessible in both drawMap and update.
async function drawMap() {
  const educationData = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  )
    .then((respons) => respons.json())
    .then((data) => data);

  fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  )
    .then((respons) => respons.json())
    .then((data) => {
      counties = topojson.feature(data, data.objects.counties);

      const projection = d3
        .geoIdentity()
        .fitSize([width * 0.9, height * 0.9], counties);
      const path = d3.geoPath(projection);

      map.attr("transform", `translate(${0}, ${height * 0.05})`);
      map
        .selectAll("path")
        .data(counties.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "county")
        .attr("data-fips", (d) => d.id)
        .attr("data-education", (d, i) => {
          for (let i = 0; i < educationData.length; i++) {
            if (d.id === educationData[i].fips) {
              return educationData[i].bachelorsOrHigher;
            }
          }
        })
        .attr("countyName", (d) => {
          for (let i = 0; i < educationData.length; i++) {
            if (d.id === educationData[i].fips) {
              return educationData[i].area_name;
            }
          }
        })

        .style("fill", (d) => {
          for (let i = 0; i < educationData.length; i++) {
            if (d.id === educationData[i].fips) {
              const bachelorsOrHigher = educationData[i].bachelorsOrHigher;
              if (bachelorsOrHigher > 50) {
                return colors[0];
              } else if (bachelorsOrHigher > 40) {
                return colors[1];
              } else if (bachelorsOrHigher > 30) {
                return colors[2];
              } else if (bachelorsOrHigher > 20) {
                return colors[3];
              } else if (bachelorsOrHigher > 10) {
                return colors[4];
              } else {
                return colors[5];
              }
            }
          }
        })

        .on("mouseover", (e) => {
          const attributes = e.target.attributes;
          const countyName = attributes.countyName.value;
          const countyProcent = attributes["data-education"].value;
          const tooltipOuter = svg
            .append("g")
            .attr("id", "tooltip")
            .attr("data-education", countyProcent);

          const tooltipInner = tooltipOuter
            .append("foreignObject")
            .attr("width", 250)
            .attr("height", 50)
            .html(`${countyName}: ${countyProcent} %`);
        })
        .on("mouseout", (e) => {
          const tooltipOuter = d3.select("#tooltip");
          tooltipOuter.remove();
        });

      addingLegend(width, height);
    });
}
drawMap();

function resize() {
  // For the svg itself:
  const newWidth = main.clientWidth;
  const newHeight = main.clientHeight;
  map.attr("width", newWidth);
  map.attr("height", newHeight);

  // For the paths:

  const projection = d3
    .geoIdentity()
    .fitSize([newWidth * 0.9, newHeight * 0.9], counties);
  const path = d3.geoPath(projection);
  map.selectAll(".county").attr("d", path);

  // For legend:
  addingLegend(newWidth, newHeight);
}

d3.select(window).on("resize", resize);

function addingLegend(width, height) {
  const prevLegend = d3.select("#legend");
  prevLegend.remove();

  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${width * 0.5}, 1)`);

  legend
    .selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("x", (_, i) => -width * 0.07 + width * 0.02 * i)
    .attr("width", width * 0.02)
    .attr("height", height * 0.02)
    .style("fill", (_, i) => colors[colors.length - 1 - i]);

  const xScale = d3
    .scaleThreshold()
    .range(
      Array.from({ length: 7 }, (_, i) => {
        return -width * 0.07 + i * width * 0.02;
      })
    )
    .domain(["10", "20", "30", "40", "50+"]);

  const xAxis = d3.axisBottom(xScale);

  const line = legend
    .append("g")
    .attr("transform", `translate(${0}, ${height * 0.02})`)
    .call(xAxis);

  line
    .selectAll("text")
    .attr("y", (_, i) => {
      if (width < 900 && i % 2 === 1) {
        return 16;
      } else {
        return 8;
      }
    })
    .attr("x", (e) => {
      if (e.includes("+")) {
        return 3;
      }
    })
    .attr("font-size", "8");
}
