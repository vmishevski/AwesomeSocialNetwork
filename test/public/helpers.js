/**
 * Created by Voislav on 10/29/2015.
 */

var helpers = {
    check: function (done, f) {
        try{
            f();
        }catch(err){
            done(err);
        }
        finally{
            done();
        }
    }
};