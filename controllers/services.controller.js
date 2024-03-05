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
