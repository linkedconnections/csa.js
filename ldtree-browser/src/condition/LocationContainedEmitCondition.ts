import Condition from './Condition';
import ChildRelation from '../tree/ChildRelation';
import Node from '../tree/Node';
import RelationType from '../tree/RelationType';
import * as terraformer from 'terraformer'
import * as terraformerparser from 'terraformer-wkt-parser'
import {Primitive} from "terraformer";
import { GeoJsonObject, GeometryObject } from 'geojson';
import FollowCondition from './FollowCondition';
import EmitCondition from './EmitCondition';

export default class LocationContainedEmitCondition implements EmitCondition {

    nodeprimitivepoly: Primitive<GeoJsonObject>;
    nodepoly: GeometryObject;

    constructor(polygonwktstring: string){
        this.nodepoly = terraformerparser.parse(polygonwktstring);
        this.nodeprimitivepoly = new terraformer.Primitive(this.nodepoly)
    }

    check_condition(node:Node, nodeContext) {
        try{
            let childpoly = terraformerparser.parse(node.getValue());
            let childprimitivepoly = new terraformer.Primitive(childpoly)
            return (this.nodeprimitivepoly.contains(childpoly) || this.nodeprimitivepoly.intersects(childpoly) || childprimitivepoly.contains(this.nodepoly))

        } catch(err){
            return false;
        }
    }
}