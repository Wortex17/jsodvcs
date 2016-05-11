/*!
 * jsodvcs
 * https://github.com/wortex17/jsodvcs
 * Created 24.04.2016 by Patrick Michael Hopf
 *
 * Released under The MIT License
 */
"use strict";

/**
 * @namespace jsodvcs
 */

let jsodvcs = {};
module.exports = jsodvcs;


/**
 * The core of jsodvcs - the repository class.
 * @type {jsodvcs.Repository}
 */
jsodvcs.Repository = require("./Repository");
/**
 * @type {jsodvcs.ObjectStorage}
 */
jsodvcs.ObjectStorage = require("./ObjectStorage");
/**
 * @type {jsodvcs.ResetMode}
 */
jsodvcs.ResetMode = require("./ResetMode");
/**
 * @type {jsodvcs.RepositoryObjectType}
 */
jsodvcs.RepositoryObjectType = require("./RepositoryObjectType");


/**
 * As jsodvcs does not have any context of a "current directory"
 * or the filesystem at all, init will simple create a new repository
 * via the constructor.
 * This method is simple there for people who would like
 * this to look more like git.
 * @see Repository.constructor
 * @return {Repository}
 */
jsodvcs.init = function(options)
{
    return new (this.Repository)(options);
};