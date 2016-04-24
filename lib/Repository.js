/*!
 * jsodvcs
 * https://github.com/wortex17/jsodvcs
 * Created 24.04.2016 by Patrick Michael Hopf
 *
 * Released under The MIT License
 */
"use strict";

let
    _ = require("lodash")
    ,hash = require("object-hash")
;

/**
 * @param {*} object
 * @return {string}
 */
function getObjectHash(object)
{
    return hash(object);
}
function isInObjects(objectHash, objects)
{
    return !_.isUndefined(getFromObjects(objectHash, objects));
}
/**
 * Retrieves earlier stored object from the "objects"
 * container.
 * Returns the object contents hash,
 * which is used to retrieve it later.
 * @param {string} objectHash
 * @param {Object} objects
 */
function getFromObjects(objectHash, objects)
{
    let cKeys = [objectHash.slice(0, 3), objectHash.slice(3)];
    if(_.isNil(objects[cKeys[0]]))
    {
        return undefined;
    }
    return objects[cKeys[0]][cKeys[1]];
}
/**
 * Takes care of adding the given object to the "objects"
 * container.
 * Returns the object contents hash,
 * which is used to retrieve it later.
 * @param {string} objectHash
 * @param {*} object
 * @param {Object} objects
 */
function setInObjects(objectHash, object, objects)
{
    let cKeys = [objectHash.slice(0, 3), objectHash.slice(3)];

    if(_.isNil(objects[cKeys[0]]))
    {
        objects[cKeys[0]] = {};
    }
    objects[cKeys[0]][cKeys[1]] = object;
    return objectHash;
}

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

        //Create empty index
        this.index = {};
        //Create storage for the objects
        this.objects = {};
        //Create storage for the refs
        this.refs = {
            heads: {}
        };
    }

    /**
     * Adds the given object to the index at the given path.
     * @param {string} path
     * @param {*} content
     * @param options
     * @return {Repository}
     */
    add(path, content, options)
    {
        options = _.extend({}, options);

        let hash = getObjectHash(content);
        if(!isInObjects(hash, this.objects))
        {
            setInObjects(hash, content, this.objects);
        }
        this.index[path] = hash;
        return this;
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