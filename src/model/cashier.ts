import { assert } from "../assertions.ts";
import db from "./connection.ts";
import { hashPassword } from "./hash.ts";

export default class Cashier {

    #username: string;
    #password: string;

    constructor(username: string, password: string) {
        this.#username = username;
        this.#password = password;
        this.#checkCashier();
    }

    static async getAllCashiers(): Promise<Array<Cashier>> {
        const allCashiers = new Array<Cashier>();
        const results = await db()
            .query<{ username: string, password: string }>(
                "select username, password from cashier_catalog"
            );
        for (const row of results.rows) {
            allCashiers.push(new Cashier(row.username, row.password));
        }
        return allCashiers;
    }

    // saves to cashier_catalog 
    static async saveCashier(cashier: Cashier): Promise<Cashier> {
        const hashed = await hashPassword(cashier.#password);

        await db().query(
            "insert into cashier_catalog(username, password) values($1, $2) on conflict do nothing",
            [cashier.#username, hashed]
        );
        await db().query(
            "insert into cashier(username, password) values($1, $2) on conflict do nothing",
            [cashier.#username, hashed]
        );
        return cashier;
    }

    // hashes the given password and compares against the stored hash
    static async findCashier(username: string, password: string): Promise<Cashier | null> {
        const hashed = await hashPassword(password);

        const result = await db()
            .query<{ username: string, password: string }>(
                "select username, password from cashier_catalog where username = $1 and password = $2",
                [username, hashed]
            );
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        const cashier = new Cashier(row.username, row.password);

        await db().query(
            "insert into cashier(username, password) values($1, $2) on conflict do nothing",
            [row.username, row.password]
        );

        return cashier;
    }

    static async usernameExists(username: string): Promise<boolean> {
        const result = await db()
            .query<{ username: string }>(
                "select username from cashier_catalog where username = $1",
                [username]
            );
        return result.rows.length > 0;
    }

    #checkCashier() {
        assert(this.#username.length >= 1, "Cashier username should be at least 1 character long");
        assert(this.#password.length >= 1, "Cashier password should be at least 1 character long");
    }

    get username() {
        return this.#username;
    }
}

export class InvalidCashierUsernameException extends Error {}
export class InvalidCashierPasswordException extends Error {}
export class CashierAlreadyExistsException extends Error {}
export class CashierNotFoundException extends Error {}