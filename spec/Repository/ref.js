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


    describe.only('Repository.isRef(ref)', function() {

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
            it("should ignore the leading 'refs/' part", function () {
                expect(repo.get_ref("heads/master")).to.equal("@refpointer@hash@");
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
            repo.objects['@re'] = {};
            repo.objects['@re']['fpointer@hash@'] = "foobar";

            it("should return the repository", function () {
                expect(repo.set_ref("refs/heads/master", "@refpointer@hash@")).to.be.equal(repo);
            });
            it("should ignore the leading 'refs/' part", function () {
                expect(repo.get_ref("heads/master")).to.equal("@refpointer@hash@");
            });
        });

        context("when setting existing ref 'refs/heads/master' to stored objectHash", function() {
            let repo = new jsodvcs.Repository();
            repo.objects['@re'] = {};
            repo.objects['@re']['fpointer@hash@'] = "foobar";
            repo.objects['@re']['fpointer@hash@2'] = "foobar2";

            repo.set_ref("refs/heads/master", "@refpointer@hash@");

            it("should return the repository", function () {
                expect(repo.set_ref("refs/heads/master", "@refpointer@hash@2")).to.be.equal(repo);
            });
            it("should ignore the leading 'refs/' part", function () {
                expect(repo.get_ref("heads/master")).to.equal("@refpointer@hash@2");
            });
        });

        context("when setting existing ref 'refs/heads/this/is/really/really/deep' to stored objectHash", function() {
            let repo = new jsodvcs.Repository();
            repo.objects['@re'] = {};
            repo.objects['@re']['fpointer@hash@'] = "foobar";
            repo.objects['@re']['fpointer@hash@2'] = "foobar2";

            repo.set_ref("refs/heads/this/is/really/really/deep", "@refpointer@hash@");

            it("should return the repository", function () {
                expect(repo.set_ref("refs/this/is/really/really/deep", "@refpointer@hash@2")).to.be.equal(repo);
            });
            it("should ignore the leading 'refs/' part", function () {
                expect(repo.get_ref("this/is/really/really/deep")).to.equal("@refpointer@hash@2");
            });
        });
    });
};