var gulp = require('gulp');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var gulpOpen = require('gulp-open');
var protractor = require('gulp-protractor').protractor;
var webdriver_update = require('gulp-protractor').webdriver_update;
var gulpNgConfig = require('gulp-ng-config');
var config = require('config');
var wiredep = require('wiredep').stream;
var inject = require('gulp-inject');

var watchLivereload = function () {
    gulp.watch(['public/**/*.*'], function (event) {
        gulp.src(event.path, {read: false})
            .pipe(livereload());
    });
};

var child;

gulp.task('spawn', function () {
    var spawn = require('child_process').spawn;
    child = spawn('node', ['bin/www']);
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
            args: ['--baseUrl', 'http://127.0.0.1:' + (process.env.PORT || 3000)]
        }))
        .on('error', function(e) {
            throw e;
        })
        .on('end', function () {
            child.kill('SIGKILL');
        })
});

gulp.task('webdriver_update', webdriver_update );

gulp.task('kill-spawn', function () {
    if(child){
        child.kill('SIGKILL');
    }
});

var publicConfig = function (enviroment) {
    return gulp.src('public/scripts/config/config.json')
        .pipe(gulpNgConfig('awesomeSocialNetworkApp.config', {
            environment: enviroment,
            constants: {
                socketServerUrl: 'http://localhost:' + config.socketPort + '/'
            }
        }))
        .pipe(gulp.dest('public/scripts/config/'));
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

gulp.task('default', ['public-config:development', 'injectScripts', 'serve', 'open']);

gulp.task('test:integration', ['protractor']);

gulp.task('wiredep', function () {
    gulp.src('public/index.html')
        .pipe(wiredep({
            cwd: 'public'
        }))
        .pipe(gulp.dest('./public'));
});

gulp.task('injectScripts', function () {
    var target = gulp.src('public/index.html');

    return target
        .pipe(wiredep({
            cwd: 'public',
            exclude: ['blueimp*']
        }))
        .pipe(inject(gulp.src(['public/scripts/**/*.js'], {read: false}), {relative: true}))
        .pipe(gulp.dest('./public'));
});