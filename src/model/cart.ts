import db from "./connection.ts";
import Product from "./product.ts";
import Receipt from "./receipt.ts";
import type Listener from "./listeners.ts";
import type Coupon from "./coupon.ts";
import BogoCoupon from "./bogo-coupon.ts";
import TotalDiscountCoupon from "./total-discount-coupon.ts";

/**
 * Represents a shopping cart belonging to a specific cashier.
 * Handles item storage, checkout persistence, coupon saving, and listener notifications.
 */
export default class Cart {

    #id: number;
    #items: Array<Product>;
    #cashierUsername: string;
    #listeners: Array<Listener>;
    #receipt?: Receipt;
    #coupon?: Coupon;

    /**
     * Creates a cart instance. Always use {@link createForCashier} or
     * {@link loadOrCreateForCashier} constructor is private.
     *
     * @param id the database id for this cart
     * @param cashierUsername the cashier who owns the cart
     * @param items optional list of products already in the cart
     */
    private constructor(id: number, cashierUsername: string, items: Array<Product> = []) {

        this.#id = id;
        this.#cashierUsername = cashierUsername;
        this.#items = items;
        this.#listeners = new Array<Listener>();
    }

    /**
     * Creates a new cart row in the database for the given cashier
     *
     * @param cashierUsername the cashier who will own the new cart
     */
    static async createForCashier(cashierUsername: string): Promise<Cart> {

        const result = await db()
            .query<{ id: number }>(
                "insert into cart(cashier_username, checked_out) values($1, false) returning id",
                [cashierUsername]
            );

        return new Cart(result.rows[0].id, cashierUsername);
    }

    /**
     * Loads the most recent  (not checked-out) cart for the cashier
     * If none exists, creates a new one
     *
     * @param cashierUsername the username used to search for an open cart
     */
    static async loadOrCreateForCashier(cashierUsername: string): Promise<Cart> {

        const result = await db()
            .query<{ id: number }>(
                `select id from cart 
                 where cashier_username = $1 and checked_out = false
                 order by id desc limit 1`,
                [cashierUsername]
            );

        // no existing cart, so create a new one
        if (result.rows.length === 0)
            return Cart.createForCashier(cashierUsername);

        // load existing unchecked-out cart with its products
        const cartId = result.rows[0].id;
        const items = await Product.getProductsForCart(cartId);
        return new Cart(cartId, cashierUsername, items);
    }

    /**
     * Adds a product to the cart, persists it, and notifies listeners
     *
     * @param entry the product being added
     */
    async addToCart(entry: Product): Promise<void> {

        this.#items.push(entry);
        await entry.saveToCart(this.#id);
        this.#notifyAll();
    }

    /**
     * Completes checkout by storing both receipt and coupon,
     * then marking the cart as checked out in the database
     *
     * @param receipt the computed receipt for this cart
     * @param coupon the coupon applied at checkout
     */
    async checkout(receipt: Receipt, coupon: Coupon): Promise<void> {

        this.#receipt = receipt;
        this.#coupon = coupon;

        await Receipt.saveReceipt(receipt);
        await this.#saveCoupon(coupon);
        await this.#markCheckedOut();
    }

    /**
     * Marks this cart as checked out
     */
    async #markCheckedOut(): Promise<void> {

        await db().query(
            "update cart set checked_out = true where id = $1",
            [this.#id]
        );
    }

    /**
     * Persists the applied coupon based on its runtime type
     *
     * @param coupon the coupon used during checkout
     */
    async #saveCoupon(coupon: Coupon): Promise<void> {

        if (coupon instanceof BogoCoupon) {
            await BogoCoupon.saveCoupon(coupon, this.#id);

        } else if (coupon instanceof TotalDiscountCoupon) {
            await TotalDiscountCoupon.saveCoupon(coupon, this.#id);
        }
    }

    /**
     * Returns eligible UNITS products grouped by name, along with their combined
     * quantity values. Used to determine whether a BOGO coupon can be applied
     *
     * @return a map keyed by product name containing the product and its total quantity
     */
    getBogoEligible(): Map<string, { product: Product, totalQty: number }> {

        const grouped =
            new Map<string, { product: Product, totalQty: number }>();

        this.#items
            .filter(p => p.quantity === "UNITS")
            .forEach(p => {

                const existing = grouped.get(p.name);

                if (existing) {
                    existing.totalQty += Number(p.quantityValue);
                } else {
                    grouped.set(p.name, {
                        product: p,
                        totalQty: Number(p.quantityValue)
                    });
                }
            });

        return grouped;
    }

    /**
     * Registers a listener that will be notified
     * whenever cart contents change
     */
    registerListener(listener: Listener): void { this.#listeners.push(listener); }

    /**
     * Notifies all registered listeners of a cart update
     */
    #notifyAll(): void { this.#listeners.forEach(l => l.notify()); }


    get items(): Array<Product> { return this.#items; }
    get id(): number { return this.#id; }
    get cashierUsername(): string { return this.#cashierUsername; }
    get receipt(): Receipt | undefined { return this.#receipt; }
    get coupon(): Coupon | undefined { return this.#coupon; }
}