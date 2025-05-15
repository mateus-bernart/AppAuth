import axiosInstance from '../services/api';

export const sendOtp = async (email, toast) => {
  try {
    const response = await axiosInstance.post('/email/send-otp', {
      email,
    });
    console.log(response.data);
    toast.show('OTP Sent', {type: 'success', placement: 'top'});
  } catch (error) {
    console.log(error.response.data);
  }
};
