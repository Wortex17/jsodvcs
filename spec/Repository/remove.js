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
    describe('Repository#remove(path, content)', function() {

        context("; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.add("foo/bar", 42).remove("foo/bar");

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should not add an entry to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(1);
            });
            it('should remove the entry from the "index" object property', function () {
                expect(_.keys(repo.index)).to.have.lengthOf(0);
            });
        });
    });
};