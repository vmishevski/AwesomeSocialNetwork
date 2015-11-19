var gulp = require('gulp');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var gulpOpen = require('gulp-open');
var protractor = require('gulp-protractor').protractor;
var webdriver_update = require('gulp-protractor').webdriver_update;
var gulpNgConfig = require('gulp-ng-config');
var config = require('config');

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

gulp.task('protractor', ['webdriver_update', 'spawn'], function () {
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

var publicConfig = function (enviroment) {
    return gulp.src('public/config/config.json')
        .pipe(gulpNgConfig('awesomeSocialNetworkApp.config', {
            environment: enviroment,
            constants: {
                socketServerUrl: 'http://localhost:' + config.socketPort + '/'
            }
        }))
        .pipe(gulp.dest('public/config/'));
};

gulp.task('public-config:development', function () {
    return publicConfig('development');
});

gulp.task('public-config:production', function () {
    return publicConfig('production');
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

gulp.task('default', ['public-config:development', 'serve', 'open']);

gulp.task('test:integration', ['protractor']);