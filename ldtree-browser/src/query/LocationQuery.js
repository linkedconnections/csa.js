"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var SearchTreeQuery_1 = require("./SearchTreeQuery");
var LocationContainedCondition_1 = require("../condition/LocationContainedCondition");
var LocationContainedEmitCondition_1 = require("../condition/LocationContainedEmitCondition");
var LocationQuery = /** @class */ (function (_super) {
    __extends(LocationQuery, _super);
    function LocationQuery(locationString) {
        return _super.call(this, new LocationContainedEmitCondition_1["default"](locationString), new LocationContainedCondition_1["default"](locationString)) || this;
    }
    return LocationQuery;
}(SearchTreeQuery_1["default"]));
exports["default"] = LocationQuery;
