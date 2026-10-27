   
(() => {
    const container = document.getElementById('map');
    const validCoordinates = Array.isArray(coordinates) && coordinates.length === 2 &&
        coordinates.every((value) => Number.isFinite(Number(value)));

    const showMapError = (message) => {
        if (container) container.textContent = message;
        console.error(message);
    };

    if (!container || !mapToken || !validCoordinates || !window.mapboxgl) {
        const reason = !container
            ? 'the map container is missing.'
            : !mapToken
                ? 'the Mapbox token is missing from the page.'
                : !validCoordinates
                    ? 'this listing has no valid coordinates.'
                    : 'the Mapbox library did not load.';
        showMapError(`Map unavailable: ${reason}`);
        return;
    }

    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/standard',
        center: coordinates.map(Number),
        zoom: 9
    });

    const popup = new mapboxgl.Popup({ offset: 25 })
        .setText(listingLocation || 'Listing location');
    new mapboxgl.Marker({ color: '#e11d48' })
        .setLngLat(coordinates.map(Number))
        .setPopup(popup)
        .addTo(map);



    map.on('error', (event) => console.error('Mapbox map error:', event.error));
})();
