import Node from "./tree/Node";
import ContextUpdater from './contextUpdater/contextUpdater';

export default class Session {

    nodes: Array<Node>;
    context: Array<Object>;

    /**
     * The Session object is an object that keeps track of the current state of a query and its locations in the searchtrees.
     * Multiple nodes of multiple searchtrees can be passed to this object.
     * A query can be executed on this state using the TreeClient.executeQuery(query, session);
     * Session objects are changed upon query execution.s
     * @param nodes - The starting nodes of the session
     */
    public constructor(nodes: Array<Node>) {
        this.nodes = nodes;
        if (this.context === undefined || this.context === null){this.context = []}
        for (var i = 0; i < nodes.length; i++){
            this.context.push({})
        }
    }

    isEmpty(): boolean {
        return this.nodes.length == 0;
    }

    size() {
        return this.nodes.length;
    }

    getNodes(): Array<Node>{
        return this.nodes;
    }

    getMembers(){
        let members = []
        this.nodes.forEach(async element => {
            let m = await element.getMembers()
            m.forEach(a => {
                members.push(a)    
            });
        });
        return members
    }

    getChildRelations(){
        let members = []
        this.nodes.forEach(async element => {
            let m = await element.getChildRelations()
            m.forEach(a => {
                members.push(a)    
            });
        });
        return members
    }


}