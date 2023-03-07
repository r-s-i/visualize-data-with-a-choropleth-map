const main = d3.select("main").node();
const width = main.clientWidth;
const height = main.clientHeight;

const svg = d3
  .select("main")
  .append("svg")
  .attr("viewbox", `0 0 ${width} ${height}`);

const colors = [
  "rgb(210, 255, 255)",
  "rgb(180, 255, 255)",
  "rgb(135, 255, 204)",
  "rgb(90, 255, 153)",
  "rgb(45, 255, 102)",
  "rgb(0, 255, 0)",
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
        .fitSize([width * 0.95, height], counties);
      const path = d3.geoPath(projection);

      svg
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

      const legend = svg
        .append("g")
        .attr("id", "legend")
        .attr("transform", `translate(0,0)`);
      legend
        .selectAll("rect")
        .data(colors)
        .enter()
        .append("rect")
        .attr("x", (_, i) => width * 0.5 + width * 0.02 * i)
        .attr("y", 1)
        .attr("width", width * 0.02)
        .attr("height", height * 0.02)
        .style("fill", (_, i) => colors[i]);
    });
}
drawMap();

function resize() {
  // For the svg itself:
  const newWidth = main.clientWidth;
  const newHeight = main.clientHeight;
  svg.attr("width", newWidth);
  svg.attr("height", newHeight);

  // For the map:
  const projection = d3.geoIdentity().fitSize([newWidth, newHeight], counties);
  const path = d3.geoPath(projection);
  svg.selectAll(".county").attr("d", path);
  const legend = svg
    .select("#legend")
    .selectAll("rect")
    .attr("x", (_, i) => newWidth * 0.5 + newWidth * 0.02 * i)
    .attr("width", newWidth * 0.02)
    .attr("height", newHeight * 0.02);
}

d3.select(window).on("resize", resize);
