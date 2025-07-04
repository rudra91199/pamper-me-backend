import jwt from "jsonwebtoken";
import Users from "./users.model.js";
import cloudinary from "../../lib/cloudinary.config.js";

export const getUserByEmail = async (req, res) => {
  const query = { email: req.params.email };
  const result = await Users.findOne(query);
  res.send(result);
};

export const creatUser = async (req, res) => {
  const filter = { email: req.params.email };
  const userData = req.body;
  console.log(filter, userData);
  const result = await Users.updateOne(filter, userData, {
    upsert: true,
  });
  const token = jwt.sign(
    { email: req.params.email },
    "32e4983ffe13b44e3b07d578941370af09ce4b091bbae96f6fb1bd70b66ef2d8d3f763a7941b1dc20f12bc07fd57ba81cbdaeaf99045a332da216743cb5c7df7",
    {
      expiresIn: "1d",
    }
  );
  res.send({ result, accessToken: token });
};

export const updateUser = async (req, res) => {
  const id = req.query?.id;
  const email = { email: req.params.email };
  const result = await Users.updateOne(email, req.body, { upsert: true });
  if (id) {
    await cloudinary.uploader.destroy(id, (err, result) => {
      console.log(err, result);
    });
  }
  res.send(result);
};
