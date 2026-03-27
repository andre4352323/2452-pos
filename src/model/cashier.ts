import { assert } from "../assertions.ts";
import db from "./connection.ts";
import { hashPassword } from "./hash.ts";

/**
 * Represents a cashier that can be persisted, authenticated,
 * and retrieved from the database
 */
export default class Cashier {

    #username: string;
    #password: string;

    /**
     * Creates a cashier with the given username and password.
     * Performs basic validation immediately
     *
     * @param username the cashier login name
     * @param password the cashier plain-text password
     */
    constructor(username: string, password: string) {

        this.#username = username;
        this.#password = password;

        if (this.#username.length < 1)
            throw new InvalidCashierUsernameException();

        if (this.#password.length < 1)
            throw new InvalidCashierPasswordException();

        this.#checkCashier();
    }

    /**
     * Verifies that the cashier instance meets minimum requirements
     * Called internally by the constructor
     */
    #checkCashier(): void {

        assert(
            this.#username.length >= 1,
            "Username must be at least 1 character"
        );
        assert(
            this.#password.length >= 1,
            "Password must be at least 1 character"
        );
    }

    /**
     * Persists this cashier to the database
     * Called by the controller during registration
     *
     * @throws CashierAlreadyExistsException if username already taken
     */
    async save(): Promise<void> {

        const alreadyExists =
            await Cashier.usernameExists(this.#username);

        if (alreadyExists)
            throw new CashierAlreadyExistsException();

        await Cashier.#persistCashier(this);
    }

    /**
     * Attempts login using username and password
     *
     * @param username the login name
     * @param password the password to authenticate
     * @return the authenticated Cashier instance
     *
     * @throws CashierNotFoundException when credentials are invalid
     */
    static async login(username: string, password: string): Promise<Cashier> {

        const cashier = await Cashier.#findCashier(username, password);

        if (cashier === null)
            throw new CashierNotFoundException();

        return cashier;
    }

    /**
     * Retrieves all cashiers from the catalog
     *
     * @return an array of all cashier instances
     */
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

    /**
     * Checks whether a username is already present in the catalog
     *
     * @param username the username to check
     * @return true if the username exists
     */
    static async usernameExists(username: string): Promise<boolean> {

        const result = await db()
            .query<{ username: string }>(
                "select username from cashier_catalog where username = $1",
                [username]
            );

        return result.rows.length > 0;
    }

    /**
     * Persists the cashier to both cashier_catalog and cashier tables
     * Called only internally by save and login
     *
     * @param cashier the cashier instance to persist
     */
    static async #persistCashier(cashier: Cashier): Promise<void> {

        const hashed = await hashPassword(cashier.#password);

        await db().query(
            "insert into cashier_catalog(username, password) values($1, $2) on conflict do nothing",
            [cashier.#username, hashed]
        );

        await db().query(
            "insert into cashier(username, password) values($1, $2) on conflict do nothing",
            [cashier.#username, hashed]
        );
    }

    /**
     * Performs login by validating username and password against stored credentials
     * Called internally by login
     *
     * @param username the username to look up
     * @param password the plain-text password to verify
     * @return a Cashier instance or null if authentication fails
     */
    static async #findCashier(
        username: string,
        password: string
    ): Promise<Cashier | null> {

        const hashed = await hashPassword(password);

        const result = await db()
            .query<{ username: string, password: string }>(
                "select username, password from cashier_catalog where username = $1 and password = $2",
                [username, hashed]
            );

        if (result.rows.length === 0)
            return null;

        const row = result.rows[0];

        // ensure it also exists in cashier table
        await db().query(
            "insert into cashier(username, password) values($1, $2) on conflict do nothing",
            [row.username, row.password]
        );

        return new Cashier(row.username, row.password);
    }

    get username() { return this.#username; }
}

export class InvalidCashierUsernameException extends Error {}
export class InvalidCashierPasswordException extends Error {}
export class CashierAlreadyExistsException extends Error {}
export class CashierNotFoundException extends Error {}