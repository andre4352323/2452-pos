import { expect, test, describe } from 'vitest';
import Cart from '../src/model/cart';
import Product from '../src/model/product';
import Receipt from '../src/model/receipt';
import type Listener from '../src/model/listeners';

describe('Product', () => {

    test('Create product with valid name and price', () => {

        const product = new Product('Sample Product', 10.0);
        
        expect(product.name).toBe('Sample Product');
        expect(product.price).toBe(10.0);
    });

    test('Product with empty name throws error', () => {

        expect(() => new Product('', 10.0)).toThrow('Product name should be at least 1 character long');
    });

    test('Product with zero price throws error', () => {

        expect(() => new Product('Test', 0.0)).toThrow('Product price should be greater than 0.0');
    });

    test('Product with negative price throws error', () => {

        expect(() => new Product('Test', -5.0)).toThrow('Product price should be greater than 0.0');
    });
});

describe('Cart', () => {

    test('New cart is empty', () => {
        const cart = new Cart();
        
        expect(cart.items).toEqual([]);
        expect(cart.items.length).toBe(0);
    });

    test('Adding product to cart', () => {

        const product = new Product('Sample Product', 10.0);
        const cart = new Cart();
        
        cart.addToCart(product);

        expect(cart.items).toContain(product);
        expect(cart.items.length).toBe(1);
    });

    test('Adding multiple products to cart', () => {

        const product1 = new Product('Product 1', 10.0);
        const product2 = new Product('Product 2', 20.0);
        const cart = new Cart();
        
        cart.addToCart(product1);
        cart.addToCart(product2);

        expect(cart.items.length).toBe(2);
        expect(cart.items).toContain(product1);
        expect(cart.items).toContain(product2);
    });

    test('Clearing cart removes all items', () => {

        const product1 = new Product('Product 1', 10.0);
        const product2 = new Product('Product 2', 20.0);
        const cart = new Cart();
        
        cart.addToCart(product1);
        cart.addToCart(product2);
        cart.clearCart();

        expect(cart.items.length).toBe(0);
        expect(cart.items).toEqual([]);
    });

    test('Cart notifies listeners when item is added', () => {

        const product = new Product('Sample Product', 10.0);
        const cart = new Cart();
        let listenerCalled = false;
        
        const listener: Listener = {
            notify: () => { listenerCalled = true; }
        };
        
        cart.registerListener(listener);
        cart.addToCart(product);

        expect(listenerCalled).toBe(true);
    });

    test('Cart notifies listeners when cart is cleared', () => {

        const product = new Product('Sample Product', 10.0);
        const cart = new Cart();
        let notifyCount = 0;
        
        const listener: Listener = {
            notify: () => { notifyCount++; }
        };
        
        cart.registerListener(listener);
        cart.addToCart(product); 
        cart.clearCart(); 

        expect(notifyCount).toBe(2);
    });

    test('Cart can register multiple listeners', () => {

        const product = new Product('Test', 10.0);
        const cart = new Cart();
        let listener1Called = false;
        let listener2Called = false;
        
        const listener1: Listener = {
            notify: () => { listener1Called = true; }
        };
        const listener2: Listener = {
            notify: () => { listener2Called = true; }
        };
        
        cart.registerListener(listener1);
        cart.registerListener(listener2);
        cart.addToCart(product);

        expect(listener1Called).toBe(true);
        expect(listener2Called).toBe(true);
    });

    test('Checkout returns a receipt', () => {

        const cart = new Cart();
        const receipt = cart.checkout();

        expect(receipt).toBeInstanceOf(Receipt);
    });

    test('Checkout creates receipt with cart reference', () => {

        const product = new Product('Test', 10.0);
        const cart = new Cart();
        
        cart.addToCart(product);
        const receipt = cart.checkout();

        expect(receipt.totalCost()).toBe(10.0);
    });
});

describe('Receipt', () => {

    test('Receipt calculates total cost of empty cart', () => {

        const cart = new Cart();
        const receipt = new Receipt(cart);

        expect(receipt.totalCost()).toBe(0);
    });

    test('Receipt calculates total cost of single item', () => {

        const product = new Product('Product', 15.0);
        const cart = new Cart();
        
        cart.addToCart(product);
        const receipt = new Receipt(cart);

        expect(receipt.totalCost()).toBe(15.0);
    });

    test('Receipt calculates total cost of multiple items', () => {

        const product1 = new Product('Product 1', 10.0);
        const product2 = new Product('Product 2', 20.0);
        const product3 = new Product('Product 3', 5.50);
        const cart = new Cart();
        
        cart.addToCart(product1);
        cart.addToCart(product2);
        cart.addToCart(product3);
        const receipt = new Receipt(cart);

        expect(receipt.totalCost()).toBe(35.50);
    });

    test('Receipt created from checkout calculates correct total', () => {
        
        const product1 = new Product('Item A', 12.99);
        const product2 = new Product('Item B', 7.01);
        const cart = new Cart();
        
        cart.addToCart(product1);
        cart.addToCart(product2);
        const receipt = cart.checkout();

        expect(receipt.totalCost()).toBe(20.00);
    });
});