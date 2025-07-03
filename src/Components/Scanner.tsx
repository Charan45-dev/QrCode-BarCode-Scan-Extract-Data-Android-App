// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
// import QRCodeScanner from 'react-native-qrcode-scanner';
// import { RNCamera } from 'react-native-camera';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import type { RootStackParamList } from './types';
// import { getRealm } from './Database';

// type ScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Scanner'>;
// type ScannerRouteProp = RouteProp<RootStackParamList, 'Scanner'>;

// const Scanner = () => {
//   const [hasPermission, setHasPermission] = useState(false);
//   const [scannerReady, setScannerReady] = useState(false);
//   const navigation = useNavigation<ScannerScreenNavigationProp>();
//   const route = useRoute<ScannerRouteProp>();
//   const allowedType = route.params?.type ?? 'ALL';

//   useEffect(() => {
//     const requestPermission = async () => {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
//         setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
//       } else {
//         setHasPermission(true);
//       }
//     };
//     requestPermission();
//   }, []);

//   useEffect(() => {
//     if (hasPermission) {
//       const timer = setTimeout(() => setScannerReady(true), 500);
//       return () => clearTimeout(timer);
//     }
//   }, [hasPermission]);


// const onRead = async (e: { data: string; type: string }) => {
//   const { data, type } = e;
//   const scanType = type.includes('QR') ? 'QR Code' : 'Barcode';

//   if (allowedType !== 'ALL' && !type.includes(allowedType)) {
//     Alert.alert('Invalid Scan', `Only ${allowedType} scans are allowed.`);
//     return;
//   }

//   try {
//     const realm = await getRealm();

//     // Avoid duplicates
//     const existing = realm
//       .objects('ScannedData')
//       .filtered('data == $0', data);
//     if (existing.length === 0) {
//       realm.write(() => {
//         realm.create('ScannedData', {
//           _id: new Realm.BSON.ObjectId(),
//           type: scanType,
//           data: data,
//           createdAt: new Date(),
//         });
//       });
//     } else {
//       Alert.alert('Duplicate scan ignored.');
//     }

//     // Navigate after save
//     navigation.navigate('ScannedData' as never);
//   } catch (error) {
//     console.error('Error saving scan:', error);
//   }
// };  return (
//     <View style={styles.container}>
//       {hasPermission ? (
//         scannerReady ? (
//           <QRCodeScanner
//             onRead={onRead}
//             flashMode={RNCamera.Constants.FlashMode.auto}
//             reactivate={true}
//             reactivateTimeout={3000}
//             showMarker={true}
//             cameraStyle={styles.camera}
//           />
//         ) : (
//           <Text style={styles.text}>Preparing scanner...</Text>
//         )
//       ) : (
//         <Text style={styles.text}>Camera permission not granted.</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   camera: { height: '100%' },
//   text: { fontSize: 16, padding: 20, textAlign: 'center' },
// });

// export default Scanner;




import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList } from './types';
import { getRealm } from './Database';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

type ScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Scanner'>;

const Scanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ScannerScreenNavigationProp>();
  const route = useRoute<any>();
  const allowedType = route.params?.type ?? 'ALL';

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      const timer = setTimeout(() => setScannerReady(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasPermission]);

  const saveScannedData = async (data: string, type: string) => {
    try {
      const realm = await getRealm();
      const existing = realm.objects('ScannedData').filtered('data == $0', data);
      if (existing.length === 0) {
        realm.write(() => {
          realm.create('ScannedData', {
            _id: new Realm.BSON.ObjectId(),
            type: type,
            data: data,
            createdAt: new Date(),
          });
        });
        Alert.alert('Success', 'QR Code saved.');
      } else {
        Alert.alert('Duplicate', 'This QR code is already scanned.');
      }
      navigation.navigate('ScannedData' as never);
    } catch (error) {
      console.error('Realm save error:', error);
      Alert.alert('Error', 'Failed to save QR code.');
    }
  };

  const onRead = async (e: { data: string; type: string }) => {
    const { data, type } = e;
    const scanType = type.includes('QR') ? 'QR Code' : 'Barcode';

    if (allowedType !== 'ALL' && !type.includes(allowedType)) {
      Alert.alert('Invalid Scan', `Only ${allowedType} scans are allowed.`);
      return;
    }

    await saveScannedData(data, scanType);
  };

  const toggleFlash = () => setFlashOn(prev => !prev);

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
      },
      async (response) => {
        if (response.didCancel || !response.assets || response.assets.length === 0) {
          return;
        }

        const asset = response.assets[0];
        setLoading(true);

        try {
          const formData = new FormData();
          formData.append('file', {
            name: 'qr-image.png',
            type: 'image/png',
            uri:
              Platform.OS === 'ios'
                ? asset.uri?.replace('file://', '')
                : asset.uri,
          });

          const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const json = await res.json();
          const qrData = json?.[0]?.symbol?.[0]?.data;

          if (qrData) {
            await saveScannedData(qrData, 'QR Code');
          } else {
            Alert.alert('Invalid Image', 'No QR code found in image.');
          }
        } catch (err) {
          console.error('QR decode error:', err);
          Alert.alert('Error', 'Failed to decode QR code from image.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      {hasPermission ? (
        scannerReady ? (
          <>
            <QRCodeScanner
              onRead={onRead}
              flashMode={
                flashOn
                  ? RNCamera.Constants.FlashMode.torch
                  : RNCamera.Constants.FlashMode.off
              }
              reactivate
              reactivateTimeout={3000}
              showMarker
              cameraStyle={styles.camera}
              containerStyle={styles.cameraContainer}
            />
            <LinearGradient colors={['#1f1f1f', '#000']} style={styles.controls}>
              <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
                <Icon name={flashOn ? 'flash' : 'flash-off'} size={28} color="#fff" />
                <Text style={styles.controlText}>Flash</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openGallery} style={styles.controlButton}>
                <Icon name="images-outline" size={28} color="#fff" />
                <Text style={styles.controlText}>Gallery</Text>
              </TouchableOpacity>
            </LinearGradient>
          </>
        ) : (
          <Text style={styles.text}>Preparing scanner...</Text>
        )
      ) : (
        <Text style={styles.text}>Camera permission not granted.</Text>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Decoding QR from image...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraContainer: { flex: 1 },
  camera: { height: '85%' },
  text: { fontSize: 16, padding: 20, color: '#ccc', textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  controlButton: {
    alignItems: 'center',
  },
  controlText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 13,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});

export default Scanner;

