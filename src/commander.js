import yargs from "yargs";
//import pkg from "../package.json";

export default function ({ method }){
    yargs.usage('Usage: npm run start <url> -- [options]')
	//.version(pkg.version+'\n', 'version', 'Display version number')
	.alias('h', 'help').describe('h', '展示帮助信息').boolean('h')
	.alias('a', 'allowfailures').describe('a', '跳过错误继续执行\'').boolean('a')
	.alias('z', 'zoom').describe('z', '地图缩放级别用 - 分隔').string('z')
	.alias('e', 'extent').describe('e', '地图范围，格式: nw_lat,nw_lon,se_lat,se_lon').string('e')
	.alias('f', 'file').describe('f', '以geojson文件作为范围').string('f')
	.alias('d', 'delay').describe('d', '请求的间隔时间: ms,s').string('d')
	.alias('r', 'retries').describe('r', '失败后重试次数')
	.alias('m', 'method').describe('m', 'HTTP请求的method方法').string('m')
	.alias('H', 'header').describe('H', 'HTTP头文件设置').string('H')
	.alias('c', 'concurrency').describe('c', '同时请求的并发数')
	.alias('o', 'output').describe('o', '缓存图输出到的路径')
	.default({delay: '100ms', concurrency: 1, allowfailures: true, retries: 5, method})
	.check(function(argv) {
		if (!/^\d+(\.\d+)?(ms|s)$/.test(argv.delay)) throw new Error('Invalid "delay" argument');
		if (!/^((\d+\-\d+)|(\d+(,\d+)*))$/.test(argv.zoom)) throw new Error('Invalid "zoom" argument');
		return true;
	})
	.parse(process.argv);
	
	const { argv } = yargs;

    if (argv.h) {
        displayHelp();
        process.exit(0);
	}
	
    return argv;
}

export const displayHelp = function() {
	yargs.showHelp();
	console.log('Examples:');
	console.log('  $ tilemantle http://myhost.com/{z}/{x}/{y}.png --point=44.523333,-109.057222 --buffer=12mi --zoom=10-14');
	console.log('  $ tilemantle http://myhost.com/{z}/{x}/{y}.png --extent=44.523333,-109.057222,41.145556,-104.801944 --zoom=10-14');
	console.log('  $ tilemantle http://myhost.com/{z}/{x}/{y}.png --zoom=10-14 -f region.geojson');
	console.log('  $ cat region.geojson | tilemantle http://myhost.com/{z}/{x}/{y}.png --zoom=10-14');
	console.log('  $ cat region.geojson | tilemantle http://myhost.com/{z}/{x}/{y}.png --buffer=20mi --zoom=10-14');
	console.log('');
}