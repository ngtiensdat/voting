import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function App() {
  const API = 'http://localhost:3001';
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomPass, setRoomPass] = useState('');
  const [createOptions, setCreateOptions] = useState(['', '', '']);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [token, setToken] = useState(null);

  const register = async () => {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) setView('login');
  };

  const login = async () => {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setView('home');
    } else {
      alert(data.message);
    }
  };

  const createRoom = async () => {
    const filteredOptions = createOptions.filter(opt => opt.trim());
    const res = await fetch(`${API}/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ roomCode, password: roomPass, options: filteredOptions })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) {
      setOptions(filteredOptions);
      setView('vote');
    }
  };

  const joinRoom = async () => {
    const res = await fetch(`${API}/join-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, password: roomPass })
    });
    const data = await res.json();
    if (res.ok) {
      setOptions(data.options);
      setView('vote');
    } else {
      alert(data.message);
    }
  };

  const submitVote = async () => {
    if (!selectedOption) return alert('Select an option!');
    const res = await fetch(`${API}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, option: selectedOption })
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {view === 'login' && (
          <>
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn" onClick={login}>Login</button>
            <p className="text-sm mt-2">No account? <span className="text-blue-500 cursor-pointer" onClick={() => setView('register')}>Register</span></p>
          </>
        )}

        {view === 'register' && (
          <>
            <h2 className="text-xl font-bold mb-4">Register</h2>
            <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn" onClick={register}>Register</button>
            <p className="text-sm mt-2">Have an account? <span className="text-blue-500 cursor-pointer" onClick={() => setView('login')}>Login</span></p>
          </>
        )}

        {view === 'home' && (
          <>
            <h2 className="text-xl font-bold mb-4">Create or Join Room</h2>
            <input className="input" placeholder="Room Code" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
            <input className="input" placeholder="Room Password" value={roomPass} onChange={e => setRoomPass(e.target.value)} />
            <button className="btn" onClick={joinRoom}>Join Room</button>
            <div className="mt-4">
              <h3 className="font-medium mb-1">Create Voting Options</h3>
              {createOptions.map((opt, i) => (
                <input
                  key={i}
                  className="input"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => {
                    const copy = [...createOptions];
                    copy[i] = e.target.value;
                    setCreateOptions(copy);
                  }}
                />
              ))}
              <button className="text-blue-500 text-sm" onClick={() => setCreateOptions([...createOptions, ''])}>+ Add Option</button>
              <button className="btn mt-2" onClick={createRoom}>Create Room</button>
            </div>
          </>
        )}

        {view === 'vote' && (
          <>
            <h2 className="text-xl font-bold mb-4">Vote in Room: {roomCode}</h2>
            {options.map((opt, i) => (
              <label key={i} className="block mb-2">
                <input type="radio" name="vote" value={opt} onChange={e => setSelectedOption(e.target.value)} /> {opt}
              </label>
            ))}
            <button className="btn" onClick={submitVote}>Submit Vote</button>
          </>
        )}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
createRoot(container).render(<App />);
