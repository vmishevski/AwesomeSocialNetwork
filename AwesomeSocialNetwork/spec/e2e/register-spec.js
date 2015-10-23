/**
 * Created by Voislav on 10/23/2015.
 */

/* globals
browser, by, element
 */
describe('register', function () {

    beforeEach(function () {
        browser.get('http://localhost:3000');
    });

    it('should register and be redirected to home', function () {
        element(by.model('vm.user.email')).sendKeys('test@test.com');
        element(by.model('vm.user.password')).sendKeys('123123123');
        element(by.name('registerForm')).submit();

        expect(browser.getLocationAbsUrl()).toBe('/home');
    });

    it('should stay on welcome page on fail registering', function () {
        element(by.model('vm.user.email')).sendKeys('test@test.com');
        element(by.name('registerForm')).submit();

        expect(browser.getLocationAbsUrl()).toBe('/welcome');
    });
});