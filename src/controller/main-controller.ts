import Product from "../model/product.ts";
import Cart from "../model/cart.ts";
import type Cashier from "../model/cashier.ts";
import CartController from "./cart-controller.ts";
import ImageController from "./image-controller.ts";

// Entry point after sign-in. Owns the cart and all product image controllers.
export default class MainController {

    #cashier: Cashier;
    #cartController?: CartController;

    constructor(cashier: Cashier) {
        this.#cashier = cashier;

        // Clear the login UI before rendering the main app.
        document.querySelector("#app")!.innerHTML = "";

        // Load or create the cashier's active cart, then boot the product grid.
        Cart.loadOrCreateForCashier(this.#cashier.username).then((cart) => {
            this.#cartController = new CartController(cart, this.#cashier);
            this.#loadProducts();
        });
    }

    #loadProducts(): void {
        Product.getAllProducts().then((products) => {
            products.forEach((product) => {
                new ImageController(product, this.#cartController!);
            });
        });
    }
}