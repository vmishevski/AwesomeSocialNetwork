/**
 * Created by Voislav on 10/30/2015.
 */

module.exports = function () {
    var chai = require('chai'),
        expect = chai.expect,
        chaiAsPromised = require('chai-as-promised');

    chai.use(chaiAsPromised);

    return {
        expect: expect
    };
};