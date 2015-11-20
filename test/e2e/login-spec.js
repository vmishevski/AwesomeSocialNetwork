/* globals
    browser, element, by
 */




describe('login', function(){
    var WelcomePage = function () {
        var loginEmail = element(by.model('loginModel.email'));
        var loginPassword = element(by.model('loginModel.password'));
        var loginForm = element(by.name('loginForm'));

        this.get= function () {
            browser.get('http://localhost:3000/');
        };

        this.setEmailToLogin = function (val) {
            loginEmail.sendKeys(val);
        };

        this.setPasswordToLogin = function (val) {
            loginPassword.sendKeys(val);
        };

        this.login = function () {
            loginForm.submit();
        };
    };

    var helpers = require('./helpers')(),
        expect = helpers.expect;

    it('should login successfully and go to home page', function () {
        var welcomePage = new WelcomePage();
        welcomePage.get();
        welcomePage.setEmailToLogin('johndoe@yopmail.com');
        welcomePage.setPasswordToLogin('123123');
        welcomePage.login();

        expect(browser.getLocationAbsUrl()).to.eventually.equal('/home');
    });

    it('should stay on welcome page on fail login', function () {
        var welcomePage = new WelcomePage();
        welcomePage.get();
        welcomePage.setEmailToLogin('not an email');
        welcomePage.login();

        expect(browser.getLocationAbsUrl()).to.eventually.equal('/welcome').then(function () {
            expect($('[ng-show="loginForm.email.$error.email"]').isDisplayed()).to.eventually.be.true;
            expect($('[ng-show="loginForm.password.$error.required"]').isDisplayed()).to.eventually.be.true;
        });
    });
});