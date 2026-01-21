---
title: Domain model for my cool project!
author: Andre Lisandro Cruz Ibarra (cruzibal@myumanitoba.ca)
date: Winter 2026
---

# Domain model

:::mermaid

    classDiagram

        class Product{
            
            -string name
            -number price

            +price() number
            +name() string
            
    
        }

        note for Product "Invariant properties:
        * name.length >= 1
        * price >= 1"

    
        class Receipt {
            -Cart cart

            +print() void
            
        }

        note for Receipt"Invariant properties:
        * no need to check cart if its null due to typescript preventing it"

        class Cart {
            -Array~Product~ items

            +addToCart(Product p) void
            +checkout() Receipt
        
        }

        note for Cart "Invariant properties:
        *loop items, Product.name.length >=1 and Product.price >= 1 in items."

        Cart --o Product
        Cart --* Receipt

:::


