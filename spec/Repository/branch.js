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

    describe('Repository#branch', function() {
        context("when trying to create branch on fresh repo", function() {
            let repo = new jsodvcs.Repository();
            it('should throw an error', function () {
                expect(function(){repo.branch("beta");}).to.throw(Error);
            });
        });
        context("when trying to create branch on repo with corrupted HEAD", function() {
            let repo = new jsodvcs.Repository();
            repo.HEAD = "bogus";
            it('should throw an error', function () {
                expect(function(){repo.branch("beta");}).to.throw(Error);
            });
        });
        context("when trying to create branch on repo with commit", function() {
            it('should NOT throw an error', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                expect(function(){repo.branch("beta");}).to.not.throw(Error);
            });
            it('should return the repository', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                expect(repo.branch("beta")).to.equal(repo);
            });
            it('should store the branch with the same commitHash as HEAD', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                let headCommitHash = repo.get_head();
                repo.branch("beta");
                expect(repo.list_branches()['beta']).to.equal(headCommitHash);
            });
            it('should not change currentBranch', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                let currentBranch = repo.currentBranch;
                repo.branch("beta");
                expect(repo.currentBranch).to.equal(currentBranch);
            });
        });
        context("when trying to create branch with invalid name", function() {
            it('should throw an error', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                expect(function(){repo.branch("/231beta/");}).to.throw(Error);
            });
        });
        context("when trying to create branch on repo where branch with that name already exists", function() {
            it('should throw an error', function () {
                let repo = new jsodvcs.Repository();
                let content = {n:42};
                repo.add("foo/bar", content).commit("");
                repo.branch("beta");
                expect(function(){repo.branch("beta");}).to.throw(Error);
            });
        });
    });
};