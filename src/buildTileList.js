import tilecover from "@mapbox/tile-cover";
export default function(geojson, argv){
    const zooms = [];
    const parts = argv.zoom.split('-').map(Number);
    const minzoom = parts[0];
    const maxzoom = parts[1];
    for (let z = minzoom; z <= maxzoom; z++) {
        zooms.push(z);
    }
    return buildTileList(geojson, zooms);
}

function buildTileList(geojson, zooms) {
	var groups = [];
    zooms.forEach(function(z) {
        groups.push(tilecover.tiles(geojson, {min_zoom: z, max_zoom: z}));
    });
    var result = [];
    return result.concat.apply(result, groups);
}