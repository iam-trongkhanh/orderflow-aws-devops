CREATE TABLE orders (
  id uuid PRIMARY KEY,
  item_name varchar(200) NOT NULL CHECK (length(btrim(item_name)) > 0),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 1000000),
  created_at timestamptz NOT NULL DEFAULT now()
);
