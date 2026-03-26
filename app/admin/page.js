"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  async function getOrders() {
    const { data } = await supabase.from("orders").select("*");
    return data || [];
  }

  useEffect(() => {
    let isMounted = true;

    getOrders().then((data) => {
      if (isMounted) {
        setOrders(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function fetchOrders() {
    const data = await getOrders();
    setOrders(data);
  }

  async function updateStatus(id, newStatus) {
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    fetchOrders();
  }

  function shouldShowActionButtons(status) {
    const normalizedStatus = status?.toLowerCase();
    return normalizedStatus !== "accepted" && normalizedStatus !== "rejected";
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="p-4 shadow mb-3 rounded-lg">
            <p><strong>Service:</strong> {order.service_id}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <p><strong>Status:</strong> {order.status}</p>

            {shouldShowActionButtons(order.status) && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => updateStatus(order.id, "accepted")}
                  className="bg-green-500 text-white px-3 py-1 rounded cursor-pointer "
                >
                  Accept
                </button>

                <button
                  onClick={() => updateStatus(order.id, "rejected")}
                  className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
