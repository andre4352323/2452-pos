import type Product from "../model/product";
import type CartController from "../controller/cart-controller";
import type productController from "../controller/product-controller";

//view has a dependency on controllers

export default class ProductView {

    #productviewElement: HTMLDialogElement;
    #cartController: CartController;
    #product: Product;
    #productController: productController;

    constructor(product: Product, cartController: CartController, productController: productController) {

        this.#product = product;
        this.#cartController = cartController;
        this.#productController = productController;
        
        this.#productviewElement = document.createElement("dialog");
        this.#productviewElement.id = "product-details";
        this.#productviewElement.innerHTML = `
            <h2> Product Details </h2>
            <p>${this.#product.name}</p>    
            <p>Price: $${this.#product.price}</p>
            <button id="close-btn">Close</button>
            <button id="add-to-cart">Add to Cart</button>
        `
        document.body.appendChild(this.#productviewElement);

        this.#productviewElement.querySelector("#add-to-cart")!
        .addEventListener("click", () => { 
            console.log("Add to cart clicked for:", this.#product);
            this.#cartController.addToCart(this.#product)});
            
        this.#productviewElement.querySelector("#close-btn")!
        .addEventListener("click", () => this.#productController.hideDetails());
    }

    open() {

        this.#productviewElement.showModal();
    }

    close() {

        this.#productviewElement.close();
    }

}