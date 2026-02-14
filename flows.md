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

        start == Press product image ==> productView[View Product Information]
        
        productView == Press add to cart button ==> updateCart{Update Cart}
        updateCart -. cart view updated .-> start
        
        productView == Close/Go Back button ==> start
        
        start == Press checkout button<br/>(only visible if cart has items) ==> receipt[Receipt printed with total cost]
        
        receipt == Press 'Paid and Done' button ==> complete[[Order Complete]]
    
    end
:::