var gulp = require('gulp'),
    del = require('del'),
    pump = require('pump'),
    concat = require('gulp-concat'),
    uglify = require('uglify-js'),
    minifier = require('gulp-uglify/minifier'),
    rename = require('gulp-rename');

gulp.task('default', ['watch'], function() {
    gulp.start('compileSrc','compileTest');
});

gulp.task('compileSrc', function(cb) {
    pump([
        gulp.src([
            'src/start.js',
            'src/init.js',
            'src/utils.js',
            'src/public.js',
            'src/end.js'
        ]),
        concat('mmap.js'),
        gulp.dest('dist'),
        rename({suffix: '.min'}),
        minifier({}, uglify),
        gulp.dest('dist')
    ], cb );
});

gulp.task('compileTest', function(cb) {
    pump([
        gulp.src([
            'test/unit/start.js',
            'test/unit/init.js',
            'test/unit/nodes.js',
            'test/unit/end.js'
        ]),
        concat('test.js'),
        gulp.dest('test')
    ], cb );
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', [
        'compileSrc'
    ]);
    gulp.watch('test/unit/**/*.js', [
        'compileTest'
    ]);
});
