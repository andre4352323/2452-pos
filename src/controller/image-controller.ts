import Product from "../model/product";
import ImageView from "../view/image-view";
import CartController from "./cart-controller";
import ProductController from "./product-controller";

//THIS CLASS WILL HANDLE WHEN THE IMAGE OF THE PRODUCT IS CLICKED  
export default class ImageController {

    #product: Product;
    #imageView: ImageView;
    #cartController: CartController;
    #productController: ProductController;

    constructor(product: Product, cartController: CartController) {

        this.#product = product;
        this.#cartController = cartController;
        this.#productController = new ProductController(this.#product, this.#cartController);
        this.#imageView = new ImageView(this.#product, this.#productController);
        
    }
}