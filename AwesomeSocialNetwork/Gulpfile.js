var gulp = require('gulp');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');

var watchLivereload = function () {
    gulp.watch(['public/**/*.js'], function (event) {
        gulp.src(event.path, {read: false})
            .pipe(livereload());
    });
};

gulp.task('serve', function () {
    nodemon({
        script: 'bin/www',
        ignore: ['public/**', 'spec/**']
    }).on('start', function () {
        livereload.reload();
        livereload.listen();
        watchLivereload();
    });
});

gulp.task('default', ['serve']);