import CartController from "./controller/cart-controller";

let trainerController = new CartController();

//connect button on the page with the controller
//this would be later moved to a view class

document.querySelector("#add-toCart")!
.addEventListener("click", () => trainerController.addToCart());