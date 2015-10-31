/**
 * Created by Voislav on 10/31/2015.
 */
var ctrl = require('../../../server/controllers/user-controller');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = chai.expect,
    sinonChai = require('sinon-chai'),
    helpers = require('../helpers');
require('../../../server/model/index');
mockgoose(mongoose);

chai.use(sinonChai);

describe('ctrl:user', function () {
    var sandbox, base, User, err, query;

    beforeEach(function () {
        query = 'name to find';
        sandbox = sinon.sandbox.create();
        base = {};
        helpers.setup(base, sandbox);
        User = mongoose.model('User');
        sandbox.stub(User, 'find');
        err = {};
        base.req.query = { query: query};
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('search: should query for users by provided "query" parameter from url', function () {
        var users = [{email: 'test@t.com'}, {email: 'test2@t.com'}];
        User.find.callsArgWith(1, undefined, users);

        ctrl.search(base.req, base.res, base.next);

        expect(User.find).calledWith(sinon.match.defined);
        expect(base.res.status).calledWith(200);
        expect(base.res.send).calledWith(users);
    });

    it('search: should propagate search error', function () {

        User.find.callsArgWith(1, err);

        ctrl.search(base.req, base.res, base.next);

        expect(base.res.send).not.called;
        expect(base.res.status).not.called;
        expect(base.next).calledWith(err);
    });

    it('search: should return status 400 on query param in url not provided', function () {
        base.req.query.query = undefined;

        ctrl.search(base.req, base.res, base.next);

        expect(base.res.status).calledWith(400);
        expect(base.res.status).calledWith(sinon.match.defined);
    });
});