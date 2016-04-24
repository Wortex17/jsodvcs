"use strict";

let
    chai = require('chai')
    ,expect = chai.expect
;
describe('Self-Test: null', function() {

    describe('#null', function() {
        context("always", function(){
            it('should be null', function() {
                expect(null).to.equal(null);
            });
        });
    });
});
