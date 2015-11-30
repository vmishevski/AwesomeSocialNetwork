// Karma configuration
// Generated on Sun Oct 11 2015 23:20:06 GMT-0700 (Pacific Daylight Time)

module.exports = function (config) {
    var configuration = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['wiredep', 'mocha', 'chai-as-promised', 'sinon-chai'],

        // list of files / patterns to load in the browser
        files: [
            'lib/public/scripts/**/*.js',
            'test/public/helpers.js',
            'test/public/**/*spec.js',
            'lib/public/views/**/*.html'
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            //'public/scripts/app.js': ['coverage'],
            //'public/scripts/services/authentication-service.js': ['coverage'],
            'public/scripts/**/*.js': ['coverage'],
            '**/*.html': ['ng-html2js']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['coverage', 'progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        browserNoActivityTimeout: 30000,

        coverageReporter: {
            dir: 'coverage/public/',
            reporters:[
                { type: 'html', subdir: 'report-html' },
                { type: 'lcovonly', subdir: '.', file: 'report-lcov.info' }
            ]
        },

        ngHtml2JsPreprocessor: {
            stripPrefix: 'lib/public/',
            moduleName: 'templates'
        },

        wiredep: {
            cwd: 'lib/public',
            exclude: ['blueimp*'],
            devDependencies: true
        },

        client: {
            mocha: {
                reporter: 'html' // change Karma's debug.html to the mocha web reporter

                //ui: 'tdd'
            }
        }
    };

    config.set(configuration);
};
