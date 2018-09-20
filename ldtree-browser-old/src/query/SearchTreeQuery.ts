import Condition from "../condition/Condition";
import Query from './Query';
import Session from '../Session';
import Node from '../tree/Node';
import EmitCondition from '../condition/EmitCondition';
import FollowCondition from '../condition/FollowCondition';

/** 
 * Generic implementation of a query for search trees.
*/
export default abstract class SearchTreeQuery extends Query{
    emitCondition: Condition;
    followCondition: Condition;
    nodeContext;
    nodeContextUpdateAction;

    /**
     * 
     * @param emitCondition - Condition to emit a node.
     * @param followCondition - Condition to continue querying on the passed child.
     */
    constructor(emitCondition: EmitCondition, followCondition: FollowCondition ){
        super();
        this.emitCondition = emitCondition;
        this.followCondition = followCondition;
    }

    /** 
     * Overwritten base query method.
    */
    async query(){
        // Set the context of the nodes.
        if (this.session["context"] === undefined || this.session["context"] === null){
            if (this.nodeContext === undefined || this.nodeContext === null){
                this.session["context"] = new Array(this.session.nodes.length);
            } else {
                this.session["context"] = this.nodeContext
            }
        }

        this.session["leafnodes"] = []
        this.session["leafcontext"] = []
        this.session = await this.queryRecursive(this.session);

        //TODO:: put the nodes in the nodelist on top of the starting nodes they originate from and return like this as new state for the session. -> not implemented.
        
        this.session.nodes = this.session["leafnodes"]
        this.session.context = this.session["leafcontext"]
        delete this.session["leafnodes"]
        delete this.session["leafcontext"]

        return this.session;
    }


    // This method returns an array of the form [ [node1, context1], [node2, context2], ... ]
    async queryRecursive(session):Promise<any>{

        let followedChildren = new Array<any>();
        for (var i = 0; i < session.size(); i++){
            let node = session.nodes[i]
            let currentContext = session.context[i];
            if (this.emitCondition.check_condition(node, currentContext)){
                let childRelations = await node.getChildRelations();
                this.emitMember(node);
                this.emitNode(node);
                if (childRelations.length == 0){
                    // We are in a leaf node.
                    session["leafnodes"].push(node)
                    session["leafcontext"].push(currentContext)
                    this.emit("leafnode", node)
                }
            }
            for (var relation of await node.getChildRelations()){
                for (var child of await relation.getChildren()){
                    if (this.followCondition.check_condition(node, relation, child, currentContext)){
                        followedChildren.push([node, relation, child, currentContext])
                    }
                }
            }
        }   


        for (var nrccarray of followedChildren){
            if (this.nodeContextUpdateAction != null && [nrccarray[3]] != null){
                nrccarray[3] = this.nodeContextUpdateAction(nrccarray[0], nrccarray[1], nrccarray[2], nrccarray[3]);
            }
        }

        if (followedChildren.length == 0){
            return session;
        }

        session.nodes = []
        session.context = []
        for (var nrccarray of followedChildren){
            session.nodes.push(nrccarray[2])
            session.context.push(nrccarray[3])
        }
        return await this.queryRecursive(session);

    }
}

