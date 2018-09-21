import Condition from './Condition';
import ChildRelation from '../tree/ChildRelation';
import Node from '../tree/Node';
import FollowCondition from './FollowCondition';
import EmitCondition from './EmitCondition';

export default class StringContainedEmitCondition implements EmitCondition {
    flag:string = "";
    check_condition(node:Node, nodeContext) {
        if (node.getValue().startsWith(nodeContext)){
            return true;
        } 
        return false; 
    }
}