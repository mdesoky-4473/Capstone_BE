const client = require('../db/client');
const bcrypt = require('bcryptjs'); 

async function seed() {
  try {
    await client.connect();

    // Drop tables if they exist
    await client.query(`DROP TABLE IF EXISTS users CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS products CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS cart_items;`);

    // Create the users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'user'
      );
    `);

    // Create the products table
    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        image_url TEXT,
        stock_quantity INTEGER NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        UNIQUE (user_id, product_id)
      );
    `);

    // Seed sample products
    await client.query(`
      INSERT INTO products (name, description, price, image_url, stock_quantity)
      VALUES 
        ('Basketball', 'Official size and weight basketball suitable for indoor/outdoor play.', 29.99, 'https://via.placeholder.com/150', 100),
        ('Soccer Ball', 'Durable synthetic leather soccer ball for training and matches.', 24.99, 'https://via.placeholder.com/150', 80),
        ('Tennis Racket', 'Lightweight graphite tennis racket with comfortable grip.', 59.99, 'https://via.placeholder.com/150', 60),
        ('Running Shoes', 'Breathable running shoes with cushioned soles.', 89.99, 'https://via.placeholder.com/150', 120),
        ('Yoga Mat', 'Non-slip yoga mat with carrying strap.', 19.99, 'https://via.placeholder.com/150', 150),
        ('Baseball Glove', 'Leather baseball glove for right-handed throwers.', 39.99, 'https://via.placeholder.com/150', 70),
        ('Dumbbell Set', 'Adjustable dumbbell set from 5 to 25 lbs.', 79.99, 'https://via.placeholder.com/150', 50),
        ('Jump Rope', 'Speed jump rope with ball bearings for smooth rotation.', 14.99, 'https://via.placeholder.com/150', 200),
        ('Water Bottle', 'Insulated stainless steel water bottle, 32oz.', 12.99, 'https://via.placeholder.com/150', 180),
        ('Cycling Helmet', 'Lightweight helmet with airflow vents and adjustable straps.', 49.99, 'https://via.placeholder.com/150', 90);
    `);

    // Create an admin user

    const SALT_ROUNDS = 10;
    const hashedAdminPassword = await bcrypt.hash('adminpass', SALT_ROUNDS);
    await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@example.com', $1, 'admin');
    `, [hashedAdminPassword]);

    console.log('Database seeded!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}

seed();
