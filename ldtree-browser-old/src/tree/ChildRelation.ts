import RelationType from "./RelationType";
import Node from './Node';
import TreeFetcher from "../fetch/TreeFetcher";

export default class ChildRelation {

    private readonly children: Array<string>;
    private readonly relationTypes: Array<RelationType>;

    /**
     * Constructor for the ChildRelations.
     * @param children - Child nodes of this relation.
     * @param relationTypes - Relation type of this relation.
     */
    public constructor(children: Array<string>, relationTypes: Array<RelationType>) {
        if (children.length < 1 || relationTypes.length < 1) {
            throw "Invalid childrelation";
        }
        this.children = children;
        this.relationTypes = relationTypes;
    }

    /** 
     * Fetches the children from the cache and returns them (children might not be fully loaded)
    */
    public async getChildren(): Promise<Array<Node>> {
        let fetcher = TreeFetcher.getInstance();
        let result = [];
        for (let i = 0; i < this.children.length; i++) {
            let node = await fetcher.getNode(this.children[i]);
            result.push(node);
        }

        return result;
    }

    /** 
     * returns the relation type
    */
    public getRelationType(): Array<RelationType> {
        return this.relationTypes;
    }

}