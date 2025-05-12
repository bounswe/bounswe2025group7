// authService.js

const BASE_URL = 'http://167.172.162.159:8080/api/auth';

export const register = async (username, password) => {
    console.log('requested register');
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return await response.json(); // { accessToken, refreshToken }
};

export const login = async (username, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return await response.json(); // { accessToken, refreshToken }
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await fetch(`${BASE_URL}/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return await response.json(); // { accessToken, refreshToken }
};

export const sendVerificationCode = async (email) => {
  const response = await fetch(`${BASE_URL}/send-verification-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Sending verification code failed');
  }

  return await response.text(); // "Mail has send"
};

export const verifyCode = async (code) => {
  const response = await fetch(`${BASE_URL}/verify-code?code=${code}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Code verification failed');
  }

  return await response.json(); // true or false
};


/*
baseUrl : 167.172.162.159:8080

auth-service: /api/auth

————————————————————————
POST /register
Body : {
 String email:
 String password:
}
  
return : {
 String accessToken
 String refreshToken
}

————————————————————————
POST /login
Body : {
 String username:
 String password
}

return : {
 String accessToken
 String refreshToken
}

————————————————————————

POST /refresh-token
Body : {
String refreshToken
}

return : {
 String accessToken
 String refreshToken
}

————————————————————————


POST /send-verification-code
Body : {
 String email
}

return :  String : “Mail has send”

————————————————————————

POST /verify-code
RequestParam : Integer code
return : Boolean : true or false





my reg
{"username": "amin.abuhilga.140705@gmail.com", "password": "mypassword12"}
*/