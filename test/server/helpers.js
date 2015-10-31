/**
 * Created by Voislav on 10/31/2015.
 */
var setupResAndRequest = function (base, sandbox) {
    base.req = { body: {}};
    base.res = {
        send: sandbox.stub(),
        status: sandbox.stub(),
        end: sandbox.stub()
    };
    base.res.status.returns(base.res);
    base.next = sandbox.stub();
};

module.exports = {
    setup: setupResAndRequest
};