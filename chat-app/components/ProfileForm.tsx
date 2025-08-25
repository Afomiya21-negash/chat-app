"use client";
import { useState } from "react";
export default function ProfileForm() {
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    phone: "",
    profilePic: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     console.log("Profile Data:", formData);
  };
 return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white p-6 rounded-2xl shadow-md w-96 space-y-4"
    >
      <h2 className="text-xl font-bold text-center">Edit Profile</h2>
 {}
      <div>
        <label className="block text-sm font-medium">Profile Picture</label>
        <input 
          type="file" 
          name="profilePic"
          className="mt-1 block w-full text-sm text-gray-700"
        />
      </div>
 {}
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input 
          type="text" 
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="mt-1 w-full border rounded-lg px-3 py-2"
        />
      </div>
 {}
      <div>
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="mt-1 w-full border rounded-lg px-3 py-2"
        />
      </div>
 {}
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input 
          type="text" 
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 w-full border rounded-lg px-3 py-2"
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
