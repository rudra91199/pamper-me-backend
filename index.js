const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// database user and password
// pamperme20
// pamper-me-backend.vercel.app

const uri =
  "mongodb+srv://pamperme20:pamperme20@cluster0.gzilgnl.mongodb.net/?retryWrites=true&w=majority";

// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const productCollection = client.db("pamperme").collection("products");
    const orderCollection = client.db("pamperme").collection("orders");
    const userCollection = client.db("pamperme").collection("users");
    const couponCollection = client.db("pamperme").collection("coupons");
    const blogCollection = client.db("pamperme").collection("blogs");
    const reviewCollection = client.db("pamperme").collection("reviews");
    const serviceCollection = client.db("pamperme").collection("services");
    const bookingCollection = client.db("pamperme").collection("bookings");

    // Function to convert a product name to a slug
    function product_name_to_slug(product_name) {
      let slug = product_name.replace(/[^a-zA-Z0-9-]+/g, "-");
      slug = slug.replace(/-+/g, "-");
      slug = slug.replace(/^-+|-+$/g, "");
      return slug;
    }

    // insert products
    // app.get("/insert", async (req, res) => {
    //   productCollection.insertMany(data)
    //     .then((result) => {
    //       console.log(
    //         `Successfully inserted ${result.length} documents into MongoDB`
    //       );
    //     })
    //     .catch((error) => {
    //       console.error("Error inserting data into MongoDB:", error);
    //     });
    // });

    // get products
    app.get("/products", async (req, res) => {
      // const query = { status: "publish", stock_status: "instock" };
      const query = req.query;
      let uniqueSubCategory;
      let uniqueBrand;
      console.log(query);

      const products = await productCollection.find().toArray();

      const uniqueCategory = [
        ...new Set(products.map((item) => item.category)),
      ];

      if (!query.category && query.subcategory) {
        const cat = products.find(
          (product) => product.subcategory == query.subcategory
        ).category;
        // const subcategory = await productCollection.find({category:cat}).toArray();
        const subcategory = products.filter(
          (product) => product.category == cat
        );
        uniqueSubCategory = [
          ...new Set(subcategory.map((item) => item.subcategory)),
        ];
        const brand = subcategory.filter(
          (product) => product.subcategory == query.subcategory
        );
        uniqueBrand = [...new Set(brand.map((item) => item.Brand))];
      } else if (query.category && !query.subcategory) {
        // const subcategory = await productCollection.find(filter1).toArray();
        const subcategory = products.filter(
          (product) => product.category == query.category
        );
        uniqueSubCategory = [
          ...new Set(subcategory.map((item) => item.subcategory)),
        ];
        const brand = products.filter(
          (product) => product.category == query.category
        );
        uniqueBrand = [...new Set(brand.map((item) => item.Brand))];
      } else if (
        query.category &&
        query.category != "all" &&
        query.subcategory &&
        query.subcategory != "brand"
      ) {
        let subcategory;
        if (query.brand) {
          subcategory = products.filter(
            (product) => product.Brand == query.brand && product.category == query.category
          );
        } else {
          subcategory = products.filter(
            (product) => product.category == query.category
          );
        }
        uniqueSubCategory = [
          ...new Set(subcategory.map((item) => item.subcategory)),
        ];
        const brand = products.filter(
          (product) => product.subcategory == query.subcategory
        );
        uniqueBrand = [...new Set(brand.map((item) => item.Brand))];
      }
      // else if(query.ca)
      else if (query.brand) {
        const subcategory = products.filter(
          (product) => product.Brand == query.brand
        );
        uniqueSubCategory = [
          ...new Set(subcategory.map((item) => item.subcategory)),
        ];
        uniqueBrand = [...new Set(products.map((item) => item.Brand))];
      } else {
        uniqueSubCategory = [
          ...new Set(products.map((item) => item.subcategory)),
        ];
        uniqueBrand = [...new Set(products.map((item) => item.Brand))];
      }

      res.send({ products, uniqueCategory, uniqueSubCategory, uniqueBrand });

      // const cursor = productCollection.find();
      // const result = await cursor.toArray();
      // res.send(result);
    });
    // get services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
      console.log(result.length);
    });
    // get All Bookings
    app.get("/bookings", async (req, res) => {
      const query = {};
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
      console.log(result.length);
    });
    // get bookings by email
    app.get("/bookingsByEmail/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
      console.log(result.length);
    });
    // post booking
    app.post("/confirmBooking", async (req, res) => {
      const data = req.body;
      const result = await bookingCollection.insertOne(data);
      res.send(result);
    });

    app.get("/update-product-slugs", async (req, res) => {
      try {
        const query = { status: "publish", stock_status: "instock" };
        const cursor = productCollection.find(query);

        const products = await cursor.toArray();

        for (const product of products) {
          const newSlug = product_name_to_slug(product.name);
          await productCollection.updateOne(
            { _id: product._id },
            { $set: { slug: newSlug } }
          );
        }

        return res.json({ message: "Product slugs updated successfully" });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while updating product slugs" });
      }
    });

    app.get("/shop", async (req, res) => {
      const page = req.query.page;
      const query = {
        status: "publish",
        stock_status: "instock",
      };
      const cursor = productCollection
        .find(query)
        .skip(page * 50)
        .limit(50);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get shop products count
    app.get("/shopProductCount", async (req, res) => {
      const query = {
        status: "publish",
        stock_status: "instock",
      };
      const count = await productCollection.countDocuments(query);
      res.send({ count });
    });

    // get admin dashboard products
    // app.get("/Allproducts", async (req, res) => {
    //   const page = parseInt(req.query.page);
    //   const query = {};
    //   let products;
    //   if (page) {
    //     products = await productCollection
    //       .find(query)
    //       .sort({ date_created: -1 })
    //       .skip(page * 50)
    //       .limit(50)
    //       .toArray();
    //   } else {
    //     products = await productCollection
    //       .find(query)
    //       .sort({ date_created: -1 })
    //       .limit(50)
    //       .toArray();
    //   }
    //   res.send(products);
    //   console.log(products.length);
    // });
    // get all products

    // get single product
    app.get("/product/:slug", async (req, res) => {
      const slug = req.params.slug;
      console.log(slug);
      const product = await productCollection.findOne({
        slug: slug,
      });
      res.send(product);
    });

    //get amount of data
    app.get("/productCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });
    app.get("/orderCount", async (req, res) => {
      const count = await orderCollection.estimatedDocumentCount();
      res.send({ count });
    });
    app.get("/reviewCount", async (req, res) => {
      const count = await reviewCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // get new arrivals
    app.get("/newArrivals", async (req, res) => {
      const query = { status: "publish", stock_status: "instock" };
      const cursor = productCollection.find(query).limit(50);
      const result = await cursor.toArray();
      res.send(result);
      console.log(result.length);
    });

    //get products by tags
    app.get("/getProductsByTags", async (req, res) => {
      const page = req.query.page;
      const name = req.query.name;
      const query = {
        status: "publish",
        stock_status: "instock",
        "tags.name": {
          $regex: new RegExp(name, "i"), // "i" for case-insensitive
        },
      };

      const cursor = productCollection.find(query).limit(50);
      const result = await cursor.toArray();
      res.send(result);
      console.log(result.length);
    });
    //filter products by tags
    app.get("/filterByTags", async (req, res) => {
      const page = req.query.page;
      const name = req.query.name;
      const query = {
        "tags.name": {
          $regex: new RegExp(name, "i"), // "i" for case-insensitive
        },
      };

      const cursor = productCollection.find(query).sort({ date_created: -1 });
      const result = await cursor.toArray();
      res.send(result);
      console.log(result.length);
    });
    //get products count by categories
    app.get("/categoryProductCount", async (req, res) => {
      const name = req.query.name;
      const query = {
        status: "publish",
        stock_status: "instock",
        "categories.name": {
          $regex: new RegExp(name, "i"), // "i" for case-insensitive
        },
      };
      const count = await productCollection.countDocuments(query);
      res.send({ count });
    });

    //get products by categories
    app.get("/getProductsByCategory", async (req, res) => {
      const query = {
        ...(req.query.subcategory &&
          req.query.subcategory != "brand" && {
            subcategory: req.query.subcategory,
          }),
        ...(req.query.category &&
          req.query.category != "all" && { category: req.query.category }),
        ...(req.query.Brand && { Brand: req.query.Brand }),
          ...((req.query.min && req.query.max) && ({price: {$gt:req.query.min, $lt:req.query.max}}) )
        // status: "publish",
        // stock_status: "instock",
        // category: { $regex: new RegExp(category, "i") },
      };
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get products by query
    app.get("/getProductsByQuery", async(req, res) =>{
      const query = req.query;
      console.log(query);
      const filter = {
        ...(query.search && {name: { $regex: new RegExp(query.search, "i") }})
      }
      console.log(filter)
      const result = await  productCollection.find(filter).toArray();
      res.send(result);
    })

    //get filters
    app.get("/getfilters", async (req, res) => {
      const query = req.query;
      let uniqueSubCategory;
      let uniqueBrand;

      const products = await productCollection.find().toArray();

      const uniqueCategory = [
        ...new Set(products.map((item) => item.category)),
      ];

      if (!query.category && query.subcategory) {
        const cat = products.find(
          (product) => product.subcategory == query.subcategory
        ).category;
        // const subcategory = await productCollection.find({category:cat}).toArray();
        const subcategory = products.filter(
          (product) => product.category == cat
        );
        uniqueSubCategory = [
          ...new Set(subcategory.map((item) => item.subcategory)),
        ];
        const brand = subcategory.filter(
          (product) => product.subcategory == query.subcategory
        );
        uniqueBrand = [...new Set(brand.map((item) => item.Brand))];
      } else if (query.category && !query.subcategory) {
        // const subcategory = await productCollection.find(filter1).toArray();
        const subcategory = products.filter(
          (product) => product.category == query.category
        );
        uniqueSubCategory = [
          ...new Set(subcategory.map((item) => item.subcategory)),
        ];
        const brand = products.filter(
          (product) => product.category == query.category
        );
        uniqueBrand = [...new Set(brand.map((item) => item.Brand))];
      } else if (query.category && query.subcategory) {
        const subcategory = products.filter(
          (product) => product.category == query.category
        );
        uniqueSubCategory = [
          ...new Set(subcategory.map((item) => item.subcategory)),
        ];
        const brand = products.filter(
          (product) => product.subcategory == query.subcategory
        );
        uniqueBrand = [...new Set(brand.map((item) => item.Brand))];
      } else if (query.brand) {
        const subcategory = products.filter(
          (product) => product.Brand == query.brand
        );
        uniqueSubCategory = [
          ...new Set(subcategory.map((item) => item.subcategory)),
        ];
        uniqueBrand = [...new Set(products.map((item) => item.Brand))];
      } else {
        uniqueSubCategory = [
          ...new Set(products.map((item) => item.subcategory)),
        ];
        uniqueBrand = [...new Set(products.map((item) => item.Brand))];
      }
      res.send({ uniqueCategory, uniqueSubCategory, uniqueBrand });
    });

    // post product
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    // edit product
    app.put("/editProduct/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: data,
      };
      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // delete product
    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(filter);
      res.send(result);
    });

    // search backend product
    app.get("/search/:searchedText", async (req, res) => {
      const searchedText = req.params.searchedText;
      console.log(searchedText);
      const result = await productCollection
        .find({ name: { $regex: searchedText, $options: "i" } })
        .toArray();
      res.send(result);
      console.log(result.length);
    });
    
    // search frontend product
    app.get("/searchProduct/:searchText", async (req, res) => {
      const searchText = req.params.searchText;
      console.log(searchText);
      const query = {
        status: "publish",
        stock_status: "instock",
        name: {
          $regex: searchText,
          $options: "i", // "i" for case-insensitive
        },
      };
      const result = await productCollection.find(query).toArray();
      res.send(result);
      console.log(result.length);
    });

    // search order by name
    app.get("/searchOrder/:searchedText", async (req, res) => {
      const searchedText = req.params.searchedText;
      const query = [
        {
          $match: {
            $expr: {
              $regexMatch: {
                input: {
                  $concat: ["$billing.first_name", " ", "$billing.last_name"],
                },
                regex: searchedText,
                options: "i",
              },
            },
          },
        },
      ];
      const result = await orderCollection
        .aggregate(query)
        .sort({ order_date: -1 })
        .toArray();
      res.send(result);
      console.log(result.length);
    });
    // search order by id
    app.get("/searchOrderById/:searchedText", async (req, res) => {
      const searchedText = req.params.searchedText;
      console.log(searchedText);
      const query = {
        id: parseInt(searchedText),
      };
      const result = await orderCollection
        .find(query)
        .sort({ order_date: -1 })
        .toArray();
      res.send(result);
      console.log(result.length);
    });
    // search order by phone
    app.get("/searchOrderByPhone/:searchedText", async (req, res) => {
      const searchedText = req.params.searchedText;
      const query = {
        "billing.phone": { $regex: searchedText, $options: "i" },
      };
      const result = await orderCollection
        .find(query)
        .sort({ order_date: -1 })
        .toArray();
      res.send(result);
      console.log(result.length);
    });
    // search user
    app.get("/searchUser/:searchedText", async (req, res) => {
      const searchedText = req.params.searchedText;
      const query = {
        name: { $regex: searchedText, $options: "i" },
      };
      const result = await userCollection.find(query).toArray();
      res.send(result);
      console.log(result.length);
    });
    // get order confirmation data
    app.get("/orderConfirmation/:confirmationTime", async (req, res) => {
      const confirmationTime = req.params.confirmationTime;
      const query = { order_time: parseInt(confirmationTime) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    // post order list
    app.post("/order", async (req, res) => {
      const orderList = req.body;
      const result = await orderCollection.insertOne(orderList);
      res.send(result);
    });
    // get admin dashboard orders
    app.get("/orders", async (req, res) => {
      const page = parseInt(req.query.page);
      const query = {};
      let orders;
      if (page) {
        orders = await orderCollection
          .find(query)
          .sort({ order_date: -1 })
          .skip(page * 50)
          .limit(50)
          .toArray();
      } else {
        orders = await orderCollection
          .find(query)
          .sort({ order_date: -1 })
          .limit(50)
          .toArray();
      }
      res.send(orders);
      console.log(orders.length);
    });
    // get admin dashboard sorted order
    app.get("/sortOrders", async (req, res) => {
      const page = parseInt(req.query.page);
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const query = {
        order_date: {
          $gte: startDate,
          $lte: endDate,
        },
        order_status: "Delivered",
      };
      let orders;
      if (page) {
        orders = await orderCollection
          .find(query)
          .sort({ order_date: -1 })
          .skip(page * 50)
          .limit(50)
          .toArray();
      } else {
        orders = await orderCollection
          .find(query)
          .sort({ order_date: -1 })
          .limit(50)
          .toArray();
      }
      res.send(orders);
      console.log(orders.length);
    });

    // get user order list
    app.get("/userOrder/:ph", async (req, res) => {
      const ph = req.params.ph;
      console.log(ph);
      const query = { "billing.phone": ph };
      const cursor = orderCollection.find(query).sort({ order_date: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/user1Order/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { "billing.email": email };
      const cursor = orderCollection.find(query).sort({ order_date: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });
    // get user order count
    app.get("/userOrderCount/:ph", async (req, res) => {
      const ph = req.params.ph;
      const query = { "billing.phone": ph };
      const count = await orderCollection.estimatedDocumentCount(query);
      res.send({ count });
    });

    // get single order
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const product = await orderCollection.findOne({
        id: parseInt(id),
      });
      res.send(product);
    });
    // edit order
    app.put("/editOrder/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { id: parseInt(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: data,
      };
      const result = await orderCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // edit user
    app.put("/editUser/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: data,
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // delete order
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { id: parseInt(id) };
      const result = await orderCollection.deleteOne(filter);
      res.send(result);
    });
    // delete user
    app.delete("/deleteUser/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });
    // post user
    app.post("/postUser", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // post user with Google login
    app.post("/postGoogleUser/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = req.body;
      console.log(user);
      const query = { email: email };
      const exist = await userCollection.findOne(query);
      console.log(exist);
      if (!exist) {
        const result = await userCollection.insertOne(user);
        res.send(result);
      } else {
        res.send({});
      }
    });
    // get all user
    app.get("/getAllUser", async (req, res) => {
      const page = parseInt(req.query.page);
      const query = {};
      let users;
      if (page) {
        users = await userCollection
          .find(query)
          .skip(page * 50)
          .limit(50)
          .toArray();
      } else {
        users = await userCollection.find(query).limit(50).toArray();
      }
      res.send(users);
      console.log(users.length);
    });

    // Get single user
    app.get("/getUser/:number", async (req, res) => {
      const number = req.params.number;
      const query = { phone: number };
      const result = await userCollection.findOne(query);
      if (result) {
        res.send(result);
      } else {
        res.send({});
      }
    });
    app.get("/getUser/:email", async (req, res) => {
      const email = req.params.number;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      if (result) {
        res.send(result);
      } else {
        res.send({});
      }
    });
    //admin varification with phone
    app.get("/users/admin/:ph", async (req, res) => {
      const ph = req.params.ph;
      const query = { phone: ph };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    //admin varification with email
    app.get("/users/admin1/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const user = await userCollection.findOne(query);
      console.log(user);
      res.send({ isAdmin: user?.role === "admin" });
    });
    // get coupons
    app.get("/getCoupons", async (req, res) => {
      const query = { status: "publish" };
      const coupons = await couponCollection.find(query).toArray();
      res.send(coupons);
      console.log(coupons.length);
    });
    // get coupons for admin panel
    app.get("/getAllCoupons", async (req, res) => {
      const query = {};
      const coupons = await couponCollection
        .find(query)
        .sort({ date_expires: -1 })
        .toArray();
      res.send(coupons);
      console.log(coupons.length);
    });
    // get single coupon for admin panel
    app.get("/getCoupon/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const coupon = await couponCollection.findOne(query);
      res.send(coupon);
    });
    // post coupon
    app.post("/addCoupon", async (req, res) => {
      const coupon = req.body;
      const result = await couponCollection.insertOne(coupon);
      res.send(result);
    });

    // edit coupon
    app.put("/editCoupon/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: data,
      };
      const result = await couponCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // delete coupon
    app.delete("/deleteCoupon/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await couponCollection.deleteOne(filter);
      res.send(result);
    });

    // get blogs
    app.get("/getBlogs", async (req, res) => {
      const query = { status: "publish" };
      const blogs = await blogCollection.find(query).toArray();
      res.send(blogs);
      console.log(blogs.length);
    });
    // get single coupon for admin panel
    app.get("/getBlog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const coupon = await blogCollection.findOne(query);
      res.send(coupon);
    });
    // post blog
    app.post("/addBlog", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    // edit blog
    app.put("/editBlog/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: data,
      };
      const result = await blogCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // delete blog
    app.delete("/deleteBlog/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await blogCollection.deleteOne(filter);
      res.send(result);
    });
    // get admin blogs
    app.get("/getAllBlogs", async (req, res) => {
      const query = {};
      const blogs = await blogCollection.find(query).toArray();
      res.send(blogs);
      console.log(blogs.length);
    });
    // get reviews
    app.get("/reviews", async (req, res) => {
      const query = { status: "approved" };
      const reviews = await reviewCollection.find(query).toArray();
      res.send(reviews);
      console.log(reviews.length);
    });
    // get all reviews
    app.get("/allReviews", async (req, res) => {
      const page = parseInt(req.query.page);
      const query = {};
      let reviews;
      if (page) {
        reviews = await reviewCollection
          .find(query)
          .sort({ date_created: -1 })
          .skip(page * 50)
          .limit(50)
          .toArray();
      } else {
        reviews = await reviewCollection
          .find(query)
          .sort({ date_created: -1 })
          .limit(50)
          .toArray();
      }
      res.send(reviews);
      console.log(reviews.length);
    });
    // post reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    // update reviews
    app.put("/review/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: data,
      };
      const result = await reviewCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // delete review
    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(filter);
      res.send(result);
    });

    // Express route to delete a field from all documents
    // app.post("/delete-field-from-all", async (req, res) => {
    //   const fieldToDelete = "yoast_head_json"; // Replace with the field you want to delete

    //   try {
    //     const updateResult = await productCollection.updateMany(
    //       {},
    //       { $unset: { [fieldToDelete]: 1 } }
    //     );

    //     res.json({
    //       message: `Field "${fieldToDelete}" deleted from ${updateResult.nModified} documents`,
    //     });
    //   } catch (error) {
    //     console.error("Error deleting field:", error);
    //     res.status(500).json({ error: "Internal server error" });
    //   }
    // });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Server is runing");
});

app.listen(port, () => {
  console.log("Listening at port", port);
});
