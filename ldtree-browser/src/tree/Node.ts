import ChildRelation from "./ChildRelation";
import TreeFetcher from "../fetch/TreeFetcher";

export default class Node {

    readonly value: any;
    childRelations: Array<string>;
    members: Array<string>;
    totalItems: number;
    readonly id: string;

    fullyloaded: boolean;

    /**
     * Node constructor
     * @param id 
     * @param value 
     * @param childRelations - Relations with the child.
     * @param members - Data objects contained by the node.
     * @param totalItems - Amount of nodes underneath this node in the tree.
     */
    public constructor(id: string, value: any, childRelations: Array<string>, members: Array<string>, totalItems: number) {
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

    public getId(): string {
        return this.id;
    }

    public getValue(): any {
        return this.value;
    }

    /** 
     * Dependent on if the node was fully loaded, this can cause a fetch for a new page.
    */
    public async getChildRelations(): Promise<Array<ChildRelation>> {
        let fetcher = TreeFetcher.getInstance();
        let result = [];

        if (this.childRelations.length === 0){
            if (this.fullyloaded === false){
                await fetcher.fillNode(this);
                return this.getChildRelations();
            } else {
                return []
            }
        } else {
            for (let i = 0; i < this.childRelations.length; i++) {
                let node = await fetcher.getChildRelation(this.childRelations[i]);
                result.push(node);
            }
    
            return result;
        }        
    }

    /** 
     * Dependent on if the node was fully loaded, this can cause a fetch for a new page.
    */
    public async getMembers(): Promise<Array<Array<object>>> {
        let fetcher = TreeFetcher.getInstance();
        let result = [];

        if (this.members.length === 0){
            if (this.fullyloaded === false){
                await fetcher.fillNode(this);
                return this.getMembers();
            } else {
                return []
            }
        } else {
            for (let i = 0; i < this.members.length; i++) {
                let node = await fetcher.getMember(this.members[i]);
                result.push(node);
            }
        }

        return result;
    }

    /** 
     * Returns total amount of nodes underneath this node in the tree.
    */
    public async getTotalItems(): Promise<number> {

        if (this.totalItems === undefined || this.totalItems === null){
            if (this.fullyloaded === false){
                let fetcher = TreeFetcher.getInstance();
                await fetcher.fillNode(this);
                return this.totalItems
            } else {
                return 0
            }
        } else {
           return this.totalItems;
        }
    }

    /**
     * Copies info from other node.
     * @param node - other node
     */
    public copyInfo(node){
        // id and value are already set.
        // The fullyloaded parameter is set in the calling method.
        this.childRelations = node.childRelations
        this.members = node.members
        this.totalItems = node.totalItems
        this.fullyloaded = node.fullyloaded 
    }

    /**
     * Sets the flag of the node being fully loaded (not provided in an other fragment as child without all data)
     * @param loaded 
     */
    public setFullyLoaded(loaded: boolean){
        this.fullyloaded = loaded;
    }

    /** 
     * Checks node on being fully loaded
    */
    public isFullyLoaded(){
        return this.fullyloaded;
    }
}