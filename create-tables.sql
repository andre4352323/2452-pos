-- ProductType enum
create table if not exists product_type (
  name varchar(50) primary key
);

insert into product_type (name) values ('POPCORN'), ('SODA'), ('SUGAR') on conflict do nothing;

-- ProductQuantity enum
create table if not exists product_quantity (
  unit varchar(50) primary key
);

insert into product_quantity (unit) values ('UNITS'), ('GR') on conflict do nothing;

-- Cashier
create table if not exists cashier (
  username varchar(255) primary key,
  password varchar(255) not null check (length(password) >= 10),
  constraint username_length check (length(username) >= 10)
);

-- Cart
create table if not exists cart (
  id serial primary key
);

-- Product
create table if not exists product (
  id serial primary key,
  name varchar(50) not null,
  price numeric(10, 2) not null check (price > 0.0),
  quantity_value numeric not null check (quantity_value >= 1),
  quantity_unit varchar(50) not null,

  cart_id integer,
  foreign key (name) references product_type(name),
  foreign key (quantity_unit) references product_quantity(unit) on delete restrict,
  foreign key (cart_id) references cart(id) on delete set null
);

-- Receipt
create table if not exists receipt (
  id serial primary key,
  cart_id integer not null unique,
  cashier_username varchar(255) not null,
  time timestamptz not null default now(),
  foreign key (cart_id) references cart(id) on delete cascade,
  foreign key (cashier_username) references cashier(username) 
  on update cascade
  on delete restrict
);

create table if not exists coupon (
  id serial primary key,
  type varchar(50) not null,              -- BOGO or TOTAL_DISCOUNT
  name varchar(255) not null check (length(name) >= 5),
  description varchar(255) not null check (length(description) >= 10),
  selected_product_id integer,            -- only filled for BOGO, null for TOTAL_DISCOUNT
  cart_id integer unique,
  foreign key (selected_product_id) references product(id) on delete set null,
  foreign key (cart_id) references cart(id) on delete set null
);