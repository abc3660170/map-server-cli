var config = require('./config');
var chalk = require('chalk');
var os= require('os')
const { port } = config;

const child = exec(`http-server tilescache -p ${port} --cors`);

child.stdout.on('data', function(data){
    console.log(data.toString());
})
  
child.stderr.on('data', (data) => {
    console.log(chalk.redBright(data));
});

getIPAddress();

function exec(cmd) {
    return require('child_process').exec(cmd);
}



function getIPAddress(){
    var services = []
    var ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(function (dev) {
        ifaces[dev].forEach(function (details) {
            if (details.family === 'IPv4') {
            services.push(makeMapServices(details.address,port.toString()))
            }
        });
    });
    services.forEach(service => {
        console.log(chalk.greenBright(service));
    })
}

function makeMapServices(ipv4,port){
    return `地图服务地址:http://${ipv4}:${port}/{z}/{x}/{y}.png`;
}