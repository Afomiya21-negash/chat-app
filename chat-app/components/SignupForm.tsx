'use client'
import { useRouter } from "next/navigation";
import { useState } from 'react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')  // <-- fixed here
  const [password, setPassword] = useState('')
  const router = useRouter();

  const handleRegister = async () => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    alert(data.message);
    router.push("/");
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Name" onChange={e => setUsername(e.target.value)} />  {/* <-- fixed here */}
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  )
}