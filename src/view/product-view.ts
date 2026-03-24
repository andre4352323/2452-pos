import type Product from "../model/product";
import type CartController from "../controller/cart-controller";
import type ProductController from "../controller/product-controller";

export default class ProductView {

    #productviewElement: HTMLDialogElement;
    #cartController: CartController;
    #product: Product;
    #productController: ProductController;

    constructor(product: Product, cartController: CartController, productController: ProductController) {
        this.#product = product;
        this.#cartController = cartController;
        this.#productController = productController;

        const isGrams = this.#product.quantity === "GR";
        const unit = isGrams ? "gr" : "units";
        // Grams allow decimals, units only allow whole numbers.
        const inputType = isGrams ? "number" : "number";
        const stepAttr = isGrams ? 'step="0.1" min="0.1"' : 'step="1" min="1"';

        this.#productviewElement = document.createElement("dialog");
        this.#productviewElement.id = "product-details";
        this.#productviewElement.innerHTML = `
            <h2>Product Details</h2>
            <p>${this.#product.name}</p>
            <p>Price: $${this.#product.price} per ${unit}</p>
            <label for="quantity-input">Quantity (${unit})</label>
            <input type="${inputType}" id="quantity-input" ${stepAttr} value="1" />
            <span id="quantity-error" style="color: red; display: none;">
                Please enter a valid quantity greater than 0.
            </span>
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

    #addToCart(): void {
        const input = this.#productviewElement.querySelector<HTMLInputElement>("#quantity-input")!;
        const errorSpan = this.#productviewElement.querySelector<HTMLSpanElement>("#quantity-error")!;
        const quantityValue = parseFloat(input.value);

        // Validate: must be a positive number, and for UNITS must be a whole number.
        const isGrams = this.#product.quantity === "GR";
        const isValid = !isNaN(quantityValue) && quantityValue > 0 &&
            (isGrams || Number.isInteger(quantityValue));

        if (!isValid) {
            errorSpan.style.display = "inline";
            input.style.borderColor = "red";
            return;
        }

        errorSpan.style.display = "none";
        input.style.borderColor = "";

        this.#cartController.addToCart(this.#product, quantityValue);
    }

    open(): void {
        this.#productviewElement.showModal();
    }

    close(): void {
        this.#productviewElement.close();
    }
}