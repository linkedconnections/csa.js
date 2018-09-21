const ldfetch = require('ldfetch');
import URL = require('url');

/** 
 * This class handles fetching the data and turning it into triples using the ldfetch package.
*/
export default class TripleFetcher {

    private fetch;

    constructor(fetch?: any) {
        if (fetch === undefined) {
            this.fetch = new ldfetch({});
        } else {
            this.fetch = fetch;
        }
    }

    /**
     * This method fetches the triples in the file (id), and bundles them by subject.
     * @param id 
     */
    public getTriplesBySubject(id: string): Array<object> {
        let parsed = URL.parse(id);
        let url = parsed.href.replace(parsed.hash, '').replace(parsed.search, '');

        return this.fetch.get(url).then((triples) => {
            let result = {};

            triples.triples.forEach((triple) => {
                this.expandBlankNodes(triple, url);

                let key = triple.subject.value;

                if (! result.hasOwnProperty(key)) {
                    result[key] = [];
                }

                result[key].push(triple);
            });
            
            return result;
        });
    }

    private expandBlankNodes(triple, url: string) {
        if (triple.subject.value.slice(0,2) === "_:") {
            triple.subject.value = `${url}#${triple.subject.value.substring(1)}`;
        }

        if (triple.object.value.slice(0,2) === "_:") {
            triple.object.value = `${url}#${triple.object.value.substring(1)}`;
        }
    }

}