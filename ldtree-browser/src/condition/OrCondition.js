"use strict";
exports.__esModule = true;
var OrCondition = /** @class */ (function () {
    function OrCondition(left, right) {
        this.left = left;
        this.right = right;
    }
    OrCondition.prototype.check_condition = function (node, relation, child, nodeContext) {
        return this.left.check_condition(node, relation, child, nodeContext) ||
            this.right.check_condition(node, relation, child, nodeContext);
    };
    return OrCondition;
}());
exports["default"] = OrCondition;
