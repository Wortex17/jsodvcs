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
    require("./ref").spec();
    require("./update_index").spec();
    require("./add").spec();
    require("./remove").spec();
    require("./move").spec();
    require("./contents").spec();
    require("./commit").spec();
    require("./reset").spec();
    require("./status").spec();
    require("./diff").spec();
    require("./branch").spec();
    require("./checkout").spec();
    require("./get_lca").spec();
    require("./merge").spec();
    require("./fetch").spec();
    require("./pull").spec();
});