var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('uglify-js'),
    minifier = require('gulp-uglify/minifier'),
    rename = require('gulp-rename');

gulp.task('default', ['watch'], function() {
    gulp.start('compileSrc');
});

gulp.task('compileSrc', function(cb) {
    return gulp.src([
        'src/start.js',
        'src/init.js',
        'src/core/utils.js',
        'src/core/update.js',
        'src/core/link.js',
        'src/core/public.js',
        'src/end.js'
    ])
    .pipe(concat('mmap.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifier({}, uglify))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', [
        'compileSrc'
    ]);
});
