import type Product from "../model/product";
import type ProductController from "../controller/product-controller";

//view has a dependency on controllers

export default class ImageView {

    #product: Product;
    #productEl: HTMLImageElement;
    #productController: ProductController;

    //cuando se crea este view de la imagen y si se hace click lo pasare
    // al controller del producto

    constructor(product: Product, productController: ProductController) {

        this.#productController = productController;
        this.#product = product;
  
        //adding the div to the html document and 
        // the div added has an image to hold product image
        document.querySelector("#app")!.innerHTML += 
            `<div id="product">
              <img src="images/${this.#product.name}.png"
              alt="${this.#product.name}" />
             </div>`

        this.#productEl = document.querySelector(`img[alt='${this.#product.name}']`)!;
        document.body.appendChild(this.#productEl);

        this.#productEl.addEventListener("click", () => this.#productController.showDetails()); //this will show the details when the image is clicked
    }
}