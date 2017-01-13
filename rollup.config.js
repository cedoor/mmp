// Rollup plugins
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import eslint from 'rollup-plugin-eslint'

const pkg = require('./package.json')

export default {
    entry: 'src/index.js',
    dest: 'build/'+ pkg.name +'.js',
    format: 'umd',
    moduleName: pkg.name,
    external: ['d3'],
    globals: { d3: 'd3' },
    plugins: [
        json(),
        eslint(),
        babel({ presets: ["es2015-rollup"] })
    ],
    banner : `/**
 * @module ${pkg.name}
 * @version ${pkg.version}
 * @file ${pkg.description}
 * @copyright ${pkg.author.name} ${new Date().getFullYear()}
 * @license ${pkg.license}
 * @see {@link ${pkg.homepage}|GitHub}
 */`
}
