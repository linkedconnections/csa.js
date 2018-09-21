import Condition from './Condition';
import ChildRelation from '../tree/ChildRelation';
import Node from '../tree/Node';
import RelationType from '../tree/RelationType';
import * as terraformer from 'terraformer'
import * as terraformerparser from 'terraformer-wkt-parser'
import {Primitive} from "terraformer";
import {GeoJsonObject, GeometryObject} from "geojson";
import FollowCondition from './FollowCondition';

export default class KNNCondition implements FollowCondition {

    nodeprimitivepoly: Primitive<GeoJsonObject>;
    nodepoly: GeometryObject;

    constructor(long: string, lat: string){
    }

    check_condition(node:Node, relation:ChildRelation, child:Node, nodeContext) {
        return true;
    }
}