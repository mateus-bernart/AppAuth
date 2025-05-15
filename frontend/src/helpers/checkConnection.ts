import {isOnline} from './networkHelper';

export const checkConnection = async toast => {
  const online = await isOnline();
  console.log(online);

  if (!online) {
    toast.show('Check Wi-fi connection.', {
      type: 'warning',
      placement: 'top',
    });
    return;
  }
};
