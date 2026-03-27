import type Cart from "../model/cart";
import type CartController from "../controller/cart-controller";

/**
 * Displays and manages the shopping cart UI
 * All business logic is delegated to {@link CartController} and the model
 */
export default class CartView {

    #cart: Cart;
    #cartEl: HTMLUListElement;
    #cartContainerEl: HTMLDivElement;
    #cartController: CartController;

    /**
     * Creates and renders the cart container, registers itself as a cart listener,
     * and wires up the checkout button
     *
     * @param cart the cart model being observed
     * @param cartController the controller handling cart actions and checkout
     */
    constructor(cart: Cart, cartController: CartController) {
        
        this.#cart = cart;
        this.#cartController = cartController;

        // register view as an observer of cart updates
        this.#cart.registerListener(this);

        // create cart container with heading, item list, and checkout button
        this.#cartContainerEl = document.createElement("div");
        this.#cartContainerEl.id = "cart";
        this.#cartContainerEl.innerHTML = `
            <h2>Shopping Cart</h2>
            <ul></ul>
            <button id="checkout-btn">Checkout</button>
        `;

        // reference to the cart item list
        this.#cartEl = this.#cartContainerEl.querySelector("ul")!;

        // wire up checkout button to controller
        this.#cartContainerEl.querySelector("#checkout-btn")!
            .addEventListener("click", () => this.#cartController.checkout());

        // attach cart UI to page
        document.body.appendChild(this.#cartContainerEl);
    }

    /**
     * Hides the entire cart container
     */
    hide(): void { this.#cartContainerEl.style.display = "none"; }

    /**
     * Shows the cart container
     */
    show(): void { this.#cartContainerEl.style.display = "block"; }

    /**
     * Updates the internal cart reference
     *
     * @param cart the updated cart model
     */
    updateCart(cart: Cart): void { this.#cart = cart; }

    /**
     * Clears all rendered cart items
     */
    clearItems(): void { this.#cartEl.replaceChildren(); }

    /**
     * Re-renders the full list of cart items
     * Triggered automatically whenever the cart model notifies its listeners
     */
    notify(): void {

        this.#cartEl.replaceChildren();

        this.#cart.items.forEach((item) => {

            const productEl = document.createElement("li");
            productEl.innerHTML = `
                <strong>${item.name}</strong> — 
                ${Number(item.quantityValue)} ${item.quantity} — 
                $${(Number(item.price) * Number(item.quantityValue)).toFixed(2)}
            `;

            this.#cartEl.appendChild(productEl);
        });
    }
}