"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Orders() {
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("address", address);

    setOrders(data || []);
  }

  function getStatusColor(status) {
    if (status === "accepted") return "text-green-600";
    if (status === "rejected") return "text-red-600";
    return "text-yellow-600";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4 text-center">My Orders</h1>

        <input
          type="text"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border p-3 w-full mb-3 rounded-lg"
        />

        <button
          onClick={fetchOrders}
          className="bg-blue-600 text-white w-full py-2 rounded-lg mb-4"
        >
          Check Orders
        </button>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border p-3 mb-3 rounded-lg">
              <p><strong>Service:</strong> {order.service_id}</p>
              <p className={getStatusColor(order.status)}>
                <strong>Status:</strong> {order.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}