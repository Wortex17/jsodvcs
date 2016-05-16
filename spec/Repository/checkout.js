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

    describe('Repository#checkout', function() {
        context("when trying to checkout non-existing branch", function() {
            let repo = new jsodvcs.Repository();
            it('should throw an error', function () {
                expect(function(){repo.checkout("beta");}).to.throw(Error);
            });
        });
        context("when trying to checkout existing branch", function() {
            it('should NOT throw an error', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                expect(function(){repo.checkout("beta");}).to.not.throw(Error);
            });
            it('should return the repository', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                expect(repo.checkout("beta")).to.equal(repo);
            });
            it('should change HEAD to the correct branch', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta").checkout("beta");
                expect(repo.HEAD).to.equal("refs/heads/beta");
            });
            it('should change currentBranch to the correct branch', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta").checkout("beta");
                expect(repo.currentBranch).to.equal("beta");
            });
        });
        context("when trying to checkout same branch", function() {
            it('should NOT throw an error', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                expect(function(){repo.checkout("master");}).to.not.throw(Error);
            });
            it('should return the repository', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                expect(repo.checkout("master")).to.equal(repo);
            });
            it('should not change HEAD', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta").checkout("master");
                expect(repo.HEAD).to.equal("refs/heads/master");
            });
            it('should not change currentBranch', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta").checkout("master");
                expect(repo.currentBranch).to.equal("master");
            });
        });
        context("when trying to checkout existing branch with different content", function() {
            it('should NOT throw an error', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                expect(function(){repo.checkout("beta");}).to.not.throw(Error);
            });
            it('should return the repository', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                expect(repo.checkout("beta")).to.equal(repo);
            });
            it('should change HEAD to the correct branch', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout("beta");
                expect(repo.HEAD).to.equal("refs/heads/beta");
            });
            it('should change currentBranch to the correct branch', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout("beta");
                expect(repo.currentBranch).to.equal("beta");
            });
            it('should change the index to the version of that branch', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout("beta");
                expect(repo.get_content("foo/bar")).to.deep.equal(content);
            });
        });
        context("when trying to checkout existing branch with different content and options.paths", function() {
            it('should change the index to the version of that branch only for these paths', function () {
                let repo = new jsodvcs.Repository();
                repo.add("foo/bar", 42).add("foo/bar2", 2).commit("");
                repo.branch("beta");
                repo.add("foo/bar", 84).add("foo/bar2", 4).commit("");
                repo.checkout("beta", {paths:["foo/bar"]});
                expect(repo.get_content("foo/bar")).to.deep.equal(42);
                expect(repo.get_content("foo/bar2")).to.deep.equal(4);
            });
        });
        context("when trying to checkout commit", function() {
            it('should NOT throw an error', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                expect(function(){repo.checkout(out.commitHash);}).to.not.throw(Error);
            });
            it('should return the repository', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                expect(repo.checkout(out.commitHash)).to.equal(repo);
            });
            it('should change HEAD to the given commitHash and bring repo in detached HEAD state', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout(out.commitHash);
                expect(repo.HEAD).to.equal(out.commitHash);
                expect(repo.isDetachedHEAD).to.be.true;
            });
            it('should change currentBranch to undefined', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout(out.commitHash);
                expect(repo.currentBranch).to.be.undefined;
            });
            it('should change the index to the version of that commit', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout(out.commitHash);
                expect(repo.get_content("foo/bar")).to.deep.equal(content);
            });
        });
        context("when trying to checkout tree", function() {
            it('should NOT throw an error', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                expect(function(){repo.checkout(out.commit.tree);}).to.not.throw(Error);
            });
            it('should return the repository', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                expect(repo.checkout(out.commit.tree)).to.equal(repo);
            });
            it('should not change HEAD', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout(out.commit.tree);
                expect(repo.HEAD).to.equal("refs/heads/master");
                expect(repo.isDetachedHEAD).to.be.false;
            });
            it('should not change currentBranch', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout(out.commit.tree);
                expect(repo.currentBranch).to.equal("master");
            });
            it('should change the index to the version of that tree', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                let content2 = {n:84};
                let out = {};
                repo.add("foo/bar", content).commit("", {out:out});
                repo.branch("beta");
                repo.add("foo/bar", content2).commit("");
                repo.checkout(out.commit.tree);
                expect(repo.get_content("foo/bar")).to.deep.equal(content);
            });
        });
    });
};