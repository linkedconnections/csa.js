import ContextUpdater from './contextUpdater';
import Node from '../tree/Node';
export default class StringSearchContextUpdater implements ContextUpdater {
   
    newsearchstring: string;
    constructor(newsearchstring){
        this.newsearchstring = newsearchstring;
    }

    updateContext(node: Node, context: any) {
        context.searchstring = context.leftoverstring + this.newsearchstring;
    }
}