-- ProductType enum
create table if not exists product_type (
  name varchar(50) primary key
);

-- ProductQuantity enum
create table if not exists product_quantity (
  unit varchar(50) primary key
);

-- Cashier
create table if not exists cashier (
  username varchar(255) primary key,
  password varchar(255) not null
);

-- Cart
create table if not exists cart (
  id serial primary key,
  cashier_username varchar(255) references cashier(username),
  checked_out boolean not null default false
);

-- Product (owned by cart)
create table if not exists product (
  id serial primary key,
  name varchar(50) not null,
  price numeric(10, 2) not null,
  quantity_value numeric not null,
  quantity_unit varchar(50) not null,
  cart_id integer,
  foreign key (name) references product_type(name),
  foreign key (quantity_unit) references product_quantity(unit),
  foreign key (cart_id) references cart(id) on delete cascade
);

-- Receipt (owned by cart)
create table if not exists receipt (
  id serial primary key,
  cart_id integer not null unique,
  cashier_username varchar(255) not null,
  time timestamp not null default now(),
  foreign key (cart_id) references cart(id) on delete cascade,
  foreign key (cashier_username) references cashier(username)
);

-- Coupon (owned by cart)
create table if not exists coupon (
  id serial primary key,
  name varchar(255) not null,
  description varchar(255) not null,
  selected_product_id integer,
  cart_id integer unique,
  foreign key (selected_product_id) references product(id),
  foreign key (cart_id) references cart(id) on delete cascade
);

-- Product Inventory
create table if not exists product_inventory (
  product_type varchar(50) primary key,
  product_unit varchar(50) not null,
  product_price numeric(10, 2)
);

insert into product_inventory (product_type, product_unit, product_price) values
('POPCORN', 'UNITS', 5.00),
('SODA',    'UNITS', 3.50),
('SUGAR',   'GR',    0.05)
('GUMMY BEARS', 'GR', 0.025),
('ICE CREAM',    'UNITS', 3.50),
('HOT DOG',   'UNITS',    4.00),
('CHIPS', 'UNITS', 5.20),
('GUMMY WORMS',    'GR', 0.035),
('NACHOS',   'UNITS',    6.50)
('CHOCOLATE', 'UNITS', 2.50),
('GUMMY SHARKS', 'GR', 0.065),
('OREO MILKSHAKE',    'UNITS', 7.80),
('GUMMY PENGUINS',   'GR',    0.075),
on conflict do nothing;

-- Coupon Inventory
create table if not exists coupon_inventory (
  id serial primary key,
  type varchar(50) not null unique,
  name varchar(255) not null,
  description varchar(255) not null
);

insert into coupon_inventory (type, name, description) values
('BOGO',           'BOGO Coupon',     'Buy one product and get one of the same for free.'),
('TOTAL_DISCOUNT', 'Total Discount',  'Get 10% off the total value of your cart.')
on conflict (type) do nothing;

-- Sync enum tables from inventory
insert into product_type (name)
  select distinct product_type from product_inventory
  on conflict do nothing;

insert into product_quantity (unit)
  select distinct product_unit from product_inventory
  on conflict do nothing;

-- Cashier catalog (for login lookup)
create table if not exists cashier_catalog (
  username varchar(255) primary key,
  password varchar(255) not null
);