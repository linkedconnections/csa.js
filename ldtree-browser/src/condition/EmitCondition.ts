import Condition from './Condition';

export default interface EmitCondition extends Condition {
    check_condition(node, nodeContext): boolean;
}