"use strict";

let
    _ = require('lodash'),
    chai = require('chai')
    ,expect = chai.expect
;

let
    jsodvcs = require("../../")
;

describe('Repository', function() {

    let Repository = jsodvcs.Repository;

    describe('#add(path, content)', function() {

        let repo = new Repository();
        let ret = repo.add("foo/bar", 42);
        it('should return the repository', function() {
            expect(ret).to.equal(repo);
        });
        it('should add an entry to the "objects" object property', function() {
            expect(_.keys(repo.objects)).to.have.lengthOf(1);
        });
        it('should add an entry to the "index" object property with the gien path as property name', function() {
            expect(_.keys(repo.index)).to.have.lengthOf(1);
            expect(repo.index).to.have.ownProperty("foo/bar");
        });

    });
});
