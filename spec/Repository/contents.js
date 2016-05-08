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
    describe('Repository#working_copy', function() {

        context("when content was added before", function() {
            let repo = new jsodvcs.Repository();
            let content = {n:42};
            let ret = repo.add("foo/bar", content).working_copy;

            it('should return an object containing paths and cloned contents', function () {
                expect(ret).to.deep.equal({"foo/bar": {n:42}});
                expect(ret["foo/bar"]).to.not.equal({n:42});
            });
        });

        context("when no content was added before", function() {
            let repo = new jsodvcs.Repository();
            let ret = repo.working_copy;

            it('should return an empty object', function () {
                expect(ret).to.deep.equal({});
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
        });
    });
};