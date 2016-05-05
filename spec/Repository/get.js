"use strict";

let
    _ = require('lodash'),
    chai = require('chai')
    ,expect = chai.expect
;

let
    jsodvcs = require("../../")
;

exports.spec = function(){
    describe('Repository#get(path)', function() {

        context("when content was added at path before", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.add("foo/bar", 42).get("foo/bar");

            it('should return the previously added content', function () {
                expect(ret).to.equal(42);
            });
        });

        context("when no content was added at path before", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.add("foo/bar", 42).get("foo/bar/XX");

            it('should return undefined', function () {
                expect(ret).to.equal(undefined);
            });
        });
    });
};