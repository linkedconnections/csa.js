"use strict";
exports.__esModule = true;
var AndCondition = /** @class */ (function () {
    function AndCondition(left, right) {
        this.left = left;
        this.right = right;
    }
    AndCondition.prototype.check_condition = function (node, relation, child, nodeContext) {
        return this.left.check_condition(node, relation, child, nodeContext) &&
            this.right.check_condition(node, relation, child, nodeContext);
    };
    return AndCondition;
}());
exports["default"] = AndCondition;
