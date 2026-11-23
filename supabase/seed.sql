-- Starter products (prices in GEL). Safe to re-run: existing slugs are skipped.
insert into public.products (name, slug, price, image_url, description) values
  ('Nike Fleece Jacket', 'nike-fleece-jacket', 289, '/products/nike-fleece-jacket.jpg', 'Soft full-zip polar fleece with a stand collar. Warm, light, made for everyday wear.'),
  ('The North Face Puffer Jacket', 'the-north-face-puffer-jacket', 549, '/products/north-face-puffer.jpg', 'Glossy quilted puffer with a hood. Insulated for Georgian winters.'),
  ('Essentials Oversized Hoodie', 'essentials-oversized-hoodie', 199, '/products/essentials-hoodie.jpg', 'Heavyweight heather grey hoodie with a relaxed oversized fit and kangaroo pocket.'),
  ('Adidas Track Pants', 'adidas-track-pants', 169, '/products/adidas-track-pants.jpg', 'Classic black track pants with three side stripes and cuffed ankles.'),
  ('Nike Air Force 1 ''07', 'nike-air-force-1-07', 379, '/products/air-force-1.jpg', 'All-white leather low-tops. The everyday sneaker that goes with everything.'),
  ('Carhartt Watch Beanie', 'carhartt-watch-beanie', 79, '/products/carhartt-beanie.jpg', 'Ribbed knit cuffed beanie in hamilton brown.')
on conflict (slug) do nothing;
