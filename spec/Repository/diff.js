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
    describe('Repository#diff()', function() {
        context("No previous commit; No arguments; No options", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
            ;
            it('should return undefined', function () {
                expect(repo.diff()).to.be.undefined;
            });
        });

        context("No previous commit; HEAD; No options", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
            ;
            it('should return undefined', function () {
                expect(repo.diff()).to.be.undefined;
            });
        });
        context("No changes since last commit; HEAD; No options", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
                .commit("")
                .add('foo/bar', 42)
                .add('foo/bar2', 2)
            ;
            it('should return an array', function () {
                expect(repo.diff('HEAD')).to.be.an.array;
            });
            it("should return no paths", function(){
                expect(repo.diff('HEAD')).to.deep.equal([])
            });
        });
        context("Some changes since last commit; HEAD; No options", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
                .commit("")
                .add('foo/bar', 42)
                .add('foo/bar2', 3)
                .add('foo/bar3', 666)
            ;
            it('should return an array', function () {
                expect(repo.diff('HEAD')).to.be.an.array;
            });
            it("should return all changed and added paths", function(){
                expect(repo.diff('HEAD')).to.deep.equal(['foo/bar2', 'foo/bar3'])
            });
        });
        context("Some changes since last commit; HEAD; Restricted paths", function(){
            let repo = new jsodvcs.Repository();
            repo.add('foo/bar', 42)
                .add('foo/bar2', 2)
                .commit("")
                .add('foo/bar', 42)
                .add('foo/bar2', 3)
                .add('foo/bar3', 666)
            ;
            it('should return an array', function () {
                expect(repo.diff('HEAD', undefined, {paths:['foo/bar3']})).to.be.an.array;
            });
            it("should return changed and added paths that match with the paths given via options", function(){
                expect(repo.diff('HEAD', undefined, {paths:['foo/bar3']})).to.deep.equal(['foo/bar3'])
            });
        });
    });
};