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

        Cashier "*" --o Receipt
        
        class Product{

            -~serial id
            -ProductType name
            -number price
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
            -Cart cart
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
            -?Coupon coupon
            -?Receipt receipt
            
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
        * name.length >= 20
        * description.length >= 50
        * product must not be null before apply() is called
        * product must appear 2 or more times in the cart"

        Coupon <|.. BOGO

        class TotalDiscount{

            -string name
            -string description

            +apply(Cart c) number

        }

        note for TotalDiscount "Invariant properties:
        * name.length >= 20
        * description.length >= 50"

        Coupon <|.. TotalDiscount
  
:::