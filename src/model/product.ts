import { assert } from "../assertions.ts";
import db from "./connection.ts";
import type { ProductType } from "./product-type.ts";
import type { ProductQuantity } from "./product-quantity.ts";

/**
 * represents a product that can be retrieved from the inventory
 * and persisted to a cart in the database
 */
export default class Product {

    #id?: number;
    #name: ProductType;
    #quantity: ProductQuantity;
    #price: number;
    #quantityValue?: number;

    /**
     * catalog product, no quantity yet, decided later when added to cart
     *
     * @param name the product type
     * @param price the product price
     * @param quantity the product quantity unit
     */
    constructor(name: ProductType, price: number, quantity: ProductQuantity) {

        this.#name = name;
        this.#price = price;
        this.#quantity = quantity;
        this.#checkProduct();
    }

    /**
     * adding a catalog product to a cart with a quantity by user
     *
     * @param name the product type
     * @param price the product price
     * @param quantity the product quantity unit
     * @param quantityValue the amount of the product
     * @return a Product instance with the given quantity
     *
     * @throws InvalidProductQuantityException if quantityValue is less than 1
     */
    static withQuantity(name: ProductType, price: number, quantity: ProductQuantity, quantityValue: number): Product {

        if (quantityValue < 1) throw new InvalidProductQuantityException();

        const p = new Product(name, price, quantity);
        p.#quantityValue = quantityValue;
        return p;
    }

    /**
     * reconstructing a cart product that already exists in the db
     *
     * @param id the existing product id
     * @param name the product type
     * @param price the product price
     * @param quantity the product quantity unit
     * @param quantityValue the amount of the product
     * @return a Product instance reconstructed from the database row
     */
    static fromRow(id: number, name: ProductType, price: number, quantity: ProductQuantity, quantityValue: number): Product {

        const p = new Product(name, price, quantity);
        p.#id = id;
        p.#quantityValue = quantityValue;
        return p;
    }

    /**
     * retrieves all products from the inventory
     *
     * @return an array of all product instances
     */
    static async getAllProducts(): Promise<Array<Product>> {

        const allProducts = new Array<Product>();
        const results = await db()
            .query<{ product_type: ProductType, product_unit: ProductQuantity, product_price: number }>(
                "select product_type, product_unit, product_price from product_inventory"
            );
        results.rows.forEach(row => {
            allProducts.push(new Product(row.product_type, row.product_price, row.product_unit));
        });
        return allProducts;
    }

    /**
     * retrieves all products belonging to a specific cart
     *
     * @param cartId the id of the cart to retrieve products for
     * @return an array of product instances for the given cart
     */
    static async getProductsForCart(cartId: number): Promise<Array<Product>> {

        const allProducts = new Array<Product>();
        const results = await db()
            .query<{ id: number, name: ProductType, price: number, quantity_unit: ProductQuantity, quantity_value: number }>(
                "select id, name, price, quantity_unit, quantity_value from product where cart_id = $1",
                [cartId]
            );
        results.rows.forEach(row => {
            allProducts.push(Product.fromRow(row.id, row.name, row.price, row.quantity_unit, row.quantity_value));
        });
        return allProducts;
    }

    /**
     * persists a product to the database under a specific cart
     * called internally by saveToCart
     *
     * @param product the product instance to persist
     * @param cartId the id of the cart to save the product to
     * @return the persisted product with its generated id
     */
    static async #saveProduct(product: Product, cartId: number): Promise<Product> {

        const result = await db()
            .query<{ id: number }>(
                `insert into product(name, price, quantity_value, quantity_unit, cart_id)
                 values($1, $2, $3, $4, $5) returning id`,
                [product.#name, product.#price, product.#quantityValue, product.#quantity, cartId]
            );
        product.#id = result.rows[0].id;
        return product;
    }

    /**
     * saves this product to the given cart
     *
     * @param cartId the id of the cart to save this product to
     */
    async saveToCart(cartId: number): Promise<void> {

        await Product.#saveProduct(this, cartId);
    }

    /**
     * verifies that the product instance meets minimum requirements
     * called internally by the constructor
     */
    #checkProduct() {

        assert(this.#name.length > 0, "Product name should be at least 1 character long");
        assert(this.#price > 0.0, "Product price should be greater than 0.0");
    }

    get price(): number { return this.#price; }
    get name(): string { return this.#name; }
    get id(): number | undefined { return this.#id; }
    get quantity(): ProductQuantity { return this.#quantity; }
    get quantityValue(): number | undefined { return this.#quantityValue; }
}

export class InvalidProductQuantityException extends Error {}