"use strict";
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
var TreeFetcher_1 = require("../fetch/TreeFetcher");
var Node = /** @class */ (function () {
    /**
     * Node constructor
     * @param id
     * @param value
     * @param childRelations - Relations with the child.
     * @param members - Data objects contained by the node.
     * @param totalItems - Amount of nodes underneath this node in the tree.
     */
    function Node(id, value, childRelations, members, totalItems) {
        if (value === undefined) {
            throw "Invalid node";
        }
        this.id = id;
        this.value = value;
        this.childRelations = childRelations;
        this.members = members;
        this.totalItems = totalItems;
        this.fullyloaded = true;
    }
    Node.prototype.getId = function () {
        return this.id;
    };
    Node.prototype.getValue = function () {
        return this.value;
    };
    /**
     * Dependent on if the node was fully loaded, this can cause a fetch for a new page.
    */
    Node.prototype.getChildRelations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fetcher, result, i, node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fetcher = TreeFetcher_1["default"].getInstance();
                        result = [];
                        if (!(this.childRelations.length === 0)) return [3 /*break*/, 4];
                        if (!(this.fullyloaded === false)) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetcher.fillNode(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.getChildRelations()];
                    case 2: return [2 /*return*/, []];
                    case 3: return [3 /*break*/, 9];
                    case 4:
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < this.childRelations.length)) return [3 /*break*/, 8];
                        return [4 /*yield*/, fetcher.getChildRelation(this.childRelations[i])];
                    case 6:
                        node = _a.sent();
                        result.push(node);
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, result];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dependent on if the node was fully loaded, this can cause a fetch for a new page.
    */
    Node.prototype.getMembers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fetcher, result, i, node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fetcher = TreeFetcher_1["default"].getInstance();
                        result = [];
                        if (!(this.members.length === 0)) return [3 /*break*/, 4];
                        if (!(this.fullyloaded === false)) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetcher.fillNode(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.getMembers()];
                    case 2: return [2 /*return*/, []];
                    case 3: return [3 /*break*/, 8];
                    case 4:
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < this.members.length)) return [3 /*break*/, 8];
                        return [4 /*yield*/, fetcher.getMember(this.members[i])];
                    case 6:
                        node = _a.sent();
                        result.push(node);
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Returns total amount of nodes underneath this node in the tree.
    */
    Node.prototype.getTotalItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fetcher;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.totalItems === undefined || this.totalItems === null)) return [3 /*break*/, 4];
                        if (!(this.fullyloaded === false)) return [3 /*break*/, 2];
                        fetcher = TreeFetcher_1["default"].getInstance();
                        return [4 /*yield*/, fetcher.fillNode(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.totalItems];
                    case 2: return [2 /*return*/, 0];
                    case 3: return [3 /*break*/, 5];
                    case 4: return [2 /*return*/, this.totalItems];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Copies info from other node.
     * @param node - other node
     */
    Node.prototype.copyInfo = function (node) {
        // id and value are already set.
        // The fullyloaded parameter is set in the calling method.
        this.childRelations = node.childRelations;
        this.members = node.members;
        this.totalItems = node.totalItems;
        this.fullyloaded = node.fullyloaded;
    };
    /**
     * Sets the flag of the node being fully loaded (not provided in an other fragment as child without all data)
     * @param loaded
     */
    Node.prototype.setFullyLoaded = function (loaded) {
        this.fullyloaded = loaded;
    };
    /**
     * Checks node on being fully loaded
    */
    Node.prototype.isFullyLoaded = function () {
        return this.fullyloaded;
    };
    return Node;
}());
exports["default"] = Node;
