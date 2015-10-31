var gulp = require('gulp');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var gulpOpen = require('gulp-open');
var protractor = require('gulp-protractor').protractor;
var webdriver_update = require('gulp-protractor').webdriver_update;

var watchLivereload = function () {
    gulp.watch(['public/**/*.*'], function (event) {
        gulp.src(event.path, {read: false})
            .pipe(livereload());
    });
};

var child;

gulp.task('spawn', function () {
    var exec = require('child_process').exec;
    child = exec('node ./bin/www');
    child.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    child.stderr.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    child.on('close', function(code) {
        console.log('closing code: ' + code);
    });
});

gulp.task('protractor', function () {
    gulp.src(['./src/tests/*.js'])
        .pipe(protractor({
            configFile: 'protractor.conf.js',
            args: ['--baseUrl', 'http://127.0.0.1:3000']
        }))
        .on('error', function(e) { throw e; })
        .on('end', function () {
            //child.disconnect();
            //child.kill('SIGHUP');
        })
});

gulp.task('webdriver_update', webdriver_update );

gulp.task('kill-spawn', function () {
    if(child){
        child.kill('SIGHUP');
    }
});

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

gulp.task('test:integration', ['webdriver_update', 'spawn'], ['protractor']);