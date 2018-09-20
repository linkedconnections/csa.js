"use strict";
exports.__esModule = true;
var StringContainsCondition = /** @class */ (function () {
    function StringContainsCondition() {
    }
    StringContainsCondition.prototype.check_condition = function (node, relation, child, nodeContext) {
        if (nodeContext["searchstring"] != "" && nodeContext["searchstring"].startsWith(child.getValue())) {
            return true;
        }
        return false;
    };
    return StringContainsCondition;
}());
exports["default"] = StringContainsCondition;
