---
title: Domain model for my cool project!
author: Andre Lisandro Cruz Ibarra (cruzibal@myumanitoba.ca)
date: Winter 2026
---

# Domain model

:::mermaid

    classDiagram


        class Cashier{

            -~string userName
            -string password
            -?Array~Receipt~ receipt 

            +userName() string
            +password() string
        }

        note for Cashier "Invariant properties:
        * username.length >=  10
        * password.lenght >= 10
        * no need to check for null in receipt due to typescript preventing it"

        Cashier "*" --o Receipt
        
        class Product{

            -~serial id
            -ProductType name
            -number price
            -number quantityValue
            -ProductQuantity quantity
            -Cart cart
        
            +price() number
            +name() ProductType  
            +quantity() ProductQuantity 
        }

        Product "1" --* ProductType
        Product "1" --* ProductQuantity
        Product "1" --o Cart
        
        note for Product "Invariant properties:
        * price > 0.0
        * quantity value >= 1
        * no need to check for null quantity and name due to typescript preventing it
        * id is for ddl purposes to differentiate other instances of the same name in a cart"

        class ProductQuantity{
            <<enumeration>>

            UNITS,
            GR
        }

        ProductQuantity "+" --o Product
        
        class ProductType {
            <<enumeration>>

            POPCORN,
            SODA,
            SUGAR
        }

         ProductType "+" --o Product

        class Receipt {
            -~serial id
            -~Cart cart
            -Temporal time
            -Cashier cashier

            +totalCost() number
            +getTime() Temporal
            
        }

        Receipt "1" --o Cashier
        Receipt "1" --o Cart

        note for Receipt"Invariant properties:
        * no need to check cart if its null due to typescript preventing it"

        class Cart {
            
            -?Array~Product~ items
            -Array~Listeners~ listener
            -Coupon coupon
            -~Receipt receipt
            
            +applyCoupon(Coupon c) void
            +addToCart(Product p) void
            +checkout() Receipt
            +items() Array~Product~
            +clearCart() void
            +registerListeners(Listener l) void
        }

    
        note for Cart "Invariant properties:
        *loop items, Product.price > 0.0 in items."

        Cart "*" --o Product
        Cart "1" --o Coupon
        Cart "1" --* Receipt

        class Listeners{
            <<Interface>>

            +notify() void
        }

        class Coupon{
            <<interface>>
            
            +apply(Cart c) number
        }

        Coupon "1" --o Cart

        class BOGO{

            -string name
            -?Product product
            -string description

            +apply(Cart c) number
            
        }

        note for BOGO "Invariant properties:
        * name.length >= 5
        * description.length >= 10
        * product must not be null before apply() is called
        * product must appear 2 or more times in the cart"

        Coupon <|.. BOGO

        class TotalDiscount{

            -string name  
            -string description

            +apply(Cart c) number

        }

        note for TotalDiscount "Invariant properties:
        * name.length >= 5
        * description.length >= 10"

        Coupon <|.. TotalDiscount

        
  
:::

# Domain Model Changes

## New Classes
- **Cashier** — new actor with username/password and lazy receipt collection
- **ProductType** *(enum)* — replaces `string name` on Product; values: `POPCORN`, `SODA`, `SUGAR`
- **ProductQuantity** *(enum)* — new unit type on Product; values: `UNITS`, `GR`
- **Coupon** *(interface)* — discount strategy with `apply(Cart): number`
- **BOGO** *(implements Coupon)* — buy-one-get-one discount
- **TotalDiscount** *(implements Coupon)* — flat cart discount

## Modified Classes

**Product** — added `~serial id`, `quantityValue`, `ProductQuantity quantity`, `Cart cart`; `name` retyped from `string` to `ProductType`

**Receipt** — added `~serial id`, `Temporal time`, `Cashier cashier`, and `getTime()` method

**Cart** — added `Coupon coupon`, `~Receipt receipt`, `applyCoupon()` method; `items` made optional

## Removed Invariants
- `Product.name.length >= 1` — no longer needed, name is now enforced by `ProductType` enum