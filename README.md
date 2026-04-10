title: POS System
author: Andre Lisandro Cruz Ibarra (cruzibal@umanitoba.ca)
date: Winter 2026
---

# Overview

POS System is an implementation of the software used to do things like keep track of inventory and create receipts for COMP 2452 in Winter 2026.

# Running

This project is a Node.js project using VSCode. You can run it on the command
line using
`npm install` and then
`npx vite`:
the last command have to be typed after running my training program below 
and then open your web browser and go to the address printed out.


# Training of the data
 so to run my training program run this command line in the root of the program,
 `npx ts-node train.ts` and it will output a model.csv file in the root of the program that contains and adjacency matrix with raw probabilities between [0,1]

# Domain model and flow diagrams

* You can find my domain model in `domain.md`.
* You can find my flow diagrams in `flows.md`.

# Changes in my domain model and flow diagrams

* Made a new class cashier with username and password with an array of receipts
* Added temporal variable to Receipt
* Added enumeration class for product names and use it in my product class as name instead of string
* Made a new flow to choose from two coupons when trying to checkout instead of just paying right away
* the new point of start is the log in screen flow and added a sign up flow to create a cashier account and then log in