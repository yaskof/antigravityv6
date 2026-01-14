import React, { useMemo, useState } from "react";
import {
  Bell,
  Bike,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Signal,
} from "lucide-react";

const platformPalette = {
  "Trendyol Go": {
    badge: "bg-orange-100 text-orange-700",
    ring: "ring-orange-200",
    dot: "bg-orange-500",
  },
  "Getir Yemek": {
    badge: "bg-purple-100 text-purple-700",
    ring: "ring-purple-200",
    dot: "bg-purple-500",
  },
  Yemeksepeti: {
    badge: "bg-pink-100 text-pink-700",
    ring: "ring-pink-200",
    dot: "bg-pink-500",
  },
  "Migros Yemek": {
    badge: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
  "Manuel Sipariş": {
    badge: "bg-slate-100 text-slate-700",
    ring: "ring-slate-200",
    dot: "bg-slate-500",
  },
};

const initialOrders = [
  {
    id: "SP-10452",
    customer: "Ahmet Yılmaz",
    platform: "Trendyol Go",
    items: [
      { name: "Sucuklu Pizza", price: 180 },
      { name: "Ayran", price: 20 },
    ],
    total: 200,
    status: "pending",
    courierId: null,
    timestamp: "14:12",
  },
  {
    id: "SP-10453",
    customer: "Büşra Demir",
    platform: "Getir Yemek",
    items: [{ name: "Burger Menü", price: 240 }],
    total: 240,
    status: "preparing",
    courierId: null,
    timestamp: "14:16",
  },
  {
    id: "SP-10454",
    customer: "Hasan Kurt",
    platform: "Yemeksepeti",
    items: [{ name: "Tavuk Döner Dürüm", price: 150 }],
    total: 150,
    status: "ready",
    courierId: null,
    timestamp: "14:18",
  },
  {
    id: "SP-10455",
    customer: "Zehra Kaya",
    platform: "Migros Yemek",
    items: [{ name: "Mantı", price: 210 }],
    total: 210,
    status: "courier",
    courierId: "CR-002",
    timestamp: "14:08",
  },
];

const initialCouriers = [
  {
    id: "CR-001",
    name: "Mert Aksoy",
    phone: "+90 533 111 22 33",
    status: "active",
    activeOrders: 0,
  },
  {
    id: "CR-002",
    name: "Elif Arslan",
    phone: "+90 544 444 55 66",
    status: "busy",
    activeOrders: 1,
  },
  {
    id: "CR-003",
    name: "Deniz Kurt",
    phone: "+90 505 777 88 99",
    status: "active",
    activeOrders: 0,
  },
];

const statusLabels = {
  pending: "Bekliyor",
  preparing: "Hazırlanıyor",
  ready: "Hazır",
  courier: "Kuryede",
  delivered: "Teslim Edildi",
};

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-emerald-100 text-emerald-700",
  courier: "bg-indigo-100 text-indigo-700",
  delivered: "bg-slate-200 text-slate-600",
};

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [orders, setOrders] = useState(initialOrders);
  const [couriers, setCouriers] = useState(initialCouriers);
  const [notification, setNotification] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({
    customer: "",
    platform: "Manuel Sipariş",
    itemName: "",
    itemPrice: "",
    total: "",
  });

  const pendingCount = orders.filter((order) => order.status === "pending")
    .length;
  const activeCouriers = couriers.filter((courier) => courier.status === "active")
    .length;
  const revenue = useMemo(() => {
    return orders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const handleStatusAdvance = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (order.status === "pending") return { ...order, status: "preparing" };
        if (order.status === "preparing")
          return { ...order, status: "ready" };
        if (order.status === "courier")
          return { ...order, status: "delivered" };
        return order;
      }),
    );
  };

  const assignCourier = (orderId) => {
    const availableCouriers = couriers.filter(
      (courier) => courier.status === "active",
    );
    if (availableCouriers.length === 0) {
      setNotification({
        type: "error",
        message: "Müsait kurye bulunamadı. Lütfen daha sonra tekrar deneyin.",
      });
      return;
    }
    const courierToAssign = [...availableCouriers].sort(
      (a, b) => a.activeOrders - b.activeOrders,
    )[0];

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: "courier", courierId: courierToAssign.id }
          : order,
      ),
    );

    setCouriers((prev) =>
      prev.map((courier) => {
        if (courier.id !== courierToAssign.id) return courier;
        const updatedOrders = courier.activeOrders + 1;
        return {
          ...courier,
          activeOrders: updatedOrders,
          status: updatedOrders > 0 ? "busy" : "active",
        };
      }),
    );

    setNotification({
      type: "success",
      message: `${courierToAssign.name} için SMS gönderildi (${courierToAssign.phone}).`,
    });
  };

  const handleDelivered = (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || !order.courierId) {
      handleStatusAdvance(orderId);
      return;
    }
    setOrders((prev) =>
      prev.map((item) =>
        item.id === orderId ? { ...item, status: "delivered" } : item,
      ),
    );
    setCouriers((prev) =>
      prev.map((courier) => {
        if (courier.id !== order.courierId) return courier;
        const updatedOrders = Math.max(courier.activeOrders - 1, 0);
        return {
          ...courier,
          activeOrders: updatedOrders,
          status: updatedOrders > 0 ? "busy" : "active",
        };
      }),
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (
      !formState.customer ||
      !formState.itemName ||
      !formState.itemPrice ||
      !formState.total
    ) {
      setNotification({
        type: "error",
        message: "Lütfen tüm alanları doldurun.",
      });
      return;
    }

    const newOrder = {
      id: `SP-${Math.floor(Math.random() * 90000 + 10000)}`,
      customer: formState.customer,
      platform: formState.platform,
      items: [
        {
          name: formState.itemName,
          price: Number(formState.itemPrice),
        },
      ],
      total: Number(formState.total),
      status: "pending",
      courierId: null,
      timestamp: "Şimdi",
    };

    setOrders((prev) => [newOrder, ...prev]);
    setFormState({
      customer: "",
      platform: "Manuel Sipariş",
      itemName: "",
      itemPrice: "",
      total: "",
    });
    setShowModal(false);
    setNotification({
      type: "success",
      message: "Yeni sipariş sisteme eklendi.",
    });
  };

  const handleConnectionToggle = () => {
    setIsOnline((prev) => !prev);
    setNotification({
      type: "info",
      message: !isOnline
        ? "Bağlantı tekrar sağlandı."
        : "Bağlantı kesildi. Yeniden bağlanılıyor...",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-200 bg-white px-4 py-6">
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">SiparişMatik</p>
              <p className="text-lg font-semibold">Yönetim Paneli</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                activeView === "dashboard"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setActiveView("dashboard")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Panel
            </button>
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                activeView === "orders"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setActiveView("orders")}
            >
              <ClipboardList className="h-4 w-4" />
              Siparişler
            </button>
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                activeView === "couriers"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setActiveView("couriers")}
            >
              <Bike className="h-4 w-4" />
              Kuryeler
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              <Settings className="h-4 w-4" />
              Ayarlar
            </button>
          </nav>
        </aside>

        <main className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {activeView === "couriers" ? "Kuryeler" : "Sipariş Paneli"}
              </h1>
              <p className="text-sm text-slate-500">
                Tüm kanalları tek ekrandan gerçek zamanlı yönetin.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                onClick={handleConnectionToggle}
              >
                <span
                  className={`relative flex h-3 w-3 ${
                    isOnline ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                      isOnline ? "bg-emerald-400" : "bg-rose-400"
                    } opacity-75`}
                  />
                  <span
                    className={`relative inline-flex h-3 w-3 rounded-full ${
                      isOnline ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                </span>
                {isOnline ? "Canlı Bağlantı" : "Bağlantı Hatası"}
              </button>
              <button className="relative rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                onClick={() => setShowModal(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Sipariş Gir
              </button>
            </div>
          </header>

          {!isOnline && (
            <div className="mx-8 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Bağlantı hatası algılandı. Veriler senkronize edilemiyor.
            </div>
          )}

          {notification && (
            <div
              className={`mx-8 mt-4 rounded-xl border px-4 py-3 text-sm ${
                notification.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : notification.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700"
              }`}
            >
              {notification.message}
            </div>
          )}

          <section className="px-8 py-6">
            {(activeView === "dashboard" || activeView === "orders") && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Günlük Ciro</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      ₺{revenue.toLocaleString("tr-TR")}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Sadece teslim edilen siparişler.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Bekleyen Sipariş</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {pendingCount}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Sesli bildirim aktif.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">
                      Aktif Kurye Sayısı
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {activeCouriers}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Müsait ve atanabilir.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Canlı Siparişler</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Signal className="h-4 w-4" />
                      Gerçek zamanlı güncelleniyor
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {orders.map((order) => {
                      const platform = platformPalette[order.platform];
                      return (
                        <div
                          key={order.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
                                  platform?.ring ?? "ring-slate-200"
                                }`}
                              >
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    platform?.dot ?? "bg-slate-500"
                                  }`}
                                />
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">
                                  {order.platform}
                                </p>
                                <p className="text-lg font-semibold">
                                  {order.customer}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                statusStyles[order.status]
                              }`}
                            >
                              {statusLabels[order.status]}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                platform?.badge ?? "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {order.id}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {order.timestamp}
                            </span>
                            {order.courierId && (
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                Kurye: {order.courierId}
                              </span>
                            )}
                          </div>

                          <div className="mt-4 space-y-1 text-sm text-slate-600">
                            {order.items.map((item, index) => (
                              <div
                                key={`${order.id}-${index}`}
                                className="flex items-center justify-between"
                              >
                                <span>{item.name}</span>
                                <span>₺{item.price}</span>
                              </div>
                            ))}
                            <div className="mt-2 flex items-center justify-between font-semibold text-slate-900">
                              <span>Toplam</span>
                              <span>₺{order.total}</span>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {order.status === "ready" && (
                              <button
                                className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                                onClick={() => assignCourier(order.id)}
                              >
                                Kurye Çağır
                              </button>
                            )}
                            {order.status === "courier" && (
                              <button
                                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                                onClick={() => handleDelivered(order.id)}
                              >
                                Teslim Edildi
                              </button>
                            )}
                            {order.status !== "ready" &&
                              order.status !== "courier" &&
                              order.status !== "delivered" && (
                                <button
                                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                  onClick={() => handleStatusAdvance(order.id)}
                                >
                                  {order.status === "pending"
                                    ? "Hazırlamaya Al"
                                    : "Hazırla"}
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeView === "couriers" && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {couriers.map((courier) => (
                  <div
                    key={courier.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{courier.id}</p>
                        <p className="text-lg font-semibold">{courier.name}</p>
                      </div>
                      <span
                        className={`flex h-3 w-3 rounded-full ${
                          courier.status === "active"
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                      />
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p>Telefon: {courier.phone}</p>
                      <p>
                        Durum:{" "}
                        <span className="font-semibold text-slate-900">
                          {courier.status === "active"
                            ? "Müsait"
                            : "Meşgul"}
                        </span>
                      </p>
                      <p>Aktif Sipariş: {courier.activeOrders}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Manuel Sipariş Girişi</h3>
              <button
                className="text-sm text-slate-500 hover:text-slate-700"
                onClick={() => setShowModal(false)}
              >
                Kapat
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-slate-500">Müşteri</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  value={formState.customer}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      customer: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-500">Platform</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    value={formState.platform}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        platform: event.target.value,
                      }))
                    }
                  >
                    {Object.keys(platformPalette).map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Tutar</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    type="number"
                    min="0"
                    value={formState.total}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        total: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-500">Ürün Adı</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    value={formState.itemName}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        itemName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500">Ürün Fiyatı</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    type="number"
                    min="0"
                    value={formState.itemPrice}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        itemPrice: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <button
                className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                type="submit"
              >
                Siparişi Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
