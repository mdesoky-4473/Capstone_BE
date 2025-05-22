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
        ('Basketball', 'Official size and weight basketball suitable for indoor/outdoor play.', 29.99, 'https://target.scene7.com/is/image/Target/GUEST_20affc7e-e0d7-4eb6-a6f3-68d13520f8be?wid=1200&hei=1200&qlt=80&fmt=webp', 100),
        ('Soccer Ball', 'Durable synthetic leather soccer ball for training and matches.', 24.99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwP84bXC89RiNFstVvK_sKLjn_FZZ9HvV8yA&s', 80),
        ('Tennis Racket', 'Lightweight graphite tennis racket with comfortable grip.', 59.99, 'https://nwscdn.com/media/wysiwyg/3kf/tennis/Well_Balanced_Tennis_Racket_For_Senior_Tennis_Players.jpg', 60),
        ('Running Shoes', 'Breathable running shoes with cushioned soles.', 89.99, 'https://cdn.thewirecutter.com/wp-content/media/2024/11/runningshoes-2048px-09517.jpg?auto=webp&quality=75&width=1024', 120),
        ('Yoga Mat', 'Non-slip yoga mat with carrying strap.', 19.99, 'https://www.huggermugger.com/wp-content/uploads/2022/07/ultimate-cushion-yoga-mat_black_01___64388.1692990322.1280.1280-jpg.webp', 150),
        ('Baseball Glove', 'Leather baseball glove for right-handed throwers.', 39.99, 'https://www.diamondsportgear.com/cdn/shop/files/Nokona_Ballglove_Alpha_Select_Edge_S100_I-web-9-800x800.jpg?v=1732028173&width=720', 70),
        ('Dumbbell Set', 'Adjustable dumbbell set from 5 to 25 lbs.', 79.99, 'https://m.media-amazon.com/images/I/71bxRATPpIL._AC_UF1000,1000_QL80_.jpg', 50),
        ('Jump Rope', 'Speed jump rope with ball bearings for smooth rotation.', 14.99, 'https://img.lakeshorelearning.com/is/image/OCProduction/fb188?wid=800&fmt=jpeg&qlt=85,1&pscan=auto&op_sharpen=0&resMode=sharp2&op_usm=1,0.65,6,0', 200),
        ('Water Bottle', 'Insulated stainless steel water bottle, 32oz.', 12.99, 'https://i.etsystatic.com/11471603/r/il/57f627/2355415200/il_fullxfull.2355415200_9h58.jpg', 180),
        ('Cycling Helmet', 'Lightweight helmet with airflow vents and adjustable straps.', 49.99, 'https://m.media-amazon.com/images/I/61C+CXVy85L.jpg', 90);
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
