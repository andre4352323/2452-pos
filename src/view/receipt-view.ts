import type Cart from "../model/cart";
import type CartController from "../controller/cart-controller";

export default class ReceiptView {

    #cart: Cart;
    #cartController: CartController;
    #receiptEl: HTMLDialogElement;

    constructor(cart: Cart, cartController: CartController){

        this.#cart = cart;
        this.#cartController = cartController;
        this.#cart.registerListener(this);

        this.#receiptEl = document.createElement("dialog");
        this.#receiptEl.id = "receipt";
        this.#receiptEl.innerHTML = `
            <h2> Receipt </h2>
            
        `
        document.body.appendChild(this.#receiptEl);


    }

    notify(): void {
        
        //empty the contents of the list
        this.#receiptEl.replaceChildren();
    }
}