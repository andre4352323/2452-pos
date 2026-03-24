import type Coupon from "./coupon.ts";
import type Product from "./product.ts";
import db from "./connection.ts";

export default class BogoCoupon implements Coupon {

    readonly name: string;
    readonly description: string;
    #selectedProduct: Product;

    private constructor(name: string, description: string, selectedProduct: Product) {
        this.name = name;
        this.description = description;
        this.#selectedProduct = selectedProduct;
    }

    static async fromInventory(selectedProduct: Product): Promise<BogoCoupon> {
        const result = await db().query<{ name: string, description: string }>(
            `select name, description from coupon_inventory where type = 'BOGO' limit 1`
        );
        const row = result.rows[0];
        return new BogoCoupon(row.name, row.description, selectedProduct);
    }

    apply(subtotal: number): number {
        return subtotal - Number(this.#selectedProduct.price);
    }

    static async saveCoupon(coupon: BogoCoupon, cartId: number): Promise<void> {
        await db().query(
            `insert into coupon(name, description, selected_product_id, cart_id)
             values($1, $2, $3, $4)
             on conflict do nothing`,
            [coupon.name, coupon.description, coupon.#selectedProduct.id, cartId]
        );
    }

    get selectedProduct(): Product { return this.#selectedProduct; }
}