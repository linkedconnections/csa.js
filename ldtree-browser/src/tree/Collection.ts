import TreeFetcher from "../fetch/TreeFetcher";
import Node from "./Node";

export default class Collection {

    private readonly manages: Array<string>;
    private readonly totalItems: number;
    private readonly members: Array<any>;
    private readonly views: Array<string>;

    public constructor(manages: Array<string>, totalItems: number, members: Array<any>, views: Array<string>) {
        if (views.length < 1) {
            throw "Invalid collection";
        }

        this.manages = manages;
        this.totalItems = totalItems;
        this.members = members;
        this.views = views;
    }

    public getManaged(): Array<string> {
        return this.manages;
    }

    public getTotalItems(): number {
        return this.totalItems;
    }

    public getMembers(): Array<any> {
        return this.members;
    }

    public async getViews(): Promise<Array<Node>> {
        let fetcher = TreeFetcher.getInstance();
        let nodes = [];

        for (let i = 0; i < this.views.length; i++) {
            let node = await fetcher.getNode(this.views[i]);
            nodes.push(node);
        }
        return nodes;
    }

}