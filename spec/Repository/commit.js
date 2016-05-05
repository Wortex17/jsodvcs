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
                expect(_.keys(repo.objects)).to.have.lengthOf(0);
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
                expect(_.keys(repo.objects)).to.have.lengthOf(3);
            });
            it('should let the HEAD ref point to the current commit', function () {
                expect(repo.get_head()).to.equal(out.commitHash);
                expect(repo.get_head_commit()).to.equal(repo.get_commit(out.commitHash));
                expect(repo.get_commit(repo.HEAD)).to.equal(repo.get_commit(out.commitHash));
            });
        });
        context("when committing no further content; no message; no options", function() {
            let repo = new jsodvcs.Repository();
            let out = {};
            let ret = repo.add("foo/bar", 42).commit({out:out}).commit();
            it("should return the repo", function () {
                expect(ret).to.be.equal(repo);
            });
            it('should add no more entries to the "objects" object property', function () {
                expect(_.keys(repo.objects)).to.have.lengthOf(3);
            });
            it('should let the HEAD ref point to the the previous commit', function () {
                expect(repo.get_head()).to.equal(out.commitHash);
                expect(repo.get_head_commit()).to.equal(repo.get_commit(out.commitHash));
                expect(repo.get_commit(repo.HEAD)).to.equal(repo.get_commit(out.commitHash));
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
                expect(_.keys(repo.objects)).to.have.lengthOf(6);
            });
            it('should let the HEAD ref point to the latest commit', function () {
                expect(repo.get_head()).to.equal(out2.commitHash);
                expect(repo.get_head_commit()).to.equal(repo.get_commit(out2.commitHash));
                expect(repo.get_commit(repo.HEAD)).to.equal(repo.get_commit(out2.commitHash));
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
                expect(_.keys(repo.objects)).to.have.lengthOf(6);
            });
            it('should let the HEAD ref point to the latest commit', function () {
                expect(repo.get_head()).to.equal(out2.commitHash);
                expect(repo.get_head_commit()).to.equal(repo.get_commit(out2.commitHash));
                expect(repo.get_commit(repo.HEAD)).to.equal(repo.get_commit(out2.commitHash));
            });
            it('should write message, date, author and committer to the commit', function () {
                let commit = repo.get_commit(out2.commitHash);
                expect(commit.date).to.deep.equal(new Date(1462463105392));
                expect(commit.author).to.deep.equal('Arthur');
                expect(commit.committer).to.deep.equal('Colonel Mitter');
                expect(commit.message).to.deep.equal('commitB');
            });
        });
    });
};