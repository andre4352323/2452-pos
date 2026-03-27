import Product from "../model/product.ts";
import Cart from "../model/cart.ts";
import type Cashier from "../model/cashier.ts";
import CartController from "./cart-controller.ts";
import ImageController from "./image-controller.ts";

/**
 * Entry point after a successful sign-in. Owns the {@link CartController} and
 * all {@link ImageController}s for the session
 */
export default class MainController {

    #cashier: Cashier;
    #cartController?: CartController;

    /**
     * Initializes the main application for the signed-in cashier. Clears the
     * login UI, loads or creates the cashier's active cart, then loads all
     * catalog products as {@link ImageController}
     *
     * @param cashier the signed-in cashier starting a session
     */
    constructor(cashier: Cashier) {

        this.#cashier = cashier;
        // clear the login ui before rendering the main app
        document.querySelector("#app")!.innerHTML = "";

        // load or create the cashier's active cart, then boot the product images
        Cart.loadOrCreateForCashier(this.#cashier.username).then((cart) => {
            this.#cartController = new CartController(cart, this.#cashier);
            this.#loadProducts();
        });
    }

    /**
     * Loads all catalog products from the db and creates an {@link ImageController}
     * for each one. Side-effect: appends product image elements to the page
     */
    #loadProducts(): void {

        Product.getAllProducts().then((products) => {
            products.forEach((product) => {
                new ImageController(product, this.#cartController!);
            });
        });
    }
}