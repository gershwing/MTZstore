import Order from "../models/order.model.js";
import DeliveryTask from "../models/deliveryTask.model.js";
import mongoose from "mongoose";

export async function ordersByStatus(req, res) {
  const { from, to, storeId } = req.query;
  const match = {};
  if (storeId) match.storeId = new mongoose.Types.ObjectId(String(storeId));
  if (from || to) match.createdAt = {};
  if (from) match.createdAt.$gte = new Date(from);
  if (to) match.createdAt.$lte = new Date(to);

  const data = await Order.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);
  res.json({ error: false, data });
}

export async function topProducts(req, res) {
  const { from, to, storeId, limit = 10 } = req.query;
  const match = {};
  if (storeId) match.storeId = new mongoose.Types.ObjectId(String(storeId));
  if (from || to) match.createdAt = {};
  if (from) match.createdAt.$gte = new Date(from);
  if (to) match.createdAt.$lte = new Date(to);

  const data = await Order.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        qty: { $sum: "$items.qty" },
        revenueBob: { $sum: { $ifNull: ["$items.totalBob", { $multiply: ["$items.priceBob", "$items.qty"] }] } },
        revenueUsd: { $sum: { $ifNull: ["$items.totalUsd", { $multiply: ["$items.priceUsd", "$items.qty"] }] } },
        name: { $last: "$items.name" },
      }
    },
    { $project: { productId: "$_id", name: 1, qty: 1, revenueBob: 1, revenueUsd: 1, _id: 0 } },
    { $sort: { revenueBob: -1 } },
    { $limit: Number(limit) },
  ]);
  res.json({ error: false, data });
}

export async function deliverySla(req, res) {
  const { from, to, storeId, group = "day" } = req.query;
  const match = {};
  if (storeId) match.storeId = new mongoose.Types.ObjectId(String(storeId));
  if (from || to) match.createdAt = {};
  if (from) match.createdAt.$gte = new Date(from);
  if (to) match.createdAt.$lte = new Date(to);

  // Calcula (en minutos) desde CREATED/ASSIGNED hasta DELIVERED según tu timeline
  const data = await DeliveryTask.aggregate([
    { $match: match },
    {
      $project: {
        timeline: 1,
        createdAt: 1,
        deliveredAt: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$timeline",
                  as: "ev",
                  cond: { $eq: ["$$ev.type", "DELIVERED"] }
                }
              },
              as: "x",
              in: "$$x.at"
            }
          }
        },
        assignedAt: {
          $first: {
            $map: {
              input: {
                $filter: { input: "$timeline", as: "ev", cond: { $eq: ["$$ev.type", "ASSIGNED"] } }
              },
              as: "y",
              in: "$$y.at"
            }
          }
        }
      }
    },
    {
      $project: {
        start: { $ifNull: ["$assignedAt", "$createdAt"] },
        deliveredAt: 1
      }
    },
    { $match: { deliveredAt: { $ne: null } } },
    {
      $project: {
        minutes: { $divide: [{ $subtract: ["$deliveredAt", "$start"] }, 1000 * 60] },
        date: {
          $dateToString: {
            format: group === "month" ? "%Y-%m" : (group === "year" ? "%Y" : "%Y-%m-%d"),
            date: "$deliveredAt"
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$minutes" },
        p50: { $percentile: { input: "$minutes", method: "approximate", p: [0.5] } },
        p90: { $percentile: { input: "$minutes", method: "approximate", p: [0.9] } },
        count: { $sum: 1 }
      }
    },
  ]);

  const series = await DeliveryTask.aggregate([
    { $match: match },
    {
      $project: {
        timeline: 1, createdAt: 1,
        deliveredAt: {
          $first: {
            $map: {
              input: { $filter: { input: "$timeline", as: "ev", cond: { $eq: ["$$ev.type", "DELIVERED"] } } },
              as: "x", in: "$$x.at"
            }
          }
        },
        assignedAt: {
          $first: {
            $map: {
              input: { $filter: { input: "$timeline", as: "ev", cond: { $eq: ["$$ev.type", "ASSIGNED"] } } },
              as: "y", in: "$$y.at"
            }
          }
        },
      }
    },
    {
      $project: {
        start: { $ifNull: ["$assignedAt", "$createdAt"] },
        deliveredAt: 1
      }
    },
    { $match: { deliveredAt: { $ne: null } } },
    {
      $project: {
        minutes: { $divide: [{ $subtract: ["$deliveredAt", "$start"] }, 1000 * 60] },
        date: {
          $dateToString: {
            format: group === "month" ? "%Y-%m" : (group === "year" ? "%Y" : "%Y-%m-%d"),
            date: "$deliveredAt"
          }
        }
      }
    },
    {
      $group: {
        _id: "$date",
        avg: { $avg: "$minutes" },
        p50: { $percentile: { input: "$minutes", method: "approximate", p: [0.5] } },
        p90: { $percentile: { input: "$minutes", method: "approximate", p: [0.9] } },
        count: { $sum: 1 }
      }
    },
    { $project: { date: "$_id", avg: 1, p50: { $arrayElemAt: ["$p50", 0] }, p90: { $arrayElemAt: ["$p90", 0] }, count: 1, _id: 0 } },
    { $sort: { date: 1 } },
  ]);

  const summary = data?.[0]
    ? {
      avg: data[0].avg,
      p50: data[0].p50?.[0] ?? null,
      p90: data[0].p90?.[0] ?? null,
      count: data[0].count,
    }
    : null;

  res.json({ error: false, data: { summary, series } });
}
