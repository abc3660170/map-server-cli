import async from "async";
import chalk from "chalk";
import fs from "fs";
import fetch from "node-fetch";
import ProgressBar from "progress";
import humanizeDuration from "humanize-duration";
import dateFormat from "dateformat";
import numeral from "numeral";
const { eachOfLimit, retry } = async;
export default class fetchTilesAndStatistic {
    constructor(argv, {urlTemplate, headers, xyzList}){
        this.argv = argv;
        this.urlTemplate = urlTemplate;
        this.headers = headers;
        this.xyzList = xyzList;
        this.count_succeeded = 0;
        this.count_failed = 0;
        this.prevKey;
        this.startTime;
    }

    getProcessBar(){
        this.bar = this.bar || new ProgressBar(chalk.gray('[:bar] :percent (:current/:total) eta: :etas'), {total: this.xyzList.length, width: 20});
        return this.bar;
    }

    start() {
        this.startTime = (new Date()).getTime();
        eachOfLimit(this.xyzList, this.argv.concurrency, this.iterateXYZ.bind(this), err => {
            this.statistic(err);
            // if(err){
            //     console.log("全部爬完啦,好像有点错误哦！\n", err)
            // } else {
            //     console.log("全部爬完啦~~~")
            // } 
        })
    }

    sinleTaskStatistic(start){
        const task = function(start){
            this.start = start;
        }
        task.prototype.end = function(res, url){
            const time = (new Date()).getTime() - this.start;
            const size_length = res.headers.get('content-length') ? filesize(Number(res.headers.get('content-length'))) : '(no content-length)';
            const statuscolor = res.status !== 200 ? 'red' : 'green';
            const size_data = filesize(res.size);
            process.stdout.cursorTo(0);
            console.log(chalk.gray('\n[') + chalk[statuscolor](res.status) + chalk.grey(']') + ' ' + url + ' ' + chalk.blue(time + 'ms') + ' ' + chalk.grey(size_data + ', ' + size_length));
        }
        return new task(start)
    }

    async iterateXYZ(xyz, key, callback) {
        const self = this;
        const argv = self.argv;
        const headers = self.headers;
        const bar = self.getProcessBar();
        const url = self.urlTemplate
            .replace(/\{x\}/g, xyz[0])
            .replace(/\{y\}/g, xyz[1])
            .replace(/\{z\}/g, xyz[2]);
        const fileName = getFileName(url);
        const absoluteFileName = `${argv.output}/${fileName}.png`;
        const fetched = await isFileExists(absoluteFileName);
        if(fetched){
            // 文件已请求过，跳过此次请求
            this.count_succeeded++;
            bar.tick();
            return callback();
            
        }
        const taskStatistic = this.sinleTaskStatistic((new Date()).getTime());
        retry({times: argv.retry, interval: 1000}, async callback => {
            const method = argv.method;
            let res;
            try {
                res = await fetch(url, { headers, method});
                
                if(res.status !== 200){
                    const errMsg = 'Request failed (non -200 status)';
                    bar.interrupt(errMsg+'\ncurrent progress is '+ bar.curr+'/'+bar.total);
                    // if in retry,count_failed do not change
                    if(typeof self.prevKey === "undefined")  self.prevKey = "undefined";
                    if(self.prevKey !== key){
                        self.count_failed++;
                        self.prevKey = key;
                    }
                } else {
                     // 级联创建图片所在文件夹
                    await createFolder(absoluteFileName);

                    // 图片已流的形式写入到磁盘
                    const dest = fs.createWriteStream(absoluteFileName);
                    res.body.pipe(dest);

                    taskStatistic.end(res, url);
                    bar.tick();
                    self.count_succeeded++;                   
                }

                callback();

            } catch (error) {
                callback(error);
                console.log(chalk.red(error))
                console.log(chalk.red("\n连接已经断开，5秒后重连！！"))
            }
            
        }, err => {
            if (err && argv.allowfailures) err = null;
            callback(err);
        })
    }
    
    statistic(err) {
        let log;
        const duration = humanizeDuration((new Date()).getTime() - this.startTime);
        const command = process.argv.join(" ");
        const date = new Date();
        const count_succeeded = this.count_succeeded;
        const count_failed = this.count_failed;
        const logFileName = "log-"+dateFormat(date,'yyyy-mm-dd-hh-MM-ss')+".log"
        if (count_succeeded || count_failed) {
            console.log('');
            console.log(chalk.grey(numeral(count_succeeded).format('0,0') + ' succeeded, ' + numeral(count_failed).format('0,0') + ' failed after ' + duration));
            log = "执行的命令："+command+"\n耗时:"+duration+"\n成功缓存："+numeral(count_succeeded).format('0,0')+"个，失败"+numeral(count_failed).format('0,0')+"个\n";
        }
        if(!fs.existsSync("log")) fs.mkdirSync("log")
        fs.writeFileSync("log/"+logFileName,log);
        if (err) {
            console.error(chalk.red('Error: ' + (err.message || err)));
            log = err.message || err
            process.exit(1);
        }else{
            process.exit(0);
        }
    }
}

async function isFileExists(file){
    return new Promise(resolve => {
        fs.access(file, fs.constants.F_OK, err => resolve(!err));
    })  
}

async function createFolder(file){
    const fileFolder = /(.+)\//.exec(file)[1];
    return new Promise(resolve => {
        fs.mkdir(fileFolder, { recursive: true }, err => resolve(!err));
    })  
}

function filesize(bytes) {
	return Number((bytes / 1024).toFixed(2)) + 'kB';
};

function getFileName(url){
    let fileName;
    const xyzRegex = /\/(\d+\/\d+\/\d+)[^\d]/;
    const googleRegex = /x=\d+\&y=\d+\&z=\d+/;
    if(xyzRegex.test(url)){
        fileName = xyzRegex.exec(url)[1]
    } else if (googleRegex.test(url)){
        const x = /x=(\d+)/.exec(url)[1]
        const y = /y=(\d+)/.exec(url)[1]
        const z = /z=(\d+)/.exec(url)[1]
        fileName = `${z}/${x}/${y}`;
    } else {
        throw new Error('提供的 url template 不能满足');
        process.exit(1);
    }
    return fileName;
}
    


