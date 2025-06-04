import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import { getRealm } from './Database';

type ScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Scanner'>;
type ScannerRouteProp = RouteProp<RootStackParamList, 'Scanner'>;

const Scanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const navigation = useNavigation<ScannerScreenNavigationProp>();
  const route = useRoute<ScannerRouteProp>();
  const allowedType = route.params?.type ?? 'ALL';

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
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


const onRead = async (e: { data: string; type: string }) => {
  const { data, type } = e;
  const scanType = type.includes('QR') ? 'QR Code' : 'Barcode';

  if (allowedType !== 'ALL' && !type.includes(allowedType)) {
    Alert.alert('Invalid Scan', `Only ${allowedType} scans are allowed.`);
    return;
  }

  try {
    const realm = await getRealm();

    // Avoid duplicates
    const existing = realm
      .objects('ScannedData')
      .filtered('data == $0', data);
    if (existing.length === 0) {
      realm.write(() => {
        realm.create('ScannedData', {
          _id: new Realm.BSON.ObjectId(),
          type: scanType,
          data: data,
          createdAt: new Date(),
        });
      });
    } else {
      console.log('Duplicate scan ignored.');
    }

    // Navigate after save
    navigation.navigate('ScannedData' as never);
  } catch (error) {
    console.error('Error saving scan:', error);
  }
};  return (
    <View style={styles.container}>
      {hasPermission ? (
        scannerReady ? (
          <QRCodeScanner
            onRead={onRead}
            flashMode={RNCamera.Constants.FlashMode.auto}
            reactivate={true}
            reactivateTimeout={3000}
            showMarker={true}
            cameraStyle={styles.camera}
          />
        ) : (
          <Text style={styles.text}>Preparing scanner...</Text>
        )
      ) : (
        <Text style={styles.text}>Camera permission not granted.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { height: '100%' },
  text: { fontSize: 16, padding: 20, textAlign: 'center' },
});

export default Scanner;
