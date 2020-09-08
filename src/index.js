import commander from "./commander";
import parseUrl from "./parseUrl";
import determineGeometry from "./determineGeometry";
import buildTileList from "./buildTileList";
import makeHeaders from "./makeHeaders";
import fetchTilesAndStatistic from "./request";
const argv = commander({
    method: 'GET'
});
const urlTemplate = parseUrl(argv);
const geojson = determineGeometry(argv);
const xyzList = buildTileList(geojson, argv);
const headers = makeHeaders(argv);
const fetchTask = new fetchTilesAndStatistic(argv, {urlTemplate, headers, xyzList});
fetchTask.start();