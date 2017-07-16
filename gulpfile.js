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
    return gulp.src([config.src + 'module.js', config.src + 'js/**/*.js'])
        .pipe($.filter('**/*.js'))
        .pipe($.order([
            'module.js',
            '*.app.js',
            '*.module.js',
            '*'
        ]))
        .pipe($.using({}))
        //.pipe($.uglify())
        .pipe($.concat('angular-sharepoint-rest-api.js'))
        .pipe(gulp.dest(config.dest))
        .pipe($.rename('angular-sharepoint-rest-api.min.js'))
        .pipe($.uglify())
        .pipe(gulp.dest(config.dest));
});

gulp.task('bump-patch', function(){
    gulp.src('./*.json')
        .pipe($.bump({type:'patch'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bump-minor', function(){
    gulp.src('./*.json')
        .pipe($.bump({type:'minor'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bump-major', function(){
    gulp.src('./*.json')
        .pipe($.bump({type:'major'}))
        .pipe(gulp.dest('./'));
});

gulp.task('build', ['js']);