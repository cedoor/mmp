var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('uglify-js'),
    minifier = require('gulp-uglify/minifier'),
    rename = require('gulp-rename');

gulp.task('default', ['watch'], function() {
    gulp.start('compileSrc','compileTest');
});

gulp.task('compileSrc', function(cb) {
    return gulp.src([
        'src/start.js',
        'src/init.js',
        'src/core.js',
        'src/public.js',
        'src/end.js'
    ])
    .pipe(concat('mmap.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifier({}, uglify))
    .pipe(gulp.dest('dist'));
});

gulp.task('compileTest', function(cb) {
    return gulp.src([
        'test/unit/start.js',
        'test/unit/end.js'
    ])
    .pipe(concat('test.js'))
    .pipe(gulp.dest('test'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', [
        'compileSrc'
    ]);
    gulp.watch('test/unit/**/*.js', [
        'compileTest'
    ]);
});
