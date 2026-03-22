"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Book() {
  const [services, setServices] = useState([]);
  const [service, setService] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    const { data } = await supabase.from("services").select("*");
    setServices(data);
  }

  const handleSubmit = async () => {
    const { error } = await supabase.from("orders").insert([
      {
        service_id: service,
        address: address,
      },
    ]);

    if (!error) {
      alert("Order placed successfully!");
      setService("");
      setAddress("");
    } else {
      alert("Error placing order");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Book Laundry Service
        </h1>

        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="border p-3 w-full mb-3 rounded-lg"
        >
          <option value="">Select Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name} - ₹{s.price}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border p-3 w-full mb-4 rounded-lg"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
