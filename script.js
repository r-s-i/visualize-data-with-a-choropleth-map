let width = 950;
let height = 600;

const svg = d3
  .select("main")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const colors = [
  "rgb(0, 255, 0)",
  "rgb(45, 255, 102)",
  "rgb(90, 255, 153)",
  "rgb(135, 255, 204)",
  "rgb(180, 255, 255)",
  "rgb(210, 255, 255)",
];

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
      const counties = topojson.feature(data, data.objects.counties);
      const path = d3.geoPath();

      svg
        .selectAll("path")
        .data(counties.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "county")
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
        });
    });
}
drawMap();
