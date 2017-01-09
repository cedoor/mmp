// Rollup plugins
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'

const pkg = require('./package.json')

export default {
    entry: 'index.js',
    dest: 'build/'+ pkg.name +'.js',
    format: 'umd',
    moduleName: pkg.name,
    external: ['d3'],
    globals: { d3: 'd3' },
    //sourceMap: 'inline',
    plugins: [
        json(),
        babel({
            presets: ["es2015-rollup"]
        })
    ],
    banner : `/**
 * ${pkg.name} v${pkg.version} ${pkg.homepage}
 * Copyright ${new Date().getFullYear()} ${pkg.author.name}
 * Lincensed under ${pkg.license}
 */`
}
