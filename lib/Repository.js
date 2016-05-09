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

/**
 * Simple object storage with helper methods
 */
class RepositoryObjectStorage
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
        return _.keys(this.storage).length;
    }
    get length()
    {
        return this.count;
    }

    toJSON()
    {
        return this.storage;
    }
}

/**
 * @enum Repository.ObjectType
 */
let RepositoryObjectType = {
    blob: 'b',
    tree: 't',
    commit: 'm'
};

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
        this.objects = new RepositoryObjectStorage({});

        this.commitDefaultOptions = {
            committer: undefined,
            author: undefined
        };
    }

    /**
     * Computes the object hash for an object with specified type and the specified contents
     * and optionally writes it to the storage.
     * @param content
     * @param {Object} [options]
     * @param {boolean} [options.write = false] - Actually write the content into the object database.
     * @param {Repository.ObjectType} [options.type = 'blob'] - If provided, configures which flags should be set on the content in the database
     * @return {string}
     */
    hash_object(content, options)
    {
        options = _.extend({
            write: false
        }, options);
        if(!_.includes(Repository.ObjectType, options.type))
        {
            options.type = Repository.ObjectType.blob;
        }

        let hash = getObjectHash(content);
        if(options.write === true)
        {
            let writeOptions = { setFlags: [options.type] };

            this.objects.set(hash, content, writeOptions);
        }
        return hash;
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

        if(this.objects.contain(ref))
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
        if(!_.isString(objectHash) || !this.objects.contain(objectHash))
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
        let object = this.objects.get(object_ish);
        if(_.isUndefined(object))
        {
            //Try to treat as ref
            let objectHash = this.resolve_ref(object_ish);
            if(!_.isUndefined(objectHash))
                object = this.objects.get(objectHash);
        }
        return object;
    }

    /**
     * Returns the referenced blob.
     * @param {string} blob_ish - An objectHash of a blob.
     * @return {string|undefined}
     */
    get_blob_object(blob_ish)
    {
        return this.objects.get(blob_ish, {flags: [Repository.ObjectType.blob]});
    }


    /**
     * Returns the referenced commit.
     * @param {string} commit_ish - Can be either an objectHash of a commit or a ref leading to a commit.
     * @return {string|undefined}
     */
    get_commit_object(commit_ish)
    {
        let result = this.objects.get(commit_ish, {flags: [Repository.ObjectType.commit]});
        if(_.isUndefined(result))
            result = this.objects.get(this.resolve_ref(commit_ish), {flags: [Repository.ObjectType.commit]});
        return result;
    }

    /**
     * Returns the referenced tree.
     * @param {string} tree_ish - Can be either an objectHash of a tree(index), of a commit or a ref leading to a tree or commit.
     * @return {string|undefined}
     */
    get_tree_object(tree_ish)
    {
        let getTreeOrCommitTree = (function(tree_ish)
        {
            let flags = this.objects.getFlags(tree_ish);
            let directFetch = this.objects.get(tree_ish);
            let isFlags = _.isArray(flags);
            let isTree = isFlags && flags.indexOf(Repository.ObjectType.tree) >= 0;
            let isCommit = isFlags && flags.indexOf(Repository.ObjectType.commit) >= 0;

            if(isTree)
                return directFetch;
            else if (isCommit && !_.isUndefined(directFetch.tree))
                return this.objects.get(directFetch.tree);
        }).bind(this);

        let result = getTreeOrCommitTree(tree_ish);
        if(_.isUndefined(result))
            result = getTreeOrCommitTree(this.resolve_ref(tree_ish));
        return result;
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
            return this.get_blob_object(objectHash);
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
                this.index[path] = this.hash_object(content, {write:true});
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
     * @param {Object} [options.out.commit]  - Outgoing field where the created commitObject will be stored
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
        let treeHash = this.hash_object(tree, {write:true, type:RepositoryObjectType.tree});

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
        let commitHash = this.hash_object(commitObject, {write:true, type:RepositoryObjectType.commit});

        //Set the current branch/hed to the new commit
        this.set_ref(this.HEAD, commitHash);

        options.out.commit = commitObject;
        options.out.commitHash = commitHash;

        return this;
    }
}
Repository.isRef = isRef;
Repository.ObjectType = RepositoryObjectType;

/**
 * Export the class
 * @type {Repository}
 */
module.exports = Repository;