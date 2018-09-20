import Condition from './Condition';
import ChildRelation from '../tree/ChildRelation';
import Node from '../tree/Node';
import FollowCondition from './FollowCondition';

export default class StringContainsCondition implements FollowCondition {
    check_condition(node:Node, relation:ChildRelation, child:Node, nodeContext) {
        if (nodeContext["searchstring"] != "" && nodeContext["searchstring"].startsWith(child.getValue())){
            return true;
        } 
        return false; 
    }
}