-- ProductType enum
create table product_type (
  name varchar(50) not null unique
);

insert into product_type (name) values ('POPCORN'), ('SODA'), ('SUGAR');

-- ProductQuantity enum
create table product_quantity (
  unit varchar(50) not null unique
);

insert into product_quantity (unit) values ('UNITS'), ('GR');

-- Cashier
create table cashier (
  username varchar(255) not null unique,
  password varchar(255) not null
);

-- Cart
create table cart (
  id serial not null unique
);

-- Product
create table product (
  id serial not null unique,
  name varchar(50) not null,
  price numeric(10, 2) not null check (price > 0.0),
  quantity_unit varchar(50) not null,
  cart_id integer,
  foreign key (name) references product_type(name),
  foreign key (quantity_unit) references product_quantity(unit),
  foreign key (cart_id) references cart(id)
);

-- Receipt
create table receipt (
  id serial not null unique,
  cart_id integer not null,
  cashier_username varchar(255) not null,
  time timestamptz not null,
  foreign key (cart_id) references cart(id),
  foreign key (cashier_username) references cashier(username)
);

create table coupon (
  id serial not null unique,
  type varchar(50) not null,              -- BOGO or TOTAL_DISCOUNT
  name varchar(255) not null check (length(name) >= 20),
  description varchar(255) not null check (length(description) >= 50),
  selected_product_id integer,            -- only filled for BOGO, null for TOTAL_DISCOUNT
  cart_id integer,
  foreign key (selected_product_id) references product(id),
  foreign key (cart_id) references cart(id)
);