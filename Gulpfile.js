var gulp = require('gulp');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var gulpOpen = require('gulp-open');

var watchLivereload = function () {
    gulp.watch(['public/**/*.*'], function (event) {
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

gulp.task('open', function () {
   gulp.src('')
       .pipe(gulpOpen({
           uri: 'http://localhost:3000/',
           app: 'chrome'
       }));
});

gulp.task('default', ['serve', 'open']);