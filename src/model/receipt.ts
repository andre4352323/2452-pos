import db from "./connection.ts";
import type Product from "./product.ts";
import { Temporal } from "@js-temporal/polyfill";
import type Coupon from "./coupon.ts";

const TIMEZONE = "America/Winnipeg";

/**
 * Represents a completed transaction, including the products purchased,
 * the coupon applied, and the time of checkout
 */
export default class Receipt {

    #products: Array<Product>;
    #cashierUsername: string;
    #cartId: number;
    #time: Temporal.ZonedDateTime;
    #coupon: Coupon;

    /**
     * Creates a receipt for the given cart transaction
     *
     * @param products the products purchased in this transaction
     * @param cashierUsername the username of the cashier processing the transaction
     * @param cartId the id of the cart being checked out
     * @param coupon the coupon applied to this transaction
     */
    constructor(products: Array<Product>, cashierUsername: string, cartId: number, coupon: Coupon) {

        this.#products = products;
        this.#cashierUsername = cashierUsername;
        this.#cartId = cartId;
        this.#time = Temporal.Now.zonedDateTimeISO(TIMEZONE);
        this.#coupon = coupon;
    }

    /**
     * Calculates the subtotal before any coupon discount is applied.
     *
     * @return the sum of price * quantity for all products
     */
    subtotal(): number {

        return this.#products.reduce((sum, p) =>
            sum + (Number(p.price) * Number(p.quantityValue)), 0);
    }

    /**
     * Calculates the total after applying the coupon discount
     *
     * @return the discounted total cost of this transaction
     */
    totalCost(): number {

        return this.#coupon.apply(this.subtotal());
    }

    /**
     * Calculates the discount amount applied by the coupon
     *
     * @return the difference between subtotal and total cost
     */
    discount(): number {

        return this.subtotal() - this.totalCost();
    }

    /**
     * Persists the receipt to the database.
     *
     * @param receipt the receipt to save
     * @return the saved receipt
     */
    static async saveReceipt(receipt: Receipt): Promise<Receipt> {

        await db().query(
            `insert into receipt(cart_id, cashier_username, time)
             values($1, $2, $3)
             on conflict do nothing`,
            [
                receipt.#cartId,
                receipt.#cashierUsername,
                receipt.#time.toString({ timeZoneName: "never" })
            ]
        );
        return receipt;
    }

    get products(): Array<Product> { return this.#products; }
    get time(): Temporal.ZonedDateTime { return this.#time; }
    get coupon(): Coupon { return this.#coupon; }
}