import Stripe from "stripe";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { IMovie } from "./models/IMovie";
const data = require("./data/data.json") as IMovie[];
dotenv.config();

const app = express();
const API_KEY = process.env.API_KEY as string;
const stripe = new Stripe(API_KEY);

const PORT = 3000;

app.use(cors({ origin: "*" }), express.static("public"), express.json());

const calculateOrderAmount = (items: IMovie[]) => {
  let totalPrice: number = 0;

  for (let i = 0; i < items.length; i++) {
    totalPrice = totalPrice + items[i].Price * items[i].Amount;
  }
  return totalPrice * 100;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  console.log(items);
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "sek",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  console.log(paymentIntent);

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get("/movies", (req, res) => {
  res.send(JSON.stringify(data));
});

app.get("/movie/:movie_id", (req, res) => {
  const movie_id = req.params.movie_id;

  const index = data.findIndex((d) => d.imdbID === movie_id);

  if (index === -1) {
    return res.send("Find no movie with id: " + movie_id);
  }

  res.send(JSON.stringify(data[index]));
});

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));

module.exports = app;
