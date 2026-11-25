-- Starter products (prices in GEL). Safe to re-run: existing slugs are skipped.
insert into public.products (name, slug, price, image_url, description) values
  ('Nike Fleece Jacket', 'nike-fleece-jacket', 289, '/products/nike-fleece-jacket.jpg', 'Soft full-zip polar fleece with a stand collar. Warm, light, made for everyday wear.'),
  ('The North Face Puffer Jacket', 'the-north-face-puffer-jacket', 549, '/products/north-face-puffer.jpg', 'Glossy quilted puffer with a hood. Insulated for Georgian winters.'),
  ('Essentials Oversized Hoodie', 'essentials-oversized-hoodie', 199, '/products/essentials-hoodie.jpg', 'Heavyweight heather grey hoodie with a relaxed oversized fit and kangaroo pocket.'),
  ('Adidas Track Pants', 'adidas-track-pants', 169, '/products/adidas-track-pants.jpg', 'Classic black track pants with three side stripes and cuffed ankles.'),
  ('Nike Air Force 1 ''07', 'nike-air-force-1-07', 379, '/products/air-force-1.jpg', 'All-white leather low-tops. The everyday sneaker that goes with everything.'),
  ('Carhartt Watch Beanie', 'carhartt-watch-beanie', 79, '/products/carhartt-beanie.jpg', 'Ribbed knit cuffed beanie in hamilton brown.'),
  ('New Era 59FIFTY Cap', 'new-era-59fifty-cap', 99, '/products/new-era-cap.jpg', 'Structured black fitted cap with a flat brim.'),
  ('Stüssy Basic Tee', 'stussy-basic-tee', 129, '/products/stussy-basic-tee.jpg', 'Heavyweight black cotton tee with dropped shoulders and a boxy fit.'),
  ('Champion Reverse Weave Crewneck', 'champion-reverse-weave-crewneck', 189, '/products/champion-crewneck.jpg', 'Thick navy crewneck sweatshirt with ribbed side panels that keep its shape.'),
  ('Nike Tech Fleece Joggers', 'nike-tech-fleece-joggers', 259, '/products/nike-tech-fleece-joggers.jpg', 'Slim tapered joggers in dark grey tech fleece with zip pockets.'),
  ('Carhartt WIP Cargo Pants', 'carhartt-wip-cargo-pants', 279, '/products/carhartt-cargo-pants.jpg', 'Relaxed olive ripstop cargo pants with flap side pockets.'),
  ('Nike Windrunner Jacket', 'nike-windrunner-jacket', 299, '/products/nike-windrunner.jpg', 'Lightweight hooded half-zip windbreaker with the classic chevron panel.'),
  ('Adidas Samba OG', 'adidas-samba-og', 329, '/products/adidas-samba-og.jpg', 'White leather low-tops with black stripes, a suede toe and a gum sole.'),
  ('New Balance 550', 'new-balance-550', 349, '/products/new-balance-550.jpg', 'Retro basketball low-tops in white leather with forest green suede.')
on conflict (slug) do nothing;
