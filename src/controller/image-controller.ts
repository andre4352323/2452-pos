import Product from "../model/product";
import ImageView from "../view/image-view";
import CartController from "./cart-controller";
import ProductController from "./product-controller";

/**
 * Handles a single product image on the main screen. Creates a
 * {@link ProductController} and {@link ImageView} for the given product,
 * and wires the image click to show the product details dialog
 */
export default class ImageController {

    #product: Product;
    #imageView: ImageView;
    #cartController: CartController;
    #productController: ProductController;

    /**
     * Creates the image controller, its {@link ProductController}, and its
     * {@link ImageView} for the given product
     *
     * @param product the catalog product this image represents
     * @param cartController the active cart controller, passed through to
     *                       {@link ProductController} for adding to cart
     */
    constructor(product: Product, cartController: CartController) {

        this.#product = product;
        this.#cartController = cartController;
        this.#productController = new ProductController(this.#product, this.#cartController);
        this.#imageView = new ImageView(this.#product, this.#productController);
    }
}