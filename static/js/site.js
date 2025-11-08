export const DEV = document.location.search.includes("dev");
export const MINZOOM = -0.5;
export const MAXZOOM = (DEV && 4) || 3;
export const GROUPS = [
    {name: "towns", minZoom: 1.5, maxZoom: MAXZOOM, icon: '/images/town_marker.svg'},
    {name: "cities", minZoom: 0.5, maxZoom: MAXZOOM, icon: '/images/city_marker.svg'},
    {name: "sites", minZoom: 1.5, maxZoom: MAXZOOM, icon: '/images/chevron_marker.svg'},
    {name: "states", minZoom: -0.5, maxZoom: 2},
    {name: "features", minZoom: 0, maxZoom: 2.5},
];

export const mapStyle = {
    bounds: [[0,0],[1350,950]],
    borders: {
        smoothFactor: 3.0,
        color: "#6f2020",
        dashArray: "1 5 3 5",
        weight: 2,
        noClip: false,
    },
};
