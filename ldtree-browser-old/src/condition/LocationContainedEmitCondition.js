"use strict";
exports.__esModule = true;
var terraformer = require("terraformer");
var terraformerparser = require("terraformer-wkt-parser");
var LocationContainedEmitCondition = /** @class */ (function () {
    function LocationContainedEmitCondition(polygonwktstring) {
        this.nodepoly = terraformerparser.parse(polygonwktstring);
        this.nodeprimitivepoly = new terraformer.Primitive(this.nodepoly);
    }
    LocationContainedEmitCondition.prototype.check_condition = function (node, nodeContext) {
        try {
            var childpoly = terraformerparser.parse(node.getValue());
            var childprimitivepoly = new terraformer.Primitive(childpoly);
            return (this.nodeprimitivepoly.contains(childpoly) || this.nodeprimitivepoly.intersects(childpoly) || childprimitivepoly.contains(this.nodepoly));
        }
        catch (err) {
            return false;
        }
    };
    return LocationContainedEmitCondition;
}());
exports["default"] = LocationContainedEmitCondition;
