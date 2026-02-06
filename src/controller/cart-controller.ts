import Product from "../model/product";
import Cart from "../model/cart.ts";
import CartView from "../view/cart-view.ts";

// later we might want to move this to cart class to 
// have responsability of what curretn cart is and all carts

export default class CartController {

    #cart: Cart;
    //CHANGE CART VIEW TO BE NULL SO THAT ONLY ONE CART VIEW IS CREATED
    #cartView?: CartView;
 
    constructor(cart: Cart) {
        
        this.#cart = cart;
    }

    addToCart(product: Product): void {

        //WILL LIKELI HAVE IF STATEMENT TO CHECK IF THE CART VIEW WAS ALREADY CREATED OR NOT
        // IF ALREADY CREATED JUST UPDATE IT (THIS FIXED MY ERROR OF LIST NOT BEING SHOWED)
        if(!this.#cartView) {

            this.#cartView = new CartView(this.#cart, this);
        }

        this.#cart.addToCart(product);
    }
}