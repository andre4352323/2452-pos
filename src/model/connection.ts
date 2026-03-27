import  { PGlite } from "@electric-sql/pglite";
import ddl from "../../create-tables.sql?raw";

let src = import.meta.env.VITE_DATABASE_URL;

// Create a new PGlite database instance using IndexedDB as the storage backend
const pgliteDb = await PGlite.create(src);

if (src == "memory://") {

    db().exec(ddl);
}

export default function db(){
    
    return pgliteDb;
}