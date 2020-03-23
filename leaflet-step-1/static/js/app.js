// Store API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";


// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {

  // pass the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "</h3><h3>Location: " + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },

    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {
          radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.properties.mag),
          fillOpacity: .6,
          stroke: true,
          weight: .8
        })
    }
  });
  createMap(earthquakes);
}

// function to determine marker size based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 20000;
}

// function to determine marker color based on earthquake magnitude
function markerColor(m) {
  return m > 5 ? '#80026' :
        m > 4 ? '#BD0026' :
        m > 3 ? '#FC4E2A' :
        m > 2 ? '#FEB24C' :
        m > 1 ? '#FED976' :
              '#FFEDA0'; 
}

// function to crate map
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Define legend, using earthquake magnitude as the color scale
  var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 1, 2, 3, 4],
			labels = [],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + markerColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(myMap);


  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}