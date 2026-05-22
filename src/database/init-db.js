// import MongoClient and ServerApiVersion from the mongodb library and import products from the products.js file.
import {MongoClient, ServerApiVersion} from 'mongodb';
import { products } from './products.js';
// const { MongoClient, ServerApiVersion } = require('mongodb');
import * as argon2 from "argon2";

//build the uri for our connection string
const uri = process.env.MONGO_URI || "";
// console.log(`Mongo URI: ${uri}`);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



//define the init function to connect to our database and create collections
const init = async () => {
  try {
    await client.connect();
    console.log(`Connected to MongoDB`);
    // get a reference to the actual database we will be using with .db(<database name>)
    const db = client.db(process.env.MONGO_DATABASE);
    console.log(`Connected to database: ${db.databaseName}`);
    
    // initialize the Products collection
    await seedProducts(db);
    console.log(`Collection 'products' initialized successfully`);
    
    await createCollections(db);
    console.log(`Collections 'users', 'alerts', and 'orders' initialized successfully`);
    
  } catch (error) {
    console.error(error.message);
  } finally {
    await client.close();
  }
};

const lowerCaseKeys = function(obj) {
  // if it is an object, but NOT an array, then we need to iterate through all of its keys
  if (typeof obj === "object" && !Array.isArray(obj)) {
    for (let key in obj) {
      // take the first letter (key[0]) of the key and make it lowercase
      // then add that to the rest of the key after REMOVING the first letter (key.slice(1))
      let newKey = key[0].toLowerCase() + key.slice(1);
      // if the value of this key is an object, then we need to call this function again
      if (typeof obj[key] === "object") {
        obj[newKey] = lowerCaseKeys(obj[key]);
        delete obj[key];
      } else {
        obj[newKey] = obj[key];
        delete obj[key];
      }
    }
  } else if (Array.isArray(obj)) {
    // if it is an array, then we need to iterate through each item in the array
    // and for each object value call the function again.
    for (let i = 0; i < obj.length; i++) {
      let item = obj[i];
      if (typeof item === "object") {
        obj[i] = lowerCaseKeys(item);
      }
    }
  }
  return obj;
}

const seedProducts = async (db) => {
  // we need to make a small transform to the provided data before inserting
  // use .map() to transform each product before inserting it into the database
  // change Reviews.ReviewUrl to match the following pattern: /products/<productId>/reviews/

  
    // while we are at it...the data provided used a PascalCase naming convention for its keys. Use the provided lowerCaseKeys function to convert all keys to camelCase. This will make it consistent with the rest of our models.
    const formattedProducts = products.map((product) => {
      product.Reviews.ReviewsUrl = `/products/${product.Id}/reviews/`;
      product = lowerCaseKeys(product);
      return product;
    });
    try {
        // drop the collection to clear out the old records
        await db.collection("products").drop();
        console.log("Collection 'products' dropped successfully");
        // create a new collection
        await db.createCollection("products");
        console.log("Collection 'products' created successfully");
        // insert all products
        const result = await db.collection("products").insertMany(formattedProducts);
        console.log(
            `${result.insertedCount} new listing(s) created with the following id(s):`
        );
        console.log(result.insertedIds);

        await db.collection("products").createIndex({ name: 1 });
        await db.collection("products").createIndex({ description: 1 });
        await db.collection("products").createIndex({ category: 1 });
        await db.collection("products").createIndex({ id: 1 });

    } catch (error) {
      console.error(error.message);
    }
};

const createCollections = async (db) => {
  try {
    await db.collection("alerts").drop();
    console.log("Collection 'alerts' dropped successfully")

    await db.createCollection("alerts");
    console.log("Collection 'alerts' created successfully");

    await db.collection("orders").drop();
    console.log("Collection 'orders' dropped successfully")

    await db.createCollection("orders");
    console.log("Collection 'orders' created successfully");

    await db.collection("users").drop();
    console.log("Collection 'users' dropped successfully")

    await db.createCollection("users");
    console.log("Collection 'users' created successfully");

    const hashedPassword = await argon2.hash("password");

    const result = await db.collection("users").insertOne(
      {
        name: "Alex",
        email: "testuser@email.com",
        password: hashedPassword,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      console.log(
        `${result.insertedCount} new user created with the following id(s):`
      );
      console.log(result.insertedIds);

      await db.collection("users").createIndex({ name: 1 });
      await db.collection("users").createIndex({ email: 1 });

  }

  catch (error) {
    console.error(error.message);
  }
};

// Call init and handle completion
await init();