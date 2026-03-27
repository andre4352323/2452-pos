import type Product from "../model/product";
import type CartController from "../controller/cart-controller";
import type ProductController from "../controller/product-controller";
import { InvalidProductQuantityException } from "../model/product";

/**
 * Displays the product details dialog and delegates all business logic
 * to {@link CartController} and {@link ProductController}
 */
export default class ProductView {

    #productviewElement: HTMLDialogElement;
    #cartController: CartController;
    #product: Product;
    #productController: ProductController;

    /**
     * Creates the product details view, including quantity input and action buttons
     * The dialog is prepared but not shown until {@link open} is called
     *
     * @param product the product whose details are being viewed
     * @param cartController the controller responsible for adding items to the cart
     * @param productController the controller managing product detail visibility
     */
    constructor(product: Product, cartController: CartController, productController: ProductController) {

        this.#product = product;
        this.#cartController = cartController;
        this.#productController = productController;

        // determine correct unit label and numeric input constraints
        const isGrams = this.#product.quantity === "GR";
        const unit = isGrams ? "gr" : "units";
        const stepAttr = isGrams ? 'step="0.1" min="0.1"' : 'step="1" min="1"';

        this.#productviewElement = document.createElement("dialog");
        this.#productviewElement.id = "product-details";
        this.#productviewElement.innerHTML = `
            <h2>Product Details</h2>
            <p>${this.#product.name}</p>
            <p>Price: $${this.#product.price} per ${unit}</p>
            <label for="quantity-input">Quantity (${unit})</label>
            <input type="number" id="quantity-input" ${stepAttr} value="1" />
            <span id="quantity-error" style="color: red;"></span>
            <br/>
            <button id="close-btn">Close</button>
            <button id="add-to-cart">Add to Cart</button>
        `;

        document.body.appendChild(this.#productviewElement);

        this.#productviewElement.querySelector("#add-to-cart")!
            .addEventListener("click", () => this.#addToCart());

        this.#productviewElement.querySelector("#close-btn")!
            .addEventListener("click", () => this.#productController.hideDetails());
    }

    /**
     * Attempts to add the product to the cart using the entered quantity.
     * Displays validation errors if the quantity is invalid.
     */
    #addToCart(): void {

        const input =
            this.#productviewElement.querySelector<HTMLInputElement>("#quantity-input")!;

        const errorSpan =
            this.#productviewElement.querySelector<HTMLSpanElement>("#quantity-error")!;

        const quantityValue = parseFloat(input.value);

        // reset previous error highlighting
        input.setAttribute("style", "");
        errorSpan.textContent = "";

        this.#cartController.addToCart(this.#product, quantityValue)
            .then(() => {
            
            })
            .catch((e: any) => {

                if (e instanceof InvalidProductQuantityException) {

                    input.setAttribute("style", "border-color: red;");
                    errorSpan.textContent =
                        "Invalid quantity, quantity must be at least 1.";

                } else {

                    console.error("Unexpected error adding to cart:", e);
                }
            });
    }

    /**
     * Opens the product details dialog
     */
    open(): void { this.#productviewElement.showModal(); }

    /**
     * Closes the product details dialog
     */
    close(): void { this.#productviewElement.close(); }
}