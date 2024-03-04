import Bookings from "../models/bookings.model.js";

export const getBookingByEmail = async (req, res) => {
  const email = req.params.email;
  const result = await Bookings.find({email: email});
  res.send(result);
};

export const createBooking = async (req, res) => {
  console.log(req.body);
  const newBooking = new Bookings(req.body);
  try {
  const result = await newBooking.save();
  res.send(result);    
  } catch (error) {
    throw error
  }
}
