# jsodvcs <img src=" data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxQ0QzQkI2Q0NGMjFFNjExQkQ5MEQ5QzRCRUU1NTlFMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMzIzMDlFQTIxQ0YxMUU2QTQ5MEE0NTJBREZEQTM5MyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMzIzMDlFOTIxQ0YxMUU2QTQ5MEE0NTJBREZEQTM5MyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERDNCQjZDQ0YyMUU2MTFCRDkwRDlDNEJFRTU1OUUzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFDRDNCQjZDQ0YyMUU2MTFCRDkwRDlDNEJFRTU1OUUzIi8+IDwvcmRmOkRlc2NyaXB0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" />
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
Users can replace this with their custom auto resolving methods. The default resolver is available at
```Repository.defaultAutoConflictResolver```.

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
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxQ0QzQkI2Q0NGMjFFNjExQkQ5MEQ5QzRCRUU1NTlFMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMzIzMDlFQTIxQ0YxMUU2QTQ5MEE0NTJBREZEQTM5MyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMzIzMDlFOTIxQ0YxMUU2QTQ5MEE0NTJBREZEQTM5MyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERDNCQjZDQ0YyMUU2MTFCRDkwRDlDNEJFRTU1OUUzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFDRDNCQjZDQ0YyMUU2MTFCRDkwRDlDNEJFRTU1OUUzIi8+IDwvcmRmOkRlc2NyaXB0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" />
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxQ0QzQkI2Q0NGMjFFNjExQkQ5MEQ5QzRCRUU1NTlFMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1MDExQjJCRDIxRDAxMUU2QTgxNUYyQTIxQTREMDlENSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1MDExQjJCQzIxRDAxMUU2QTgxNUYyQTIxQTREMDlENSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERDNCQjZDQ0YyMUU2MTFCRDkwRDlDNEJFRTU1OUUzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFDRDNCQjZDQ0YyMUU2MTFCRDkwRDlDNEJFRTU1OUUzIi8+IDwvcmRmOkRlc2NyaXB0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" />
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxQ0QzQkI2Q0NGMjFFNjExQkQ5MEQ5QzRCRUU1NTlFMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1NzI1OEY3RjIxRDAxMUU2OTc1RkIxMTdBMjc4MzIxRSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1NzI1OEY3RTIxRDAxMUU2OTc1RkIxMTdBMjc4MzIxRSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERDNCQjZDQ0YyMUU2MTFCRDkwRDlDNEJFRTU1OUUzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFDRDNCQjZDQ0YyMUU2MTFCRDkwRDlDNEJFRTU1OUUzIi8+IDwvcmRmOkRlc2NyaXB0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" />



## License
Jsodvcs is copyright © 2016-present Patrick Michael Hopf and all
[contributors](https://github.com/Wortex17/jsodvcs/graphs/contributors).  
Jsodvcs is free, licensed under The MIT License (MIT).  
See the file LICENSE in this distribution for more details.