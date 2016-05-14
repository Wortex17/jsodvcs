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
    describe('Repository#get_indexed_content(path)', function() {

        context("when content was added at path before", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let ret = repo.add("foo/bar", content).get_indexed_content("foo/bar");

            it('should return the previously added content', function () {
                expect(ret).to.equal(content);
            });
        });

        context("when no content was added at path before", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let ret = repo.add("foo/bar", content).get_indexed_content("foo/bar/XX");

            it('should return undefined', function () {
                expect(ret).to.equal(undefined);
            });
        });
    });
    describe('Repository#get_content(path)', function() {

        context("when content was added at path before", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let ret = repo.add("foo/bar", content).get_content("foo/bar");

            it('should return a copy previously added content', function () {
                expect(ret).to.deep.equal(content);
                expect(ret).to.not.equal(content);
            });
        });

        context("when no content was added at path before", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let ret = repo.add("foo/bar", content).get_content("foo/bar/XX");

            it('should return undefined', function () {
                expect(ret).to.equal(undefined);
            });
        });
    });
    describe('Repository#workingCopy', function() {

        context("when content was added before", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let ret = repo.add("foo/bar", content).workingCopy;

            it('should return an object containing paths and cloned contents', function () {
                expect(ret).to.deep.equal({"foo/bar": {n:42}});
                expect(ret["foo/bar"]).to.not.equal({n:42});
            });
        });

        context("when no content was added before", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.workingCopy;

            it('should return an empty object', function () {
                expect(ret).to.deep.equal({});
            });
        });
    });

    describe('Repository#get_blob_object(path)', function() {

        context("when trying to get missing object", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let hash = repo.add("foo/bar", content).get_indexed_hash("foo/bar");
            let ret = repo.get_blob_object("dfndlfsd32f2fef2f");

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get blob object", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let hash = repo.add("foo/bar", content).get_indexed_hash("foo/bar");
            let ret = repo.get_blob_object(hash);

            it('should return the stored object', function () {
                expect(ret).to.equal(content);
            });
        });
        context("when trying to get commit object", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_blob_object(out.commitHash);

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get tree object", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_blob_object(out.commit.tree);

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
    });
    describe('Repository#get_commit_object(path)', function() {

        context("when trying to get missing object", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let hash = repo.add("foo/bar", content).get_indexed_hash("foo/bar");
            let ret = repo.get_commit_object("dfndlfsd32f2fef2f");

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get blob object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let hash = repo.add("foo/bar", content).get_indexed_hash("foo/bar");
            let ret = repo.get_commit_object(hash);

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get commit object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_commit_object(out.commitHash);

            it('should return the created commit object', function () {
                expect(ret).to.equal(out.commit);
            });
        });
        context("when trying to get tree object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_commit_object(out.commit.tree);

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
    });
    describe('Repository#get_commit_object(path)', function() {

        context("when trying to get missing object", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let hash = repo.add("foo/bar", content).get_indexed_hash("foo/bar");
            let ret = repo.get_commit_object("dfndlfsd32f2fef2f");

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get blob object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let hash = repo.add("foo/bar", content).get_indexed_hash("foo/bar");
            let ret = repo.get_commit_object(hash);

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get commit object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_commit_object(out.commitHash);

            it('should return the created commit object', function () {
                expect(ret).to.equal(out.commit);
            });
        });
        context("when trying to get tree object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_commit_object(out.commit.tree);

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get tree object via ref HEAD", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_commit_object("HEAD");

            it('should return the latest commit', function () {
                expect(ret).to.equal(out.commit);
            });
        });
    });

    describe('Repository#get_tree_object(path)', function() {

        context("when trying to get missing object", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let hash = repo.add("foo/bar", content).get_indexed_hash("foo/bar");
            let ret = repo.get_tree_object("dfndlfsd32f2fef2f");

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get blob object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let hash = repo.add("foo/bar", content).get_indexed_hash("foo/bar");
            let ret = repo.get_tree_object(hash);

            it('should return undefined', function () {
                expect(ret).to.be.undefined;
            });
        });
        context("when trying to get commit object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_tree_object(out.commitHash);

            it('should return the tree of the commit object', function () {
                expect(ret).to.equal(repo.objects.get(out.commit.tree));
            });
        });
        context("when trying to get tree object via hash", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_tree_object(out.commit.tree);

            it('should return the tree', function () {
                expect(ret).to.equal(repo.objects.get(out.commit.tree));
            });
        });
        context("when trying to get tree object via ref HEAD", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let out = {commitHash: "", commit: undefined};
            repo.add("foo/bar", content).commit("", {out:out});
            let ret = repo.get_tree_object("HEAD");

            it('should return the tree of the referenced (latest) commit', function () {
                expect(ret).to.equal(repo.objects.get(out.commit.tree));
            });
        });
    });

    describe('Repository.objects (RepositoryObjectStorage)', function() {



        describe('RepositoryObjectStorage#toJSON()', function() {
            let repo = new jsodvcs.Repository();
            repo.add("foo/bar", "foobar");
            it('should be a transparent wrapper to the underlying container when serializing', function () {
                expect(JSON.stringify(repo.objects)).to.deep.equal(JSON.stringify(repo.objects.storage));
            });
        });

        describe('RepositoryObjectStorage#get(objectHash)', function() {
            let repo = new jsodvcs.Repository();
            repo.add("foo/bar", "foobar");
            it('should return undefined when storage has storaged content in wrong internal format', function () {
                repo.objects.storage['abc'] = {'defghijk': false};
                expect(repo.objects.get('abcdefghijk')).to.be.undefined;
            });
            it('should return undefined when object was found but does not have correct flags', function () {
                repo.objects.set("0123456789", "foobar",  {setFlags: ['xxx']});
                expect(repo.objects.get('0123456789', {flags: []})).to.be.undefined;
            });
            it('should return the object when object was found and has the correct flags', function () {
                repo.objects.set("0123456789", "foobar", {setFlags: ['xxx']});
                expect(repo.objects.get('0123456789', {flags: ['xxx']})).to.equal("foobar");
            });
        });

        describe('RepositoryObjectStorage#getFlags(objectHash)', function() {
            let repo = new jsodvcs.Repository();
            repo.add("foo/bar", "foobar");
            it('should return undefined when storage has storaged content in wrong internal format', function () {
                repo.objects.storage['abc'] = {'defghijk': false};
                expect(repo.objects.getFlags('abcdefghijk')).to.be.undefined;
            });
            it('should return empty array when object was found and has no flags', function () {
                repo.objects.set("0123456789", "foobar");
                expect(repo.objects.getFlags('0123456789')).to.be.an.array;
                expect(repo.objects.getFlags('0123456789')).to.have.length(0);
            });
        });
    });
};