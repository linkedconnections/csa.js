import Condition from './Condition';

export default class OrCondition implements Condition{
    left: Condition;
    right: Condition;
    constructor(left:Condition, right:Condition){
        this.left = left;
        this.right = right;
    }
    check_condition(node, relation, child, nodeContext){
        return this.left.check_condition(node, relation, child, nodeContext) ||
         this.right.check_condition(node, relation, child, nodeContext);
    }
}