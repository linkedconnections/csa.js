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
var StringContainsCondition_1 = require("../condition/StringContainsCondition");
var OrCondition_1 = require("../condition/OrCondition");
var StringContainedCondition_1 = require("../condition/StringContainedCondition");
var Query_1 = require("./Query");
var SearchCompletedCondition_1 = require("../condition/SearchCompletedCondition");
var SearchStringQuery = /** @class */ (function (_super) {
    __extends(SearchStringQuery, _super);
    function SearchStringQuery(searchstring) {
        var _this = _super.call(this) || this;
        _this.searchstring = searchstring;
        _this.emitCondition = new SearchCompletedCondition_1["default"]();
        _this.followCondition = new OrCondition_1["default"](new StringContainedCondition_1["default"](), new StringContainsCondition_1["default"]());
        return _this;
    }
    SearchStringQuery.prototype.query = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toRemove, i, i, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toRemove = [];
                        for (i = 0; i < this.session.nodes.length; i++) {
                            // We look at every node in the session for a string match.
                            if (this.session.context[i]["searchstring"] === undefined || this.session.context[i]["searchstring"] === null) {
                                // We initialize a context for this query if it was nonexistent.
                                this.session.context[i]["searchstring"] = this.searchstring;
                                this.session.context[i]["leftoverstring"] = "";
                            }
                            else {
                                // This session had already been queried and contains a context.
                                if (this.session.context[i]["leftoverstring"] === "") {
                                    // Last query matched the full node string.
                                    this.session.context[i]["searchstring"] = this.searchstring;
                                }
                                else {
                                    // Last query did not match the full node string.
                                    if (this.searchstring.startsWith(this.session.context[i]["leftoverstring"])) {
                                        this.session.context[i]["searchstring"] = this.searchstring.slice(this.session.context[i]["leftoverstring"].length);
                                        this.session.context[i]["leftoverstring"] = "";
                                    }
                                    else if (this.session.context[i]["leftoverstring"].startsWith(this.searchstring)) {
                                        this.session.context[i]["leftoverstring"] = this.session.context[i]["leftoverstring"].slice(this.searchstring.length);
                                        this.session.context[i]["searchstring"] = "";
                                    }
                                    else {
                                        // Not the needed letter / lettergroup was provided to proceed on this session node
                                        toRemove.push(i);
                                    }
                                }
                            }
                        }
                        // Remove indices reverse as to not distort the other indices that have to be deleted.
                        for (i = toRemove.length - 1; i >= 0; i--) {
                            this.session.nodes.splice(toRemove[i], 1);
                            this.session.context.splice(toRemove[i], 1);
                        }
                        this.session["leafnodes"] = [];
                        this.session["leafcontext"] = [];
                        return [4 /*yield*/, this.queryRecursive(this.session)];
                    case 1:
                        session = _a.sent();
                        return [2 /*return*/, session];
                }
            });
        });
    };
    SearchStringQuery.prototype.queryRecursive = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var followQueries, followedChildren, i, node, currentContext, children, _i, followQueries_1, arr, _a, _b, nrccarray, node, childRelation, child, nodeContext, rest;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        followQueries = [];
                        followedChildren = new Array();
                        // Process every node in the session.
                        for (i = 0; i < session.size(); i++) {
                            node = session.nodes[i];
                            currentContext = session.context[i];
                            children = this.processNode(session, node, currentContext);
                            followQueries.push(children);
                        }
                        // Await all nodes untill they have been processed
                        Promise.all(followQueries);
                        session.nodes = [];
                        session.context = [];
                        _i = 0, followQueries_1 = followQueries;
                        _c.label = 1;
                    case 1:
                        if (!(_i < followQueries_1.length)) return [3 /*break*/, 6];
                        arr = followQueries_1[_i];
                        _a = 0;
                        return [4 /*yield*/, arr];
                    case 2:
                        _b = _c.sent();
                        _c.label = 3;
                    case 3:
                        if (!(_a < _b.length)) return [3 /*break*/, 5];
                        nrccarray = _b[_a];
                        node = nrccarray[0];
                        childRelation = nrccarray[1];
                        child = nrccarray[2];
                        nodeContext = nrccarray[3];
                        if (child.getValue().startsWith(nodeContext["searchstring"])) {
                            rest = child.getValue().slice(nodeContext["searchstring"].length);
                            nodeContext["searchstring"] = "";
                            nodeContext["leftoverstring"] = rest;
                            session.nodes.push(child);
                            session.context.push(nodeContext);
                        }
                        else if (nodeContext["searchstring"].startsWith(child.getValue())) {
                            // The child value is contained at the start of the rest of the substring.
                            // We remove this child value from the search string and continue searching from this child.
                            nodeContext["searchstring"] = nodeContext["searchstring"].slice(child.getValue().length);
                            nodeContext["leftoverstring"] = "";
                            session.nodes.push(child);
                            session.context.push(nodeContext);
                        }
                        _c.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 3];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (session.nodes.length == 0) {
                            // Clean session object
                            session.nodes = session["leafnodes"];
                            session.context = session["leafcontext"];
                            delete session["leafnodes"];
                            delete session["leafcontext"];
                            return [2 /*return*/, session];
                        }
                        return [4 /*yield*/, this.queryRecursive(session)];
                    case 7: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    // This method 
    SearchStringQuery.prototype.processNode = function (session, node, currentContext) {
        return __awaiter(this, void 0, void 0, function () {
            var followedChildren, childRelations, _i, _a, relation, _b, _c, child;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        followedChildren = new Array();
                        if (!this.emitCondition.check_condition(node, currentContext)) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.getChildRelations()];
                    case 1:
                        childRelations = _d.sent();
                        this.emitMember(node);
                        this.emitNode(node);
                        session["leafnodes"].push(node);
                        session["leafcontext"].push(currentContext);
                        if (childRelations.length == 0) {
                            this.emit("leafnode", node);
                        }
                        _d.label = 2;
                    case 2:
                        _i = 0;
                        return [4 /*yield*/, node.getChildRelations()];
                    case 3:
                        _a = _d.sent();
                        _d.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        relation = _a[_i];
                        _b = 0;
                        return [4 /*yield*/, relation.getChildren()];
                    case 5:
                        _c = _d.sent();
                        _d.label = 6;
                    case 6:
                        if (!(_b < _c.length)) return [3 /*break*/, 8];
                        child = _c[_b];
                        if (this.followCondition.check_condition(node, relation, child, currentContext)) {
                            followedChildren.push([node, relation, child, currentContext]);
                        }
                        _d.label = 7;
                    case 7:
                        _b++;
                        return [3 /*break*/, 6];
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9: return [2 /*return*/, followedChildren];
                }
            });
        });
    };
    return SearchStringQuery;
}(Query_1["default"]));
exports["default"] = SearchStringQuery;
