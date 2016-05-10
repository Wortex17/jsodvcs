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
    describe('Repository#reset()', function() {

        context("no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.add("foo/bar", 42).commit("").add("foo/bar", 84).reset();

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the index to its state before any adds (to HEAD)', function () {
                expect(repo.get_content("foo/bar")).to.deep.equal(42);
            });
        });
    });
};