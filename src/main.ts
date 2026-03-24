import ddl from "../create-tables.sql?raw";
import db from "./model/connection.ts";
import CashierController from "./controller/cashier-controller.ts";


db().exec(ddl);

new CashierController();