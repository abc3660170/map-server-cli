export default function(argv){
    const headers = {};
    if (argv.header) {
        if (!Array.isArray(argv.header)) argv.header = [argv.header];
        argv.header.forEach(function(header) {
            const delim = header.indexOf(':');
            if (delim === -1) return;
            const key = header.substring(0, delim).trim();
            const value = header.substring(delim + 1).trim();
            headers[key] = value;
        });
    }

    if (!headers['User-Agent']) {
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36';
    }
    if (!headers['referer']) {
        headers['referer'] = 'https://www.maptiler.com/maps/';
    }

    return headers;
}