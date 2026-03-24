import db from "./connection.ts";
import Product from "./product.ts";
import Receipt from "./receipt.ts";
import type Listener from "./listeners.ts";
import type { ProductType } from "./product-type.ts";
import type { ProductQuantity } from "./product-quantity.ts";
import type Coupon from "./coupon.ts";
import BogoCoupon from "./bogo-coupon.ts";
import TotalDiscountCoupon from "./total-discount-coupon.ts";

export default class Cart {

    #id: number;
    #items: Array<Product>;
    #cashierUsername: string;
    #listeners: Array<Listener>;
    #receipt?: Receipt;
    #coupon?: Coupon;

    // private constructor — always go through createForCashier or loadOrCreateForCashier
    private constructor(id: number, cashierUsername: string, items: Array<Product> = []) {
        this.#id = id;
        this.#cashierUsername = cashierUsername;
        this.#items = items;
        this.#listeners = new Array<Listener>();
    }

    // creates a brand new cart row in the db for this cashier and returns the instance
    static async createForCashier(cashierUsername: string): Promise<Cart> {
        const result = await db()
            .query<{ id: number }>(
                "insert into cart(cashier_username, checked_out) values($1, false) returning id",
                [cashierUsername]
            );
        return new Cart(result.rows[0].id, cashierUsername);
    }

    // loads the most recent unchecked-out cart for this cashier, or creates a new one
    static async loadOrCreateForCashier(cashierUsername: string): Promise<Cart> {
        const result = await db()
            .query<{ id: number }>(
                `select id from cart 
                 where cashier_username = $1 and checked_out = false
                 order by id desc limit 1`,
                [cashierUsername]
            );

        if (result.rows.length === 0) {
            return Cart.createForCashier(cashierUsername);
        }

        const cartId = result.rows[0].id;
        const items = await Product.getProductsForCart(cartId);
        return new Cart(cartId, cashierUsername, items);
    }

    async addToCart(product: Product, quantityValue: number): Promise<void> {
        const entry = new Product(
            product.name as ProductType,
            product.price,
            product.quantity as ProductQuantity,
            quantityValue
        );
        this.#items.push(entry);

        // must await so entry.id is set before any checkout attempt reads it
        await Product.saveProduct(entry, this.#id);
        this.#notifyAll();
    }

    // cart owns the coupon and the receipt — saves both, marks cart as checked out
    async checkout(coupon: Coupon): Promise<Receipt> {
        this.#coupon = coupon;
        this.#receipt = new Receipt([...this.#items], this.#cashierUsername, this.#id, coupon);

        await Receipt.saveReceipt(this.#receipt);

        // cart owns coupon — saved here, not in receipt
        if (coupon instanceof BogoCoupon) {
            await BogoCoupon.saveCoupon(coupon, this.#id);
        } else if (coupon instanceof TotalDiscountCoupon) {
            await TotalDiscountCoupon.saveCoupon(coupon, this.#id);
        }

        await db().query(
            "update cart set checked_out = true where id = $1",
            [this.#id]
        );

        return this.#receipt;
    }

    registerListener(listener: Listener): void {
        this.#listeners.push(listener);
    }

    #notifyAll(): void {
        this.#listeners.forEach(l => l.notify());
    }

    get items(): Array<Product> { return this.#items; }
    get id(): number { return this.#id; }
    get receipt(): Receipt | undefined { return this.#receipt; }
    get coupon(): Coupon | undefined { return this.#coupon; }
}