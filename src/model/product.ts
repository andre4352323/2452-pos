import { assert } from "../assertions.ts";
import type Listener from "./listeners.ts";

export default class Product {

    #price: number;
    #name: string;
    #listeners: Array<Listener>;

    constructor(name: string, price: number) {
        this.#name = name;
        this.#price = price;
        this.#listeners = new Array<Listener>();
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

    registerListener(listener: Listener): void {

        this.#listeners.push(listener);
    }
    
    notifyAll(): void {

        this.#listeners.forEach((listener) => {
            listener.notify();
        });
        
    }    
}