import {
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5';
import {useAuth} from '../../providers/AuthProvider';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/navigationTypes';
import Axios from 'axios';
import {storageGet} from '../../services/storage';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useToast} from 'react-native-toast-notifications';
import {
  launchCamera,
  launchImageLibrary,
  MediaType,
} from 'react-native-image-picker';

import Config from 'react-native-config';

const axios = Axios.create({
  baseURL: 'http://172.16.1.131:8000/api',
});

axios.interceptors.request.use(
  async function (config) {
    const authToken: string | null | undefined = await storageGet('AcessToken');
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

type UserInfoProps = {
  id: number;
  name: string;
  email: string;
  phone: string;
  street: string;
  neighborhood: string;
  streetNumber: string;
};

const UserDetailsComponent = () => {
  const {session, endSession} = useAuth();
  const navigation = useNavigation<AppNavigationProp>();
  const [userInfo, setUserInfo] = useState<UserInfoProps>();
  const toast = useToast();
  const [modalCameraVisible, setModalCameraVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    endSession();
    toast.show('Logged out', {type: 'success', placement: 'top'});
  };

  const uploadImage = async image => {
    const userId = session?.userId;
    let formData = new FormData();

    formData.append('file', {
      uri: image.uri,
      name: image.fileName || 'profile.jpg',
      type: image.type,
    });

    try {
      const response = await axios.post(`/user/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload Success:', response.data);
    } catch (error) {
      console.log('Upload Failed: ', error.response?.data || error.message);
    }
  };

  const handleCameraLaunch = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 130,
      maxWidth: 130,
    };

    launchCamera(options, response => {
      console.log(response);

      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else {
        let imageUri = response.assets?.[0];
        setSelectedImage(response.assets?.[0]['uri']);
        uploadImage(imageUri);
        toast.show('Profile picture updated!', {
          type: 'success',
          placement: 'top',
        });
      }
    });
  };

  const handleRemovePhoto = () => {
    setSelectedImage(null);
  };

  const handleGalleryOpen = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 130,
      maxWidth: 130,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('Image picker error: ', response.errorMessage);
      } else {
        const imageObject = response.assets?.[0];

        setSelectedImage(response.assets?.[0]['uri']);
        console.log(response.assets?.[0]['uri']);

        uploadImage(imageObject);
        toast.show('Profile picture updated!', {
          type: 'success',
          placement: 'top',
        });
      }
    });
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        await axios.get('/user').then(response => {
          setUserInfo(response.data);

          if (response.data.image) {
            const imageUrl = `http://172.16.1.131:8000/storage/profile_images/${response.data.image}`;
            setSelectedImage(imageUrl);
          }
        });
      } catch (error) {
        toast.show('Could not render data', {
          type: 'danger',
          placement: 'top',
        });
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <>
      {/* ================ MODAL ============= */}
      <Modal
        transparent={true}
        visible={modalCameraVisible}
        onRequestClose={() => setModalCameraVisible(!modalCameraVisible)}>
        <TouchableWithoutFeedback onPress={() => setModalCameraVisible(false)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Upload your photo</Text>
              <View style={styles.buttonModalContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    handleCameraLaunch();
                  }}>
                  <Text style={styles.textButton}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    handleGalleryOpen();
                  }}>
                  <Text style={styles.textButton}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    handleRemovePhoto();
                  }}>
                  <Text style={styles.textButton}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ================ HEADER ============= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconHeader}
          onPress={() => handleBack()}>
          <IconFontAwesome name="chevron-left" size={35} />
        </TouchableOpacity>
        <Text style={styles.headerText}>User Details</Text>
        <TouchableOpacity
          onPress={() => handleLogout()}
          style={styles.iconLogout}>
          <IconMaterialIcons name="logout" size={35} color="red" />
        </TouchableOpacity>
      </View>

      {/* ================ BODY ============= */}

      <View style={styles.body}>
        <View style={styles.userNameContainer}>
          <TouchableOpacity onPress={() => setModalCameraVisible(true)}>
            {selectedImage ? (
              <Image
                source={{uri: selectedImage}}
                style={styles.profileImage}
              />
            ) : (
              <IconFontAwesome name="user" size={130} />
            )}
          </TouchableOpacity>
          <Text style={styles.textUserName}>{session?.userName}</Text>
        </View>
        <View style={styles.userInfoContainer}>
          <View style={styles.containerHeader}>
            <Text style={styles.headerInfo}>Contact Info</Text>
          </View>
          <View style={styles.infoWrapper}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Email:</Text>
              <Text style={styles.infoValue}>{userInfo?.email}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Phone:</Text>
              <Text style={styles.infoValue}>{userInfo?.phone}</Text>
            </View>
          </View>
          <View>
            <View style={styles.containerHeader}>
              <Text style={styles.headerInfo}>Address</Text>
            </View>
            <View style={styles.infoWrapper}>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Street:</Text>
                <Text style={styles.infoValue}>{userInfo?.street} </Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Neighborhood:</Text>
                <Text style={styles.infoValue}>{userInfo?.neighborhood}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Number:</Text>
                <Text style={styles.infoValue}>{userInfo?.streetNumber}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default UserDetailsComponent;

const styles = StyleSheet.create({
  headerTop: {
    backgroundColor: 'lightgray',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  buttonModalContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  textButton: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
    fontSize: 15,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    backgroundColor: '#ca6c00',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconLogout: {
    position: 'absolute',
    right: 20,
    color: 'red',
  },
  profileImage: {
    height: 150,
    width: 150,
    borderRadius: 80,
    marginTop: 15,
  },
  header: {
    alignItems: 'center',
    height: 40,
  },
  iconHeader: {
    position: 'absolute',
    left: 30,
  },
  headerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 25,
  },
  body: {
    flex: 1,
  },
  userNameContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    marginTop: 20,
  },
  textUserName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 25,
    alignSelf: 'center',
  },
  userInfoContainer: {
    flex: 1,
    margin: 20,
  },
  textInput: {
    backgroundColor: 'lightgray',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  containerHeader: {
    backgroundColor: 'lightgray',
    padding: 10,
    marginBottom: 12,
  },
  headerInfo: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 15,
    height: 30,
    alignItems: 'center',
  },
  infoTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
  },
  infoValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  infoWrapper: {
    marginBottom: 10,
  },
});
