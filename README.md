# jsodvcs <img src="https://cloud.githubusercontent.com/assets/170627/15592642/a1c9f4e4-23a5-11e6-9496-2ad09d0f3469.png" />
A git-like distributed version control system for javascript objects.

[![Build Status](https://travis-ci.org/Wortex17/jsodvcs.svg?branch=master)](https://travis-ci.org/Wortex17/jsodvcs)
[![Build status](https://ci.appveyor.com/api/projects/status/8gj83geai65xkf3c/branch/master?svg=true)](https://ci.appveyor.com/project/Wortex17/jsodvcs/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/Wortex17/jsodvcs/badge.svg?branch=master)](https://coveralls.io/github/Wortex17/jsodvcs?branch=master)  
[![NPM Version](https://img.shields.io/npm/v/jsodvcs.svg)](https://www.npmjs.com/package/jsodvcs)
[![NPM Dependencies](https://img.shields.io/david/Wortex17/jsodvcs.svg)](https://www.npmjs.com/package/jsodvcs)
[![NPM Dev Dependencies](https://img.shields.io/david/dev/Wortex17/jsodvcs.svg)](https://www.npmjs.com/package/jsodvcs)

Jsodvcs (**J**ava**S**cript **O**bject **D**istributed **V**ersion **C**ontrol **S**ystem)
is an in-memory version control system for javascript data types.
You store javascript objects, arrays, string etc. in a repository, commit these changes, create and merge branches
and clone, push and pull remote versions from this repository.
As it works completely in-memory in javascript, it does not depend on any filesystem or form of text-based serialization.  
Jsodvcs is powered by [jsod](https://www.npmjs.com/package/jsod) for content diffing and patching.

<sub>*(Some form of serialization is recommended, should you want to store or transmit
the repositories over the wire. Jsodvc tries to make this process as easy as possible for you)*</sub>

* [Usage](#usage)
  * [API](#api)
* [License](#License)


## Installation
To install the latest version available on npm:
```
npm install jsodvcs
```
To install the latest development (bleeding-edge) version:
```
npm install git+https://github.com/Wortex17/jsodvcs.git
```

## Usage
```
let jsodvcs = require('jsodvcs');

let repo = jsodvcs.init();
repo
    .add("foo/bar", 42)
    .add("mercator", "Jimmy")
    .add("alphabet", {a: 'A', b: 'b', c: 'C'})
    .commit("First commit")
    .branch("beta")
    .checkout("beta")
    .add("alphabet", {a: 'A', b: 'B', c: 'C', d: 'D'})
    .commit("First changes")
    .checkout("master")
    .merge("beta")
    .commit("Merged from beta")
;

console.log(repo.workingCopy);
// { alphabet: { a: 'A', b: 'B', c: 'C', d: 'D' },
//     'foo/bar': 42,
//     mercator: 'Jimmy' }

```
During this process, three commits have been made. Each stored the versions of the repository index safely away,
and no information was lost by merging.

### API
Even though git was the inspirational source for the whole API and feature set, jsodvcs is not an exact reimplementation of git.

* There is no concept of a file-system
* There is no concept of a watched working-copy
* Repositories store pure *contents* not *files*
* Each repository has its own distinct index. Two repositories cannot share an index.

This means that you can store anything from a string to a buffer without thinking twice about it.
Each repository stores an index. You can change an index by using the ```add``` command, which adds/sets content
at a specific path.
Getting the *working copy* of the repository, essentially creates a copy of the index and all object stored before.
If you ```add``` content e.g. ```repo.add("path", {n:44})```, the added content is not tracked for any changes.
To report changes to the repository, you will have to ```add``` it again with the changed content.

#### Namespace: jsovcs

The jsodvcs namespace is the root namespace of the module. It provides access to all needed types, though the
one most needed by users will be the repository.

##### Static Method: jsovcs.init()

Creates a new clean repository instance.

#### Class: Repository

The repository class for all repository instances.

##### new Repository()

Creates a new clean repository instance.

##### Static Method: Repository.clone(remote)

* ```remote``` \<Repository>

Clones the given remote repository, return a new separated instances with the same state.

##### Property: Repository.jsodConfig

\<Object>
* ```path``` \<string>
* ```content``` \<*> Default: ```undefined```
* ```options.ignore_removal``` \<boolean> Default: ```false```

Configurations passed to [jsod](https://www.npmjs.com/package/jsod).

##### Property: Repository.commitDefaultOptions

\<Object>
* ```committer``` \<string>
* ```author```  \<string>

Automatic authorship configuration for commits.

##### Method: Repository.add(path [, content [, options]])

* ```diff```
* ```merge```

Adds the passed ```content``` to the index at ```path```. If no ```content``` was passed or it was undefined,
removes the index entry at ```path```, unless ```options.ignore_removal``` is true.

##### Method: Repository.rm(path)
*Aliases:*
- Repository.remove(srcPath, dstPath)

* ```path``` \<string>

Removes the index entry at ```path```.

##### Method: Repository.mv(srcPath, dstPath, [options])
*Aliases:*
- Repository.move(srcPath, dstPath)
- Repository.rename(srcPath, dstPath)

* ```srcPath``` \<string>
* ```dstPath``` \<string>
* ```options.quiet``` \<boolean> Default: ```false```
* ```options.force``` \<boolean> Default: ```false```
* ```options.swap``` \<boolean> Default: ```false```

Moves the content at ```srcPath``` to ```dstPath``` in the index.
Essentially renames the index entry. This will throw a <ReferenceError> if there already is some content
at the ```dstPath```, unless ```options.quiet``` is set, in which case the command reverts to a no-op.
If ```options.force``` is set, it will overwrite the destination instead.

##### Method: Repository.get_content(path)

* ```path``` \<string>

Returns a working copy (clone) of the content at the specified ```path``` from the index.

##### Property: Repository.HEAD

\<string>

The branch ref or commit hash the repository head is currently pointing at.

##### Method: Repository.status()

Returns paths that have differences in content between the index and current HEAD.

##### Method: Repository.diff(tree_ishA [, tree_ishB [, options]])

* ```tree_ishA``` \<string>
* ```tree_ishB``` \<string>
* ```options.paths``` \<string[]>

Show changes present in the current index relative to ```tree_ishA```.
If ```tree_ishB``` is passed, show changes of it relative to ```tree_ishA```.
If ```options.paths``` is set, filters the result to set paths.

##### Method: Repository.commit([message [, options]])

* ```message``` \<string> Default: ```''```
* ```options.committer``` \<string> Default: Repository.commitDefaultOptions.committer
* ```options.author``` \<string> Default: Repository.commitDefaultOptions.author
* ```options.date``` \<Date> Default: ```Date.now()```
* ```options.ignoreConflicts``` \<boolean> Default: ```false```
* ```options.out``` \<Object>

Stores the current contents of the index in a new commit along with a message from the user describing the changes.
The commit will be based off the current *HEAD*.
If a merge is currently in progress, it check it there are conflicts left. This command will throw an <Error> hen
trying to commit with unresolved conflicts, unless ```options.ignoreConflicts``` is set.
The current *HEAD* and *MERGE_HEAD* are set as parents of the commit the merge state and unresolved conflicts are cleared.

If out is given, it is filled with information about the commit process:
* ```options.out.commit``` \<Object> The created commit object
* ```options.out.commitHash``` \<string> The commit hash
* ```options.out.didCommit``` \<boolean> Flag showing if the commit was completed successfully.

##### Method: Repository.branch(name)

* ```name``` \<string>

Create a new branch pointing at the same commit as HEAD.
Note that you have to ```checkout()``` to actually switch to the created branch.

##### Method: Repository.checkout(ref [, options])

* ```ref``` \<string>
* ```options.paths``` \<string[]>

Update files in the working tree to match the version in the index or the specified branch.
If a ```commit_ish``` is given instead of a branch, repo is in detached HEAD state.
If a ```tree_ish``` is given instead of a branch, HEAD and branch will not change,
and this degrades to a reset_index call.
If ```options.paths``` is set, only checks out specified paths.

##### Method: Repository.merge(commit_ish [, options])

* ```ref``` \<string>
* ```options.indexOnly``` \<boolean> Default: ```false```
* ```options.tryAutoResolve``` \<boolean> Default: ```true```

Incorporate changes from the specified ```commit_ish``` and its predecessors into the current branch.
Use manually to merge changes from a branch into the current HEAD.
Note that this will **NOT** automatically commit merges. Check ```isMerging``` after this to see if
the merge is still open and needs to be resolved. Once resolved, or if the merge was already auto-resolved, you may commit.

When the divergent histories of the commits modify the same content differently, an index-conflict is encountered.
In this case, the contentHash of the current state (commit or branch) will be stored in the index.
An entry will be added to the ```Repository.mergeConflicts``` collection, path as key name and containing
the conflicting hashes as well as the lca hash.
If jsod is configured, a content-based diff3 is done. The resulting delta is stored at the conflict entry.

If ```options.indexOnly``` is set, only index conflicts (no content-conflicts) will be generated. This implies that
no automatic merge resolving can happen (```options.tryAutoResolve=false```)

##### Property: Repository.tryAutoResolveConflictCallback

\<function(path, mergeConflict)>

The callback that is used while merging to resolve conflicts automatically.
Users can replace this with their custom auto resolving methods. The default resolver is available a
Repository.defaultAutoConflictResolver.

##### Method: Repository.resolve_merge_conflict(path, resolvedContent)

* ```path``` \<string>
* ```resolvedContent``` \<*>

If a conflict ```Repository.mergeConflicts``` is registered for the specified ```path```,
resolve it using the passed ```resolvedContent```.

##### Method: Repository.cancel_merge()

Removes all ```Repository.mergeConflicts``` and ```Repository.MERGE_HEAD```, but leaves index as-is.

##### Method: Repository.pull(remote [, options])

* ```remote``` \<Repository>
* ```options.name``` \<string> Default: ```"origin"```
* ```options.branch``` \<string>

Incorporates changes from a remote repository into the current branch
Basically a shorthand for ```Repository.fetch()``` followed by ```merge(FETCH_HEAD)```
Targets the remote branch that matches/is tracked the local branch, if not overridden by the ```options.branch```.

##### Method: Repository.push(remote [, options])

* ```remote``` \<Repository>
* ```options.out``` \<Object>

Update a remote repository with local history.
Pushes all changes of local branches, that are ahead of changes on matching remote branches to the remote repository.
Beware that this command will interact with the remote repository, so it my change its objects, refs and index.
To ensure that local changes are ahead, it is advised to pull & merging the branches before pushing.

If out is given, it is filled with information about the push process:
* ```options.out.didRemoteCheckout``` \<string[]>
Was the remote checkedOut in the process? This happens when the current branch of the remote is being pushed to.
* ```options.out.pushedBranches``` \<string[]>
List of branches that have been pushed successfully.
* ```options.out.upToDateBranches``` \<string[]>
List of branches that have been ignored because the remote already was up to date.
* ```options.out.rejectedBranches``` \<string[]>
List of branches that have been rejected (e.g. because the local branch was behind the remote one)

##### Method: Repository.clone()

* ```remote``` \<Repository>

Clone the repository, return a new separated instances with the same state.


## Resources
<img src="https://cloud.githubusercontent.com/assets/170627/15592642/a1c9f4e4-23a5-11e6-9496-2ad09d0f3469.png" />
<img src="https://cloud.githubusercontent.com/assets/170627/15592645/a1cf4304-23a5-11e6-8c3a-32f3c65fb4a4.png" />
<img src="https://cloud.githubusercontent.com/assets/170627/15592644/a1cd1f52-23a5-11e6-9f83-67fe8a3048e3.png" />



## License
Jsodvcs is copyright © 2016-present Patrick Michael Hopf and all
[contributors](https://github.com/Wortex17/jsodvcs/graphs/contributors).  
Jsodvcs is free, licensed under The MIT License (MIT).  
See the file LICENSE in this distribution for more details.
