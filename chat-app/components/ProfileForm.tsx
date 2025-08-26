"use client";
import { useState } from "react";
export default function ProfileForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Profile:", formData);
  };
 return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md w-96 space-y-4"
    >
      <h2 className="text-xl font-bold text-center">Edit Profile</h2>
{}
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          placeholder="Enter your username"
        />
      </div>
 {}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          placeholder="Enter your email"
        />
      </div>
 <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
      >
        Save
      </button>
    </form>
  );
}
