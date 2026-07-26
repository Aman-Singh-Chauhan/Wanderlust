console.log(typeof listingData);
console.log(listingData);

if (!mapToken) {
  console.error('Mapbox token is not set. Set MAP_TOKEN in your environment.');
}

// let listing = listingData;
// if (typeof listingData === 'string') {
//   try {
//     listing = JSON.parse(listingData);
//   } catch (error) {
//     console.error('Failed to parse listingData:', error);
//     listing = {};
//   }
// }
const listing = listingData;
console.log('Map debug', { mapToken, listing });
mapboxgl.accessToken = mapToken;

const defaultCenter = [-74.5, 40];
let center = defaultCenter;
let zoom = 3;
let markerData = null;

if (listing.geometry && Array.isArray(listing.geometry.coordinates) && listing.geometry.coordinates.length === 2) {
  center = listing.geometry.coordinates;
  zoom = 12;
  markerData = {
    coordinates: center,
    title: listing.title || 'Listing Location',
  };
}

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center,
  zoom,
});

function addMarker(coords, title) {
  new mapboxgl.Marker({ color: 'red' })
    .setLngLat(coords)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${title}</h4><p>Exact location will be shown here.</p>`
      )
    )
    .addTo(map);
}

function setMapView(coords) {
  map.flyTo({ center: coords, zoom: 12 });
  addMarker(coords, listing.title || 'Listing');
}

map.on('load', () => {
  if (markerData) {
    setMapView(markerData.coordinates);
    return;
  }

  if (listing.location || listing.country) {
    const query = `${listing.location || ''}, ${listing.country || ''}`.trim();
    if (query) {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapToken}&limit=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const coords = data.features[0].center;
            setMapView(coords);
          } else {
            console.warn('Geocoding returned no results for query:', query);
          }
        })
        .catch((error) => {
          console.error('Geocoding error:', error);
        });
      return;
    }
  }
  console.warn('Listing geometry missing or invalid; map is centered at default location.');
});
