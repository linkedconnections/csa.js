"use strict";
exports.__esModule = true;
var StringContainedCondition = /** @class */ (function () {
    function StringContainedCondition() {
    }
    StringContainedCondition.prototype.check_condition = function (node, relation, child, nodeContext) {
        if (nodeContext["searchstring"] != "" && child.getValue().startsWith(nodeContext["searchstring"])) {
            return true;
        }
        return false;
    };
    return StringContainedCondition;
}());
exports["default"] = StringContainedCondition;
