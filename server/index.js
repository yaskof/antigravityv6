import express from "express";
import { normalizeOrder } from "./normalize.js";

const app = express();
app.use(express.json());

const orders = [];

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "siparismatik-gateway" });
});

app.post("/webhooks/:platform", (req, res) => {
  const platformKey = req.params.platform;
  try {
    const order = normalizeOrder(platformKey, req.body);
    orders.unshift(order);
    res.status(201).json({ status: "received", order });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

app.post("/manual-order", (req, res) => {
  try {
    const order = {
      id: req.body.id ?? `SP-${Date.now()}`,
      customer: req.body.customer,
      platform: { name: "Manuel Sipariş", color: "slate" },
      items: req.body.items ?? [],
      total: Number(req.body.total ?? 0),
      status: "pending",
      courierId: null,
      timestamp: new Date().toISOString(),
    };
    orders.unshift(order);
    res.status(201).json({ status: "created", order });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

app.get("/orders", (_req, res) => {
  res.json({ orders });
});

const PORT = process.env.PORT ?? 5050;
app.listen(PORT, () => {
  console.log(`SiparişMatik Gateway listening on ${PORT}`);
});
