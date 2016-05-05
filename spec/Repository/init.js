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

    describe('Repository#constructor()', function() {

        let repo = new Repository();

        it('should return an object', function() {
            expect(repo).to.be.a("object");
        });
        it('should have a "HEAD" string property', function() {
            expect(repo).to.have.ownProperty('HEAD');
            expect(repo.HEAD).to.exist;
            expect(repo.HEAD).to.be.a("string");
        });
        it('should have an empty "index" object property', function() {
            expect(repo).to.have.ownProperty('index');
            expect(repo.index).to.exist;
            expect(repo.index).to.be.a("object");
        });
        it('should have an empty "objects" object property', function() {
            expect(repo).to.have.ownProperty('objects');
            expect(repo.objects).to.exist;
            expect(repo.objects).to.be.a("object");
        });
        it('should have a "refs" property with an emtpty "heads" object property', function() {
            expect(repo).to.have.ownProperty('refs');
            expect(repo.refs).to.exist;
            expect(repo.refs).to.be.a("object");
            expect(repo.refs).to.have.ownProperty('heads');
            expect(repo.refs.heads).to.exist;
            expect(repo.refs.heads).to.be.a("object");
            expect(repo.refs.heads).to.be.empty;
        });

    });

    describe('jsodvcs#init()', function() {
        let repo = jsodvcs.init();
        it('should return the same as Repository#constructor()', function() {
            expect(repo).to.deep.equal(new Repository());
        });
    });
};
