import type Coupon from "./coupon.ts";
import db from "./connection.ts";

export default class TotalDiscountCoupon implements Coupon {

    readonly name: string;
    readonly description: string;

    private constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    static async fromInventory(): Promise<TotalDiscountCoupon> {
        const result = await db().query<{ name: string, description: string }>(
            `select name, description from coupon_inventory where type = 'TOTAL_DISCOUNT' limit 1`
        );
        const row = result.rows[0];
        return new TotalDiscountCoupon(row.name, row.description);
    }

    apply(subtotal: number): number {
        return subtotal * 0.9;
    }

    static async saveCoupon(coupon: TotalDiscountCoupon, cartId: number): Promise<void> {
        await db().query(
            `insert into coupon(name, description, selected_product_id, cart_id)
             values($1, $2, null, $3)
             on conflict do nothing`,
            [coupon.name, coupon.description, cartId]
        );
    }
}