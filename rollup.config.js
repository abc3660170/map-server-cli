const path = require('path')
const babel = require("rollup-plugin-babel")
//import json from 'rollup-plugin-json';
import builtin from 'builtin-modules'

// 支持的import文件格式
const commonjs = require('rollup-plugin-commonjs')  // 将cjs模块转换为es模块

module.exports = {
    input: './src/index.js',
    output: {
        file: './lib/index.js',
        format: 'cjs',
        sourcemap: true,
        strict: true
    },
    external:builtin,
    plugins: [
        //json(),
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
}