/*!
 * jsodvcs
 * https://github.com/wortex17/jsodvcs
 * Created 24.04.2016 by Patrick Michael Hopf
 *
 * Released under The MIT License
 */
"use strict";

/**
 * Enum for Repository#reset() modes.
 * @readonly
 * @enum {String}
 * @memberOf jsodvcs
 */
let ResetMode = {
    /** Changes HEAD but keeps index as-is */
    soft: 'soft',
    /** Replaces complete index */
    hard: 'hard'
};

module.exports = ResetMode;