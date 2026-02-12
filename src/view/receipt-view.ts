import type Cart from "../model/cart";
import type CartController from "../controller/cart-controller";
import type Receipt from "../model/receipt";

export default class ReceiptView {

    #cart: Cart;
    #receipt: Receipt;
    #cartController: CartController;
    #receiptEl: HTMLDialogElement;
   
    constructor(cart: Cart, cartController: CartController, reciept: Receipt) {

        this.#cart = cart;
        this.#receipt = reciept;
        this.#cartController = cartController;
    
        this.#receiptEl = document.createElement("dialog");
        this.#receiptEl.id = "receipt";
        this.#receiptEl.innerHTML = `
            <h3> Receipt </h3>
            <ul></ul>
            <p id="total"></p>
            <button id= "payed" >Payed and done</button>
        `
        document.body.appendChild(this.#receiptEl);
        this.#receiptEl.querySelector("#payed")!
        .addEventListener("click", () => this.#receiptEl.close());

        this.#render();
        this.#receiptEl.showModal();
    }

    #render(): void {

        const listEl = this.#receiptEl.querySelector("ul")!;
        const totalEl = this.#receiptEl.querySelector("#total")!;
    
        // populate the list with items in the cart
        this.#cart.items.forEach((item) => {
            let productEl = document.createElement("li");
            productEl.innerHTML = `<strong>${item.name}</strong> $${item.price.toFixed(2)}`;
            listEl.appendChild(productEl);
        });
        
        //display the total
        totalEl.innerHTML = `<strong>Total: $${this.#receipt.totalCost().toFixed(2)}</strong>`;
    }
}