import Stripe from "stripe";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { IMovie } from "./models/IMovie";
import { IPagedMovies } from "./models/IPagedMovies";
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
    totalPrice = totalPrice + items[i].price * items[i].amount;
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

app.get("/movies/page/:page_number?", (req, res) => {
  const page_number = req.params.page_number || 1;
  const pageSize = 7;

  const totalPages = Math.ceil(data.length / pageSize);

  const errorMessage = "Did not found page number";

  const startIndex = +page_number * pageSize - pageSize;
  const stopIndex = +page_number * pageSize;

  const pagedData = data.slice(startIndex, stopIndex);

  if (pagedData.length === 0) {
    throw new Error(errorMessage);
  }
  const sendData: IPagedMovies = { movies: pagedData, totalPages: totalPages };
  console.log(sendData);
  res.send(JSON.stringify(sendData));
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
