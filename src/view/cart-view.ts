import type Cart from "../model/cart";
import type CartController from "../controller/cart-controller";
import type Product from "../model/product";    

export default class CartView {

    #cart: Cart;
    #cartEl: HTMLUListElement;
    #cartController: CartController;

    constructor(cart: Cart, cartController: CartController) {

        //view needs to listen for changes in the cart (like addiging items)
        this.#cart = cart;
        this.#cartController = cartController;
        this.#cart.registerListener(this);  

        //adding the div to the html document and 
        // the div added has an unordered list to hold cart items
        document.querySelector("#app")!.innerHTML = 
            `<div id="cart">
              <h2>Shopping Cart</h2>
              <ul></ul>
             </div>`
        
        this.#cartEl = document.querySelector("#cart > ul")!;
    }

    //this method is needed to satisfy the Listener interface
    notify(): void {

        //update internal state of products showing up

        //empty the contents of the list
        this.#cartEl.replaceChildren();
        //repopulate the list with current items in the cart
        this.#cart.items.forEach( (item) => {

            let productEl = document.createElement("li");
            productEl.innerHTML = `<strong>${item.name}</strong> $${item.price.toFixed(2)}`;

            this.#cartEl.appendChild(productEl);
        });    


    }    
}