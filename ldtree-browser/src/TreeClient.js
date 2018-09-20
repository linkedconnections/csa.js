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
var Session_1 = require("./Session");
var TreeFetcher_1 = require("./fetch/TreeFetcher");
// TODO: keep some kind of state for backpropagation
/**
 * Used to create sessions and query them, has an internal node cache and is used to fetch nodes and execute queries
 */
var TreeClient = /** @class */ (function () {
    function TreeClient(maxSubjects, maxAge) {
        this.collections = {};
        // Set cache size of tree fetcher
        TreeFetcher_1["default"].getInstance(maxSubjects, maxAge);
    }
    /**
     * Add a collection to the tree to search on.
     * @param url - Url of the collection to add.
     */
    TreeClient.prototype.addCollection = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var collection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TreeFetcher_1["default"].getInstance().getCollection(url)];
                    case 1:
                        collection = _a.sent();
                        this.collections[url] = collection;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove a collection from the searches.
     * @param url - Url of the collection to delete.
     */
    TreeClient.prototype.deleteCollection = function (url) {
        delete this.collections[url];
    };
    /**
     * create a new session starting at the root nodes of the provided collections.
    */
    TreeClient.prototype.createSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, keys, i, collectionNodes, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nodes = [];
                        keys = Object.keys(this.collections);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < keys.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.collections[keys[i]].getViews()];
                    case 2:
                        collectionNodes = _a.sent();
                        nodes = nodes.concat(collectionNodes);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        session = new Session_1["default"](nodes);
                        return [2 /*return*/, session];
                }
            });
        });
    };
    /**
     *
     * @param query - The query to execute.
     * @param session - The session to execute the query on. If none given the root nodes of the collections are used as a new Session.
     */
    TreeClient.prototype.executeQuery = function (query, session) {
        if (session === void 0) { session = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(session === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createSession()];
                    case 1:
                        session = _a.sent();
                        _a.label = 2;
                    case 2:
                        query.set_session(session);
                        return [2 /*return*/, query.query()];
                }
            });
        });
    };
    return TreeClient;
}());
exports["default"] = TreeClient;
