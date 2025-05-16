import {
  Alert,
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
import React, {useCallback, useEffect, useRef, useState} from 'react';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
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
import axiosInstance from '../../../services/api';
import CustomInput from '../../../components/CustomInput';
import Header from '../../../components/Header';
import {AppNavigationProp} from '../../../types/navigationTypes';
import EditButton from '../../../components/EditButton';

const BASE_URL = __DEV__ ? process.env.DEV_API_URL : process.env.PROD_API_URL;

const UserDetails = ({route}) => {
  const {session, endSession} = useAuth();
  const toast = useToast();
  const [modalCameraVisible, setModalCameraVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const navigation = useNavigation<AppNavigationProp>();

  const userId = route?.params?.userId ?? session?.userId;
  const isMyProfile = !route?.params?.userId;

  const [editable, setEditable] = useState(false);

  const inputForm = useRef<TextInput>(null);
  const handleFocusInputForm = () => {
    inputForm.current?.focus();
  };

  const endpoint = `/users/${userId}`;

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
      try {
        await axiosInstance
          .delete(`/users/${id}/remove-image`)
          .then(response => {
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
      } catch (error) {
        console.log(error.response);
      }
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

  const deleteUser = async () => {
    try {
      const response = await axiosInstance.delete(`/user/${userId}/delete`);
      toast.show(response.data.message, {type: 'success', placement: 'top'});
      navigation.navigate('UserManagement');
    } catch (e) {
      toast.show(e.message || 'An error occurred', {
        type: 'danger',
        placement: 'top',
      });
    }
  };

  const confirmDeleteAlert = () =>
    Alert.alert('Delete user?', 'Are you sure?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'DELETE', onPress: () => deleteUser()},
    ]);

  const transformUserType = (userType: string) => {
    switch (userType) {
      case 'regional_manager':
        return 'Regional Manager';
      case 'employee':
        return 'Employee';
      case 'manager':
        return 'Manager';
      default:
        return userType;
    }
  };

  const fetchUserInfo = async () => {
    try {
      await axiosInstance.get(endpoint).then(response => {
        const data = response.data;
        reset({
          name: data.name || '',
          email: data.email || '',
          neighborhood: data.neighborhood || '',
          phone_number: data.phone_number || '',
          street: data.street || '',
          street_number: data.street_number || '',
          user_branch: data.user_branch || '',
          user_type: transformUserType(data.user_type) || '',
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
      setEditable(true);
      toast.show('Edit mode enabled. Click again to save.', {
        type: 'info',
        placement: 'top',
      });
      return;
    }

    try {
      await axiosInstance.put(endpoint, data);
      toast.show('User updated successfully', {
        placement: 'top',
        type: 'success',
      });
    } catch (error) {
      toast.show('Could not update user', {
        type: 'danger',
        placement: 'top',
      });
      console.log(error.response);
    } finally {
      setEditable(false);
    }
  };

  useEffect(() => {
    if (editable) {
      setTimeout(() => {
        handleFocusInputForm();
      });
    }
  }, [editable]);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, []),
  );

  const {control, reset, handleSubmit, setValue} = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      street: '',
      neighborhood: '',
      street_number: '',
      img: '',
      user_branch: '',
      user_type: '',
    },
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1, position: 'relative'}}>
        {/* ================ HEADER ============= */}
        <Header title="USER DETAILS" iconLeft={!isMyProfile} />

        {isMyProfile ? (
          <>
            <EditButton
              onPress={() => handleSubmit(handleEdit)()}
              iconName={editable ? 'check' : 'create'}
              size={35}
              color="white"
            />

            <TouchableOpacity
              onPress={() => handleLogout()}
              style={styles.iconLogout}>
              <IconMaterialIcons name="logout" size={35} color="red" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => confirmDeleteAlert()}
            style={styles.iconDeleteContainer}>
            <IconFontAwesome name="trash" style={styles.iconDelete} size={35} />
          </TouchableOpacity>
        )}

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

        {/* ================ BODY ============= */}

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          <View style={styles.userHeaderContainer}>
            {selectedImage ? (
              <Image
                source={{uri: selectedImage}}
                style={styles.profileImage}
              />
            ) : (
              <IconFontAwesome name="user" size={150} style={styles.userIcon} />
            )}
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
                <Text style={styles.infoTitle}>Name:</Text>
                <CustomInput
                  rules={{required: 'Name is required'}}
                  control={control}
                  name="name"
                  placeholder="Michael Scott (example)"
                  keyboardType="default"
                  iconLeft="font"
                  editable={editable}
                  ref={inputForm}
                  maxLength={255}
                />
              </View>
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
                  maxLength={255}
                />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Phone:</Text>
                <CustomInput
                  rules={{
                    validate: value => {
                      !editable ||
                        !value ||
                        value.length === 11 ||
                        'Phone number should be 11 characters';
                    },
                  }}
                  control={control}
                  name="phone_number"
                  placeholder="(000) 0000-0000"
                  keyboardType="number-pad"
                  iconLeft="phone-alt"
                  editable={editable}
                  maxLength={11}
                />
              </View>
            </View>
            <View style={styles.containerHeader}>
              <IconFontAwesome5 name="id-card-alt" size={25} />
              <Text style={styles.headerInfo}>Job info</Text>
            </View>
            <View style={styles.infoWrapper}>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Branch</Text>
                <CustomInput
                  rules={{required: 'Branch is required'}}
                  control={control}
                  name="user_branch"
                  keyboardType="default"
                  iconLeft="home"
                  editable={false}
                  maxLength={255}
                />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Role</Text>
                <CustomInput
                  rules={{required: 'Name is required'}}
                  control={control}
                  name="user_type"
                  keyboardType="default"
                  iconLeft="briefcase"
                  editable={false}
                  maxLength={255}
                />
              </View>
            </View>
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
                  placeholder="Not set yet"
                  iconLeft="map-signs"
                  editable={editable}
                  maxLength={255}
                />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Neighborhood:</Text>
                <CustomInput
                  control={control}
                  name="neighborhood"
                  placeholder="Not set yet"
                  iconLeft="map"
                  editable={editable}
                  maxLength={255}
                />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Number:</Text>
                <CustomInput
                  control={control}
                  name="street_number"
                  placeholder="Not set yet"
                  iconLeft="home"
                  editable={editable}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>
          </View>
        </ScrollView>
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
    marginBottom: 100,
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  containerName: {
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
    left: 30,
    top: 10,
    color: 'red',
  },
  iconDeleteContainer: {
    padding: 10,
    backgroundColor: 'pink',
    position: 'absolute',
    right: 30,
    borderRadius: 8,
  },
  iconDelete: {
    color: 'red',
  },
  iconEdit: {
    position: 'absolute',
    padding: 10,
    backgroundColor: '#47b64c',
    right: 30,
    borderRadius: 10,
  },
  profileImage: {
    height: 180,
    width: 180,
    borderRadius: 90,
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
    marginBottom: 60,
  },
  userHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAddPhoto: {
    color: 'white',
    padding: 10,
    backgroundColor: '#60b565',
    borderRadius: 12,
  },
  iconContainer: {
    position: 'absolute',
    right: 120,
    bottom: 0,
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
    borderBottomWidth: 2,
    borderBottomColor: '#579b6a',
    padding: 10,
    marginBottom: 12,
    paddingLeft: 10,
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
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
  },
  infoValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  infoWrapper: {
    marginBottom: 10,
  },
});
