import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://167.172.162.159:8080/api/auth';

export const register = async (username, password) => {
  console.log(`Trying to register: ${username}`);
  const response = await axios.post(`${BASE_URL}/register`, {
    username,
    password,
  });
  const {accessToken, refreshToken} = response.data;
  await saveTokens(accessToken, refreshToken);
  return response.data; // { accessToken, refreshToken }
};

export const login = async (username, password) => {
  console.log(`Trying to login from: ${username}`)
  const response = await axios.post(`${BASE_URL}/login`, {
    username,
    password,
  });
  const {accessToken, refreshToken} = response.data;
  await saveTokens(accessToken, refreshToken);
  return response.data; // { accessToken, refreshToken }
};

export const refreshToken = async () => {
  console.log(`Requested refreshAccessToken!`);
  try {
    const refresh = await getRefreshToken();
    if (!refresh) throw new Error('No refresh token found');

    const response = await axios.post(`${BASE_URL}/refresh-token`, {
      refreshToken: refresh,
    });

    const { accessToken, refreshToken: newRefresh } = response.data;
    await saveTokens(accessToken, newRefresh);
    console.log('Token refreshed successfully!');
    return response.data; // { accessToken, refreshToken }
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
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



// NOTE: reason of not using axios for this function.
/*
  exists funciton is implemented with 'fetch' - react-native CLI 
  Using axios gives 403 error.
*/
export const exists = async (email) => {
  const url = `http://167.172.162.159:8080/api/auth/exists?email=${encodeURIComponent(email)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
      'User-Agent': 'curl/7.64.1', // optional, mimics curl
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} - ${errorText}`);
  }

  const text = await response.text(); // because `true` or `false` is plain text
  return text === 'true';
};


// setting tokens
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    console.log('Tokens saved!');
  } catch (e) {
    console.error('Failed to save tokens:', e);
  }
};

// retrieving tokens
export const getAccessToken = async () => {
  return await AsyncStorage.getItem('accessToken');
};

export const getRefreshToken = async () => {
  return await AsyncStorage.getItem('refreshToken');
};

// logout
  export const logout = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
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