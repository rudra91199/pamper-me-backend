import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();
import userCollection from "../index.js";

router.get("/:email", async (req, res) => {
  const query = { email: req.params.email };
  console.log(query);
  const result = await userCollection.findOne(query);
  res.send(result);
});

router.put("/:email", async (req, res) => {
  const filter = { email: req.params.email };
  const userData = req.body;
  console.log(filter, userData);
  const result = await userCollection.updateOne(
    filter,
    {
      $set: userData,
    },
    {
      upsert: true,
    }
  );
  const token = jwt.sign(
    { email: req.params.email },
    "32e4983ffe13b44e3b07d578941370af09ce4b091bbae96f6fb1bd70b66ef2d8d3f763a7941b1dc20f12bc07fd57ba81cbdaeaf99045a332da216743cb5c7df7",
    {
      expiresIn: "1d",
    }
  );
  res.send({ result, accessToken: token });
});

router.put("/user/:email", async (req, res) => {
  const email = { email: req.params.email };
  const image = {
    url: req.body.url,
    id: req.body.id,
  };
  console.log(email, image);
  const result = await userCollection.updateOne(email, {
    $set: { image: image },
  });
  res.send(result);
});

export default router;
