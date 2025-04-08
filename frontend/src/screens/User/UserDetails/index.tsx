import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {useIsFocused, useNavigation} from '@react-navigation/native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useToast} from 'react-native-toast-notifications';
import {
  launchCamera,
  launchImageLibrary,
  MediaType,
} from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm} from 'react-hook-form';
import {useAuth} from '../../../providers/AuthProvider';
import {AppNavigationProp} from '../../../types/navigationTypes';
import axiosInstance from '../../../services/api';
import CustomInput from '../../../component/CustomInput';

const BASE_URL = __DEV__ ? process.env.DEV_API_URL : process.env.PROD_API_URL;

type UserInfoProps = {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  street: string;
  neighborhood: string;
  street_number: string;
  image?: string;
};

const UserDetails = ({route}) => {
  const {session, endSession} = useAuth();
  const navigation = useNavigation<AppNavigationProp>();
  const toast = useToast();
  const [modalCameraVisible, setModalCameraVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const {userId} = route?.params || {};
  const isFocused = useIsFocused();
  const [editable, setEditable] = useState(false);

  const inputForm = useRef<TextInput>(null);

  const handleFocusInputForm = () => {
    inputForm.current?.focus();
  };

  const endpoint = `/user/${userId}`;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    endSession();
    toast.show('Logged out', {type: 'success', placement: 'top'});
  };

  const uploadImage = async image => {
    let formData = new FormData();

    formData.append('file', {
      uri: image.uri,
      name: image.fileName || 'profile_.jpg',
      type: image.type || 'image/jpeg',
    });

    try {
      const response = await axiosInstance.post(
        `${endpoint}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );

      if (response.data.image) {
        setSelectedImage(
          `${BASE_URL}/storage/profile_images/${response.data.image}`,
        );
        setValue('img', response.data.image);
      }

      toast.show('Profile picture updated', {
        type: 'success',
        placement: 'top',
      });

      console.log('Upload Success:', response.data);
    } catch (error) {
      toast.show('Error updating the image, check internet connection.', {
        type: 'danger',
        placement: 'top',
      });
      console.log('Upload Failed: ', error.response?.data);
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
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else {
        let imageUri = response.assets?.[0];
        setSelectedImage(response.assets?.[0]['uri']);
        uploadImage(imageUri);
      }
    });
  };

  const handleRemovePhoto = async id => {
    if (selectedImage) {
      await axiosInstance.delete(`/user/${id}/remove-image`).then(response => {
        if (response.status !== 200) {
          toast.show(response.data.message, {
            type: 'danger',
            placement: 'top',
          });
          return;
        }
        toast.show(response.data.message, {
          type: 'success',
          placement: 'top',
        });
      });
      setSelectedImage(null);
    } else {
      toast.show('You dont have any image.', {
        type: 'danger',
        placement: 'top',
      });
    }
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
        console.log(imageObject);

        uploadImage(imageObject);
      }
    });
  };

  const fetchUserInfo = async () => {
    try {
      await axiosInstance.get(endpoint).then(response => {
        reset({
          name: response.data.name,
          email: response.data.email,
          neighborhood: response.data.neighborhood,
          phone_number: response.data.phone_number,
          street: response.data.street,
          street_number: response.data.street_number,
        });

        if (response.data.image) {
          const imageUrl = `${BASE_URL}/storage/profile_images/${response.data.image}`;
          setSelectedImage(imageUrl);
        }
      });
    } catch (error) {
      toast.show('Could not render user data', {
        type: 'danger',
        placement: 'top',
      });
      console.log('error:', error.response);
    }
  };

  const handleEdit = async data => {
    if (!editable) {
      setEditable(state => !state);
      return;
    }

    try {
      await axiosInstance.put(endpoint, data);
      toast.show('User updated successfully', {
        placement: 'top',
        type: 'success',
      });
      setEditable(state => !state);
    } catch (error) {
      toast.show('Could not update user', {
        type: 'danger',
        placement: 'top',
      });
      console.log(error.response);
    }
  };

  useEffect(() => {
    if (editable) {
      setTimeout(() => {
        handleFocusInputForm();
      });
    }
  }, [editable]);

  useEffect(() => {
    fetchUserInfo();
  }, [isFocused]);

  const {control, reset, handleSubmit, setValue, watch} = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      street: '',
      neighborhood: '',
      street_number: '',
      img: '',
    },
  });

  const userName = watch('name');

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        {/* ================ MODAL ============= */}
        <Modal
          transparent={true}
          visible={modalCameraVisible}
          onRequestClose={() => setModalCameraVisible(!modalCameraVisible)}>
          <TouchableWithoutFeedback
            onPress={() => setModalCameraVisible(false)}>
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
                      handleRemovePhoto(userId);
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
            <IconFontAwesome name="chevron-left" size={30} />
          </TouchableOpacity>
          <Text style={styles.headerText}>User Details</Text>
          <TouchableOpacity
            onPress={() => handleLogout()}
            style={styles.iconLogout}>
            <IconMaterialIcons name="logout" size={35} color="red" />
          </TouchableOpacity>
        </View>

        {/* ================ BODY ============= */}

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          <View>
            <View style={styles.userHeaderContainer}>
              {selectedImage ? (
                <Image
                  source={{uri: selectedImage}}
                  style={styles.profileImage}
                />
              ) : (
                <IconFontAwesome
                  name="user"
                  size={150}
                  style={styles.userIcon}
                />
              )}
              <View style={styles.containerName}>
                <CustomInput
                  rules={{required: 'Name is required'}}
                  control={control}
                  name="name"
                  editable={editable}
                  ref={inputForm}
                  textStyle
                />
              </View>
              <TouchableOpacity
                onPress={() => setModalCameraVisible(true)}
                style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="image-plus"
                  style={styles.iconAddPhoto}
                  size={30}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfoContainer}>
              <View style={styles.containerHeader}>
                <IconFontAwesome5 name="user-alt" size={25} />
                <Text style={styles.headerInfo}>Contact Info</Text>
              </View>
              <View style={styles.infoWrapper}>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoTitle}>Email:</Text>
                  <CustomInput
                    rules={{required: 'Email is required'}}
                    control={control}
                    name="email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    iconLeft="envelope"
                    editable={editable}
                    ref={inputForm}
                  />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoTitle}>Phone:</Text>
                  <CustomInput
                    rules={{
                      minLength: {
                        value: 11,
                        message: 'Phone number should be minimum 11 characters',
                      },
                    }}
                    control={control}
                    name="phone_number"
                    placeholder="(+33)3333-3333"
                    keyboardType="number-pad"
                    iconLeft="phone-alt"
                    editable={editable}
                  />
                </View>
              </View>
              <View>
                <View style={styles.containerHeader}>
                  <IconFontAwesome5 name="map-marker-alt" size={25} />
                  <Text style={styles.headerInfo}>Address</Text>
                </View>
                <View style={styles.infoWrapper}>
                  <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>Street:</Text>
                    <CustomInput
                      control={control}
                      name="street"
                      placeholder="123 Main Street"
                      iconLeft="map-signs"
                      editable={editable}
                    />
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>Neighborhood:</Text>
                    <CustomInput
                      control={control}
                      name="neighborhood"
                      placeholder="Downtown, etc."
                      iconLeft="map"
                      editable={editable}
                    />
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>Number:</Text>
                    <CustomInput
                      control={control}
                      name="street_number"
                      placeholder="Apt 4B or House 42"
                      iconLeft="home"
                      editable={editable}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.editButtonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleSubmit(handleEdit)}>
            {!editable ? (
              <IconFontAwesome5 name="pen" size={30} color="white" />
            ) : (
              <IconFontAwesome5 name="check" size={30} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserDetails;

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
  editButtonContainer: {
    position: 'absolute',
    bottom: 0,
    margin: 30,
    alignSelf: 'flex-end',
  },
  containerName: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  editButton: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'green',
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
    backgroundColor: 'green',
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
  userHeaderContainer: {
    height: 200,
    backgroundColor: 'lightgray',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAddPhoto: {
    color: 'white',
    padding: 10,
    backgroundColor: '#005be4',
    borderRadius: 12,
  },
  iconContainer: {
    position: 'absolute',
    right: 130,
    bottom: 50,
  },
  userImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIcon: {
    borderRadius: 50,
  },
  textUserName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 25,
  },
  inputUserName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 25,
  },
  editIcon: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: 'green',
    color: 'white',
    borderRadius: 8,
    justifyContent: 'flex-end',
  },
  userInfoContainer: {
    flex: 1,
    margin: 20,
  },
  containerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'lightgray',
    padding: 10,
    marginBottom: 12,
    paddingLeft: 15,
  },
  headerInfo: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
  },
  infoContainer: {
    marginBottom: 10,
  },
  inputText: {
    backgroundColor: '#dfdfdf',
    borderRadius: 8,
    padding: 8,
    width: 200,
    height: 50,
    fontFamily: 'Poppins-Regular',
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
