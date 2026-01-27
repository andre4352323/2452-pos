import Cart from "./cart";

export default class Receipt {

    #cart: Cart

    constructor(cart: Cart) {

        this.#cart = cart;
    }

    totalCost(): number {

        return this.#cart.items.reduce((total, item) => total + item.price, 0);
    }   
}