import Session from '../Session';
import Node from '../tree/Node';
import * as terraformer from 'terraformer';
import * as terraformerparser from 'terraformer-wkt-parser';
import TinyQueue = require('../tinyqueue/tinyqueue')
import {Primitive} from "terraformer";
import Query from './Query';

export default class KNNQuery extends Query{
    point;
    long;
    lat;
    queue;
    maxMinDist;
    emittedNodes = [];
    k;
    constructor(lat, long, k = 3)
        {
            super();
            this.point = new terraformer.Point(long, lat);
            this.k = k;
            this.long = long;
            this.lat = lat;
            this.maxMinDist = 0;
            let queue = new TinyQueue([], function (a, b) {
                return a.distance - b.distance;
            });
            
            this.queue = queue;
        }


        query(): Promise<Session> {
            return this.queryRecursive(this.session);
        }

        // This method returns an array of the form [ [node1, context1], [node2, context2], ... ]
        
        async queryRecursive(session):Promise<any>{
    
            let followed_children = [];
            let saved_nodes = new Array<any>();
    
            for (var i = 0; i < session.nodes.length; i++){
                let node: Node = session.nodes[i]
                try{
                    let queueObj = this.getQueueObject(node);
                    queueObj["distance"] = this.getDistance(queueObj);
                    if (queueObj["distance"] > this.maxMinDist){
                        this.maxMinDist = queueObj["distance"]
                    }
                    this.queue.push(queueObj)
                } catch (ex) {

                }
            }

            while (this.queue.length){
                let leafNode = true;
                let closestObj = this.queue.pop();
                for (var relation of await closestObj.node.getChildRelations()){
                    for (var child of await relation.getChildren()){
                        leafNode = false;
                        try{
                            let queueChild = this.getQueueObject(child);
                            queueChild["distance"] = this.getDistance(queueChild);
                            this.queue.push(queueChild);
                        } catch(ex) {

                        }
                    }
                }
                if (leafNode){
                    // Leaf node
                    this.emitNode(closestObj.node)
                    this.emitMember(closestObj.node)
                    this.emittedNodes.push(closestObj.node)
                    if (this.emittedNodes.length >= this.k){
                        return (new Session(this.emittedNodes))
                    } 
                }
            }
        
            return new Session([]);
        }


        getQueueObject(node){
            let nodepoly = terraformerparser.parse(node.getValue());
            let nodeprimitivepoly = new terraformer.Primitive(nodepoly)
            let entry = {}
            entry["node"] = node;
            entry["primitive"] = nodeprimitivepoly;
            let e = nodeprimitivepoly.envelope();
            entry["x"] = e.x
            entry["y"] = e.y
            entry["w"] = e.w
            entry["h"] = e.h
            return entry;
        }

        getDistance(queueObj){
            if (queueObj["primitive"].contains(this.point)){
                return 0;
            } else {
                return this.distancePointBox(this.long, this.lat, queueObj.x, queueObj.y, queueObj.x + queueObj.w, queueObj.y + queueObj.h)
            }
        }

        // Credits: https://codereview.stackexchange.com/questions/175566/compute-shortest-distance-between-point-and-a-rectangle
        distancePointBox(x, y, x_min, y_min, x_max, y_max) {
            if (x < x_min) {
                if (y <  y_min) return HYPOT(x_min-x, y_min-y);
                if (y <= y_max) return x_min - x;
                return HYPOT(x_min-x, y_max-y);
            } else if (x <= x_max) {
                if (y <  y_min) return y_min - y;
                if (y <= y_max) return 0;
                return y - y_max;
            } else {
                if (y <  y_min) return HYPOT(x_max-x, y_min-y);
                if (y <= y_max) return x - x_max;
                return HYPOT(x_max-x, y_max-y);
            }
        }
    }

function HYPOT(x, y) { return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))}
    
    

