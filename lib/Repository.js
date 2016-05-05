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
     * Adds the given content to the index at the given path.
     * @param {string} path
     * @param {*} [content] - If not given, the path will be removed from the index instead.
     * @param {Object} [options]
     * @param {boolean} [options.ignore_removal = false] - If the provided content is not given, ignore this command (do not remove from index)
     * @return {Repository}
     */
    add(path, content, options)
    {
        options = _.extend({
            'ignore-removal': false
        }, options);
        this.update_index(path, content, {
            add: true,
            remove: !options['ignore_removal']
        });
        return this;
    }

    /**
     * Removes the content at given path from the index.
     * @param {string} path
     * @param {Object} [options]
     * @return {Repository}
     */
    rm(path, options)
    {
        this.update_index(path, undefined, {
            remove: true
        });
        return this;
    }
    /**
     * Alias for Repository#rm()
     * @see rm
     */
    remove(path, options)
    {
        return this.rm.apply(this, arguments)
    }

    /**
     * Updates the index at the given path with given content.
     * This prepares the content staged for the next commit.
     * @param {string} path
     * @param {*} content
     * @param {Object} [options]
     * @param {boolean} [options.add = false] - If the specified path is'nt in the index already then it’s added.
     * @param {boolean} [options.remove = false] - If the specified path is in the index already but the content is missing (undefined), then it's removed.
     */
    update_index(path, content, options)
    {
        options = _.extend({
            add: false,
            remove: false
        }, options);
        let isIndexed = this.has_indexed(path);
        if(_.isUndefined(content))
        {
            //Remove
            if(options.remove)
            {
                delete this.index[path];
            }

        } else {
            //Update or Add
            if (isIndexed || options.add) {
                let hash = getObjectHash(content);
                if (!isInObjects(hash, this.objects)) {
                    setInObjects(hash, content, this.objects);
                }
                this.index[path] = hash;
            }
        }
        return this;
    }

    /**
     * Returns if the given path is present in the index.
     * @param {string} path
     * @return {Boolean}
     */
    has_indexed(path)
    {
        return this.index.hasOwnProperty(path);
    }

    /**
     * Returns the objectHash stored in the index at the given path.
     * @param {string} path
     * @return {*|undefined} Returns undefined if the path is not in the index.
     */
    get_indexed(path)
    {
        if(this.has_indexed(path))
        {
            return this.index[path];
        } else return undefined;
    }

    /**
     * Returns content of the given path from the index.
     * @param path
     * @return {*|undefined} Returns undefined if the path is not in the index.
     */
    get(path)
    {
        let objectHash = this.get_indexed(path);
        if(_.isUndefined(objectHash))
        {

            return undefined;
        } else {
            return getFromObjects(objectHash, this.objects);
        }
    }
}

/**
 * Export the class
 * @type {Repository}
 */
module.exports = Repository;