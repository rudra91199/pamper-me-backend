import Products from "./products.model.js";

export const getAllProducts = async (req, res) => {
  // const query = { status: "publish", stock_status: "instock" };
  const query = req.query;
  let uniqueSubCategory;
  let uniqueBrand;
  console.log(query);

  const products = await Products.find();

  const uniqueCategory = [...new Set(products.map((item) => item.category))];

  if (!query.category && query.subcategory) {
    const cat = products.find(
      (product) => product.subcategory == query.subcategory
    ).category;
    const subcategory = products.filter((product) => product.category == cat);
    uniqueSubCategory = [
      ...new Set(subcategory.map((item) => item.subcategory)),
    ];
    const brand = subcategory.filter(
      (product) => product.subcategory == query.subcategory
    );
    uniqueBrand = [...new Set(brand.map((item) => item.Brand))];
  } else if (query.category && !query.subcategory) {
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
        (product) =>
          product.Brand == query.brand && product.category == query.category
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
  } else if (query.category && query.category != "all" && query.brand) {
    const cat = products.filter(
      (product) => product.category == query.category
    );
    const subcategory = cat.filter((product) => product.Brand === query.brand);
    uniqueSubCategory = [
      ...new Set(subcategory.map((item) => item.subcategory)),
    ];
    uniqueBrand = [...new Set(cat.map((item) => item.Brand))];
  } else if (query.brand) {
    const subcategory = products.filter(
      (product) => product.Brand == query.brand
    );
    uniqueSubCategory = [
      ...new Set(subcategory.map((item) => item.subcategory)),
    ];
    uniqueBrand = [...new Set(products.map((item) => item.Brand))];
  } else {
    uniqueSubCategory = [...new Set(products.map((item) => item.subcategory))];
    uniqueBrand = [...new Set(products.map((item) => item.Brand))];
  }

  res.send({ products, uniqueCategory, uniqueSubCategory, uniqueBrand });
};

export const getProductsByCategory = async (req, res) => {
  console.log("click");
  const query = {
    ...(req.query.subcategory &&
      req.query.subcategory != "brand" && {
        subcategory: req.query.subcategory,
      }),
    ...(req.query.category &&
      req.query.category != "all" && { category: req.query.category }),
    ...(req.query.Brand && { Brand: req.query.Brand }),
    ...(req.query.min &&
      req.query.max && {
        price: { $gt: req.query.min, $lt: req.query.max },
      }),
    // status: "publish",
    // stock_status: "instock",
    // category: { $regex: new RegExp(category, "i") },
  };
  console.log(query);
  const result = await Products.find(query);
  res.send(result);
};

export const getProductsByQuery = async (req, res) => {
  const query = req.query;
  console.log("product", query);
  const filter = {
    ...(query.search && {
      name: { $regex: query.search, $options: "i" },
    }),
  };
  const result = await Products.find(filter);
  res.send(result);
};

export const updateProduct = async (req, res) => {
  const id = req.params.id;
  const result = await Products.findByIdAndUpdate(id, req.body);
  res.send(result);
};

export const addReview = async (req, res) => {
  const id = req.params.id;
  const result = await Products.findByIdAndUpdate(id, {
    $push: { reviews: req.body },
  });
  res.send(result);
};

export const postProduct = async (req, res) => {
  console.log(req.body)
  try {
    const newProduct = new Products(req.body);
    const result = await newProduct.save();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
