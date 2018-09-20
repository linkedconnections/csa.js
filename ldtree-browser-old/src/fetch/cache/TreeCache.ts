import LRU = require('lru-cache');
import Node from "../../tree/Node";
import ChildRelation from "../../tree/ChildRelation";
import Collection from "../../tree/Collection";
import TripleParser from "../helpers/TripleParser";
import TripleFetcher from "../helpers/TripleFetcher";

export default class TreeCache {

    private tripleCache: LRU.Cache<string, Array<object>>;
    private parser: TripleParser;
    private fetcher: TripleFetcher;
    private runningPromises;
    private notFullyLoadedIds = new Set()

    /**
     * Constructor of the TreeCache object.
     * @param maxSubjects - Max amount of id's saved in the cache
     * @param maxAge - Max age of items in the cache (ms)
     */
    public constructor(maxSubjects?: number, maxAge?: number) {
        if (maxSubjects === undefined) {
            maxSubjects = 10000;
        }

        if (maxAge === undefined) {
            maxAge = 1000 * 300; // 5 min
        }

        // Initialize parser and fetcher
        this.parser = new TripleParser();
        this.fetcher = new TripleFetcher();

        // Create the cache object.
        this.tripleCache = new LRU<string, Array<object>>({
            max: maxSubjects,
            maxAge: maxAge,
        });

        // RunningPromises are the currently running fetches.
        this.runningPromises = {};
    }

    public async getNode(id: string): Promise<Node> {
        // await this.awaitPromises(id)
        // console.log("getting node", id)
        let found = this.tripleCache.peek(id);

        if (!found){
            this.runningPromises[id.split("#")[0]] = true
            let triples = await this.fetchTriples(id);
            delete this.runningPromises[id.split("#")[0]]
            // this.runningPromises.push(triples);
            let result = this.parser.parseNode(await triples, id);
            // set if a node is fully loaded
            result.setFullyLoaded(true);

            delete this.runningPromises[id.split("#")[0]]
            return result;
        } else {
            let triples = this.tripleCache.get(id);
            try {
                let result = this.parser.parseNode(triples, id);
                // set if a node is fully loaded
                result.setFullyLoaded(! this.notFullyLoadedIds.has(id));
                return result
            } catch (err) {
                this.runningPromises[id.split("#")[0]] = true
                let triples = await this.fetchTriples(id);
                delete this.runningPromises[id.split("#")[0]]
                // this.runningPromises.push(triples);
                let result = this.parser.parseNode(await triples, id);
                // set if a node is fully loaded
                result.setFullyLoaded(true);
                return result;
            }
        }
    }

    public async getMember(id: string): Promise<Array<object>> {
        // await this.awaitPromises(id)
        let found = this.tripleCache.peek(id);

        if (!found){
            let triples = await this.checkRunningOrExecute(id)
            // this.runningPromises[id.split("#")[0]] = true
            // let triples = await this.fetchTriples(id);
            // delete this.runningPromises[id.split("#")[0]]
            // this.runningPromises.push(triples);
            return this.parser.parseMember(triples);
        } else {
            let triples = this.tripleCache.get(id);
            try {
                let result = this.parser.parseMember(triples);
                return result
            } catch (err) {
                // this.runningPromises[id.split("#")[0]] = true
                // let triples = await this.fetchTriples(id);
                // delete this.runningPromises[id.split("#")[0]]
                // // this.runningPromises.push(triples);
                let triples = await this.checkRunningOrExecute(id)
                return this.parser.parseMember(await triples);
            }
        }
    }

    public async getChildRelation(id: string): Promise<ChildRelation> {
        // await this.awaitPromises(id)
        let found = this.tripleCache.peek(id);

        if (!found){
            this.runningPromises[id.split("#")[0]] = true
            let triples = await this.fetchTriples(id);
            delete this.runningPromises[id.split("#")[0]]
            // this.runningPromises.push(triples);
            return this.parser.parseChildRelation(await triples);
        } else {
            let triples = this.tripleCache.get(id);
            try {
                let result = this.parser.parseChildRelation(triples);
                return result
            } catch (err) {
                this.runningPromises[id.split("#")[0]] = true
                let triples = await this.fetchTriples(id);
                delete this.runningPromises[id.split("#")[0]]
                // this.runningPromises.push(triples);
                return this.parser.parseChildRelation(await triples);
            }
        }
    }

    public async getCollection(id: string): Promise<Collection> {
        // await this.awaitPromises(id)
        let found = this.tripleCache.peek(id);

        if (!found){
            this.runningPromises[id.split("#")[0]] = true
            let triples = await this.fetchTriples(id);
            delete this.runningPromises[id.split("#")[0]]
            // this.runningPromises.push(triples);
            return this.parser.parseCollection(await triples);
        } else {
            let triples = this.tripleCache.get(id);
            try {
                let result = this.parser.parseCollection(triples);
                return result
            } catch (err) {
                this.runningPromises[id.split("#")[0]] = true
                let triples = await this.fetchTriples(id);
                delete this.runningPromises[id.split("#")[0]]
                // this.runningPromises.push(triples);
                return this.parser.parseCollection(triples);
            }
        }
    }

    public async fillNode(node: Node){
        // await this.awaitPromises(node.id)
        // Check if state has changed after all runnning processes have finished
        if (node.fullyloaded === true){ 
            return node;
        }
        this.runningPromises[node.id.split("#")[0]] = true
        let triples = this.fetchTriples(node.getId());
        delete this.runningPromises[node.id.split("#")[0]]
        // this.runningPromises.push(triples);
        let result = await this.parser.parseNode(await triples, node.getId());
        // set if a node is fully loaded
        result.setFullyLoaded(true);
        node.copyInfo(result)
        return node;
    }

    runningQuerys = {}
    private async checkRunningOrExecute(id){
        let baseid = id.split("#")[0]
        if (this.runningQuerys.hasOwnProperty(baseid)){
            await this.runningQuerys[baseid];
            let result = this.tripleCache.get(id);
            if (result === null || result === undefined){
               return this.checkRunningOrExecute(id);
            } 
            return result 
        } else {
            let triples = this.fetchTriples(id);
            this.runningQuerys[baseid] = triples;
            let solvedtriples = await triples
            delete this.runningQuerys[baseid]
            return solvedtriples;
        }
    }

    // Use flag to indicate nodes that are not from this fragment and may therefore be not completely loaded
    private async fetchTriples(id: string): Promise<Array<Object>> {
        let result = undefined;
        let triples = await this.fetcher.getTriplesBySubject(id);
        if (triples === undefined || triples === null){
            throw "id " + id + " could not be parsed successfully";
        }
        let keys = Object.keys(triples);
        keys.forEach((key) => {
            if (key.split("#")[0] === id.split("#")[0]) {
                if (id === key) {
                    result = triples[key];
                }
                this.tripleCache.set(key, triples[key]);
            } else {
                if (! this.tripleCache.peek(key)){
                    this.notFullyLoadedIds.add(key)
                    this.tripleCache.set(key, triples[key]);
                } else {
                    console.log(key, "already present")
                }
            }
        });
        return result;
    }

   
}
