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


    describe('Repository.isRef(ref)', function() {

        context("when valid ref syntax", function() {
            it("should return true", function () {
                expect(jsodvcs.Repository.isRef("refs/heads/master")).to.be.true;
                expect(jsodvcs.Repository.isRef("refs/remotes/origin/master")).to.be.true;
                expect(jsodvcs.Repository.isRef("refs/heads/slash/inbetween")).to.be.true;
                expect(jsodvcs.Repository.isRef("refs/remotes/origin/slash/inbetween")).to.be.true;
                expect(jsodvcs.Repository.isRef("refs/heads/num0inbetween")).to.be.true;
                expect(jsodvcs.Repository.isRef("refs/remotes/origin/num0inbetween")).to.be.true;
                expect(jsodvcs.Repository.isRef("HEAD")).to.be.true;
                expect(jsodvcs.Repository.isRef("FETCH_HEAD")).to.be.true;
                expect(jsodvcs.Repository.isRef("MERGE_HEAD")).to.be.true;
            });
        });
        context("when no parameter given", function() {
            it("should return false", function () {
                expect(jsodvcs.Repository.isRef()).to.be.false;
            });
        });
        context("when invalid ref syntax", function() {
            it("should return false", function () {
                expect(jsodvcs.Repository.isRef("heads/master")).to.be.false;
                expect(jsodvcs.Repository.isRef("refs/master")).to.be.false;
                expect(jsodvcs.Repository.isRef("refs/headss/master")).to.be.false;
                expect(jsodvcs.Repository.isRef("refs/remotes/master")).to.be.false;
                expect(jsodvcs.Repository.isRef("refs/origin/master")).to.be.false;
                expect(jsodvcs.Repository.isRef("FOOBAR")).to.be.false;
                expect(jsodvcs.Repository.isRef("refs/heads//slashstart")).to.be.false;
                expect(jsodvcs.Repository.isRef("refs/heads/slashend/")).to.be.false;
                expect(jsodvcs.Repository.isRef("refs/heads/0numstart")).to.be.false;
                expect(jsodvcs.Repository.isRef("refs/heads/numend0")).to.be.false;
            });
        });
    });

    describe('Repository#get_ref(ref)', function() {

        context("when getting missing ref 'refs/heads/master'", function() {
            let repo = new jsodvcs.Repository();

            it("should return undefined", function () {
                expect(repo.get_ref("refs/heads/master")).to.be.undefined;
            });
        });

        context("when getting existing ref 'refs/heads/master'", function() {
            let repo = new jsodvcs.Repository();
            repo.refs.heads.master = "@refpointer@hash@";

            it("should return the pointed objectHash", function () {
                expect(repo.get_ref("refs/heads/master")).to.equal("@refpointer@hash@");
            });
            it("should not ignore the leading 'refs/' part", function () {
                expect(repo.get_ref("heads/master")).to.be.undefined;
            });
        });
    });

    describe('Repository#set_ref(ref)', function() {

        context("when setting missing ref 'refs/heads/master' to foreign objectHash", function() {
            let repo = new jsodvcs.Repository();

            it("should throw a ReferenceError", function () {
                expect(function(){repo.set_ref("refs/heads/master", "@refpointer@hash@")}).to.throw(ReferenceError);
            });
        });

        context("when setting missing ref 'refs/heads/master' to stored objectHash", function() {
            let repo = new jsodvcs.Repository();
            repo.objects.set('@refpointer@hash@', 'foobar');

            it("should return the repository", function () {
                expect(repo.set_ref("refs/heads/master", "@refpointer@hash@")).to.be.equal(repo);
            });
            it("should not ignore the leading 'refs/' part", function () {
                expect(function(){repo.set_ref("heads/master");}).to.throw(TypeError);
            });
            it("should make the ref available via get_ref", function () {
                expect(repo.get_ref("refs/heads/master")).to.equal("@refpointer@hash@");
            });
        });

        context("when setting existing ref 'refs/heads/master' to stored objectHash", function() {
            let repo = new jsodvcs.Repository();
            repo.objects.set('@refpointer@hash@', 'foobar');
            repo.objects.set('@refpointer@hash@2', 'foobar2');

            repo.set_ref("refs/heads/master", "@refpointer@hash@");

            it("should return the repository", function () {
                expect(repo.set_ref("refs/heads/master", "@refpointer@hash@2")).to.be.equal(repo);
            });
            it("should not ignore the leading 'refs/' part", function () {
                expect(function(){repo.set_ref("heads/master");}).to.throw(TypeError);
            });
            it("should make the ref available via get_ref", function () {
                expect(repo.get_ref("refs/heads/master")).to.equal("@refpointer@hash@2");
            });
        });

        context("when setting existing ref 'refs/heads/this/is/really/really/deep' to stored objectHash", function() {
            let repo = new jsodvcs.Repository();
            repo.objects.set('@refpointer@hash@', 'foobar');
            repo.objects.set('@refpointer@hash@2', 'foobar2');

            repo.set_ref("refs/heads/this/is/really/really/deep", "@refpointer@hash@");

            it("should return the repository", function () {
                expect(repo.set_ref("refs/heads/this/is/really/really/deep", "@refpointer@hash@2")).to.be.equal(repo);
            });
            it("should not ignore the leading 'refs/' part", function () {
                expect(function(){repo.set_ref("heads/master", "@refpointer@hash@2");}).to.throw(TypeError);
            });
            it("should make the ref available via get_ref and the new pointed hash", function () {
                repo.set_ref("refs/heads/this/is/really/really/deep", "@refpointer@hash@2");
                expect(repo.get_ref("refs/heads/this/is/really/really/deep")).to.equal("@refpointer@hash@2");
            });
        });
    });
    
    describe('Repository#resolve_ref(ref)', function() {

        let repo = new jsodvcs.Repository();
        repo.objects.set('@refpointer@hash@', 'foobar');
        repo.objects.set('@refpointer@hash@2', 'foobar2');
        repo.HEAD = "refs/heads/master";
        repo.FETCH_HEAD = "@refpointer@hash@2";
        repo.MERGE_HEAD = "HEAD";
        repo.set_ref("refs/heads/master", "@refpointer@hash@");

        let repo2 = new jsodvcs.Repository();
        delete repo2.HEAD;
        repo.objects.set('@refpointer@hash@', 'foobar');
        repo.objects.set('@refpointer@hash@2', 'foobar2');

        context("when resolving invalid ref name", function() {
            it("should return undefined", function () {
                expect(repo.resolve_ref("99be_/")).to.be.undefined;
            });
        });

        context("when resolving invalid (and not local) ref name", function() {
            it("should return undefined", function () {
                expect(repo.resolve_ref("XOXOXO")).to.be.undefined;
            });
        });

        context("when resolving valid fully qualified ref name", function() {
            it("should return the stored objectHash", function () {
                expect(repo.resolve_ref("refs/heads/master")).to.equal("@refpointer@hash@");
            });
        });

        context("when resolving local ref name", function() {
            it("should return the same as the fully qualified ref name", function () {
                expect(repo.resolve_ref("master")).to.equal(repo.resolve_ref("refs/heads/master"));
            });
        });

        context("when resolving HEAD", function() {
            it("should return the same as the branch pointed to by HEAD", function () {
                expect(repo.resolve_ref("HEAD")).to.equal(repo.resolve_ref("refs/heads/master"));
            });
        });
        context("when resolving FETCH_HEAD (which directly points to objectHash)", function() {
            it("should return the same as the object hash pointed to by REF_HEAD", function () {
                expect(repo.resolve_ref("FETCH_HEAD")).to.equal("@refpointer@hash@2");
            });
        });
        context("when resolving MERGE_HEAD (which points to HEAD)", function() {
            it("should return the same as HEAD", function () {
                expect(repo.resolve_ref("MERGE_HEAD")).to.equal(repo.resolve_ref("HEAD"));
            });
        });

        context("when resolving HEAD (which is not set)", function() {
            it("should return the same as the branch pointed to by HEAD", function () {
                expect(repo2.resolve_ref("HEAD")).to.be.undefined;
            });
        });
        context("when resolving FETCH_HEAD (which is not set)", function() {
            it("should return the same as the object hash pointed to by REF_HEAD", function () {
                expect(repo2.resolve_ref("FETCH_HEAD")).to.be.undefined;
            });
        });
        context("when resolving MERGE_HEAD (which is not set)", function() {
            it("should return undefined", function () {
                expect(repo2.resolve_ref("MERGE_HEAD")).to.be.undefined;
            });
        });
    });
};