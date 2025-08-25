import Link from "next/link";
export default function NavBar() {
  return (
    <nav className="flex gap-4 p-4 bg-gray-100">
      <Link href="/chat" className="text-blue-500 hover:underline">
        Chat
      </Link>
      <Link href="/profile" className="text-blue-500 hover:underline">
        Profile
      </Link>
    </nav>
  );
}
