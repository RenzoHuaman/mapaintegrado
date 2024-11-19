const mapboxAccessToken = 'pk.eyJ1IjoibWFyY2NhbGRlcm9uIiwiYSI6ImNtM2Mwdno3djFpdnQyam45ZmNweGNmcGgifQ.0-VvBD5ZHNPP08RUs7XErw';
let map, mode = '', routeControl, trafficLayer, startMarker, endMarker;

document.getElementById('conductor-btn').addEventListener('click', function() {
    mode = 'conductor';
    initializeMap();
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    document.getElementById('controls').style.display = 'block'; // Mostrar controles del conductor
});

document.getElementById('deportista-btn').addEventListener('click', function() {
    mode = 'deportista';
    initializeMap();
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    document.getElementById('controls').style.display = 'none'; // Ocultar controles del conductor
    addAirQualityZones(); // Solo añadir zonas de calidad de aire en "Deportista"
});

document.getElementById('reset-btn').addEventListener('click', function() {
    // Restablecer el modo
    mode = '';
    
    // Mostrar la selección de modo
    document.getElementById('mode-selection').style.display = 'block';
    document.getElementById('map').style.display = 'none';
    
    // Limpiar el mapa y reiniciar
    if (map) {
        map.remove();  // Elimina el mapa actual
    }
    initializeMap();  // Inicializa un nuevo mapa limpio
});

// Función para inicializar el mapa
function initializeMap() {
    map = L.map('map').setView([-33.4419, -70.6463], 13); // Coordenadas centradas en Santiago, Chile
    L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`, {
        attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);

    // Si el modo es "Conductor", mostramos las rutas y tráfico
    if (mode === 'conductor') {
        addRoute();  // Llamamos a la función para agregar una ruta
    }
}

// Función para activar y desactivar tráfico
document.getElementById('toggle-traffic-btn').addEventListener('click', function() {
    if (trafficLayer) {
        map.removeLayer(trafficLayer); // Si el tráfico está visible, lo quitamos
        trafficLayer = null;
        this.textContent = 'Activar tráfico'; // Cambiar texto del botón
    } else {
        trafficLayer = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`, {
            attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map);
        this.textContent = 'Desactivar tráfico'; // Cambiar texto del botón
    }
});

// Función para agregar una ruta (para el modo conductor)
function addRoute() {
    // Elimina cualquier ruta anterior
    if (routeControl) {
        map.removeControl(routeControl);
    }

    routeControl = L.Routing.control({
        waypoints: [],  // Comienza sin waypoints
        routeWhileDragging: true
    }).addTo(map);

    // Permitir que el usuario elija el punto de inicio y destino
    map.on('click', function(e) {
        if (!startMarker) {
            startMarker = L.marker(e.latlng).addTo(map);
            routeControl.spliceWaypoints(0, 1, e.latlng); // Establecer el punto de inicio
        } else if (!endMarker) {
            endMarker = L.marker(e.latlng).addTo(map);
            routeControl.spliceWaypoints(1, 1, e.latlng); // Establecer el punto de destino
        }

        // Si ambos marcadores están presentes, activar la ruta
        if (startMarker && endMarker) {
            routeControl.setWaypoints([startMarker.getLatLng(), endMarker.getLatLng()]);
        }
    });
}

// Función para limpiar la ruta ingresada
document.getElementById('clear-route-btn').addEventListener('click', function() {
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
    }
});

// Función para añadir zonas de calidad de aire (para el modo deportista)
function addAirQualityZones() {
    const zones = [
        { lat: -33.435, lon: -70.641 },
        { lat: -33.440, lon: -70.650 },
        { lat: -33.445, lon: -70.640 },
        { lat: -33.450, lon: -70.653 },
        { lat: -33.455, lon: -70.644 },
        { lat: -33.460, lon: -70.660 },
        { lat: -33.445, lon: -70.660 }
    ];

    const riskLevels = [
        { level: "Bajo", color: "green", diseases: "Sin riesgo significativo." },
        { level: "Moderado", color: "yellow", diseases: "Personas con asma podrían sentir molestias leves." },
        { level: "Alto", color: "orange", diseases: "Personas con enfermedades respiratorias deben tener precaución." },
        { level: "Muy Alto", color: "red", diseases: "Riesgo elevado para personas con asma o EPOC." }
    ];

    zones.forEach(zone => {
        const pm = Math.random() * 200;
        const no2 = Math.random() * 100;
        const co = Math.random() * 50;
        const co2 = Math.random() * 500;
        const riskIndex = Math.floor(Math.random() * riskLevels.length);
        const risk = riskLevels[riskIndex];

        const popupContent = `
            PM: ${pm.toFixed(1)} µg/m³<br>
            NO₂: ${no2.toFixed(1)} µg/m³<br>
            CO: ${co.toFixed(1)} ppm<br>
            CO₂: ${co2.toFixed(1)} ppm<br>
            Nivel de riesgo: ${risk.level}<br>
            Advertencia: ${risk.diseases}
        `;

        const circle = L.circle([zone.lat, zone.lon], {
            color: risk.color,
            fillColor: risk.color,
            fillOpacity: 0.5,
            radius: 500
        }).addTo(map);

        circle.bindPopup(popupContent);
    });
}