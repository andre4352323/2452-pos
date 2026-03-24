import Product from "../model/product";
import ProductView from "../view/product-view";
import CartController from "./cart-controller";

export default class ProductController {

    #product: Product;
    #productView?: ProductView;
    #cartController: CartController;

    constructor(product: Product, cartController: CartController) {
        this.#product = product;
        this.#cartController = cartController;
    }

    showDetails(): void {
        if (!this.#productView) {
            this.#productView = new ProductView(this.#product, this.#cartController, this);
        }
        this.#productView.open();
    }

    hideDetails(): void {
        this.#productView?.close();
    }
}