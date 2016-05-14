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
    describe('Repository#status()', function() {
        context("No previous commit", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
            ;
            it('should return an array', function () {
                expect(repo.status()).to.be.an.array;
            });
            it("should return all added paths", function(){
                expect(repo.status()).to.deep.equal(['foo/bar', 'foo/bar2'])
            });
        });
        context("No changes since last commit", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
                .commit("")
                .add('foo/bar', 42)
                .add('foo/bar2', 2)
            ;
            it('should return an array', function () {
                expect(repo.status()).to.be.an.array;
            });
            it("should return no paths", function(){
                expect(repo.status()).to.deep.equal([])
            });
        });
        context("Some changes since last commit", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
                .commit("")
                .add('foo/bar', 42)
                .add('foo/bar2', 3)
                .add('foo/bar3', 666)
            ;
            it('should return an array', function () {
                expect(repo.status()).to.be.an.array;
            });
            it("should return all changed and added paths", function(){
                expect(repo.status()).to.deep.equal(['foo/bar2', 'foo/bar3'])
            });
        });
    });
    describe('Repository#isClean', function() {
        context("No previous commit, no changes", function(){
            let repo = new jsodvcs.Repository();
            it('should return true', function () {
                expect(repo.isClean).to.be.true;
            });
        });
        context("No previous commit, with changes", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
            ;
            it('should return false', function () {
                expect(repo.isClean).to.be.false;
            });
        });
        context("Previous commit, no changes", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
                .commit("")
            ;
            it('should return true', function () {
                expect(repo.isClean).to.be.true;
            });
        });
        context("Previous commit, with changes", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
                .commit("")
                .add('foo/bar', 42)
                .add('foo/bar2', 3)
            ;
            it('should return false', function () {
                expect(repo.isClean).to.be.false;
            });
        });
    });
};