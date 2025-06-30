import Orders from "./orders.model.js";

export const postOrder = async (req, res) => {
  try {
    const newOrder = new Orders(req.body);
    const result = await newOrder.save();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
};
export const getOrder = async (req, res) => {
  try {
    const orders = await Orders.find();
    res.send(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching orders");
  }
};
