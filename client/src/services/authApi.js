import axios from 'axios';

const client = axios.create({
  baseURL: '/api/auth',
});

const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((item) => item.msg).join(', ');
  }
  if (error.message === 'Network Error') {
    return 'Unable to reach the server. Make sure the backend is running.';
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
