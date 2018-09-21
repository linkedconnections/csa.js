import EmitCondition from './EmitCondition';
import Node from '../tree/Node';
export default class SearchCompletedCondition implements EmitCondition {
    check_condition(node:Node,  nodeContext) {
        if (nodeContext["searchstring"] === ""){
            return true;
        }
        return false; 
    }
}