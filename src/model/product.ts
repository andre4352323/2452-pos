export default class Product {

    #price: number;
    #name: string;

    constructor(name: string, price: number) {
        this.#name = name;
        this.#price = price;
    }

    get price(): number {
        return this.#price;
    }

    get name(): string {
        return this.#name;
    }

}