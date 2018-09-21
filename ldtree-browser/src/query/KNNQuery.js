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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Session_1 = require("../Session");
var terraformer = require("terraformer");
var terraformerparser = require("terraformer-wkt-parser");
var TinyQueue = require("../tinyqueue/tinyqueue");
var Query_1 = require("./Query");
var KNNQuery = /** @class */ (function (_super) {
    __extends(KNNQuery, _super);
    function KNNQuery(lat, long, k) {
        if (k === void 0) { k = 3; }
        var _this = _super.call(this) || this;
        _this.emittedNodes = [];
        _this.point = new terraformer.Point(long, lat);
        _this.k = k;
        _this.long = long;
        _this.lat = lat;
        _this.maxMinDist = 0;
        var queue = new TinyQueue([], function (a, b) {
            return a.distance - b.distance;
        });
        _this.queue = queue;
        return _this;
    }
    KNNQuery.prototype.query = function () {
        return this.queryRecursive(this.session);
    };
    // This method returns an array of the form [ [node1, context1], [node2, context2], ... ]
    KNNQuery.prototype.queryRecursive = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var followed_children, saved_nodes, i, node, queueObj, leafNode, closestObj, _i, _a, relation, _b, _c, child, queueChild;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        followed_children = [];
                        saved_nodes = new Array();
                        for (i = 0; i < session.nodes.length; i++) {
                            node = session.nodes[i];
                            try {
                                queueObj = this.getQueueObject(node);
                                queueObj["distance"] = this.getDistance(queueObj);
                                if (queueObj["distance"] > this.maxMinDist) {
                                    this.maxMinDist = queueObj["distance"];
                                }
                                this.queue.push(queueObj);
                            }
                            catch (ex) {
                            }
                        }
                        _d.label = 1;
                    case 1:
                        if (!this.queue.length) return [3 /*break*/, 9];
                        leafNode = true;
                        closestObj = this.queue.pop();
                        _i = 0;
                        return [4 /*yield*/, closestObj.node.getChildRelations()];
                    case 2:
                        _a = _d.sent();
                        _d.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        relation = _a[_i];
                        _b = 0;
                        return [4 /*yield*/, relation.getChildren()];
                    case 4:
                        _c = _d.sent();
                        _d.label = 5;
                    case 5:
                        if (!(_b < _c.length)) return [3 /*break*/, 7];
                        child = _c[_b];
                        leafNode = false;
                        try {
                            queueChild = this.getQueueObject(child);
                            queueChild["distance"] = this.getDistance(queueChild);
                            this.queue.push(queueChild);
                        }
                        catch (ex) {
                        }
                        _d.label = 6;
                    case 6:
                        _b++;
                        return [3 /*break*/, 5];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        if (leafNode) {
                            // Leaf node
                            this.emitNode(closestObj.node);
                            this.emitMember(closestObj.node);
                            this.emittedNodes.push(closestObj.node);
                            if (this.emittedNodes.length >= this.k) {
                                return [2 /*return*/, (new Session_1["default"](this.emittedNodes))];
                            }
                        }
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/, new Session_1["default"]([])];
                }
            });
        });
    };
    KNNQuery.prototype.getQueueObject = function (node) {
        var nodepoly = terraformerparser.parse(node.getValue());
        var nodeprimitivepoly = new terraformer.Primitive(nodepoly);
        var entry = {};
        entry["node"] = node;
        entry["primitive"] = nodeprimitivepoly;
        var e = nodeprimitivepoly.envelope();
        entry["x"] = e.x;
        entry["y"] = e.y;
        entry["w"] = e.w;
        entry["h"] = e.h;
        return entry;
    };
    KNNQuery.prototype.getDistance = function (queueObj) {
        if (queueObj["primitive"].contains(this.point)) {
            return 0;
        }
        else {
            return this.distancePointBox(this.long, this.lat, queueObj.x, queueObj.y, queueObj.x + queueObj.w, queueObj.y + queueObj.h);
        }
    };
    // Credits: https://codereview.stackexchange.com/questions/175566/compute-shortest-distance-between-point-and-a-rectangle
    KNNQuery.prototype.distancePointBox = function (x, y, x_min, y_min, x_max, y_max) {
        if (x < x_min) {
            if (y < y_min)
                return HYPOT(x_min - x, y_min - y);
            if (y <= y_max)
                return x_min - x;
            return HYPOT(x_min - x, y_max - y);
        }
        else if (x <= x_max) {
            if (y < y_min)
                return y_min - y;
            if (y <= y_max)
                return 0;
            return y - y_max;
        }
        else {
            if (y < y_min)
                return HYPOT(x_max - x, y_min - y);
            if (y <= y_max)
                return x - x_max;
            return HYPOT(x_max - x, y_max - y);
        }
    };
    return KNNQuery;
}(Query_1["default"]));
exports["default"] = KNNQuery;
function HYPOT(x, y) { return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)); }
