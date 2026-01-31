import Product from "../model/product";
import Cart from "../model/cart.ts";
import CartView from "../view/cart-view.ts";

// later we might want to move this to cart class to 
// have responsability of what curretn cart is and all carts

export default class CartController {

    #cart: Cart;
    #cartView: CartView;

    constructor() {

        this.#cart = new Cart();
        this.#cartView = new CartView(this.#cart);
    }

    addToCart() {

        let product = new Product("Popcorns", 5.5);
        this.#cart.addToCart(product);
    }
}