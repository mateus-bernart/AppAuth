import {DEV_API_URL, PROD_API_URL} from '@env';

export const BASE_URL = __DEV__ ? `${DEV_API_URL}/api` : `${PROD_API_URL}/api`;
