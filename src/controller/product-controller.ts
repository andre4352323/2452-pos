import Product from "../model/product";
import ProductView from "../view/product-view";
import CartController from "./cart-controller";

/**
 * Manages the product details dialog for a single catalog product, coordinating
 * between {@link Product}, {@link ProductView}, and {@link CartController}.
 */
export default class ProductController {

    #product: Product;
    #productView?: ProductView;
    #cartController: CartController;

    /**
     * Creates the product controller for the given product
     *
     * @param product the catalog product this controller manages.
     * @param cartController the active cart controller, used by {@link ProductView}
     *                       when the cashier adds the product to the cart
     */
    constructor(product: Product, cartController: CartController) {

        this.#product = product;
        this.#cartController = cartController;
    }

    /**
     * Opens the {@link ProductView} details dialog for this product
     * Creates the view if it does not already exist
     */
    showDetails(): void {

        if (!this.#productView) {

            this.#productView = new ProductView(this.#product, this.#cartController, this);
        }

        this.#productView.open();
    }

    /**
     * Closes the {@link ProductView} details dialog if it is open
     */
    hideDetails(): void { this.#productView?.close(); }
}