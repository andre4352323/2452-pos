import { assert } from "../assertions.ts";

export default class Product {

    #price: number;
    #name: string;

    constructor(name: string, price: number) {
        this.#name = name;
        this.#price = price;
        this.#checkProduct();
        
    }

    #checkProduct() {

        assert(this.#name.length > 0, "Product name should be at least 1 character long");
        assert(this.#price > 0.0, "Product price should be greater than 0.0");
    }

    get price(): number {
        return this.#price;
    }

    get name(): string {
        return this.#name;
    }

}