/*!
 * jsodvcs
 * https://github.com/wortex17/jsodvcs
 * Created 24.04.2016 by Patrick Michael Hopf
 *
 * Released under The MIT License
 */
"use strict";

let _ = require("lodash");

class Repository
{
    /**
     * Initializes a new git repository.
     * Note that jsodvcs repositories are always acting like
     * "bare" git repositories (in that there is no working directory),
     * so the associated option is not present.
     * @param options
     */
    constructor(options){
        options = _.extend({}, options);
        //Set the current HEAD to the default ref
        this.HEAD = "ref: refs/heads/master";

        //Create storage for the objects
        this.objects = {};
        //Create storage for the refs
        this.refs = {
            heads: {}
        };
    }
}


/**
 * As jsodvcs does not have any context of a "current directory"
 * or the filesystem at all, init will simple create a new repository
 * via the constructor.
 * This method is simple there for people who would like
 * this to look more like git.
 * @see Repository.constructor
 * @return {Repository}
 */
Repository.init = function(options)
{
    return new Repository(options);
};

/**
 * Export the class
 * @type {Repository}
 */
module.exports = Repository;