// Rollup plugins
import babel from 'rollup-plugin-babel'
import eslint from 'rollup-plugin-eslint'
import uglify from 'rollup-plugin-uglify'
import progress from 'rollup-plugin-progress'
import json from 'rollup-plugin-json'
import fs from 'fs'

const
    env = process.env.NODE_ENV === 'production',
    pkg = JSON.parse( fs.readFileSync('package.json', 'utf8') ),
    dest = 'dist/' + pkg.name + ( env ? '.min.js' : '.js' ),
    banner = `/**
 * ${pkg.name} v${pkg.version} ${pkg.homepage}
 * Copyright ${new Date().getFullYear()} ${pkg.author.name}
 * Lincensed under ${pkg.license}
 */`

export default {
    banner: banner,
    entry: 'index.js',
    dest: dest,
    format: 'umd',
    moduleName: pkg.name,
    external: ['d3'],
    globals: { d3: 'd3' },
    //sourceMap: 'inline',
    plugins: [
        json({ exclude: 'node_modules/**' }),
        progress(),
        eslint(),
        babel({
            exclude: 'node_modules/**',
            presets: ["es2015-rollup"]
        }),
        ( env && uglify() )
    ]
}
