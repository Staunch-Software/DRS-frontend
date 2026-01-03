import api from './axios';

export const getVessels = async () => {
  const response = await api.get('/vessels');
  return response.data;
};

export const createVessel = async (vesselData) => {
  const response = await api.post('/vessels', vesselData);
  return response.data;
};