import Product from "../model/product";
import Cart from "../model/cart.ts";
import CartView from "../view/cart-view.ts";
import product from "../model/product";

// later we might want to move this to cart class to 
// have responsability of what curretn cart is and all carts

export default class CartController {

    #cart: Cart;
    #cartView: CartView;
 
    constructor(cart: Cart) {
        
        this.#cart = cart;
        this.#cartView = new CartView(this.#cart, this);
    }

    addToCart(product: Product): void {

        this.#cart.addToCart(product);
    }
}