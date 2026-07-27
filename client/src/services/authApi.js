import axios from 'axios';

// Always use a relative path so requests route through the Vite proxy
// in development (avoids cross-origin 405 errors) and resolve correctly
// in production regardless of the server port.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/auth';

const client = axios.create({
  baseURL: apiBaseUrl,
});

const getErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (responseData?.errors?.length) {
    return responseData.errors.map((item) => item.msg || item.message || item).filter(Boolean).join(', ');
  }

  if (error?.message === 'Network Error') {
    return 'Unable to reach the server. Make sure the backend is running.';
  }

  if (error?.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

export async function registerUser(payload) {
  try {
    const { data } = await client.post('/register', payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function loginUser(payload) {
  try {
    const { data } = await client.post('/login', payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function fetchCurrentUser(token) {
  try {
    const { data } = await client.get('/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.user;
  } catch {
    return null;
  }
}

export async function fetchCampuses() {
  try {
    const { data } = await client.get('/campuses');
    return data.campuses;
  } catch {
    return null;
  }
}
