exports.config = {
    framework: 'mocha',
    seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar',
    specs: ['test/e2e/**/*.js'],
    multiCapabilities: [{
        browserName: 'firefox'
    }],

    mochaOpts: {
        reporter: 'spec',
        slow: 3000,
        timeout: 10000
    }
};