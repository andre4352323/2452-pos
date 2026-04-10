import ddl from "../create-tables.sql?raw";
import modelCsv from "../model.csv?raw";
import db from "./model/connection.ts";
import CashierController from "./controller/cashier-controller.ts";
import seedrandom from 'seedrandom';

var rng = seedrandom("walter");
export default rng;

console.log(rng());
console.log(rng()); 
console.log(rng()); 

db().exec(ddl);
export const matrix: number[][] = modelCsv.trim().split("\n").map(row => row.split(",").map(Number));

new CashierController();
