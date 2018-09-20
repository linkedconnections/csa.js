"use strict";
exports.__esModule = true;
var SearchCompletedCondition = /** @class */ (function () {
    function SearchCompletedCondition() {
    }
    SearchCompletedCondition.prototype.check_condition = function (node, nodeContext) {
        if (nodeContext["searchstring"] === "") {
            return true;
        }
        return false;
    };
    return SearchCompletedCondition;
}());
exports["default"] = SearchCompletedCondition;
