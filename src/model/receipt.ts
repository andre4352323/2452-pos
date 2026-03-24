import db from "./connection.ts";
import type Product from "./product.ts";
import { Temporal } from "@js-temporal/polyfill";
import type Coupon from "./coupon.ts";

const TIMEZONE = "America/Winnipeg";

export default class Receipt {

    #products: Array<Product>;
    #cashierUsername: string;
    #cartId: number;
    #time: Temporal.ZonedDateTime;
    #coupon: Coupon;

    constructor(products: Array<Product>, cashierUsername: string, cartId: number, coupon: Coupon) {
        this.#products = products;
        this.#cashierUsername = cashierUsername;
        this.#cartId = cartId;
        this.#time = Temporal.Now.zonedDateTimeISO(TIMEZONE);
        this.#coupon = coupon;
    }

    totalCost(): number {
        const subtotal = this.#products.reduce((sum, p) =>
            sum + (Number(p.price) * Number(p.quantityValue)), 0);

        // delegate the discount logic entirely to the coupon
        return this.#coupon.apply(subtotal);
    }

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
}