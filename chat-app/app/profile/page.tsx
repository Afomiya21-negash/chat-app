import type { Metadata } from "next";
import ProfileForm from "../../components/ProfileForm";

export const metadata: Metadata = {
  title: "Profile - ቡና ጠጡ",
  description: "Edit your profile information.",
};

export default function ProfilePage() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">My Profile</h1>
      <ProfileForm />
    </div>
  );
}
