import Orders from "../models/orders.model.js";

export const postOrder = async (req, res) => {
    try {
        const newOrder = new Orders(req.body);
        const result = await newOrder.save();
        res.send(result); 
    } catch (error) {
        console.log(error)
    }
}