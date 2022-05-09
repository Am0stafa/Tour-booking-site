
export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1IjoiMHhhYmRvbW9zdGFmYSIsImEiOiJjbDJpbWFrd2QwaGpoM2pxNm03ZTd0djczIn0.bBuPr0SL-bzhwsRHiQOKxg';
    
    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      scrollZoom: false,
      //  center: [-74.5, 40], // starting position [lng, lat]
       zoom: 15 // starting zoom
    });
    
    //! what we basically want to do is put all the locations for a certain tour on the map and then the map will fit all this points by creating a bound variable which will be the area that will be displayed on the map; and we get access to this mapboxgl object as we included it at the beginning of our page.
    
    
    const bounds = new mapboxgl.LngLatBounds();
  
    //^ now we loop over the locations and make a mark above each one
  
    locations.forEach(loc => {
      //& Create marker
      const el = document.createElement('div');
      el.className = 'marker';
  
      //& Add marker
      new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(loc.coordinates)
        .addTo(map);
  
      //* here we create a pop up which will display information about the location above the mark and it is a bit similar to creating a marker
    
      //& Add popup

      new mapboxgl.Popup({offset: 30})
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
        
    
      //? the last thing we need to to
      //& Extend map bounds to include current location
      bounds.extend(loc.coordinates);
    });
    
    //! we need to make sure that the map fits the bound and what will this do is moves and zooms the mapp right to the bounds to fit our markers
    
    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
      }
    });
  };
  