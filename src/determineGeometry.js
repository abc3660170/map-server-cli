import { union, clone, bbox, bboxPolygon, point, featureCollection } from "@turf/turf";

export default function(argv){
    let geojson = [];
    var coords = String(argv.extent).split(',').map(parseFloat);

    geojson = featureCollection([
        point([coords[1], coords[0]]),
        point([coords[3], coords[2]])
    ]);
    geojson = bboxPolygon(bbox(geojson));

    if(geojson.type === 'FeatureCollection'){
        var merged = clone(geojson.features[0]),features = geojson.features;
        for(var i = 0; i < features.length; i++){
            var poly = features[i];
            if (poly.geometry) merged = union(merged, poly);
        }
        geojson = merged;
    }

    if (geojson.type === 'Feature') {
        geojson = geojson.geometry;
    }

    return geojson;
}
