import ItemType from './ItemType';
import Node from "../../tree/Node";
import ChildRelation from "../../tree/ChildRelation";
import Collection from "../../tree/Collection";

/** 
 * This class handles the parsing of triple pattern fragments.
*/
export default class TripleParser {

    private singles;

    public constructor() {
        this.singles = new Set();
        this.singles.add("https://w3id.org/tree#value");
        this.singles.add("http://www.w3.org/ns/hydra/core#totalItems");
    }

    private parseTriples(triples: Array<object>, type:ItemType): object {
        if (type === ItemType.Member) {
            return triples;
        }

        let obj = {};

        for (let i = 0; i < triples.length; i++) {
            let triple = triples[i];
            // @ts-ignore
            let subject = triple.subject.value;
            // @ts-ignore
            let predicate = triple.predicate.value;
            // @ts-ignore
            let object = triple.object.value;

            this.addTriple(obj, subject, predicate, object, this.singles.has(predicate));
        }

        return obj;
    }

    private addTriple(obj, subject, predicate, object, single) {
        if (!obj.hasOwnProperty(subject)) {
            obj[subject] = {};
        }

        let sub = obj[subject];
        if (single) {
            sub[predicate] = object;
        } else {
            if (! sub.hasOwnProperty(predicate)) {
                sub[predicate] = []
            }
            sub[predicate].push(object);
        }
    }

    public parseNode(triples: Array<object>, nodeId): Node {
        let obj = this.parseTriples(triples, ItemType.Node);
        obj = obj[Object.keys(obj)[0]];

        let value = obj["https://w3id.org/tree#value"];

        let childRelations = obj.hasOwnProperty("https://w3id.org/tree#hasChildRelation") ? obj["https://w3id.org/tree#hasChildRelation"] : [];
        let members = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#member") ? obj["http://www.w3.org/ns/hydra/core#member"] : [];
        let totalItems = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#totalItems") ? Number(obj["http://www.w3.org/ns/hydra/core#totalItems"]) : NaN;

        try {
            let result = new Node(nodeId, value, childRelations, members, totalItems);
            return result
        } catch(err) {
            throw err;
        }

    }

    public parseChildRelation(triples: Array<object>): ChildRelation {
        let obj = this.parseTriples(triples, ItemType.ChildRelation);
        obj = obj[Object.keys(obj)[0]];

        let children = obj["https://w3id.org/tree#child"];
        let type = obj["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];

        try {
            let result = new ChildRelation(children, type);
            return result;
        } catch(err) {
            throw err;
        }
    }

    public parseCollection(triples: Array<object>): Collection {
        let obj = this.parseTriples(triples, ItemType.Collection);
        obj = obj[Object.keys(obj)[0]];

        let manages = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#manages") ? obj["http://www.w3.org/ns/hydra/core#manages"] : [];
        let members = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#member") ? obj["http://www.w3.org/ns/hydra/core#member"] : [];
        let totalItems = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#totalItems") ? Number(obj["http://www.w3.org/ns/hydra/core#totalItems"]) : NaN;
        let view = obj.hasOwnProperty("http://www.w3.org/ns/hydra/core#view") ? obj["http://www.w3.org/ns/hydra/core#view"] : [];

        try {
            let result = new Collection(manages, totalItems, members, view);
            return result;
        } catch(err) {
            throw err;
        }
    }

    public parseMember(triples: Array<object>): Array<object> {
        let result = triples;
        return result
    }

}