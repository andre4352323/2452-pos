import { expect, test } from 'vitest';
import Cart from '../src/model/cart';
import Product from '../src/model/product';

test('Adding to cart', () => {

    let product = new Product('Sample Product', 10.0);
    let cart = new Cart();
    
    cart.addToCart(product);

    expect(cart.items.includes(product));
}); 

test('Listening to cart changes', () => {

    let product = new Product('Sample Product', 10.0);
    let cart = new Cart();
    let listenerCalled = false;
    cart.addToCart(product);

    expect(listenerCalled).toBe(true);
});