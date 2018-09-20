"use strict";
exports.__esModule = true;
var ItemType_1 = require("./ItemType");
var Node_1 = require("../../tree/Node");
var ChildRelation_1 = require("../../tree/ChildRelation");
var Collection_1 = require("../../tree/Collection");
/**
 * This class handles the parsing of triple pattern fragments.
*/
var TripleParser = /** @class */ (function () {
    function TripleParser() {
        this.singles = new Set();
        this.singles.add("https://w3id.org/tree#value");
        this.singles.add("http://www.w3.org/ns/hydra/core#totalItems");
    }
    TripleParser.prototype.parseTriples = function (triples, type) {
        if (type === ItemType_1["default"].Member) {
            return triples;
        }
        var obj = {};
        for (var i = 0; i < triples.length; i++) {
            var triple = triples[i];
            // @ts-ignore
            var subject = triple.subject.value;
            // @ts-ignore
            var predicate = triple.predicate.value;
            // @ts-ignore
            var object = triple.object.value;
            this.addTriple(obj, subject, predicate, object, this.singles.has(predicate));
        }
        return obj;
    };
    TripleParser.prototype.addTriple = function (obj, subject, predicate, object, single) {
        if (!obj.hasOwnProperty(subject)) {
            obj[subject] = {};
        }
        var sub = obj[subject];
        if (single) {
            sub[predicate] = object;
        }
        else {
            if (!sub.hasOwnProperty(predicate)) {
                sub[predicate] = [];
            }
            sub[predicate].push(object);
        }
    };
    TripleParser.prototype.parseNode = function (triples, nodeId) {
        var obj = this.parseTriples(triples, ItemType_1["default"].Node);
        obj = obj[Object.keys(obj)[0]];
        var value = obj["https://w3id.org/tree#value"];
        var childRelations = obj.hasOwnProperty("https://w3id.org/tree#hasChildRelation") ? obj["https://w3id.org/tree#hasChildRelation"] : [];
        var members = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#member") ? obj["http://www.w3.org/ns/hydra/core#member"] : [];
        var totalItems = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#totalItems") ? Number(obj["http://www.w3.org/ns/hydra/core#totalItems"]) : NaN;
        try {
            var result = new Node_1["default"](nodeId, value, childRelations, members, totalItems);
            return result;
        }
        catch (err) {
            throw err;
        }
    };
    TripleParser.prototype.parseChildRelation = function (triples) {
        var obj = this.parseTriples(triples, ItemType_1["default"].ChildRelation);
        obj = obj[Object.keys(obj)[0]];
        var children = obj["https://w3id.org/tree#child"];
        var type = obj["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
        try {
            var result = new ChildRelation_1["default"](children, type);
            return result;
        }
        catch (err) {
            throw err;
        }
    };
    TripleParser.prototype.parseCollection = function (triples) {
        var obj = this.parseTriples(triples, ItemType_1["default"].Collection);
        obj = obj[Object.keys(obj)[0]];
        var manages = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#manages") ? obj["http://www.w3.org/ns/hydra/core#manages"] : [];
        var members = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#member") ? obj["http://www.w3.org/ns/hydra/core#member"] : [];
        var totalItems = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#totalItems") ? Number(obj["http://www.w3.org/ns/hydra/core#totalItems"]) : NaN;
        var view = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#view") ? obj["http://www.w3.org/ns/hydra/core#view"] : [];
        try {
            var result = new Collection_1["default"](manages, totalItems, members, view);
            return result;
        }
        catch (err) {
            throw err;
        }
    };
    TripleParser.prototype.parseMember = function (triples) {
        var result = triples;
        return result;
    };
    return TripleParser;
}());
exports["default"] = TripleParser;
