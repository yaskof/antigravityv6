const platformConfig = {
  trendyol: {
    name: "Trendyol Go",
    color: "orange",
  },
  getir: {
    name: "Getir Yemek",
    color: "purple",
  },
  yemeksepeti: {
    name: "Yemeksepeti",
    color: "pink",
  },
  migros: {
    name: "Migros Yemek",
    color: "emerald",
  },
};

const normalizeItems = (items = []) =>
  items.map((item) => ({
    name: item.name ?? item.title ?? "Ürün",
    price: Number(item.price ?? item.amount ?? 0),
  }));

const createOrderId = (prefix = "SP") =>
  `${prefix}-${Math.floor(Math.random() * 90000 + 10000)}`;

export const normalizeOrder = (platformKey, payload) => {
  const platform = platformConfig[platformKey];
  if (!platform) {
    throw new Error("Desteklenmeyen platform.");
  }

  const total = Number(payload.total ?? payload.amount ?? payload.price ?? 0);
  return {
    id: payload.id ?? payload.order_id ?? createOrderId(),
    customer: payload.customer ?? payload.customer_name ?? "Bilinmeyen Müşteri",
    platform,
    items: normalizeItems(payload.items),
    total,
    status: "pending",
    courierId: null,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    raw: payload,
  };
};
