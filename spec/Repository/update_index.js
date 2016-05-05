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
    describe('Repository#update_index(path, content)', function() {

        context("empty content; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.update_index("foo/bar", undefined);

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
        context("new path, new content; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.update_index("foo/bar", 42);

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
        context("new path, new content; add=true", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.update_index("foo/bar", 42, {add:true});

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
        context("old path, new content; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.update_index("foo/bar", 42, {add:true});
            let prevIndexEntry = repo.index["foo/bar"];
            ret = ret.update_index("foo/bar", 46);

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should add an entry to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(2);
            });
            it('should not add an entry to the "index" object property', function () {
                expect(_.keys(repo.index)).to.have.lengthOf(1);
                expect(repo.index).to.have.ownProperty("foo/bar");
            });
            it('should update the entry in the "index" object property', function () {
                expect(prevIndexEntry).to.not.be.equal(repo.index["foo/bar"]);
            });
        });
        context("new path, empty content; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.update_index("foo/bar");

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
        context("old path, empty content; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.update_index("foo/bar", 42, {add:true}).update_index("foo/bar");

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should not add an entry to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(1);
            });
            it('should not add an entry to the "index" object property', function () {
                expect(_.keys(repo.index)).to.have.lengthOf(1);
            });
        });
        context("old path, empty content; remove=true", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.update_index("foo/bar", 42, {add:true}).update_index("foo/bar", undefined, {remove:true});

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