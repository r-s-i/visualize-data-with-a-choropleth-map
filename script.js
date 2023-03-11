const main = d3.select("main").node();
let width = main.clientWidth;
let height = main.clientHeight;

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

let counties; // Need to be accessible in both drawMap and resize.
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
          addingTooltip(width, height, e);
        })
        .on("mouseout", (e) => {
          removingTooltip(e);
        });

      addingLegend(width, height);
    });
}
drawMap();

function resize() {
  width = main.clientWidth;
  height = main.clientHeight;
  map.attr("width", width);
  map.attr("height", height);
  map.attr("transform", `translate(${0}, ${height * 0.05})`);

  const projection = d3
    .geoIdentity()
    .fitSize([width * 0.9, height * 0.9], counties);
  const path = d3.geoPath(projection);
  map.selectAll(".county").attr("d", path);

  addingLegend(width, height);
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
      if (width < 600 && i % 2 === 1) {
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

function addingTooltip(width, height, e) {
  const attributes = e.target.attributes;
  const countyName = attributes.countyName.value;
  const countyProcent = attributes["data-education"].value;

  const tooltip = svg
    .append("foreignObject")
    .attr("id", "tooltip")
    .attr("data-education", countyProcent)
    .attr("width", width * 0.5)
    .attr("height", height * 0.04)
    .attr("y", height - height / (100 / 4))
    .attr("x", width / 2 - width * 0.25)
    .html(`${countyName}: <span class="nobr">${countyProcent} %</span>`);

  e.target.style.opacity = 0.33;
}
function removingTooltip(e) {
  const tooltip = d3.select("#tooltip");
  tooltip.remove();

  e.target.style.opacity = 1;
}

// Non-d3 related code:
const $ = (id) => document.getElementById(id);

const test = $("tests");
const fccTest = $("fcc_test_suite_wrapper");
fccTest.style.visibility = "hidden";
test.addEventListener("mouseup", (i) => {
  if (fccTest.style.visibility === "hidden") {
    fccTest.style.visibility = "visible";
  } else {
    fccTest.style.visibility = "hidden";
  }
});

const infoButton = $("info-b");
const infoAside = $("info-a");
infoButton.addEventListener("mouseup", (i) => {
  infoAside.classList.toggle("visible");
});
