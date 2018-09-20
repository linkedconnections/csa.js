import SearchTreeQuery from './SearchTreeQuery';
import Condition from '../condition/Condition';
import Session from '../Session';
import Node from '../tree/Node';
import ChildRelation from '../tree/ChildRelation';
import OrCondition from '../condition/OrCondition';
import StringContainedCondition from '../condition/StringContainedCondition';
import StringContainsCondition from '../condition/StringContainsCondition';
import LocationContainedCondition from "../condition/LocationContainedCondition";
import LocationContainedEmitCondition from '../condition/LocationContainedEmitCondition';

export default class LocationQuery extends SearchTreeQuery{
    followcondition: Condition;

    constructor(locationString: string)
        {
            super(new LocationContainedEmitCondition(locationString), new LocationContainedCondition(locationString));
        }
}

