import  { PGlite } from "@electric-sql/pglite";


// Create a new PGlite database instance using IndexedDB as the storage backend
const pgliteDb = await PGlite.create('idb://2452-pos');

export default function db(){
    
    return pgliteDb;
}