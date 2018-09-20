import Condition from './Condition';
import ChildRelation from '../tree/ChildRelation';
import Node from '../tree/Node';
import FollowCondition from './FollowCondition';
import EmitCondition from './EmitCondition';

export default class StringContainsEmitCondition implements EmitCondition {
    check_condition(node:Node, nodeContext) {
        if (nodeContext.startsWith(node.getValue())){
            return true;
        } 
        return false; 
    }
}