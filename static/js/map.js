import { DEV, MINZOOM, MAXZOOM, GROUPS, mapConfig } from './site.js';

function map_resizer(mapdiv) {
    return () => {
        const parentHeight = mapdiv.parentElement.clientHeight;
        mapdiv.style.height = `${parentHeight}px`;
    };
}

export default async function setupMap(mapdiv, target, zoom, offset) {
    const xTiles = mapConfig.xTiles;
    const yTiles = mapConfig.yTiles;
    const mapWidth = mapConfig.width;
    const mapHeight = mapConfig.height;
    const bounds = [[0,0], [mapHeight,mapWidth]];

    const resizer = map_resizer(mapdiv);
    addEventListener('resize', resizer);
    resizer();

    let map = L.map(mapdiv, {
        crs: L.CRS.Simple,
        maxBounds: bounds,
        zoomSnap: 0,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 70,
    });

    let tileLayers = {};
    mapConfig.layers.forEach((name, index) => {
        if (DEV)
            name += "_dev";

        let tile_url = `/tiles/${name}/{z}_{x}_{y}.webp`;
        console.log("Generating map layer", name, "at", tile_url);

        let layer = L.tileLayer(tile_url, {
            bounds: bounds,
            tileSize: L.point(mapWidth/xTiles, mapHeight/yTiles),
            minZoom: MINZOOM,
            maxZoom: MAXZOOM,
            minNativeZoom: 0,
            maxNativeZoom: 0,
            noWrap: true,
            attribution: "Generated with <a href='https://azgaar.github.io/Fantasy-Map-Generator/'>Azgaar's Fantasy Map Generator</a>"
        });
        
        if (!index)
            layer.addTo(map);
        tileLayers[name] = layer;
    });

    if (mapConfig.layers.length > 1)
        L.control.layers(tileLayers).addTo(map);

    map.fitBounds(bounds);

    if (target)
        map.setView(target, zoom || 0);
    else
        map.setView([817,345], zoom || 0);

    const groups = new Map();
    for (const desc of GROUPS) {
        const group = {
            name: desc.name,
            minZoom: desc.minZoom,
            maxZoom: desc.maxZoom,
            group: L.layerGroup(),
        };
        if (desc.icon)
            group.icon = L.icon({
                    iconUrl: desc.icon,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    className: `map-icon-${desc.name}`,
                });
        groups.set(desc.name, group);
    }

    let coordsPopup = L.popup();
    map.on('click', e => {
        if (e.originalEvent.ctrlKey) {
            coordsPopup
                .setLatLng(e.latlng)
                .setContent(`Location: [${e.latlng.lat}, ${e.latlng.lng}]`)
                .openOn(map);
        }
    });

    const checkMarkers = (map) => {
        const z = map.getZoom() + (offset || 0);

        groups.forEach(group => {
            const shouldHave = (z >= group.minZoom && z <= group.maxZoom);
            if (shouldHave) {
                if (!map.hasLayer(group.group))
                    map.addLayer(group.group);
            } else {
                if (map.hasLayer(group.group))
                    map.removeLayer(group.group);
            }
        });
    };
    map.on('zoomend', e => {
        checkMarkers(map);
    });

    const add_markers = (markers, link) => {
        markers.forEach(marker => {
            if (!marker) return;

            let group = groups.get(marker.group);
            if (!group || !marker.pos)
                return;

            const onClick = () => {
                const dest = marker.name
                    .replaceAll(/[\s]/g, "-")
                    .replaceAll(/['\\/_+,.]/g, "");
                window.location.href = `/pages/${dest}`;
            };

            let className = `map-tooltip-${group.name}`;
            if (!link)
                className += ` map-tooltip-nolink`;

            const tipOptions = {
                direction: 'bottom',
                className,
                permanent: true,
                interactive: link,
            };

            const label = marker.label || marker.name;

            if (group.icon) {
                let m = L.marker(marker.pos, {icon: group.icon, interactive: link})
                    .bindTooltip(label, tipOptions)
                    .addTo(group.group);

                if (link) {
                    m.on('click', onClick);
                    m.getTooltip().on('click', onClick);
                }
            } else {
                const t = L.tooltip(tipOptions)
                    .setLatLng(marker.pos)
                    .setContent(label)
                    .addTo(group.group);

                if (link)
                    t.on('click', onClick)
            }

        });
        checkMarkers(map);

    };

    // Real link markers
    fetch('/data/mapmarkers.json')
        .then( resp => resp.json() )
        .then( markers => add_markers(markers, true) );

    // Extra defined markers
    fetch('/data/mapmarkers_extra.json')
        .then( resp => resp.json() )
        .then( markers => add_markers(markers, false) );
}
