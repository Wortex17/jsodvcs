/*!
 * jsodvcs
 * https://github.com/wortex17/jsodvcs
 * Created 24.04.2016 by Patrick Michael Hopf
 *
 * Released under The MIT License
 */
"use strict";

/**
 * @readonly
 * @enum {String}
 * @memberOf jsodvcs
 */
let RepositoryObjectType = {
    blob: 'b',
    tree: 't',
    commit: 'c'
};

module.exports = RepositoryObjectType;