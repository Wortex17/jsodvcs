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
        context("no commit_ish; no options", function() {
            let repo = new jsodvcs.Repository();
            repo.add("foo/bar", 42).commit("").add("foo/bar", 84).add("foo/bar2", 3);
            let prevHEAD = repo.HEAD;
            let ret = repo.reset();
            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the index to its state before any adds (to HEAD)', function () {
                expect(repo.get_content("foo/bar")).to.deep.equal(42);
                expect(repo.get_content("foo/bar2")).to.be.undefined;
            });
            it('should not change the HEAD', function () {
                expect(repo.HEAD).to.equal(prevHEAD);
            });
        });
        context("given commit hash; no options", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            repo.add("foo/bar", 42).commit("", {out:out}).add("foo/bar", 84).commit("")
                .add("foo/bar", 126);
            let ret = repo.reset(out.commitHash);

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the index to the commit tree', function () {
                expect(repo.get_content("foo/bar")).to.deep.equal(42);
            });
            it('should set the HEAD to the commit hash', function () {
                expect(repo.HEAD).to.equal(out.commitHash);
            });
            it('should bring the repository into a detached HEAD state', function () {
                expect(repo.detached_HEAD).to.be.true;
            });
        });
        context("given ref; no options", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            repo.add("foo/bar", 42).commit("", {out:out}).add("foo/bar", 84).commit("")
                .add("foo/bar", 126);
            repo.set_ref('refs/heads/beta', out.commitHash);
            let ret = repo.reset('refs/heads/beta');

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the index to the commit tree', function () {
                expect(repo.get_content("foo/bar")).to.deep.equal(42);
            });
            it('should set the HEAD to the ref', function () {
                expect(repo.HEAD).to.equal('refs/heads/beta');
            });
            it('should not bring the repository into a detached HEAD state', function () {
                expect(repo.detached_HEAD).to.be.false;
            });
        });
        context("given ref; mode:soft", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            repo.add("foo/bar", 42).commit("", {out:out}).add("foo/bar", 84).commit("")
                .add("foo/bar", 126);
            repo.set_ref('refs/heads/beta', out.commitHash);
            let ret = repo.reset('refs/heads/beta', {mode: jsodvcs.ResetMode.soft});

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should reset the index to the commit tree', function () {
                expect(repo.get_content("foo/bar")).to.deep.equal(126);
            });
            it('should set the HEAD to the ref', function () {
                expect(repo.HEAD).to.equal('refs/heads/beta');
            });
            it('should not bring the repository into a detached HEAD state', function () {
                expect(repo.detached_HEAD).to.be.false;
            });
        });
    });


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