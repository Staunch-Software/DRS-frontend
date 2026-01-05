import api from './axios';

export const getVessels = async () => {
  const response = await api.get('/vessels/'); // <--- FIXED
  return response.data;
};

export const createVessel = async (vesselData) => {
  const response = await api.post('/vessels/', vesselData); // <--- FIXED
  return response.data;
};