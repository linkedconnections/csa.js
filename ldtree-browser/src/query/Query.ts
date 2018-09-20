import EventEmitter = require('events');
import Session from '../Session';
import Node from '../tree/Node';

// This is the query abstract class template
// A query consists of a session on which it is executed,
export default abstract class Query extends EventEmitter{

    session: Session;

    /**
     * Sets the session object that is used throughout the query.
     * @param session - 
     */
    set_session(session: Session){
        this.session = session;
    }

    /**
     * This method is called to execute the query;
     */
    abstract async query(): Promise<Session>;

    /**
     * All members of the passed node are emitted.
     * @param node 
     */
    async emitMember(node: Node){
        let members = await node.getMembers();
        for (var member of members){
            if (member === null || member === undefined){

                console.log("THIS", member)
                console.log(node)
                console.log(members)
            }
            if (Object.keys(member).length !== 0){
                this.emit("member", member)
            }
        }
    }  
    /**
     * The node itself is emitted.
     * @param node 
     */
    async emitNode(node){
        this.emit("node", node)
    }
}