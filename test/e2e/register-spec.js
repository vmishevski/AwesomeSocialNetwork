/**
 * Created by Voislav on 10/23/2015.
 */

var helpers = require('./helpers')(),
    expect = helpers.expect;

describe('register', function () {
    beforeEach(function () {
        browser.get('http://localhost:3000');
    });

    it('should register and be redirected to home', function () {
        element(by.model('vm.user.email')).sendKeys('test' + Math.round(Math.random()*100) +'@test.com');
        element(by.model('vm.user.fullName')).sendKeys('Test User');
        element(by.model('vm.user.password')).sendKeys('123123123');
        element(by.name('registerForm')).submit();

        expect(browser.getLocationAbsUrl()).to.eventually.equal('/home');
    });

    it('should stay on welcome page on fail registering', function () {
        element(by.model('vm.user.email')).sendKeys('test@test.com');
        element(by.name('registerForm')).submit();

        expect(browser.getLocationAbsUrl()).to.eventually.equal('/welcome')
            .then(function () {
                expect($('[ng-show="registerForm.email.$error.email"]').isDisplayed()).to.eventually.be.false;
                expect($('[ng-show="registerForm.password.$error.required"]').isDisplayed()).to.eventually.be.true;
        });
    });
});