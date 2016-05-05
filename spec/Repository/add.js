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
    describe('Repository#add(path, content)', function() {

        context("; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.add("foo/bar", 42);

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should add an entry to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(1);
            });
            it('should add an entry to the "index" object property with the given path as property name', function () {
                expect(_.keys(repo.index)).to.have.lengthOf(1);
                expect(repo.index).to.have.ownProperty("foo/bar");
            });
        });
        context("empty content; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.add("foo/bar");

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should not add an entry to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(0);
            });
            it('should not add an entry to the "index" object property', function () {
                expect(_.keys(repo.index)).to.have.lengthOf(0);
            });
        });
        context("overwriting with content; no options", function() {
            let repo = new jsodvcs.Repository();
            repo.add("foo/bar", 42).add("foo/bar", 46);

            it('should add an entry to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(2);
            });
            it('should not add an entry to the "index" object property', function () {
                expect(_.keys(repo.index)).to.have.lengthOf(1);
                expect(repo.index).to.have.ownProperty("foo/bar");
            });
        });
        context("overwriting with empty content; no options", function() {
            let repo = new jsodvcs.Repository();
            repo.add("foo/bar", 42).add("foo/bar");

            it('should not add an entry to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(1);
            });
            it('should remove the entry from the "index" object property', function () {
                expect(_.keys(repo.index)).to.have.lengthOf(0);
            });
        });

        context("overwriting with empty content; ignore_removal:true", function() {
            let repo = new jsodvcs.Repository();
            repo.add("foo/bar", 42).add("foo/bar", undefined, {ignore_removal: true});

            it('should not add an entry to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(1);
            });
            it('should not remove the entry from the "index" object property', function () {
                expect(_.keys(repo.index)).to.have.lengthOf(1);
                expect(repo.index).to.have.ownProperty("foo/bar");
            });
        });

    });
};