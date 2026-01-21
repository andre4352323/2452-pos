---
title: Domain model for my cool project!
author: Andre Lisandro Cruz Ibarra (cruzibal@myumanitoba.ca)
date: Winter 2026
---

# Flows of Interaction

## POS screen

this is the very first thing you will se when you start my app

:::mermaid
flowchart

    subgraph ADDING_PRODUCTS

        start[[Products Screen]]

        start == Press product image to add to the cart ==> updateCart
        updateCart[Update Cart] == Press checkout button ==> validCart
        updateCart == Press product image to add to the cart ==> updateCart
        start == Press checkout button ==> validCart
        validCart{Has product in cart}
        validCart -. Yes, print receipt .-> complete
        validCart -. No .-> start
       
        complete[[Order complete]]        
    
    end
:::