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
;

/**
 * Simple object storage with helper methods
 * @class
 * @memberOf jsodvcs
 */
class ObjectStorage
{
    constructor(storage){
        this.storage = _.extend({}, storage);
    }

    /**
     * Returns if any content is stored for this hash
     * container.
     * @param {string} objectHash
     */
    contains(objectHash)
    {
        return !_.isUndefined(this.get(objectHash));
    }

    /**
     * @see contains
     */
    contain(objectHash)
    {
        return this.contains.apply(this, arguments);
    }

    /**
     * Retrieves earlier stored content from the storage.
     * container.
     * @param {string} objectHash
     * @param {Object} [options]
     * @param {Object} [options.flags] - Exclusive list of flags that are required on the object.
       Even if an object is present, if it is not flagged with any flag in this sit, it will not be returned.
     */
    get(objectHash, options)
    {
        if(!_.isString(objectHash))
            return undefined;

        options = _.extend({}, options);

        let cKeys = [objectHash.slice(0, 3), objectHash.slice(3)];
        if(_.isNil(this.storage[cKeys[0]]))
        {
            return undefined;
        }
        let stored = this.storage[cKeys[0]][cKeys[1]];
        if(!_.isArray(stored))
            return undefined;
        let object = stored[0];
        if(_.isArray(options.flags))
        {
            //If flags are given, exclude objects that do not contain any flag
            let flags = stored[1];
            if(!_.isArray(flags) || !_.find(flags, function(flag){
                    return options.flags.indexOf(flag) >= 0;
                }))
                return undefined;
        }
        return object;
    }

    getFlags(objectHash)
    {
        if(!_.isString(objectHash))
            return undefined;
        let cKeys = [objectHash.slice(0, 3), objectHash.slice(3)];
        if(_.isNil(this.storage[cKeys[0]]))
        {
            return undefined;
        }
        let stored = this.storage[cKeys[0]][cKeys[1]];
        if(_.isArray(stored))
            return stored[1];
    }

    /**
     * Takes care of adding the given object to the storage.
     * @param {string} objectHash
     * @param {*} objectContent
     * @param {Object} [options]
     * @param {Object} [options.setFlags] - If provided, configures which flags should be set on the content
     */
    set(objectHash, objectContent, options)
    {
        options = _.extend({}, options);
        options.setFlags = _.isArray(options.setFlags) ? options.setFlags : [];
        let cKeys = [objectHash.slice(0, 3), objectHash.slice(3)];

        if(_.isNil(this.storage[cKeys[0]]))
        {
            this.storage[cKeys[0]] = {};
        }
        let stored = this.storage[cKeys[0]][cKeys[1]];
        if(!_.isArray(stored))
        {
            stored = [];
            this.storage[cKeys[0]][cKeys[1]] = stored;
        }
        stored[0] = objectContent;


        let flags = stored[1];
        if(!_.isArray(flags))
        {
            flags = [];
            stored[1] = flags;
        }

        _.forEach(options.setFlags, function(setFlag){
            if(flags.indexOf(setFlag) < 0)
            {
                flags.push(setFlag);
            }
        });
        flags.sort();

        return this;
    }

    get count()
    {
        let c = 0;
        _.forEach(this.storage, function(subStorage)
        {
            c += _.keys(subStorage).length;
        });
        return c;
    }
    get length()
    {
        return this.count;
    }

    toJSON()
    {
        return this.storage;
    }


    /**
     * Lists hashes with their assigned content and flags from the storage
     */
    list()
    {
        let that = this;
        let listed = {};
        _.forEach(that.storage, function(subStorage, hashStart){
            _.forEach(subStorage, function(stored, hashRest){
                if(_.isArray(stored))
                {
                    listed[hashStart + hashRest] = {
                        content: stored[0],
                        flags: stored[1]
                    };
                }
            });
        });
        return listed;
    }
}

module.exports = ObjectStorage;