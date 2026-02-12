import CartController from "./controller/cart-controller";
import ImageController from "./controller/image-controller";
import Product from "./model/product";
import Cart from "./model/cart";

let product1 = new Product("Popcorn", 5.5);
let product2 = new Product("Soda", 3.0);
const cart = new Cart();

const cartController = new CartController(cart);
new ImageController(product1, cartController);
new ImageController(product2, cartController);