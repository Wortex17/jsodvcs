# jsodvcs
A git-like distributed version control system for javascript objects.

[![Build Status](https://travis-ci.org/Wortex17/jsod.svg?branch=master)](https://travis-ci.org/Wortex17/jsod)
[![Coverage Status](https://coveralls.io/repos/github/Wortex17/jsod/badge.svg?branch=master)](https://coveralls.io/github/Wortex17/jsod?branch=master)  
[![NPM Version](https://img.shields.io/npm/v/jsod.svg)](https://www.npmjs.com/package/jsod)
[![NPM Dependencies](https://img.shields.io/david/Wortex17/jsod.svg)](https://www.npmjs.com/package/jsod)
[![NPM Dev Dependencies](https://img.shields.io/david/dev/Wortex17/jsod.svg)](https://www.npmjs.com/package/jsod)

Jsodvcs (**J**ava**S**cript **O**bject **D**istributed **V**ersion **C**ontrol **S**ystem) 
gives users the possibility to store javascript objects and other native
types in a repository, commit, stage and discard changes, create branches and pull and merge
commits/changes from other repositories. It works completely in-memory in javascript and does
not depend on or require any specific form of text-based serialization or even a file system
at all!  
*(Though, some form of serilization is recommended should you want to store or transmit
the repositories over the wire. Jsodvc tries to make this process as easy as possbile for you)*


## License
Jsodvcs is copyright © 2016-present Patrick Michael Hopf and all
[contributors](https://github.com/Wortex17/jsodvcs/graphs/contributors).  
Jsodvcs is free, licensed under The MIT License (MIT).  
See the file LICENSE in this distribution for more details.