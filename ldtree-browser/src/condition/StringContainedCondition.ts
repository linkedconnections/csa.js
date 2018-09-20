import Condition from './Condition';
import ChildRelation from '../tree/ChildRelation';
import Node from '../tree/Node';
import FollowCondition from './FollowCondition';

export default class StringContainedCondition implements FollowCondition {
    check_condition(node:Node, relation:ChildRelation, child:Node, nodeContext) {
        if (nodeContext["searchstring"] != "" && child.getValue().startsWith(nodeContext["searchstring"])){
            return true;
        } 
        return false; 
    }
}