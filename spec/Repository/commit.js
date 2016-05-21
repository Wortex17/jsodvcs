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
    describe('Repository#commit(message, options)', function() {

        context("when committing a blank index; no message; no options", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.commit();
            it("should return the repo", function () {
                expect(ret).to.be.equal(repo);
            });
            it('should add no entries to the "objects" object property', function () {
                expect(repo.objects).to.have.lengthOf(0);
            });
            it('should let the HEAD ref point to nothing', function () {
                expect(repo.get_head_commit()).to.be.undefined;
            });
        });
        context("when committing first content; no message; no options", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            let ret = repo.add("foo/bar", 42).commit({out:out});
            it("should return the repo", function () {
                expect(ret).to.be.equal(repo);
            });
            it('should add 3 entries to the "objects" object property (content, index, commit)', function () {
                expect(repo.objects).to.have.lengthOf(3);
            });
            it('should let the HEAD ref point to the current commit', function () {
                expect(repo.get_head()).to.equal(out.commitHash);
                expect(repo.get_head_commit()).to.equal(repo.get_object(out.commitHash));
                expect(repo.get_object(repo.HEAD)).to.equal(repo.get_object(out.commitHash));
            });
        });
        context("when committing no further content; no message; no options", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            let out2 = {};
            let ret = repo.add("foo/bar", 42).commit({out:out}).commit({out:out2});
            it("should return the repo", function () {
                expect(ret).to.be.equal(repo);
            });
            it('should add no more entries to the "objects" object property', function () {
                expect(repo.objects).to.have.lengthOf(3);
            });
            it('should let the HEAD ref point to the the previous commit', function () {
                expect(repo.get_head()).to.equal(out.commitHash);
                expect(repo.get_head_commit()).to.equal(repo.get_object(out.commitHash));
                expect(repo.get_object(repo.HEAD)).to.equal(repo.get_object(out.commitHash));
            });
            it('should set the out-didCommit to false', function () {
                expect(out2.didCommit).to.be.false;
            });
            it('should set the out-commit to the head-commit before', function () {
                expect(out2.commitHash).to.equal(out.commitHash);
            });
        });
        context("when committing changed content; no message; no options", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            let out2 = {};
            let ret = repo.add("foo/bar", 42).commit({out:out}).add("foo/bar", 46).commit({out:out2});
            it("should return the repo", function () {
                expect(ret).to.be.equal(repo);
            });
            it('should add 3 more entries to the "objects" object property (content, index, commit)', function () {
                expect(repo.objects).to.have.lengthOf(6);
            });
            it('should let the HEAD ref point to the latest commit', function () {
                expect(repo.get_head()).to.equal(out2.commitHash);
                expect(repo.get_head_commit()).to.equal(repo.get_object(out2.commitHash));
                expect(repo.get_object(repo.HEAD)).to.equal(repo.get_object(out2.commitHash));
            });
        });
        context("when committing further content; with message; date,author,committer set", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            let out2 = {};
            let ret = repo.add("foo/bar", 42).commit("commitA", {out:out}).add("foo/bar2", 46).commit("commitB", {
                author: 'Arthur',
                committer: 'Colonel Mitter',
                date: new Date(1462463105392),
                out:out2
            });
            it("should return the repo", function () {
                expect(ret).to.be.equal(repo);
            });
            it('should add 3 more entries to the "objects" object property (content, index, commit)', function () {
                expect(repo.objects).to.have.lengthOf(6);
            });
            it('should let the HEAD ref point to the latest commit', function () {
                expect(repo.get_head()).to.equal(out2.commitHash);
                expect(repo.get_head_commit()).to.equal(repo.get_object(out2.commitHash));
                expect(repo.get_object(repo.HEAD)).to.equal(repo.get_object(out2.commitHash));
            });
            it('should write message, date, author and committer to the commit', function () {
                let commit = repo.get_object(out2.commitHash);
                expect(commit.date).to.deep.equal(new Date(1462463105392));
                expect(commit.author).to.deep.equal('Arthur');
                expect(commit.committer).to.deep.equal('Colonel Mitter');
                expect(commit.message).to.deep.equal('commitB');
            });
        });

        context("when committing merged content; no message; no options", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            let outY = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar1", 2).commit({out:outB});

            repo.checkout("branchA");
            let ret = repo.merge("branchB").commit({out:outY});

            it("should return the repo", function () {
                expect(ret).to.be.equal(repo);
            });
            it("should have committed without further changes", function () {
                expect(outY.didCommit).to.be.true;
            });
            it("should remove merging state", function () {
                expect(repo.isMerging).to.be.false;
            });
            it("should give the commit two parents", function () {
                expect(outY.commit.parents).to.deep.equal([outA.commitHash, outB.commitHash]);
            });
        });

        context("when committing merged conflicted content; no message; no options", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            let outY = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 2).commit({out:outB});

            repo.checkout("branchA").merge("branchB");

            it("should throw an error", function () {
                expect(function(){repo.commit();}).to.throw(Error);
            });
        });

        context("when committing merged conflicted content; options.ignoreConflicts = true", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            let outY = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 2).commit({out:outB});

            repo.checkout("branchA").merge("branchB");

            it("should not throw an error", function () {
                expect(function(){repo.commit({ignoreConflicts:true, out:outY});}).to.not.throw(Error);
            });
            it("should have committed without further changes", function () {
                expect(outY.didCommit).to.be.true;
            });
            it("should remove merging state", function () {
                expect(repo.isMerging).to.be.false;
            });
            it("should remove conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.false;
            });
            it("should give the commit two parents", function () {
                expect(outY.commit.parents).to.deep.equal([outA.commitHash, outB.commitHash]);
            });
        });
    });
};