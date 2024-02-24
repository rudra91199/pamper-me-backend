import Bookings from "../models/bookings.model.js";

export const getBookingByEmail = async (req, res) => {
  const email = req.params.email;
  const result = await Bookings.find({email: email});
  res.send(result);
};
