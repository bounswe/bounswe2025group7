import axios from 'axios';

const BASE_URL = 'http://167.172.162.159:8080/api/auth';

export const register = async (username, password) => {
  console.log($`Trying to register: ${username}`);
  const response = await axios.post(`${BASE_URL}/register`, {
    username,
    password,
  });
  return response.data; // { accessToken, refreshToken }
};

export const login = async (username, password) => {
  console.log(`Trying to login from: ${username}`)
  const response = await axios.post(`${BASE_URL}/login`, {
    username,
    password,
  });
  return response.data; // { accessToken, refreshToken }
};

export const refreshAccessToken = async (refreshToken) => {
  console.log(`Requested refreshAccessToken!`);
  const response = await axios.post(`${BASE_URL}/refresh-token`, {
    refreshToken,
  });
  return response.data; // { accessToken, refreshToken }
};

export const sendVerificationCode = async (email) => {
  console.log(`Verification code is sent to ${email}!`)
  const response = await axios.post(`${BASE_URL}/send-verification-code`, {
    email,
  });
  return response.data; // "Mail has send"
};

export const verifyCode = async (email, code) => {
  const response = await axios.post(`${BASE_URL}/verify-code`, {
    email,
    code,
  });
  return response.data; // true or false
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
amin.abuhilga@gmail.com, pass12

aliihsanuslu17@gmail.com
12345
*/