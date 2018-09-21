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
var Query_1 = require("./Query");
/**
 * Generic implementation of a query for search trees.
*/
var SearchTreeQuery = /** @class */ (function (_super) {
    __extends(SearchTreeQuery, _super);
    /**
     *
     * @param emitCondition - Condition to emit a node.
     * @param followCondition - Condition to continue querying on the passed child.
     */
    function SearchTreeQuery(emitCondition, followCondition) {
        var _this = _super.call(this) || this;
        _this.emitCondition = emitCondition;
        _this.followCondition = followCondition;
        return _this;
    }
    /**
     * Overwritten base query method.
    */
    SearchTreeQuery.prototype.query = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Set the context of the nodes.
                        if (this.session["context"] === undefined || this.session["context"] === null) {
                            if (this.nodeContext === undefined || this.nodeContext === null) {
                                this.session["context"] = new Array(this.session.nodes.length);
                            }
                            else {
                                this.session["context"] = this.nodeContext;
                            }
                        }
                        this.session["leafnodes"] = [];
                        this.session["leafcontext"] = [];
                        _a = this;
                        return [4 /*yield*/, this.queryRecursive(this.session)];
                    case 1:
                        _a.session = _b.sent();
                        //TODO:: put the nodes in the nodelist on top of the starting nodes they originate from and return like this as new state for the session. -> not implemented.
                        this.session.nodes = this.session["leafnodes"];
                        this.session.context = this.session["leafcontext"];
                        delete this.session["leafnodes"];
                        delete this.session["leafcontext"];
                        return [2 /*return*/, this.session];
                }
            });
        });
    };
    // This method returns an array of the form [ [node1, context1], [node2, context2], ... ]
    SearchTreeQuery.prototype.queryRecursive = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var followedChildren, i, node, currentContext, childRelations, _i, _a, relation, _b, _c, child, _d, followedChildren_1, nrccarray, _e, followedChildren_2, nrccarray;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        followedChildren = new Array();
                        i = 0;
                        _f.label = 1;
                    case 1:
                        if (!(i < session.size())) return [3 /*break*/, 11];
                        node = session.nodes[i];
                        currentContext = session.context[i];
                        if (!this.emitCondition.check_condition(node, currentContext)) return [3 /*break*/, 3];
                        return [4 /*yield*/, node.getChildRelations()];
                    case 2:
                        childRelations = _f.sent();
                        this.emitMember(node);
                        this.emitNode(node);
                        if (childRelations.length == 0) {
                            // We are in a leaf node.
                            session["leafnodes"].push(node);
                            session["leafcontext"].push(currentContext);
                            this.emit("leafnode", node);
                        }
                        _f.label = 3;
                    case 3:
                        _i = 0;
                        return [4 /*yield*/, node.getChildRelations()];
                    case 4:
                        _a = _f.sent();
                        _f.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        relation = _a[_i];
                        _b = 0;
                        return [4 /*yield*/, relation.getChildren()];
                    case 6:
                        _c = _f.sent();
                        _f.label = 7;
                    case 7:
                        if (!(_b < _c.length)) return [3 /*break*/, 9];
                        child = _c[_b];
                        if (this.followCondition.check_condition(node, relation, child, currentContext)) {
                            followedChildren.push([node, relation, child, currentContext]);
                        }
                        _f.label = 8;
                    case 8:
                        _b++;
                        return [3 /*break*/, 7];
                    case 9:
                        _i++;
                        return [3 /*break*/, 5];
                    case 10:
                        i++;
                        return [3 /*break*/, 1];
                    case 11:
                        for (_d = 0, followedChildren_1 = followedChildren; _d < followedChildren_1.length; _d++) {
                            nrccarray = followedChildren_1[_d];
                            if (this.nodeContextUpdateAction != null && [nrccarray[3]] != null) {
                                nrccarray[3] = this.nodeContextUpdateAction(nrccarray[0], nrccarray[1], nrccarray[2], nrccarray[3]);
                            }
                        }
                        if (followedChildren.length == 0) {
                            return [2 /*return*/, session];
                        }
                        session.nodes = [];
                        session.context = [];
                        for (_e = 0, followedChildren_2 = followedChildren; _e < followedChildren_2.length; _e++) {
                            nrccarray = followedChildren_2[_e];
                            session.nodes.push(nrccarray[2]);
                            session.context.push(nrccarray[3]);
                        }
                        return [4 /*yield*/, this.queryRecursive(session)];
                    case 12: return [2 /*return*/, _f.sent()];
                }
            });
        });
    };
    return SearchTreeQuery;
}(Query_1["default"]));
exports["default"] = SearchTreeQuery;
