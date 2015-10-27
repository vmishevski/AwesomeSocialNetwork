'use strict';

/* globals
    browser, element, by
 */

describe('login', function(){
    it('should login successfully and go to home page', function () {
        browser.get('http://localhost:3000/');

        element(by.model('loginModel.email')).sendKeys('voislav@it-labs.com');
        element(by.model('loginModel.password')).sendKeys('123123123');
        element(by.model('loginModel.password')).submit();
        expect(browser.getLocationAbsUrl()).toBe('/home');
    });

    it('should stay on welcome page on fail login', function () {
        browser.get('http://localhost:3000/');

        element(by.model('loginModel.email')).sendKeys('fail');
        element(by.model('loginModel.email')).submit();

        expect(browser.getLocationAbsUrl()).toBe('/welcome');
    });
});