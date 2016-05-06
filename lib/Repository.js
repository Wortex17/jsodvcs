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
    if(!_.isString(objectHash))
        return undefined;
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
        this.HEAD = "refs/heads/master";

        //Create empty index
        this.index = {};
        //Create storage for the refs
        this.refs = {
            heads: {}
        };
        //Create storage for the objects
        this.objects = {};

        this.commitDefaultOptions = {
            committer: undefined,
            author: undefined
        };
    }

    /**
     * Returns the object hash the stored ref at given path is pointing at.
     * @param {string} refPath
     * @return {string|undefined}
     */
    get_ref(refPath)
    {
        if(!_.isString(refPath))
            return undefined;
        let pivot = this.refs;
        let refPathSegs = refPath.split('/');
        for(let i = 0; i < refPathSegs.length; i++)
        {
            let refPathSeg = refPathSegs[i];
            if(i == 0 && refPathSeg == 'refs')
                continue;
            let segExists = pivot.hasOwnProperty(refPathSeg);
            if(!segExists)
            {
                return undefined;
            }
            pivot = pivot[refPathSeg];
        }
        return pivot;
    }

    /**
     * Stores a object hash at the given ref path
     * @param {string} refPath
     * @param {string} objectHash
     */
    set_ref(refPath, objectHash)
    {
        let pivot = this.refs;
        let refPathSegs = refPath.split('/');
        if(!_.isString(objectHash) || !isInObjects(objectHash, this.objects))
        {
            throw new ReferenceError("Cannot create ref pointing to '"+objectHash+"' as it is not stored in objects")
        }
        for(let i = 0; i < refPathSegs.length; i++)
        {
            let refPathSeg = refPathSegs[i];
            if(i == 0 && refPathSeg == 'refs')
                continue;
            if(i == refPathSegs.length-1)
            {
                pivot[refPathSeg] = objectHash;
            } else if(!pivot.hasOwnProperty(refPathSeg))
            {
                pivot[refPathSeg] = {};
            }
            pivot = pivot[refPathSeg];
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
     * Returns the commit that the HEAD is currently pointing to.
     * @returns {Object|undefined}
     */
    get_head_commit()
    {
        return this.get_commit(this.get_head());
    }

    /**
     * Returns the commit hash that the HEAD is currently pointing to.
     * IF the HEAD is pointing points to a ref, that ref will be resolved too.
     * @return {string|undefined}
     */
    get_head()
    {
        let hash = getFromObjects(this.HEAD, this.objects);
        if(_.isUndefined(hash))
        {
            //Try to treat as ref
            let commitHash = this.get_ref(this.HEAD);
            if(!_.isUndefined(commitHash))
                return commitHash;
        } else {
            return this.HEAD;
        }
    }

    /**
     * Returns the referenced commit.
     * @param {string} reference - Can be either a objectHash or a ref.
     * @return {string|undefined}
     */
    get_commit(reference)
    {
        let commit = getFromObjects(reference, this.objects);
        if(_.isUndefined(commit))
        {
            //Try to treat as ref
            let commitHash = this.get_ref(reference);
            if(!_.isUndefined(commitHash))
                commit = getFromObjects(commitHash, this.objects);
        }
        return commit;
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
     * @return {Repository}
     */
    rm(path)
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
    remove(path)
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
                let objectHash = getObjectHash(content);
                if (!isInObjects(objectHash, this.objects)) {
                    setInObjects(objectHash, content, this.objects);
                }
                this.index[path] = objectHash;
            }
        }
        return this;
    }

    /**
     * This is used like git-write-tree but behaves differently:
     * As jsodvcs does not have a concept of directories (or files),
     * does not really create a tree but a list from its index.
     */
    write_index()
    {
        let that = this;
        let indexKeys = Object.keys(this.index);
        indexKeys.sort();
        let indexObject = {};
        indexKeys.forEach(function(indexKey){
            indexObject[indexKey] = that.index[indexKey];
        });
        return indexObject;
    }

    /**
     * Stores the current contents of the index in a new commit along with a log message from the user describing the changes.
     * The commit will be based off the current HEAD.
     * @param {string} [message]
     * @param {Object} [options]
     * @param {string} [options.committer] - The committer of this commit. Defaults to the committer in commitDefaultOptions.
     * @param {string} [options.author]  - The author of this commit. Defaults to the author in commitDefaultOptions (=undefined).
     * @param {string} [options.date]  - The author of this commit. Defaults to Date.now().
     * @param {Object} [options.out]  - Outgoing container. Assign an object here, which will be filled with additional information
     * @param {string} [options.out.commitHash]  - Outgoing field where the created commit hash will be stored
     */
    commit(message, options)
    {
        if(arguments.length == 1 && !_.isString(message))
        {
            //noinspection JSValidateTypes
            options = message;
            //noinspection JSValidateTypes
            message = undefined;
        }
        options = _.extend({
            committer: this.commitDefaultOptions.committer,
            author: this.commitDefaultOptions.author,
            date: new Date(),
            out: {}
        }, options);

        ///Check parent
        let parentCommitHash = this.get_ref(this.HEAD);
        let parentCommit = this.get_head_commit();

        ///Create snapshot of index
        let tree = this.write_index();
        if(_.isUndefined(parentCommit) && _.keys(tree).length == 0)
        {
            return this; //Branch is blank (empty index & no parent)
        }
        let treeHash = getObjectHash(tree);
        if (!isInObjects(treeHash, this.objects)) {
            setInObjects(treeHash, tree, this.objects);
        }

        ///Check if there really were changes
        if(!_.isUndefined(parentCommit) && treeHash == parentCommit.tree)
        {
            return this; //Exit early, no changes to commit
        }

        ///Create commit object
        let commitObject = {
            tree: treeHash,
            parents: [parentCommitHash],
            author: options.author,
            committer: options.committer,
            date: options.date,
            message: message
        };
        if(_.isUndefined(commitObject.parent))
        {
            delete commitObject.parent;
        }
        if(_.isUndefined(commitObject.message))
        {
            delete commitObject.message;
        }
        if(_.isUndefined(commitObject.author))
        {
            delete commitObject.author;
        }
        if(_.isUndefined(commitObject.committer))
        {
            delete commitObject.committer;
        }

        ///Store the commit object
        let commitHash = getObjectHash(commitObject);
        if (!isInObjects(commitHash, this.objects)) {
            setInObjects(commitHash, commitObject, this.objects);
        }

        //Set the current branch/hed to the new commit
        this.set_ref(this.HEAD, commitHash);

        options.out.commitHash = commitHash;

        return this;
    }
}

/**
 * Export the class
 * @type {Repository}
 */
module.exports = Repository;