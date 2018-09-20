"use strict";
exports.__esModule = true;
var ldfetch = require('ldfetch');
var URL = require("url");
/**
 * This class handles fetching the data and turning it into triples using the ldfetch package.
*/
var TripleFetcher = /** @class */ (function () {
    function TripleFetcher(fetch) {
        if (fetch === undefined) {
            this.fetch = new ldfetch({});
        }
        else {
            this.fetch = fetch;
        }
    }
    /**
     * This method fetches the triples in the file (id), and bundles them by subject.
     * @param id
     */
    TripleFetcher.prototype.getTriplesBySubject = function (id) {
        var _this = this;
        var parsed = URL.parse(id);
        var url = parsed.href.replace(parsed.hash, '').replace(parsed.search, '');
        return this.fetch.get(url).then(function (triples) {
            var result = {};
            triples.triples.forEach(function (triple) {
                _this.expandBlankNodes(triple, url);
                var key = triple.subject.value;
                if (!result.hasOwnProperty(key)) {
                    result[key] = [];
                }
                result[key].push(triple);
            });
            return result;
        });
    };
    TripleFetcher.prototype.expandBlankNodes = function (triple, url) {
        if (triple.subject.value.slice(0, 2) === "_:") {
            triple.subject.value = url + "#" + triple.subject.value.substring(1);
        }
        if (triple.object.value.slice(0, 2) === "_:") {
            triple.object.value = url + "#" + triple.object.value.substring(1);
        }
    };
    return TripleFetcher;
}());
exports["default"] = TripleFetcher;
