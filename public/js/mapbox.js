/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWx2aXMxIiwiYSI6ImNsdGh2YndjYTA5MWkya3A1ZjF2NHcyNDQifQ.noihy6RN6wujGqxpr1oYIA';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/alvis1/clti1k3or00k401ph9u6rbbyr',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const elem = document.createElement('div');
    elem.className = 'marker';

    new mapboxgl.Marker({
      element: document.createElement('div'),
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
