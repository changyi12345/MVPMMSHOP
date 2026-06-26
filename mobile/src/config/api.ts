import { Platform } from 'react-native';

const PROD_API = 'https://api.rankage.shop';

/** Android emulator maps host localhost to 10.0.2.2 */
const DEV_API = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export const API_BASE = __DEV__ ? DEV_API : PROD_API;
