import type Cart from "../model/cart";
import type CartController from "../controller/cart-controller";

export default class CartView {

    #cart: Cart;
    #cartEl: HTMLUListElement;
    #cartContainerEl: HTMLDivElement;
    #cartController: CartController;

    constructor(cart: Cart, cartController: CartController) {
        this.#cart = cart;
        this.#cartController = cartController;
        this.#cart.registerListener(this);

        // Append to body instead of writing to #app so that ImageView's
        // innerHTML += on #app never touches this element or kills its listeners.
        this.#cartContainerEl = document.createElement("div");
        this.#cartContainerEl.id = "cart";
        this.#cartContainerEl.innerHTML = `
            <h2>Shopping Cart</h2>
            <ul></ul>
            <button id="checkout-btn">Checkout</button>
        `;

        this.#cartEl = this.#cartContainerEl.querySelector("ul")!;
        this.#cartContainerEl.querySelector("#checkout-btn")!
            .addEventListener("click", () => this.#cartController.checkout());

        document.body.appendChild(this.#cartContainerEl);
    }

    hide(): void {
        
        this.#cartContainerEl.style.display = "none";
    }

    show(): void {

        this.#cartContainerEl.style.display = "block";
    }

    updateCart(cart: Cart): void {

        this.#cart = cart;
    }

    clearItems(): void {

        this.#cartEl.replaceChildren();
    }

    notify(): void {
    this.#cartEl.replaceChildren();
    this.#cart.items.forEach((item) => {
        let productEl = document.createElement("li");
        productEl.innerHTML = `<strong>${item.name}</strong> — ${Number(item.quantityValue)} ${item.quantity} — $${(Number(item.price) * Number(item.quantityValue)).toFixed(2)}`;
        this.#cartEl.appendChild(productEl);
    });
    }   
}