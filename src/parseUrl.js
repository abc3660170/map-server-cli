import { displayHelp } from "./commander";
var validateurlparam = function(template, param) {
	if (template.indexOf(param) === -1) {
		displayHelp();
		console.error('URL missing ' + param + ' parameter');
		process.exit(1);
	}
};

export default function(argv){
    var url = decodeURIComponent(argv._.slice(2)[0]);
    if (!/^https?\:/.test(url)) {
        displayHelp();
        console.error('No url template provided');
        process.exit(1);
    }
    validateurlparam(url, '{x}');
    validateurlparam(url, '{y}');
    validateurlparam(url, '{z}');
    console.log(url);
    return url
}

