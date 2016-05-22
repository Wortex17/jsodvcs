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

    describe('Repository#push()', function() {

        context("when pushing all branches, some of which are ahead, behind and up-to-date", function(){

            let origin = new jsodvcs.Repository();
            origin
                .add("foo/int", 42)
                .commit()
                .branch("to-be-rejected")
                .add("four", 4)
                .commit()
                .checkout("master")
                .branch("to-be-behind")
                .add("one", 1)
                .commit()
                .checkout("master")
                .branch("to-be-up2date")
                .add("seven", 7)
                .commit()
                .checkout("master")
            ;
            let local = origin.clone();
            origin
                .checkout("to-be-rejected")
                .add("four", 44)
                .commit()
                .checkout("to-be-behind")
                .add("one", 11)
                .commit()
                .checkout("master")
            ;
            local
                .branch("to-be-new")
                .add("nine", 9)
                .commit()
                .checkout("to-be-rejected")
                .add("four", 444)
                .commit()
                .checkout("master")
                .add("foo/int", 84)
                .commit()
            ;

            let out = {};
            let ret = local.push(origin, {out:out});
            it('should return the repository', function() {
                expect(ret).to.equal(local);
            });
            it('should have pushed branches that were new', function() {
                expect(out.pushedBranches).to.include('refs/heads/to-be-new');
                expect(origin.resolve_ref('refs/heads/to-be-new')).to.equal(local.resolve_ref('refs/heads/to-be-new'));
            });
            it('should have pushed branches that were ahead', function() {
                expect(out.pushedBranches).to.include('refs/heads/master');
                expect(origin.resolve_ref('refs/heads/master')).to.equal(local.resolve_ref('refs/heads/master'));
            });
            it('should have rejected branches that were behind (no local changes)', function() {
                expect(out.rejectedBranches).to.include('refs/heads/to-be-behind');
                expect(origin.resolve_ref('refs/heads/to-be-behind')).to.not.equal(local.resolve_ref('refs/heads/to-be-behind'));
            });
            it('should have rejected branches that were behind (local changes)', function() {
                expect(out.rejectedBranches).to.include('refs/heads/to-be-rejected');
                expect(origin.resolve_ref('refs/heads/to-be-rejected')).to.not.equal(local.resolve_ref('refs/heads/to-be-rejected'));
            });
            it('should have ignored branches that were up to date', function() {
                expect(out.upToDateBranches).to.include('refs/heads/to-be-up2date');
                expect(origin.resolve_ref('refs/heads/to-be-up2date')).to.equal(local.resolve_ref('refs/heads/to-be-up2date'));
            });
            it('should have checked out remote as it was on a pushed branch', function() {
                expect(out.didRemoteCheckout).to.be.true;
            });
        });

        context("when pushing to a non-repository", function(){
            let repoA = new jsodvcs.Repository();
            repoA
                .add("foo/int", 42)
                .add("foo/string", "foobar")
                .add("foo/obj", {a:'a'})
                .commit();
            it('should throw a type error', function() {
                expect(function(){repoA.push({})}).to.throw(TypeError);
            });
        });
    });
};
