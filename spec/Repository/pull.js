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

    let Repository = jsodvcs.Repository;

    describe('Repository#pull()', function() {

        context("when performing a simple pull of foreign changes without options", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            let repoA_HEAD = repoA.HEAD;
            let repoA_branches = repoA.list_branches();
            let repoB = new jsodvcs.Repository();
            let outB = {};
            repoB
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit({out:outB});
            let ret = repoA.pull(repoB);
            it('should return the repository', function() {
                expect(ret).to.equal(repoA);
            });
            it('should change the HEAD', function() {
                expect(repoA.HEAD).to.equal(repoA_HEAD);
            });
            it('should not change any local branches', function() {
                expect(repoA.list_branches()).to.deep.equal(repoA_branches);
            });
            it('should make objects from the fetched remote available', function() {
                expect(repoA.get_commit_object(outB.commitHash)).to.deep.equal(outB.commit);
            });
            it('should set FETCH_HEAD to the remote branch that matches the current local one', function() {
                expect(repoA.FETCH_HEAD).to.equal("refs/remotes/origin/master");
            });
            it('should store remote branches', function() {
                expect(repoA.get_ref("refs/remotes/origin/master")).to.equal(outB.commitHash);
            });
            it('should set the repository in a merging state', function() {
                expect(repoA.isMerging).to.be.true;
            });
        });
        context("when performing a simple pull of ahead-branch without options", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            let repoA_HEAD = repoA.HEAD;
            let repoA_branches = repoA.list_branches();
            let repoB = _.cloneDeep(repoA);
            let outB = {};
            repoB
                .add("foo/int", 84)
                .commit({out:outB});
            let ret = repoA.pull(repoB);
            it('should return the repository', function() {
                expect(ret).to.equal(repoA);
            });
            it('should change the HEAD', function() {
                expect(repoA.HEAD).to.equal(repoA_HEAD);
            });
            it('should update the current HEAD', function() {
                expect(repoA.HEAD).to.deep.equal(repoB.HEAD);
            });
            it('should make objects from the fetched remote available', function() {
                expect(repoA.get_commit_object(outB.commitHash)).to.deep.equal(outB.commit);
            });
            it('should set FETCH_HEAD to the remote branch that matches the current local one', function() {
                expect(repoA.FETCH_HEAD).to.equal("refs/remotes/origin/master");
            });
            it('should store remote branches', function() {
                expect(repoA.get_ref("refs/remotes/origin/master")).to.equal(outB.commitHash);
            });
            it('should not set the repository in a merging state', function() {
                expect(repoA.isMerging).to.be.false;
            });
        });
        context("when pulling from a non-repository", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            it('should throw a type error', function() {
                expect(function(){repoA.pull({})}).to.throw(TypeError);
            });
        });
        context("when pulling from a repository while merging", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            repoA.MERGE_HEAD = "ujfnu93oh9§";
            let repoB = new jsodvcs.Repository();
            it('should throw an error', function() {
                expect(function(){repoA.pull(repoB)}).to.throw(Error);
            });
        });
        context("when pulling from a repository which is merging", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            let repoB = new jsodvcs.Repository();
            repoB.MERGE_HEAD = "ujfnu93oh9§";
            it('should throw an error', function() {
                expect(function(){repoA.pull(repoB)}).to.throw(Error);
            });
        });
        context("when pulling from a repository which has a different hashVersion", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            let repoB = new jsodvcs.Repository();
            repoB.hashVersion = "somethingelse@0.0.0";
            it('should throw an error', function() {
                expect(function(){repoA.pull(repoB)}).to.throw(Error);
            });
        });
    });
};
