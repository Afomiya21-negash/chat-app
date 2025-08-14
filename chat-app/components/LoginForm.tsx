'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

 const handleLogin = async () => {
  if (!email.trim() || !password) {
    alert('Please fill in both email and password');
    return;
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem('token', data.token);
    console.log('Token saved in login:', localStorage.getItem('token'));
    localStorage.setItem('user', JSON.stringify(data.user)); 
    alert('Login successful!');
    router.push('/chat');
  } else {
    alert(data.error || 'Login failed');
  }
};


  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}