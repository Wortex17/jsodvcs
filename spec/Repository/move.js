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
    describe('Repository#move()', function() {

        it('should call mv()', function () {
            let repo = new jsodvcs.Repository();
            let spy_mv = repo.mv;
            repo.move("a", "b");
            expect(spy_mv).to.have.been.called;
        });

        context("sourcePath does not exist, destinationPath does not exists", function() {
            let repo = new jsodvcs.Repository();

            it('should return the repository', function () {
                expect(repo.move("a", "b")).to.equal(repo);
            });
        });
        context("sourcePath does exist, destinationPath does not exists", function() {
            let repo = new jsodvcs.Repository();
            repo.add("a", 42);
            let ret = repo.move("a", "b");

            it('should return the repository', function () {
                expect(ret).to.equal(repo);
            });
            it('should remove the content from sourcePath', function () {
                expect(repo.get_content("a")).to.be.undefined;
            });
            it('should add the content to destinationPath', function () {
                expect(repo.get_content("b")).to.equal(42);
            });
        });
        context("sourcePath does not exist, destinationPath does exists", function() {
            it('should not throw an error', function () {
                let repo = new jsodvcs.Repository();
                repo.add("b", 8);
                expect(function(){repo.move("a", "b");}).to.not.throw;
            });
            it('should return the repository', function () {
                let repo = new jsodvcs.Repository();
                repo.add("b", 8);
                repo.move("a", "b");
                expect(repo.move("a", "b")).to.equal(repo);
            });
        });
        context("sourcePath does exist, destinationPath does exists;", function() {
            it('should throw an ReferenceError', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                expect(function(){repo.move("a", "b");}).to.throw(ReferenceError);
            });
            it('should not remove the content from sourcePath', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                try {
                    repo.move("a", "b");
                } catch(e) {}
                expect(repo.get_content("a")).to.equal(42);
            });
            it('should not add the content to destinationPath', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                try {
                    repo.move("a", "b");
                } catch(e) {}
                expect(repo.get_content("b")).to.equal(8);
            });
        });
        context("sourcePath does exist, destinationPath does exists; quiet:true", function() {
            it('should not throw an error', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                expect(function(){repo.move("a", "b", {quiet:true});}).to.not.throw;
            });
            it('should not remove the content from sourcePath', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                repo.move("a", "b", {quiet:true});
                expect(repo.get_content("a")).to.equal(42);
            });
            it('should not add the content to destinationPath', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                repo.move("a", "b", {quiet:true});
                expect(repo.get_content("b")).to.equal(8);
            });
        });
        context("sourcePath does exist, destinationPath does exists; force:true", function() {
            it('should not throw an error', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                expect(function(){repo.move("a", "b", {force:true});}).to.not.throw;
            });
            it('should remove the content from sourcePath', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                repo.move("a", "b", {force:true});
                expect(repo.get_content("a")).to.be.undefined;
            });
            it('should add the content to destinationPath', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                repo.move("a", "b", {force:true});
                expect(repo.get_content("b")).to.equal(42);
            });
        });
        context("sourcePath does not exist, destinationPath does not exists; force:true", function() {
            it('should return the repository', function () {
                let repo = new jsodvcs.Repository();
                expect(repo.move("a", "b", {force:true})).to.equal(repo);
            });
            it('should not add any content to destinationPath', function () {
                let repo = new jsodvcs.Repository();
                repo.move("a", "b", {force:true});
                expect(repo.get_content("b")).to.be.undefined;
            });
        });
        context("sourcePath does exist, destinationPath does exists; swap:true", function() {
            it('should not throw an error', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                expect(function(){repo.move("a", "b", {swap:true});}).to.not.throw;
            });
            it('should add the previous destination content to sourcePath', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                repo.move("a", "b", {swap:true});
                expect(repo.get_content("a")).to.equal(8);
            });
            it('should add the previous source content to destinationPath', function () {
                let repo = new jsodvcs.Repository();
                repo.add("a", 42);
                repo.add("b", 8);
                repo.move("a", "b", {swap:true});
                expect(repo.get_content("b")).to.equal(42);
            });
        });
    });
    describe('Repository#rename()', function() {
        it('should return the repository', function () {
            let repo = new jsodvcs.Repository();
            expect(repo.move("a", "b")).to.equal(repo);
        });
        it('should call mv()', function () {
            let repo = new jsodvcs.Repository();
            let spy_mv = repo.mv;
            repo.rename("a", "b");
            expect(spy_mv).to.have.been.called;
        });
    });
};