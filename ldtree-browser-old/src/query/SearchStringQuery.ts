import Condition from '../condition/Condition';
import StringContainsCondition from '../condition/StringContainsCondition';
import Session from '../Session';
import Node from '../tree/Node';
import OrCondition from '../condition/OrCondition';
import StringContainedCondition from '../condition/StringContainedCondition';
import Query from './Query';
import EmitCondition from '../condition/EmitCondition';
import FollowCondition from '../condition/FollowCondition';
import SearchCompletedCondition from '../condition/SearchCompletedCondition';

export default class SearchStringQuery extends Query{
    searchstring: string;
    emitCondition: EmitCondition;
    followCondition: FollowCondition;

    constructor(searchstring){
        super();
        this.searchstring = searchstring;
        this.emitCondition = new SearchCompletedCondition();
        this.followCondition = new OrCondition(new StringContainedCondition(), new StringContainsCondition());
    }

    async query(): Promise<Session> {
        let toRemove = []
        for (var i = 0; i < this.session.nodes.length; i++){
            // We look at every node in the session for a string match.
            if(this.session.context[i]["searchstring"] === undefined || this.session.context[i]["searchstring"] === null){
                // We initialize a context for this query if it was nonexistent.
                this.session.context[i]["searchstring"] = this.searchstring
                this.session.context[i]["leftoverstring"] = "";
            } else {
                // This session had already been queried and contains a context.
                if (this.session.context[i]["leftoverstring"] === ""){
                    // Last query matched the full node string.
                    this.session.context[i]["searchstring"] = this.searchstring
                } else {
                    // Last query did not match the full node string.
                    if (this.searchstring.startsWith(this.session.context[i]["leftoverstring"])){
                        this.session.context[i]["searchstring"] = this.searchstring.slice(this.session.context[i]["leftoverstring"].length);
                        this.session.context[i]["leftoverstring"] = ""
                    } else if (this.session.context[i]["leftoverstring"].startsWith(this.searchstring)){
                        this.session.context[i]["leftoverstring"] = this.session.context[i]["leftoverstring"].slice(this.searchstring.length);
                        this.session.context[i]["searchstring"] = ""
                    } else {
                        // Not the needed letter / lettergroup was provided to proceed on this session node
                        toRemove.push(i);
                    }
                }
            
            }
        }
        // Remove indices reverse as to not distort the other indices that have to be deleted.
        for (var i = toRemove.length - 1; i >= 0 ; i--){
            this.session.nodes.splice(toRemove[i], 1)
            this.session.context.splice(toRemove[i], 1)
        }
        this.session["leafnodes"] = []
        this.session["leafcontext"] = []
        let session = await this.queryRecursive(this.session);
        return session;
    
    }

    async queryRecursive(session: Session): Promise<Session>{
        
        let followQueries = [];
        let followedChildren = new Array<any>();
        // Process every node in the session.
        for (var i = 0; i < session.size(); i++){
            let node = session.nodes[i];
            let currentContext = session.context[i];
            let children = this.processNode(session, node, currentContext)
            followQueries.push(children)
        }  

        // Await all nodes untill they have been processed
        Promise.all(followQueries)
        session.nodes = []
        session.context = []
        // Process all [node, childrel, child, nodeContext] pairs we received from the processNode function.
        for (var arr of followQueries){
            for (var nrccarray of await arr){
                let node: Node =  nrccarray[0]
                let childRelation =  nrccarray[1]
                let child: Node =  nrccarray[2]
                let nodeContext =  nrccarray[3]

                if (child.getValue().startsWith(nodeContext["searchstring"])){
                    // The searchstring is a substring of this child.
                    // We either have a complete or partial match with the rest of the substring and this child.
                    let rest = child.getValue().slice(nodeContext["searchstring"].length)
                    nodeContext["searchstring"] = ""
                    nodeContext["leftoverstring"] = rest;
                    session.nodes.push(child)
                    session.context.push(nodeContext)
                } else if (nodeContext["searchstring"].startsWith(child.getValue())){
                    // The child value is contained at the start of the rest of the substring.
                    // We remove this child value from the search string and continue searching from this child.
                    nodeContext["searchstring"] = nodeContext["searchstring"].slice(child.getValue().length)
                    nodeContext["leftoverstring"] = "";
                    session.nodes.push(child)
                    session.context.push(nodeContext)
                } 
            }
        }

        if (session.nodes.length == 0){
            // Clean session object
            session.nodes = session["leafnodes"]
            session.context = session["leafcontext"]
            delete session["leafnodes"]
            delete session["leafcontext"]
            return session;
        }

        return await this.queryRecursive(session);
        

    }

    // This method 
    async processNode(session, node, currentContext){
        let followedChildren = new Array<any>();
        if (this.emitCondition.check_condition(node, currentContext)){
            // This node can be emitted.
            let childRelations = await node.getChildRelations();
            this.emitMember(node);
            this.emitNode(node);
            session["leafnodes"].push(node);
            session["leafcontext"].push(currentContext);
            if (childRelations.length == 0){
                this.emit("leafnode", node);
            }
        }
        // Save all children that are fulfill the follow condition.
        for (var relation of await node.getChildRelations()){
            for (var child of await relation.getChildren()){
                if (this.followCondition.check_condition(node, relation, child, currentContext)){
                    followedChildren.push([node, relation, child, currentContext])
                }
            }
        }

        return followedChildren;
    }



}
