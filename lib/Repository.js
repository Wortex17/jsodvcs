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


/**
 * Returns true if ref is a valid ref name
 */
function isRef(ref){
    return (_.isString(ref) && (
        !_.isEmpty(ref.match(/^refs\/heads\/[A-Za-z-]+([A-Za-z-0-9\/]?[A-Za-z-])*$/))
        || !_.isEmpty(ref.match(/^refs\/remotes\/[A-Za-z-]+\/[A-Za-z-]+([A-Za-z-0-9\/]?[A-Za-z-])*$/))
        || ref === "HEAD"
        || ref === "FETCH_HEAD"
        || ref === "MERGE_HEAD"
    ));
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
     * Recurively resolves given ref to the first found objectHash
     * @param ref
     * @return {string|undefined} - Returns undefined if a invalid or not-stored ref or objectHash is encountered
     */
    resolve_ref(ref)
    {
        if(_.isUndefined(ref))
            return undefined;

        let mayBeInvalid = false;
        let pivotRef = ref;

        if(isInObjects(ref, this.objects))
            return ref; //Already an object hash (direct ref)

        if(!isRef(pivotRef))
        {
            //Possibly a unqualified local name (like "master"), try again
            pivotRef = "refs/heads/"+ref;
            if(!isRef(pivotRef))
            {
                return undefined;
            }
        }
        switch(pivotRef)
        {
            case "HEAD":
                if(_.isUndefined(this.HEAD))
                    return undefined;
                return this.resolve_ref(this.HEAD);
            case "FETCH_HEAD":
                if(_.isUndefined(this.FETCH_HEAD))
                    return undefined;
                return this.resolve_ref(this.FETCH_HEAD);
            case "MERGE_HEAD":
                if(_.isUndefined(this.MERGE_HEAD))
                    return undefined;
                return this.resolve_ref(this.MERGE_HEAD);
            default:
                return this.resolve_ref(this.get_ref(pivotRef));
        }
    }

    /**
     * Returns the object hash the stored ref at given path is pointing at.
     * @param {string} ref
     * @return {string|undefined}
     */
    get_ref(ref)
    {
        if(!(isRef(ref) && ref.startsWith('refs/')))
            return undefined;
        let pivot = this.refs;
        let refPathSegs = ref.split('/');
        for(let i = 1; i < refPathSegs.length; i++)
        {
            let refPathSeg = refPathSegs[i];
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
     * @param {string} ref
     * @param {string} objectHash
     */
    set_ref(ref, objectHash)
    {
        let pivot = this.refs;
        if(!(isRef(ref) && ref.startsWith('refs/')))
        {
            throw new TypeError("Cannot set ref with name '"+ref+"'")
        }
        let refPathSegs = ref.split('/');
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
        return this.get_object(this.get_head());
    }

    /**
     * Returns the commit hash that the HEAD is currently pointing to.
     * If the HEAD is pointing points to a ref, that ref will be resolved too.
     * @return {string|undefined}
     */
    get_head()
    {
        return this.resolve_ref(this.HEAD);
    }

    /**
     * Returns the referenced object.
     * @param {string} object_ish - Can be either a objectHash of any object or a ref.
     * @return {string|undefined}
     */
    get_object(object_ish)
    {
        let object = getFromObjects(object_ish, this.objects);
        if(_.isUndefined(object))
        {
            //Try to treat as ref
            let objectHash = this.resolve_ref(object_ish);
            if(!_.isUndefined(objectHash))
                object = getFromObjects(objectHash, this.objects);
        }
        return object;
    }

    /**
     * Returns the referenced tree.
     * @param {string} tree_ish - Can be either a objectHash of a tree(index), of a commit or a ref.
     * @return {string|undefined}
     */
    get_tree(tree_ish)
    {
        let tree = getFromObjects(tree_ish, this.objects);

    }

    /**
     * Returns the objectHash stored in the index at the given path.
     * @param {string} path
     * @return {*|undefined} Returns undefined if the path is not in the index.
     */
    get_indexed_hash(path)
    {
        if(this.has_indexed(path))
        {
            return this.index[path];
        } else return undefined;
    }

    /**
     * Returns content at the given path from the index.
     * @param {string} path
     * @return {*|undefined} Returns undefined if the path is not in the index.
     */
    get_indexed_content(path)
    {
        let objectHash = this.get_indexed_hash(path);
        if(_.isUndefined(objectHash))
        {
            return undefined;
        } else {
            return getFromObjects(objectHash, this.objects);
        }
    }

    /**
     * Returns a working copy (clone) of the content at the given path from the index.
     * @param {string} path
     * @return {*|undefined} Returns undefined if the path is not in the index.
     */
    get_content(path)
    {
        return _.clone(this.get_indexed_content(path));
    }

    /**
     * Returns a working copy clone of the whole index.
     * @return {Object.<string, *>}
     */
    get working_copy()
    {
        let that = this;
        let indexCopy = {};
        let paths = Object.keys(this.index);
        paths.sort();
        paths.forEach(function(path){
            indexCopy[path] = that.get_content(path);
        });

        return indexCopy;
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
     * This is used in context like git-write-tree but behaves differently:
     * At first, it does not write anything (hence the name 'get').
     * Second, as jsodvcs does not have a concept of directories (or files),
     * does not really create a tree but a list from its index.
     */
    get_index()
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
        let tree = this.get_index();
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
Repository.isRef = isRef;

/**
 * Export the class
 * @type {Repository}
 */
module.exports = Repository;