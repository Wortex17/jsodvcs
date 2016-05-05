"use strict";

let
    _ = require('lodash'),
    chai = require('chai')
    ,expect = chai.expect
;

let
    jsodvcs = require("../../")
;

describe('Repository', function() {
    require("./init").spec();
    require("./update_index").spec();
    require("./add").spec();
    require("./remove").spec();
});