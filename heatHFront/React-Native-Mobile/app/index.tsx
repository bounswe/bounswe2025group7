import React, { useState } from 'react';
import styled from 'styled-components';

// 🌿 Fullscreen Wrapper
const Screen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f1f8e9; /* light green background for fresh look */
  font-family: 'Poppins', sans-serif;
`;

const Container = styled.form`
  overflow: hidden;
  width: 100%;
  max-width: 360px;
  padding: 2.5rem;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
  color: #2e7d32;
  font-size: 1.8rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%; /* Ensures inputs are the same width as the button */
  box-sizing: border-box;
  margin-bottom: 1.2rem;
  padding: 0.8rem;
  border: 1px solid #cfcfcf;
  border-radius: 10px;
  font-size: 1rem;

  &:focus {
    border-color: #81c784;
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%; /* Ensures the button is the same width as the inputs */
  padding: 0.9rem;
  background: #66bb6a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #4caf50;
  }
`;

const Tagline = styled.p`
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #999;
`;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });
  };

  return (
    <Screen>
      <Container onSubmit={handleLogin}>
        <Title>Welcome 🌱</Title>
        <Subtitle>Log in to explore healthy meals delivered to you</Subtitle>
        <Input
          style = {{width: "100%"}}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Log In</Button>
        <Tagline>New here? Join the green side 🍃</Tagline>
      </Container>
    </Screen>
  );
}

export default Login;
