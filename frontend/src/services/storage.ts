import AsyncStorage from '@react-native-async-storage/async-storage';

const storageSet = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    if (__DEV__) {
      console.log('Erro ao salvar no storage', e);
    }
    return null;
  }
  return value;
};

const storageGet = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (e) {
    if (__DEV__) {
      console.log('Erro ao ler no storage', e);
    }
    return null;
  }
};

const storageDelete = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    if (__DEV__) {
      console.log('Erro ao deletar no storage', e);
    }
    return null;
  }
};

export {storageSet, storageGet, storageDelete};
