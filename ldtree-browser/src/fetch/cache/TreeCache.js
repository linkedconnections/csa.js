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
var LRU = require("lru-cache");
var TripleParser_1 = require("../helpers/TripleParser");
var TripleFetcher_1 = require("../helpers/TripleFetcher");
var TreeCache = /** @class */ (function () {
    /**
     * Constructor of the TreeCache object.
     * @param maxSubjects - Max amount of id's saved in the cache
     * @param maxAge - Max age of items in the cache (ms)
     */
    function TreeCache(maxSubjects, maxAge) {
        this.notFullyLoadedIds = new Set();
        this.runningQuerys = {};
        if (maxSubjects === undefined) {
            maxSubjects = 10000;
        }
        if (maxAge === undefined) {
            maxAge = 1000 * 300; // 5 min
        }
        // Initialize parser and fetcher
        this.parser = new TripleParser_1["default"]();
        this.fetcher = new TripleFetcher_1["default"]();
        // Create the cache object.
        this.tripleCache = new LRU({
            max: maxSubjects,
            maxAge: maxAge
        });
        // RunningPromises are the currently running fetches.
        this.runningPromises = {};
    }
    TreeCache.prototype.getNode = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var found, triples, result, _a, _b, triples, result, err_1, triples_1, result, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        found = this.tripleCache.peek(id);
                        if (!!found) return [3 /*break*/, 3];
                        this.runningPromises[id.split("#")[0]] = true;
                        return [4 /*yield*/, this.fetchTriples(id)];
                    case 1:
                        triples = _e.sent();
                        delete this.runningPromises[id.split("#")[0]];
                        _b = (_a = this.parser).parseNode;
                        return [4 /*yield*/, triples];
                    case 2:
                        result = _b.apply(_a, [_e.sent(), id]);
                        // set if a node is fully loaded
                        result.setFullyLoaded(true);
                        delete this.runningPromises[id.split("#")[0]];
                        return [2 /*return*/, result];
                    case 3:
                        triples = this.tripleCache.get(id);
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 5, , 8]);
                        result = this.parser.parseNode(triples, id);
                        // set if a node is fully loaded
                        result.setFullyLoaded(!this.notFullyLoadedIds.has(id));
                        return [2 /*return*/, result];
                    case 5:
                        err_1 = _e.sent();
                        this.runningPromises[id.split("#")[0]] = true;
                        return [4 /*yield*/, this.fetchTriples(id)];
                    case 6:
                        triples_1 = _e.sent();
                        delete this.runningPromises[id.split("#")[0]];
                        _d = (_c = this.parser).parseNode;
                        return [4 /*yield*/, triples_1];
                    case 7:
                        result = _d.apply(_c, [_e.sent(), id]);
                        // set if a node is fully loaded
                        result.setFullyLoaded(true);
                        return [2 /*return*/, result];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    TreeCache.prototype.getMember = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var found, triples, triples, result, err_2, triples_2, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        found = this.tripleCache.peek(id);
                        if (!!found) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkRunningOrExecute(id)
                            // this.runningPromises[id.split("#")[0]] = true
                            // let triples = await this.fetchTriples(id);
                            // delete this.runningPromises[id.split("#")[0]]
                            // this.runningPromises.push(triples);
                        ];
                    case 1:
                        triples = _c.sent();
                        // this.runningPromises[id.split("#")[0]] = true
                        // let triples = await this.fetchTriples(id);
                        // delete this.runningPromises[id.split("#")[0]]
                        // this.runningPromises.push(triples);
                        return [2 /*return*/, this.parser.parseMember(triples)];
                    case 2:
                        triples = this.tripleCache.get(id);
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 4, , 7]);
                        result = this.parser.parseMember(triples);
                        return [2 /*return*/, result];
                    case 4:
                        err_2 = _c.sent();
                        return [4 /*yield*/, this.checkRunningOrExecute(id)];
                    case 5:
                        triples_2 = _c.sent();
                        _b = (_a = this.parser).parseMember;
                        return [4 /*yield*/, triples_2];
                    case 6: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    TreeCache.prototype.getChildRelation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var found, triples, _a, _b, triples, result, err_3, triples_3, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        found = this.tripleCache.peek(id);
                        if (!!found) return [3 /*break*/, 3];
                        this.runningPromises[id.split("#")[0]] = true;
                        return [4 /*yield*/, this.fetchTriples(id)];
                    case 1:
                        triples = _e.sent();
                        delete this.runningPromises[id.split("#")[0]];
                        _b = (_a = this.parser).parseChildRelation;
                        return [4 /*yield*/, triples];
                    case 2: 
                    // this.runningPromises.push(triples);
                    return [2 /*return*/, _b.apply(_a, [_e.sent()])];
                    case 3:
                        triples = this.tripleCache.get(id);
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 5, , 8]);
                        result = this.parser.parseChildRelation(triples);
                        return [2 /*return*/, result];
                    case 5:
                        err_3 = _e.sent();
                        this.runningPromises[id.split("#")[0]] = true;
                        return [4 /*yield*/, this.fetchTriples(id)];
                    case 6:
                        triples_3 = _e.sent();
                        delete this.runningPromises[id.split("#")[0]];
                        _d = (_c = this.parser).parseChildRelation;
                        return [4 /*yield*/, triples_3];
                    case 7: 
                    // this.runningPromises.push(triples);
                    return [2 /*return*/, _d.apply(_c, [_e.sent()])];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    TreeCache.prototype.getCollection = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var found, triples, _a, _b, triples, result, err_4, triples_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        found = this.tripleCache.peek(id);
                        if (!!found) return [3 /*break*/, 3];
                        this.runningPromises[id.split("#")[0]] = true;
                        return [4 /*yield*/, this.fetchTriples(id)];
                    case 1:
                        triples = _c.sent();
                        delete this.runningPromises[id.split("#")[0]];
                        _b = (_a = this.parser).parseCollection;
                        return [4 /*yield*/, triples];
                    case 2: 
                    // this.runningPromises.push(triples);
                    return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                    case 3:
                        triples = this.tripleCache.get(id);
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 5, , 7]);
                        result = this.parser.parseCollection(triples);
                        return [2 /*return*/, result];
                    case 5:
                        err_4 = _c.sent();
                        this.runningPromises[id.split("#")[0]] = true;
                        return [4 /*yield*/, this.fetchTriples(id)];
                    case 6:
                        triples_4 = _c.sent();
                        delete this.runningPromises[id.split("#")[0]];
                        // this.runningPromises.push(triples);
                        return [2 /*return*/, this.parser.parseCollection(triples_4)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    TreeCache.prototype.fillNode = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var triples, result, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // await this.awaitPromises(node.id)
                        // Check if state has changed after all runnning processes have finished
                        if (node.fullyloaded === true) {
                            return [2 /*return*/, node];
                        }
                        this.runningPromises[node.id.split("#")[0]] = true;
                        triples = this.fetchTriples(node.getId());
                        delete this.runningPromises[node.id.split("#")[0]];
                        _b = (_a = this.parser).parseNode;
                        return [4 /*yield*/, triples];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), node.getId()])];
                    case 2:
                        result = _c.sent();
                        // set if a node is fully loaded
                        result.setFullyLoaded(true);
                        node.copyInfo(result);
                        return [2 /*return*/, node];
                }
            });
        });
    };
    TreeCache.prototype.checkRunningOrExecute = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var baseid, result, triples, solvedtriples;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseid = id.split("#")[0];
                        if (!this.runningQuerys.hasOwnProperty(baseid)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.runningQuerys[baseid]];
                    case 1:
                        _a.sent();
                        result = this.tripleCache.get(id);
                        if (result === null || result === undefined) {
                            return [2 /*return*/, this.checkRunningOrExecute(id)];
                        }
                        return [2 /*return*/, result];
                    case 2:
                        triples = this.fetchTriples(id);
                        this.runningQuerys[baseid] = triples;
                        return [4 /*yield*/, triples];
                    case 3:
                        solvedtriples = _a.sent();
                        delete this.runningQuerys[baseid];
                        return [2 /*return*/, solvedtriples];
                }
            });
        });
    };
    // Use flag to indicate nodes that are not from this fragment and may therefore be not completely loaded
    TreeCache.prototype.fetchTriples = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, triples, keys;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = undefined;
                        return [4 /*yield*/, this.fetcher.getTriplesBySubject(id)];
                    case 1:
                        triples = _a.sent();
                        if (triples === undefined || triples === null) {
                            throw "id " + id + " could not be parsed successfully";
                        }
                        keys = Object.keys(triples);
                        keys.forEach(function (key) {
                            if (key.split("#")[0] === id.split("#")[0]) {
                                if (id === key) {
                                    result = triples[key];
                                }
                                _this.tripleCache.set(key, triples[key]);
                            }
                            else {
                                if (!_this.tripleCache.peek(key)) {
                                    _this.notFullyLoadedIds.add(key);
                                    _this.tripleCache.set(key, triples[key]);
                                }
                                else {
                                    console.log(key, "already present");
                                }
                            }
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return TreeCache;
}());
exports["default"] = TreeCache;
