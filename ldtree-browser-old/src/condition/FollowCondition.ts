import Condition from './Condition';

export default interface FollowCondition extends Condition {
    check_condition(node, relation, child, nodeContext): boolean;
}