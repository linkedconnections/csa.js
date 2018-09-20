import Session from './Session';
import Collection from "./tree/Collection";
import Query from "./query/Query";
import TreeFetcher from "./fetch/TreeFetcher";

// TODO: keep some kind of state for backpropagation

/**
 * Used to create sessions and query them, has an internal node cache and is used to fetch nodes and execute queries
 */
export default class TreeClient {

    private collections: { [key:string]:Collection; };

    public constructor (maxSubjects?: number, maxAge?: number) {
        this.collections = {};
        // Set cache size of tree fetcher
        TreeFetcher.getInstance(maxSubjects, maxAge);
    }

    /**
     * Add a collection to the tree to search on.
     * @param url - Url of the collection to add.
     */
    public async addCollection(url: string): Promise<void> {
        // Request and parse
        let collection = await TreeFetcher.getInstance().getCollection(url);
        this.collections[url] = collection;
    }

    /**
     * Remove a collection from the searches.
     * @param url - Url of the collection to delete.
     */
    public deleteCollection(url: string): void {
        delete this.collections[url];
    }

    /** 
     * create a new session starting at the root nodes of the provided collections.
    */
    private async createSession(): Promise<Session> {
        let nodes = [];
        let keys = Object.keys(this.collections);

        for (let i = 0; i < keys.length; i++) {
            let collectionNodes = await this.collections[keys[i]].getViews();
            nodes = nodes.concat(collectionNodes);

        }

        let session = new Session(nodes);
        return session;
    }

    /**
     * 
     * @param query - The query to execute.
     * @param session - The session to execute the query on. If none given the root nodes of the collections are used as a new Session.
     */
    public async executeQuery(query: Query, session: Session = null) {

        
        // TODO: Pass fetcher to query
        if (session === null){
            session = await this.createSession();
        }

        query.set_session(session);
        return query.query();
        
        
    }

}