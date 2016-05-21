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

    describe('Repository#fetch()', function() {

        context("when performing a simple fetch without options", function(){
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
            let ret = repoA.fetch(repoB);
            it('should return the repository', function() {
                expect(ret).to.equal(repoA);
            });
            it('should not change the HEAD', function() {
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
        });
        context("when performing a simple fetch with options.name set", function(){
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
            let ret = repoA.fetch(repoB, {name:"specialName"});
            it('should return the repository', function() {
                expect(ret).to.equal(repoA);
            });
            it('should not change the HEAD', function() {
                expect(repoA.HEAD).to.equal(repoA_HEAD);
            });
            it('should not change any local branches', function() {
                expect(repoA.list_branches()).to.deep.equal(repoA_branches);
            });
            it('should make objects from the fetched remote available', function() {
                expect(repoA.get_commit_object(outB.commitHash)).to.deep.equal(outB.commit);
            });
            it('should set FETCH_HEAD to the remote branch that matches the current local one', function() {
                expect(repoA.FETCH_HEAD).to.equal("refs/remotes/specialName/master");
            });
        });
        context("when performing a simple fetch with options.trackBranch set", function(){
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
                .commit().branch("beta").checkout("beta")
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit({out:outB});
            let ret = repoA.fetch(repoB, {trackedBranch:"beta"});
            it('should return the repository', function() {
                expect(ret).to.equal(repoA);
            });
            it('should not change the HEAD', function() {
                expect(repoA.HEAD).to.equal(repoA_HEAD);
            });
            it('should not change any local branches', function() {
                expect(repoA.list_branches()).to.deep.equal(repoA_branches);
            });
            it('should make objects from the fetched remote available', function() {
                expect(repoA.get_commit_object(outB.commitHash)).to.deep.equal(outB.commit);
            });
            it('should set FETCH_HEAD to the remote branch that matches the current local one', function() {
                expect(repoA.FETCH_HEAD).to.equal("refs/remotes/origin/beta");
            });
        });context("when performing a simple fetch with options.branches set", function(){
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
                .commit({out:outB}).branch("beta").checkout("beta")
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            let ret = repoA.fetch(repoB, {branches:["master"]});
            it('should return the repository', function() {
                expect(ret).to.equal(repoA);
            });
            it('should not change the HEAD', function() {
                expect(repoA.HEAD).to.equal(repoA_HEAD);
            });
            it('should not change any local branches', function() {
                expect(repoA.list_branches()).to.deep.equal(repoA_branches);
            });
            it('should make objects from the fetched remote available', function() {
                expect(repoA.get_commit_object(outB.commitHash)).to.deep.equal(outB.commit);
            });
            it('should only store specified remote branches', function() {
                expect(repoA.get_ref("refs/remotes/origin/master")).to.equal(outB.commitHash);
                expect(repoA.get_ref("refs/remotes/origin/beta")).to.be.undefined;
            });
        });
        context("when fetching from a non-repository", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            it('should throw a type error', function() {
                expect(function(){repoA.fetch({})}).to.throw(TypeError);
            });
        });
        context("when fetching from a repository while", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            repoA.MERGE_HEAD = "ujfnu93oh9§";
            let repoB = new jsodvcs.Repository();
            it('should throw a type error', function() {
                expect(function(){repoA.fetch(repoB)}).to.throw(Error);
            });
        });
        context("when fetching from a repository which is merging", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            let repoB = new jsodvcs.Repository();
            repoB.MERGE_HEAD = "ujfnu93oh9§";
            it('should throw a type error', function() {
                expect(function(){repoA.fetch(repoB)}).to.throw(Error);
            });
        });
    });
};
