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
    describe('Repository#merge()', function() {

        context("when merging commit ahead of HEAD", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 126).commit({out:outB});
            repo.checkout("master");

            let ret = repo.merge("branchA");

            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should not set #isMerging", function () {
                expect(repo.isMerging).to.be.false;
            });
            it("should not record any merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.false;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("master");
            });
            it("should set the branch header to the ahead commit", function () {
                expect(repo.get_head()).to.equal(repo.resolve_ref("branchA"));
            });
        });
        context("when merging commit behind of HEAD", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 126).commit({out:outB});

            let HEAD = repo.HEAD;

            let branches = repo.list_branches();
            let ret = repo.merge("master");

            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should not set #isMerging", function () {
                expect(repo.isMerging).to.be.false;
            });
            it("should not record any merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.false;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("branchB");
            });
            it("should not change HEAD", function () {
                expect(repo.HEAD).to.equal(HEAD);
            });
        });
        context("when merging while having a detached HEAD", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 126).commit({out:outB});
            repo.checkout(outX.commitHash); //detach

            it("should throw an error", function () {
                expect(function(){repo.merge("branchA");}).to.throw(Error);
            });
        });
        context("when merging invalid commit", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 126).commit({out:outB});
            repo.checkout("master");

            it("should throw an error", function () {
                expect(function(){repo.merge("XOXO");}).to.throw(Error);
            });
        });
        context("when merging while already merging", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 126).commit({out:outB});
            repo.checkout("master");

            repo.MERGE_HEAD = outB.commitHash;
            it("should throw an error", function () {
                expect(function(){repo.merge("branchB");}).to.throw(Error);
            });
        });

        context("when merging divergent commit with changes at different paths", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar1", 2).commit({out:outB});

            repo.checkout("branchA");
            let ret = repo.merge("branchB");

            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should set #isMerging", function () {
                expect(repo.isMerging).to.be.true;
            });
            it("should not record any merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.false;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("branchA");
            });
            it("should incorporate all changes", function () {
                expect(repo.workingCopy).to.deep.equal({
                    "foo/bar": 84,
                    "foo/bar1": 2
                });
            });
        });

        context("when merging divergent commit with no common lca", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar1", 2).commit({out:outB});
            outB.commit.parents = []; //Detach the commit from its lineage

            repo.checkout("branchA");
            let ret = repo.merge("branchB");

            //For now, just error out with complex merge unsupported
            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should set #isMerging", function () {
                expect(repo.isMerging).to.be.true;
            });
            it("should record merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.true;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("branchA");
            });
        });

        context("when merging divergent commit with changes at the same path", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 2).commit({out:outB});

            repo.checkout("branchA");
            let ret = repo.merge("branchB");

            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should set #isMerging", function () {
                expect(repo.isMerging).to.be.true;
            });
            it("should record merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.true;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("branchA");
            });
            it("should generate contentDelta for mergeConflicts", function () {
                expect(repo.mergeConflicts['foo/bar'].contentDelta).to.not.be.undefined;
            });
        });
        context("when merging divergent commit with changes (including removal) at the same path", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.remove("foo/bar").commit({out:outB});

            repo.checkout("branchA");
            let ret = repo.merge("branchB");

            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should set #isMerging", function () {
                expect(repo.isMerging).to.be.true;
            });
            it("should record merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.true;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("branchA");
            });
            it("should generate contentDelta for mergeConflicts", function () {
                expect(repo.mergeConflicts['foo/bar'].contentDelta).to.not.be.undefined;
            });
        });
        context("when merging divergent commit with changes at the same path; indexOnly:true", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", 42).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", 84).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", 2).commit({out:outB});

            repo.checkout("branchA");
            let ret = repo.merge("branchB", {indexOnly:true});

            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should set #isMerging", function () {
                expect(repo.isMerging).to.be.true;
            });
            it("should record merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.true;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("branchA");
            });
            it("should not generate contentDelta for mergeConflicts", function () {
                expect(repo.mergeConflicts['foo/bar'].contentDelta).to.be.undefined;
            });
        });

        context("when merging divergent commit with changes at the same path which can be auto-resolved", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", {a: 'a'}).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", {a: 'A'}).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", {a: 'a', b: 'B'}).commit({out:outB});

            repo.checkout("branchA");
            let ret = repo.merge("branchB");

            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should set #isMerging", function () {
                expect(repo.isMerging).to.be.true;
            });
            it("should not record any merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.false;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("branchA");
            });
            it("should incorporate all changes", function () {
                expect(repo.workingCopy).to.deep.equal({'foo/bar': {
                    a: 'A',
                    b: 'B'
                }});
            });
        });
        context("when merging divergent commit with changes at the same path which can be auto-resolved; " +
            "tryAutoResolve:false", function() {
            let repo = new jsodvcs.Repository();
            let outA = {};
            let outB = {};
            let outX = {};
            repo.add("foo/bar", {a: 'a'}).commit({out:outX});
            repo.branch("branchA").checkout("branchA");
            repo.add("foo/bar", {a: 'A'}).commit({out:outA});
            repo.checkout("master");
            repo.branch("branchB").checkout("branchB");
            repo.add("foo/bar", {a: 'a', b: 'B'}).commit({out:outB});

            repo.checkout("branchA");
            let ret = repo.merge("branchB", {tryAutoResolve:false});

            it("should return repo", function () {
                expect(ret).to.equal(repo);
            });
            it("should set #isMerging", function () {
                expect(repo.isMerging).to.be.true;
            });
            it("should record merge conflicts", function () {
                expect(repo.hasMergeConflicts).to.be.true;
            });
            it("should not switch the branch", function () {
                expect(repo.currentBranch).to.equal("branchA");
            });
            it("should generate contentDelta for mergeConflicts", function () {
                expect(repo.mergeConflicts['foo/bar'].contentDelta).to.not.be.undefined;
            });
        });
    });
    describe('Repository#resolve_merge_conflict()', function() {

        context("when mergeConflict is recorded for path", function () {
            let repo = new jsodvcs.Repository();
            repo.mergeConflicts['foo/bar'] = {};
            let ret = repo.resolve_merge_conflict('foo/bar', 42);

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should set the given resolvedContent in the index', function () {
                expect(repo.get_content('foo/bar')).to.deep.equal(42);
            });
            it('should remove the mergeConflict entry', function () {
                expect(repo.mergeConflicts['foo/bar']).to.be.undefined;
            });
        });
        context("when mergeConflict is not recorded for path", function () {
            let repo = new jsodvcs.Repository();
            let ret = repo.resolve_merge_conflict('foo/bar', 42);

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should not set the given resolvedContent in the index', function () {
                expect(repo.get_content('foo/bar')).to.not.deep.equal(42);
            });
        });
    });
};