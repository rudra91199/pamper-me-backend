import Services from "../models/services.model.js";

export const getServices = async (req, res) => {
  const query = {};
  const result = await Services.find(query);
  res.send(result);
};

export const getServiceByQuery = async (req, res) => {
  const query = req.query;
  const filter = {
    ...(query.search && {
      title: { $regex: query.search, $options: "i" },
    }),
  };
  const result = await Services.find(filter);
  res.send(result);
};

export const updateAllService = async (req, res) => {
  const body = req.body;
  console.log(body);
  const result = await Services.updateMany(
    {},
    {
      $set: body,
    },
    {
      upsert: true,
    }
  );
  res.send(result);
};

export const addReview = async (req, res) => {
  const id = req.params.id;
  const result = await Services.findByIdAndUpdate(id, {
    $push: { reviews: req.body },
  });
  res.send(result);
};
