import Services from "../models/services.model.js";

export const getServices = async (req, res) => {
  const query = {};
  const result = await Services.find(query);
  res.send(result);
};
