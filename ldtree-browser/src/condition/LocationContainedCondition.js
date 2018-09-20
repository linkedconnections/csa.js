"use strict";
exports.__esModule = true;
var RelationType_1 = require("../tree/RelationType");
var terraformer = require("terraformer");
var terraformerparser = require("terraformer-wkt-parser");
var LocationContainedCondition = /** @class */ (function () {
    function LocationContainedCondition(polygonwktstring) {
        this.nodepoly = terraformerparser.parse(polygonwktstring);
        this.nodeprimitivepoly = new terraformer.Primitive(this.nodepoly);
    }
    LocationContainedCondition.prototype.check_condition = function (node, relation, child, nodeContext) {
        try {
            if (relation.getRelationType().indexOf(RelationType_1["default"].GeospatiallyContainsRelation) != -1) {
                var childpoly = terraformerparser.parse(child.getValue());
                var childprimitivepoly = new terraformer.Primitive(childpoly);
                return (this.nodeprimitivepoly.contains(childpoly) || this.nodeprimitivepoly.intersects(childpoly) || childprimitivepoly.contains(this.nodepoly));
            }
            return false;
        }
        catch (err) {
            return false;
        }
    };
    return LocationContainedCondition;
}());
exports["default"] = LocationContainedCondition;
