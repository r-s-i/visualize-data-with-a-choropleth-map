let width = 950;
let height = 600;

const svg = d3
  .select("main")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

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
      .attr("class", "county");
  });
