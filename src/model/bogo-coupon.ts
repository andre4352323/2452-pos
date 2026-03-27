import type Coupon from "./coupon.ts";
import type Product from "./product.ts";
import db from "./connection.ts";

/**
 * Represents a BOGO (Buy-One-Get-One) coupon
 * Stores the selected product that receives the free unit and
 * handles discount calculation and persistence
 */
export default class BogoCoupon implements Coupon {

    readonly name: string;
    readonly description: string;
    #selectedProduct: Product;

    /**
     * Creates a BOGO coupon with metadata and the chosen product.
     * Constructor is private use {@link fromInventory} to load template data
     *
     * @param name the coupon display name
     * @param description a short explanation of the coupon
     * @param selectedProduct the product receiving a free unit
     */
    private constructor(name: string, description: string, selectedProduct: Product) {

        this.name = name;
        this.description = description;
        this.#selectedProduct = selectedProduct;
    }

    /**
     * Retrieves BOGO coupon metadata from the inventory table and
     * returns a new coupon bound to the given selected product
     *
     * @param selectedProduct the product for which the free unit applies
     */
    static async fromInventory(selectedProduct: Product): Promise<BogoCoupon> {

        const result = await db().query<{ name: string, description: string }>(
            `select name, description from coupon_inventory where type = 'BOGO' limit 1`
        );

        const row = result.rows[0];
        return new BogoCoupon(row.name, row.description, selectedProduct);
    }

    /**
     * Applies the coupon discount to the subtotal
     * The discount is equal to the selected product's unit price
     *
     * @param subtotal the original price before discount
     * @returns the new subtotal after applying the free-unit deduction
     */
    apply(subtotal: number): number {

        return subtotal - Number(this.#selectedProduct.price);
    }

    /**
     * Saves the applied BOGO coupon into persistent storage 
     * @param coupon the BogoCoupon to save
     * @param cartId the cart to associate the coupon with
     */
    static async saveCoupon(coupon: BogoCoupon, cartId: number): Promise<void> {
        
        await db().query(
            `insert into coupon(name, description, selected_product_id, cart_id)
             values($1, $2, $3, $4)
             on conflict do nothing`,
            [coupon.name, coupon.description, coupon.#selectedProduct.id, cartId]
        );
    }

    /**
     * Gets the product tied to the BOGO discount
     */
    get selectedProduct(): Product { return this.#selectedProduct; }
}