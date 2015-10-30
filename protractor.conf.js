exports.config = {
    framework: 'mocha',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['test/e2e/**/*.js'],
    multiCapabilities: [{
        browserName: 'chrome'
    }],

    mochaOpts: {
        reporter: 'spec',
        slow: 3000,
        timeout: 10000
    }
};