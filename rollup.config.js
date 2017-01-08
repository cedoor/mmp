// Rollup plugins
import babel from 'rollup-plugin-babel'
import eslint from 'rollup-plugin-eslint'
import uglify from 'rollup-plugin-uglify'
import progress from 'rollup-plugin-progress'

const env = process.env.NODE_ENV === 'production'

export default {
    entry: 'src/main.js',
    dest: 'dist/mmap' + ( env ? '.min.js' : '.js' ),
    format: 'umd',
    moduleName: 'mmap',
    external: ['d3'],
    globals: {
        d3: 'd3'
    },
    //sourceMap: 'inline',
    plugins: [
        progress(),
        eslint(),
        babel({
            exclude: 'node_modules/**',
            presets: ["es2015-rollup"],
        }),
        ( env && uglify() )
    ]
}
