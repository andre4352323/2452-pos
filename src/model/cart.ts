import type Listener from "./listeners";
import Product from "./product";
import Receipt from "./receipt";

export default class Cart{

    #items: Array<Product>;
    #listeners: Array<Listener>;

    constructor() {

        this.#items = new Array<Product>();
        this.#listeners = new Array<Listener>();
    }

    addToCart(item: Product): void {

        this.#items.push(item);
        this.#notifyAll();
    }

    checkout(): Receipt {

        return new Receipt(this);
    }

    get items(): Array<Product> {

        return this.#items;
    }

    registerListener(listener: Listener): void {

        this.#listeners.push(listener);
    }

    // Notify all registered listeners about an event
    #notifyAll(): void {

        this.#listeners.forEach((listener) => {
            listener.notify();
        });
    }    
}    