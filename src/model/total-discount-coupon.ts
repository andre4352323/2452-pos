import type Coupon from "./coupon.ts";
import db from "./connection.ts";

/**
 * represents a coupon that applies a 10% discount to the cart subtotal
 * implements the Coupon interface
 */
export default class TotalDiscountCoupon implements Coupon {

    readonly name: string;
    readonly description: string;

    /**
     * creates a TotalDiscountCoupon with the given name and description
     *
     * @param name the coupon name
     * @param description the coupon description
     */
    private constructor(name: string, description: string) {

        this.name = name;
        this.description = description;
    }

    /**
     * retrieves the total discount coupon from the inventory
     *
     * @return a TotalDiscountCoupon instance from the database
     */
    static async fromInventory(): Promise<TotalDiscountCoupon> {

        const result = await db().query<{ name: string, description: string }>(
            `select name, description from coupon_inventory where type = 'TOTAL_DISCOUNT' limit 1`
        );
        const row = result.rows[0];
        return new TotalDiscountCoupon(row.name, row.description);
    }

    /**
     * applies a 10% discount to the given subtotal
     *
     * @param subtotal the original cart subtotal
     * @return the subtotal after the discount is applied
     */
    apply(subtotal: number): number {
        return subtotal * 0.9;
    }

    /**
     * persists a coupon to the database under a specific cart
     *
     * @param coupon the TotalDiscountCoupon instance to persist
     * @param cartId the id of the cart to save the coupon to
     */
    static async saveCoupon(coupon: TotalDiscountCoupon, cartId: number): Promise<void> {
        
        await db().query(
            `insert into coupon(name, description, selected_product_id, cart_id)
             values($1, $2, null, $3)
             on conflict do nothing`,
            [coupon.name, coupon.description, cartId]
        );
    }
}