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
    describe('Repository#reset_index()', function() {

        context("no tree_ish; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.add("foo/bar", 42).commit("").add("foo/bar", 84).add("foo/bar2", 3).reset_index();

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the index to its state before any adds (to HEAD)', function () {
                expect(repo.get_content("foo/bar")).to.deep.equal(42);
                expect(repo.get_content("foo/bar2")).to.be.undefined;
            });
        });
        context("tree_ish: commit hash; no options", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            let ret = repo.add("foo/bar", 42).commit("").add("foo/bar", 84).commit("", {out:out})
                .add("foo/bar", 126).reset_index(out.commitHash);

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the index to the commit tree', function () {
                expect(repo.get_content("foo/bar")).to.deep.equal(84);
            });
        });
        context("tree_ish: tree hash; no options", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            let ret = repo.add("foo/bar", 42).commit("").add("foo/bar", 84).commit("", {out:out})
                .add("foo/bar", 126).reset_index(out.commit.tree);

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the index to the given tree', function () {
                expect(repo.get_content("foo/bar")).to.deep.equal(84);
            });
        });
        context("tree_ish: commit hash; only specific paths", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            let ret = repo.add("foo/bar", 42).add("foo/bar2", 2).commit("")
                .add("foo/bar", 84).add("foo/bar2", 3).commit("", {out:out})
                .add("foo/bar", 126).add("foo/bar2", 7).reset_index(out.commitHash, {paths: ['foo/bar2']});

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the given path to the commit tree', function () {
                expect(repo.get_content("foo/bar2")).to.deep.equal(3);
            });
            it('should ´not reset the other path to the commit tree', function () {
                expect(repo.get_content("foo/bar")).to.not.deep.equal(84);
            });
        });
    });
};