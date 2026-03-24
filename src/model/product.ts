import { assert } from "../assertions.ts";
import db from "./connection.ts";
import type { ProductType } from "./product-type.ts";
import type { ProductQuantity } from "./product-quantity.ts";
 
export default class Product {
 
    #id?: number;
    #name: ProductType;
    #quantity: ProductQuantity;
    #price: number;
    #quantityValue: number;
 
    constructor(name: ProductType, price: number, quantity: ProductQuantity, quantityValue: number = 1) {
        this.#name = name;
        this.#price = price;
        this.#quantity = quantity;
        this.#quantityValue = quantityValue;
        this.#checkProduct();
    }
 
    // Use this when reconstructing a product that already exists in the DB.
    // Ensures the id is set correctly without exposing #id or changing the constructor.
    static fromRow(id: number, name: ProductType, price: number, quantity: ProductQuantity, quantityValue: number): Product {
        const p = new Product(name, price, quantity, quantityValue);
        p.#id = id;
        return p;
    }
 
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
 
    static async saveProduct(product: Product, cartId: number): Promise<Product> {
        const result = await db()
            .query<{ id: number }>(
                `insert into product(name, price, quantity_value, quantity_unit, cart_id)
                 values($1, $2, $3, $4, $5) returning id`,
                [product.#name, product.#price, product.#quantityValue, product.#quantity, cartId]
            );
        product.#id = result.rows[0].id;
        return product;
    }
 
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
 
    #checkProduct() {
        assert(this.#name.length > 0, "Product name should be at least 1 character long");
        assert(this.#price > 0.0, "Product price should be greater than 0.0");
    }
 
    get price(): number { return this.#price; }
    get name(): string { return this.#name; }
    get id(): number | undefined { return this.#id; }
    get quantity(): ProductQuantity { return this.#quantity; }
    get quantityValue(): number { return this.#quantityValue; }
}