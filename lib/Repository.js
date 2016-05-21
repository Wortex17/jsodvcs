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
    ,jsod = require("jsod")
;

let
    ResetMode = require("./ResetMode"),
    ObjectStorage = require("./ObjectStorage"),
    RepositoryObjectType = require("./RepositoryObjectType")
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
 * @class
 * @memberOf jsodvcs
 */
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
        this.objects = new ObjectStorage({});

        this.commitDefaultOptions = {
            committer: undefined,
            author: undefined
        };

        /**
         * A container of deltas for paths that have an index-conflict.
         * The property key name is the path for which the delta was generated.
         * The property value contains the conflicting hashes and the content based delta, is jsod was used.
         * If a delta was generated, the overall list of content-based conflicts is stored as deltaConflicts
         * @type {Object}
         */
        this.mergeConflicts = {};


        //A replaceable auto resolver.
        //Called for every mergeConflict after all index-conflicts have been collected and optional deltas
        //have been generated.
        this.tryAutoResolveConflictCallback = Repository.defaultAutoConflictResolver;
    }

    /**
     * Computes the object hash for an object with specified type and the specified contents
     * and optionally writes it to the storage.
     * @param content
     * @param {Object} [options]
     * @param {boolean} [options.write = false] - Actually write the content into the object database.
     * @param {RepositoryObjectType} [options.type = 'blob'] - If provided, configures which flags should be set on the content in the database
     * @return {string}
     */
    hash_object(content, options)
    {
        options = _.extend({
            write: false
        }, options);
        if(!_.includes(RepositoryObjectType, options.type))
        {
            options.type = RepositoryObjectType.blob;
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
     * Recurively resolves given ref to the first encountered objectHash or the last encountered ref
     * @param {string} ref
     * @param {Object} [options]
     * @param {boolean} [options.refOnly = false] - Return the last encountered ref instead of first encountered objectHash
     * @return {string|undefined} - Returns undefined if a invalid or not-stored ref or objectHash is encountered
     */
    resolve_ref(ref, options)
    {
        if(_.isUndefined(ref))
            return undefined;

        options = _.extend({
            refOnly: false
        }, options);
        let pivotRef = ref;
        if(this.objects.contain(ref))
            return (options.refOnly) ? undefined : ref; //Already an object hash (direct ref)

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
                return this.resolve_ref(this.HEAD, options);
            case "FETCH_HEAD":
                if(_.isUndefined(this.FETCH_HEAD))
                    return undefined;
                return this.resolve_ref(this.FETCH_HEAD, options);
            case "MERGE_HEAD":
                if(_.isUndefined(this.MERGE_HEAD))
                    return undefined;
                return this.resolve_ref(this.MERGE_HEAD, options);
            default:
                let nextRef = this.get_ref(pivotRef);
                if(_.isUndefined(nextRef))
                    return undefined; //pivotRef isn't a valid ref, so return undefined
                let nextResolve = this.resolve_ref(nextRef, options);
                return (options.refOnly && _.isUndefined(nextResolve)) ?
                    pivotRef //Resolving did not lead to a valid ref, so return the pivot
                    : nextResolve;
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
        return this.get_commit_object(this.get_head());
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
        return this.objects.get(blob_ish, {flags: [RepositoryObjectType.blob]});
    }


    /**
     * Returns the referenced commit.
     * @param {string} commit_ish - Can be either an objectHash of a commit or a ref leading to a commit.
     * @return {string|undefined}
     */
    get_commit_object(commit_ish)
    {
        let result = this.objects.get(commit_ish, {flags: [RepositoryObjectType.commit]});
        if(_.isUndefined(result))
            result = this.objects.get(this.resolve_ref(commit_ish), {flags: [RepositoryObjectType.commit]});
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
            let isTree = isFlags && flags.indexOf(RepositoryObjectType.tree) >= 0;
            let isCommit = isFlags && flags.indexOf(RepositoryObjectType.commit) >= 0;

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
    get workingCopy()
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
     * Returns if the repo is in a detached HEAD state
     * @returns {boolean}
     */
    get isDetachedHEAD()
    {
        return _.isUndefined(this.get_ref(this.HEAD))
    }

    /**
     * Returns if the repo is currently merging
     * @returns {boolean}
     */
    get isMerging()
    {
        return !_.isUndefined(this.MERGE_HEAD)
    }

    /**
     * Returns if the repo is currently merging and has merge conflicts
     * @returns {boolean}
     */
    get hasMergeConflicts()
    {
        return this.isMerging && _.size(this.mergeConflicts) > 0
    }

    /**
     * Returns if the index is clean (no changes)
     * @return {boolean}
     */
    get isClean()
    {
        return this.status().length == 0;
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
            'ignore_removal': false
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
     * Moves the content at given path to another path in the index.
     * Essentially renames the paths.
     * @throws ReferenceError - If destinationPath already exists.
     * Is a no-op if there is nothing stored at sourcePath.
     * @param {string} sourcePath
     * @param {string} destinationPath
     * @param {Object} [options]
     * @param {boolean} [options.quiet = false] - If true, will not throw an exception but revert to no-op.
     * @param {boolean} [options.force = false] - If true, will not overwrite destinationPath even if it was set before.
     * @param {boolean} [options.swap = false] - If true, will swap destination and source contents, if both exist.
     * @return {Repository}
     */
    mv(sourcePath, destinationPath, options)
    {
        options = _.extend({}, options);
        let sourceHash = this.get_indexed_hash(sourcePath);
        let destinationHash = this.get_indexed_hash(destinationPath);
        if(!_.isUndefined(sourceHash))
        {
            let shouldMove = false;
            let hasDestinationHash = !_.isUndefined(destinationHash);
            if(hasDestinationHash)
            {
                if(!options.quiet && !options.force && !options.swap)
                {
                    throw new ReferenceError("Cannot mv() \""+sourcePath+"\" to \""+destinationPath+"\". Destination already exists.");
                } else if(options.force || options.swap)
                {
                    shouldMove = true;
                }
            } else {
                shouldMove = true;
            }
            if(shouldMove)
            {
                this.index[destinationPath] = sourceHash;
                if(options.swap && hasDestinationHash)
                {
                    this.index[sourcePath] = destinationHash;
                } else {
                    delete this.index[sourcePath];
                }
            }
        }
        return this;
    }
    /**
     * Alias for Repository#mv()
     * @see mv
     */
    move(sourcePath, destinationPath)
    {
        return this.mv.apply(this, arguments)
    }
    /**
     * Alias for Repository#mv()
     * @see mv
     */
    rename(sourcePath, destinationPath)
    {
        return this.mv.apply(this, arguments)
    }

    /**
     * Resets the current HEAD and index to a specified commit
     * @param {String} [commit_ish="HEAD"]
     * @param {Object} [options]
     * @param {jsodvcs.ResetMode} [options.mode=ResetMode.hard] - When given commit_ish, defines the way index is reset to the commit.
     */
    reset(commit_ish, options)
    {
        commit_ish = _.isString(commit_ish) ? commit_ish : "HEAD";
        options = _.extend({
            mode: ResetMode.hard
        }, options);

        let ref = this.resolve_ref(commit_ish, {refOnly:true});
        if(_.isUndefined(ref))
        {
            //Directly pointed to a commit
            ref = commit_ish;
        }
        let commit = this.get_commit_object(ref);
        if(!_.isUndefined(commit))
        {
            //Set head to given ref. This may cause it to become DETACHED if it pointed directly to a commit hash
            this.HEAD = ref;

            switch(options.mode)
            {
                case ResetMode.soft:
                    break;
                case ResetMode.hard:
                default:
                    this.reset_index(commit.tree);
                    break;
            }
        }
        return this;
    }
    /**
     * Resets the current index to a specified state.
     * Solely updates the index without updating the HEAD
     * @param {String} [tree_ish="HEAD"]
     * @param {Object} [options]
     * @param {Array.<String>} [options.paths] - List of paths that should be reset
     */
    reset_index(tree_ish, options)
    {
        tree_ish = _.isString(tree_ish) ? tree_ish : "HEAD";
        options = _.extend({}, options);

        let tree = this.get_tree_object(tree_ish);
        if(!_.isUndefined(tree))
        {
            let resetAll = !_.isArray(options.paths);

            //Set index to reflect tree (easy, as our trees are the same as indexes)
            let targetIndex = tree;
            let unionKeys = _.union(_.keys(this.index), _.keys(targetIndex));
            let that = this;
            _.forEach(unionKeys, function(path){
                if(resetAll || options.paths.indexOf(path) >= 0)
                {
                    if(targetIndex.hasOwnProperty(path))
                    {
                        that.index[path] = targetIndex[path];
                    } else {
                        delete that.index[path];
                    }
                }
            });
        }
        return this;
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
     * Returns paths that have differences in content between the index and current HEAD commit.
     */
    status()
    {
        return this.diff('HEAD') || _.keys(this.index);
    }

    /**
     * Show changes present in the current index (or tree_ishB) relative to tree_ishA.
     * @param {string} tree_ishA - The tree, identified by treeHash, commitHash or ref, that should be compared relative to.
     * @param {string|undefined} [tree_ishB=undefined] - The other tree that should be compared. If undefined, the current index is used.
     * @param {Object} [options]
     * @param {Array.<string>} [options.paths] - Only diff the given paths
     *
     * @return {Array.<string>|undefined} - Returns undefined if tree_ishA or tree_ishB did not resolve.
     */
    diff(tree_ishA, tree_ishB, options)
    {
        let treeA = this.get_tree_object(tree_ishA);
        //We can use index directly, as we have flat trees
        let treeB = _.isUndefined(tree_ishB) ?
            this.index  //We can use index directly, as we have flat trees
            : this.get_tree_object(tree_ishB);
        return this._diff(treeA, treeB, options)
    }

    /**
     * @private
     * @param {Object} treeA
     * @param {Object} treeB
     * @param {Object} [options]
     * @param {Array.<string>} [options.paths]
     */
    _diff(treeA, treeB, options)
    {
        if(_.isUndefined(treeA) || _.isUndefined(treeB))
            return undefined;

        options = _.extend({
        }, options);

        let allPaths = _.isArray(options.paths) ? options.paths : _.union(_.keys(treeA), _.keys(treeB));
        let changedPaths = [];
        _.forEach(allPaths, function(path){
            if(treeA[path] !== treeB[path])
            {
                changedPaths.push(path);
            }
        });
        return changedPaths;
    }

    /**
     * Returns an object that records modifications on base of treeX, made in treeA and/or in treeB.
     * If treeA and treeB made different modifications at the same path, an array with both these modifications is
     * stored at that path.
     * @param treeX
     * @param treeA
     * @param treeB
     * @return {Object}
     * @private
     */
    _diff3(treeX, treeA, treeB)
    {
        let diffA = this._diff(treeX, treeA);
        let diffB = this._diff(treeX, treeB);
        let unidiff = {};
        _.forEach(diffA, function(path){
            unidiff[path] = treeA[path];
        });
        _.forEach(diffB, function(path){
            let modificationA = unidiff[path];
            let modificationB = treeB[path];
            unidiff[path] =
                (_.isUndefined(modificationA) || modificationA == modificationB)
                    ? modificationB
                    : [modificationA, modificationB]
            ;
        });

        return unidiff;
    }

    /**
     * Stores the current contents of the index in a new commit along with a log message from the user describing the changes.
     * The commit will be based off the current HEAD.
     * @param {string} [message]
     * @param {Object} [options]
     * @param {string} [options.committer] - The committer of this commit. Defaults to the committer in commitDefaultOptions.
     * @param {string} [options.author]  - The author of this commit. Defaults to the author in commitDefaultOptions (=undefined).
     * @param {string} [options.date]  - The author of this commit. Defaults to Date.now().
     * @param {string} [options.ignoreConflicts = false]  - Ignore if the repository has merge conflicts and commit away
     * @param {Object} [options.out] - Outgoing container. Assign an object here, which will be filled with additional information
     * @param {Object} [options.out.commit]  - Outgoing field where the created commitObject will be stored
     * @param {string} [options.out.commitHash]  - Outgoing field where the created commit hash will be stored
     * @param {string} [options.out.didCommit]  - Outgoing field where it is stored if a new commit was created
     *
     * @throws {Error} When trying to commit while there are merge conflicts.
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
            ignoreConflicts: false,
            out: {}
        }, options);

        if(!options.ignoreConflicts && this.hasMergeConflicts)
        {
            throw new Error("Cannot commit on repository, while having merge conflicts");
        }

        ///Check parent
        let parentCommitHash = this.resolve_ref(this.HEAD);
        let parentCommit = this.get_head_commit();

        let mergeParentHash = this.resolve_ref(this.MERGE_HEAD);
        let mergeParent = this.get_commit_object(mergeParentHash);

        ///Create snapshot of index
        let tree = this.get_index();
        if(_.isUndefined(parentCommit) && _.keys(tree).length == 0)
        {
            options.out.didCommit = false;
            return this; //Branch is blank (empty index & no parent)
        }
        let treeHash = this.hash_object(tree, {write:true, type:RepositoryObjectType.tree});

        ///Check if there really were changes
        if(!_.isUndefined(parentCommit) && treeHash == parentCommit.tree && _.isUndefined(mergeParent))
        {
            options.out.commit = parentCommit;
            options.out.commitHash = parentCommitHash;
            options.out.didCommit = false;
            return this; //Exit early, no changes to commit
        }

        ///Create commit object
        let commitObject = {
            tree: treeHash,
            parents: [],
            author: options.author,
            committer: options.committer,
            date: options.date,
            message: message
        };
        if(!_.isUndefined(parentCommitHash))
        {
            commitObject.parents.push(parentCommitHash);
            if(!_.isUndefined(mergeParent))
            {
                commitObject.parents.push(mergeParentHash);
            }
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
        this.cancel_merge();

        options.out.didCommit = true;
        options.out.commit = commitObject;
        options.out.commitHash = commitHash;

        return this;
    }

    /**
     * List all local branches and the commitHashes they are pointing to.
     * @return {Object.<string, string>}
     */
    list_branches()
    {
        let that = this;
        let branches = {};
        _.forIn(this.refs.heads, function(pointer, name){
            branches[name] = that.resolve_ref(pointer);
        });
        return branches;
    }

    /**
     * Returns the current working ranch.
     * @return {string|undefined}
     */
    get currentBranch()
    {
        let that = this;
        let result = undefined;
        _.forIn(this.refs.heads, function(pointer, name){
            if('refs/heads/'+name === that.HEAD)
            {
                result = name;
                return false;
            }
        });
        return result;
    }

    /**
     * Create a new branch pointing at the same commit as HEAD.
     * @throws {Error} If HEAD is not pointing to a commit or branch
     * @throws {Error} If given name is not a valid branch name
     * @throws {Error} If a branch with the given name already exists
     * @param {string} name
     * @return {Repository}
     */
    branch(name)
    {
        let headCommit = this.get_head_commit();
        if(_.isUndefined(headCommit))
        {
            throw new Error("Cannot create new branch; HEAD not pointing to a valid commit object");
        }
        name = Repository.treatAsBranchName(name);
        if(!isRef(name))
        {
            throw new Error("Cannot create new branch with invalid name \"" + name + "\"");
        }
        if(!_.isUndefined(this.get_ref(name)))
        {
            throw new Error("Cannot create new branch; A branch with name \"" + name + "\" already exists");
        }

        this.set_ref(name, this.get_head());

        return this;
    }

    /**
     * Updates files in the working tree to match the version in the index or the specified branch.
     * If a commit_ish is given instead of a branch, repo is in detached HEAD state.
     * If a tree_ish is given instead of a branch, HEAD and branch will not change, and this degrades to a reset_index call.
     * @param {string} ref - Commit_ish, tree_ish or name of the branch to check out.
     * @param {Object} [options]
     * @param {Array.<String>} [options.paths] - If given, only checks out given paths.
     * @return {Repository}
     */
    checkout(ref, options)
    {
        options = _.extend({}, options);
        let branch = undefined;
        let flags = this.objects.getFlags(ref);
        let isObject_ish = !_.isUndefined(flags);
        let isCommit_ish = isObject_ish && flags.indexOf(RepositoryObjectType.commit) >= 0;
        let isTree_ish = isObject_ish && flags.indexOf(RepositoryObjectType.tree) >= 0;
        let validTarget = (isObject_ish && (isCommit_ish || isTree_ish));

        if(!validTarget) {
            //Treat ref as branch ref
            branch = Repository.treatAsBranchName(ref);
            ref = this.get_ref(branch);
            flags = this.objects.getFlags(ref);
            isObject_ish = !_.isUndefined(flags);
            isCommit_ish = isObject_ish && flags.indexOf(RepositoryObjectType.commit) >= 0;
            isTree_ish = isObject_ish && flags.indexOf(RepositoryObjectType.tree) >= 0;
            validTarget = (isObject_ish && isCommit_ish);
        }

        if(!validTarget)
        {
            throw new Error("Cannot checkout \""+ref+"\"; Not a valid target (branch, commit or tree)");
        }

        if(!_.isUndefined(branch) && branch === this.HEAD)
        {
            ///Already on branch
            return this;
        }

        let resetOptions = {};
        if(_.isArray(options.paths))
        {
            resetOptions.paths = options.paths;
        }

        if(!_.isUndefined(branch))
        {
            this.HEAD = branch;
        } else if(isCommit_ish)
        {
            this.HEAD = ref;
        }
        //Cancel the ongoing merge
        this.cancel_merge();
        this.reset_index(ref, resetOptions);


        return this;
    }

    /**
     * Returns the commitHash of the commit that is the most recent common ancestor of two commits
     * @param {string} commitHashA
     * @param {string} commitHashB
     * @return {string|undefined} the commitHash that is the lca or undefined dif there is no lca.
     */
    get_lca(commitHashA, commitHashB)
    {
        if(_.isUndefined(commitHashB) || _.isUndefined(commitHashA))
            return undefined;
        if(commitHashA == commitHashB)
            return commitHashA;

        let that = this;
        //Each commit node gets expanded, after which the other node gets expanded.
        //This equals the parallel walking down a tree, only with a single array.
        let visitQueue = [commitHashA, commitHashB];
        visitQueue.sort();
        for(let visitIndex = 0; visitIndex < visitQueue.length; visitIndex++)
        {
            let currentCommit = that.get_commit_object(visitQueue[visitIndex]);
            if(!_.isUndefined(currentCommit) && _.isArray(currentCommit.parents))
            {
                for(let p = 0; p < currentCommit.parents.length; p++)
                {
                    let parentHash = currentCommit.parents[p];
                    if(!_.isUndefined(parentHash))
                    {
                        if(visitQueue.indexOf(parentHash) >= 0)
                        {
                            return parentHash; //We found our first, and therefore most recent, match.
                        }
                        visitQueue.push(parentHash);
                    }
                }
                visitQueue.push();
            }
        }
        return undefined;
    }

    /**
     * Incorporates changes from the given commit and its predecessors into the current branch.
     * Use manually to merge changes from one branch into another.
     * Used by Repository#pull to incorporate changes from another repository.
     * Note that this will NOT automatically commit merges. Check Repository#isMerging after this to see if
     * the merge is still open and needs to be resolved. Once resolved, or if the merge was already closed,
     * you may commit.
     *
     * When the divergent histories of the commits modify the same content differently, an index-conflict is encountered.
     * In this case, the contentHash of the current state (commit or branch) will be stored in the index.
     * An entry will be added to the Repository#conflicts collection, path as key name and an array of the two different
     * hashes as value.
     * Then, if jsod is configured, a content-based diff3 is done. The resulting delta is stored at the third array
     * index of the conflicts entry.
     *
     * @param commit_ish
     * @param {Object} [options]
     * @param {Object} [options.indexOnly = false] - If true, do not generate content conflicts (only index conflicts)
     * @param {Object} [options.tryAutoResolve = true] - If false, do not try to auto resolve index conflicts
     * @return {Repository}
     */
    merge(commit_ish, options)
    {
        let that = this;
        options = _.extend({
            indexOnly: false,
            tryAutoResolve: true
        }, options);

        if(this.isMerging)
            throw new Error("Cannot merge " + commit_ish + " as the repository is currently merging");

        if(this.isDetachedHEAD)
            throw new Error("Cannot merge " + commit_ish + " as the repository HEAD is detached");

        let mine = this.get_head();
        let mineCommit = this.get_commit_object(mine);
        let their = this.resolve_ref(commit_ish);
        let theirCommit = this.get_commit_object(their);

        if(_.isUndefined(theirCommit))
            throw new Error("Cannot merge " + commit_ish + " as it is no valid commit");

        let lca = this.get_lca(mine, their);
        if(lca == their)
        {
            return this; //Already up-to-date or ahead
        } else if(lca == mine)
        {
            //Fast-forward to their
            this.set_ref(this.resolve_ref(this.HEAD, {refOnly:true}), their);
        } else {
            //Start the real merge
            this.MERGE_HEAD = their;

            //Get the lcaTree
            let lcaCommit = this.get_commit_object(lca);
            let lcaTree = _.isUndefined(lcaCommit) ? {} : this.get_tree_object(lcaCommit.tree);
            let mineTree = this.get_tree_object(mineCommit.tree);
            let theirTree = this.get_tree_object(theirCommit.tree);

            //Now, check the two diffs. If the same paths have been modified differently,
            //we have an index conflict (which we may resolve at data-diff level)
            let uniDiff = this._diff3(lcaTree, mineTree, theirTree);

            _.forIn(uniDiff, function(contentHash, path){
                if(_.isArray(contentHash))
                {
                    //We leave the contentHash in the index as it is (prefer 'use mine' style)
                    //But record a mergeConflict
                    that.mergeConflicts[path] = {
                        lca: lcaTree[path],         //As by now, this is an index-conflict. So we record the lca hash...
                        modifications: contentHash  //...and the two conflicting modification hashes.
                    };
                } else {
                    that.index[path] = contentHash;
                }
            });

            if(!options.indexOnly)
            {
                _.forIn(that.mergeConflicts, function(mergeConflict){
                    mergeConflict.contentDeltaConflictNodes = [];
                    mergeConflict.contentDelta = jsod.diff3(
                        that.get_blob_object(mergeConflict.modifications[0]),
                        that.get_blob_object(mergeConflict.lca),
                        that.get_blob_object(mergeConflict.modifications[1]),
                        null, //diffConfig
                        null, //mergeConfig
                        mergeConflict.contentDeltaConflictNodes
                    );
                });
            }


            //Try to auto-resolve conflicts
            if(options.tryAutoResolve)
            {
                _.forIn(that.mergeConflicts, function(mergeConflict, path){
                    that.tryAutoResolveConflictCallback.call(that, path, mergeConflict);
                });
            }

            //Everything possible was auto-resolved! Different than git, we will NOT auto-commit if there are no
            // conflicts left.
            //Partial reason is the modification of the commit configuration and letting the user add custom
            //changes to the commit.
        }


        return this;
    }

    /**
     * If a mergeConflict is registered for the specified path,
     * resolve it using the given content as value.
     * @param {string} path
     * @param {*} resolvedContent
     */
    resolve_merge_conflict(path, resolvedContent)
    {
        if(this.mergeConflicts.hasOwnProperty(path))
        {
            this.add(path, resolvedContent);
            delete this.mergeConflicts[path];
        }
        return this;
    }

    /**
     * Removes all mergeConflicts and MERGE_HEAD, but leaves index as-is.
     */
    cancel_merge()
    {
        //Remove the MERGE_HEAD
        delete this.MERGE_HEAD;
        //Clear the merge conflicts collection
        for (var path in this.mergeConflicts)
            delete this.mergeConflicts[path];
    }

}
Repository.isRef = isRef;
/**
 * Will treat the given branch as branch ref, correcting the ref name if need be.
 * @param branch
 * @return {string}
 */
Repository.treatAsBranchName = function(branch){
    branch = _.trim(branch, '/');
    if(!branch.startsWith('refs/heads/'))
    {
        branch = 'refs/heads/' + branch;
    }
    return branch;
};
Repository.defaultAutoConflictResolver = function(path, mergeConflict){
    if(!_.isUndefined(mergeConflict.contentDelta))
    {
        if( _.size(mergeConflict.contentDeltaConflictNodes) === 0)
        {
            //There are no content-based conflicts, so merge by content
            let merged = jsod.patch(this.get_blob_object(mergeConflict.lca), mergeConflict.contentDelta);
            this.resolve_merge_conflict(path, merged);
        }
    }
};

/**
 * Export the class
 * @type {Repository}
 */
module.exports = Repository;