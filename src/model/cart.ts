import Product from "./product";
import Receipt from "./receipt";

export default class Cart{

    #items: Array<Product>;

    constructor() {

        this.#items = [];
    }

    addToCart(item: Product): void {

        this.#items.push(item);
    }

    checkout(): Receipt {

        return new Receipt(this);
    }

    get items(): Array<Product> {

        return this.#items;
    }
}    