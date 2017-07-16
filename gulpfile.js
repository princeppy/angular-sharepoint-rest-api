// Include Gulp
var gulp = require('gulp');
var args = require('yargs').argv;
var del = require('del');
var path = require('path');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/,
    lazy: true
});

var config = {
    src: 'src/',
    dest: 'dist/',
};

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * Copy js
 * @return {Stream}
 */
gulp.task('js', function () {
    return gulp.src([config.src + 'js/**/*.js'])
        .pipe($.filter('**/*.js'))
        .pipe($.order([
            '*.app.js',
            '*.module.js',
            '*.*'
        ]))
        //.pipe($.uglify())
        .pipe($.concat('angular-sharepoint-rest-api.js'))
        .pipe(gulp.dest(config.dest));
});

gulp.task('build', ['js']);