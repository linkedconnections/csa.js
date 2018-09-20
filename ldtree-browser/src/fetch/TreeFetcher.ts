import Node from "../tree/Node";
import ldfetch = require('ldfetch');
import Collection from "../tree/Collection";
import TreeCache from "./cache/TreeCache";
import ChildRelation from "../tree/ChildRelation";

/**
 * Class used to fetch tree nodes and members
 */
export default class TreeFetcher {

    private static instance: TreeFetcher;

    private treeCache: TreeCache;
    private fetch;

    private constructor (maxSubjects?: number, maxAge?: number) {
        // Create node cache
        this.treeCache = new TreeCache(maxSubjects, maxAge);
        this.fetch = new ldfetch({});
    }

    public async getNode(id: string): Promise<Node> {
        return this.treeCache.getNode(id);
    }

    public async getMember(id: string): Promise<object> {
        return this.treeCache.getMember(id);
    }

    public async getCollection(id: string): Promise<Collection> {
        return this.treeCache.getCollection(id);
    }

    public async getChildRelation(id: string): Promise<ChildRelation> {
        return this.treeCache.getChildRelation(id);
    }

    public async fillNode(node: Node){
        return await this.treeCache.fillNode(node);
    }

    public static getInstance(maxSubjects?: number, maxAge?: number) {
        if (!TreeFetcher.instance) {
            TreeFetcher.instance = new TreeFetcher(maxSubjects, maxAge);
        }
        return TreeFetcher.instance;
    }

}