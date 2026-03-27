import type Product from "../model/product";
import type ProductController from "../controller/product-controller";

/**
 * Renders the product image and delegates all interaction
 * behavior to {@link ProductController}
 */
export default class ImageView {

    #product: Product;
    #productEl: HTMLImageElement;
    #productController: ProductController;

    /**
     * Creates the product image element, inserts it into the UI,
     * and registers a click handler that forwards interaction events
     * to the product controller
     *
     * @param product the product whose image will be displayed
     * @param productController the controller responsible for handling image interactions
     */
    constructor(product: Product, productController: ProductController) {

        this.#productController = productController;
        this.#product = product;
        document.querySelector("#app")!.innerHTML += 
            `<div id="product">
                <img src="/src/img/${this.#product.name}.jpg"
                    alt="${this.#product.name}"
                    style="width: 200px; height: 200px; object-fit: cover; cursor: pointer;"/>
             </div>`;

        this.#productEl =
            document.querySelector(`img[alt='${this.#product.name}']`)!;

        document.body.appendChild(this.#productEl);

        this.#productEl.addEventListener(
            "click",
            () => this.#productController.showDetails()
        );
    }
}