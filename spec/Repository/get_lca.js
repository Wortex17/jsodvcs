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
    describe('Repository#get_lca()', function() {

        context("when commitHashA:undefined", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            repo.add("foo/bar", 42).commit({out:out});
            it("should return undefined", function () {
                expect(repo.get_lca(undefined, out.commitHash)).to.be.undefined;
            });
        });
        context("when commitHashB:undefined", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            repo.add("foo/bar", 42).commit({out:out});
            it("should return undefined", function () {
                expect(repo.get_lca(out.commitHash, undefined)).to.be.undefined;
            });
        });
        context("when commitHashA:undefined & commitHashB:undefined", function() {
            let repo = new jsodvcs.Repository();
            repo.add("foo/bar", 42).commit();
            it("should return undefined", function () {
                expect(repo.get_lca()).to.be.undefined;
            });
        });
        context("when commitHashA == commitHashB", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            repo.add("foo/bar", 42).commit({out:out});
            it("should return commitHashA", function () {
                expect(repo.get_lca(out.commitHash, out.commitHash)).to.equal(out.commitHash);
            });
        });
        context("when both hashes do not have a common ancestor", function() {
            let repoA = new jsodvcs.Repository();
            let repoB = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            repoA.add("foo/bar", 42).commit({out:outA});
            repoB.add("foo/bar", 42).commit({out:outB});
            it("should return undefined", function () {
                expect(repoA.get_lca(outA.commitHash, outB.commitHash)).to.be.undefined;
                expect(repoB.get_lca(outA.commitHash, outB.commitHash)).to.be.undefined;
            });
        });
        context("when commitHashB is ahead of commitHashA", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            repo.add("foo/bar", 42).commit({out:outA});
            repo.add("foo/bar", 84).commit({out:outB});
            it("should return commitHashA", function () {
                expect(repo.get_lca(outA.commitHash, outB.commitHash)).to.equal(outA.commitHash);
                expect(repo.get_lca(outB.commitHash, outA.commitHash)).to.equal(outA.commitHash);
            });
        });
        context("when commitHashB is behind of commitHashA", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            repo.add("foo/bar", 42).commit({out:outB});
            repo.add("foo/bar", 84).commit({out:outA});
            it("should return commitHashB", function () {
                expect(repo.get_lca(outA.commitHash, outB.commitHash)).to.equal(outB.commitHash);
                expect(repo.get_lca(outB.commitHash, outA.commitHash)).to.equal(outB.commitHash);
            });
        });
        context("when both commits derive from commitHashX", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("pointX");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.reset("pointX");
            repo.add("foo/bar", 126).commit({out:outB});
            it("should return commitHashX", function () {
                expect(repo.get_lca(outA.commitHash, outB.commitHash)).to.equal(outX.commitHash);
                expect(repo.get_lca(outB.commitHash, outA.commitHash)).to.equal(outX.commitHash);
            });
        });
    });
};