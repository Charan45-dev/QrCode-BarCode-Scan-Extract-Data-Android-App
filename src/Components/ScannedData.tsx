import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import {List, Button, Text, ActivityIndicator} from 'react-native-paper';
import {
  CommonActions,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {getRealm} from './Database';
import Realm from 'realm';
import {RootStackParamList} from './types';

interface ScannedItem {
  _id: Realm.BSON.ObjectId;
  type: string;
  data: string;
  createdAt: Date;
}

const ScannedData = () => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Typed route
  const route = useRoute<RouteProp<RootStackParamList, 'ScannedData'>>();
  const navigation = useNavigation();
  const lastProcessedRef = useRef<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const realm = await getRealm();
      const items = realm
        .objects<ScannedItem>('ScannedData')
        .sorted('createdAt', true);
      setScannedItems(Array.from(items));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScannedData = async (type: string, data: string) => {
    if (!type || !data) {
      console.warn('Missing type or data. Skipping save.');
      return false;
    }

    try {
      const realm = await getRealm();

      // ✅ Prevent duplicate entries
      const existing = realm
        .objects<ScannedItem>('ScannedData')
        .filtered('data == $0', data);
      if (existing.length > 0) {
        console.log('Duplicate entry found. Skipping save.');
        return true;
      }

      realm.write(() => {
        realm.create('ScannedData', {
          _id: new Realm.BSON.ObjectId(),
          type,
          data,
          createdAt: new Date(),
        });
      });
      await loadData();
      return true;
    } catch (error) {
      console.error('Error saving scan:', error);
      return false;
    }
  };

  const deleteItem = async (id: Realm.BSON.ObjectId) => {
    try {
      const realm = await getRealm();
      const item = realm.objectForPrimaryKey<ScannedItem>('ScannedData', id);
      if (item) {
        realm.write(() => {
          realm.delete(item);
        });
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  useEffect(() => {
    const {data, label} = route.params || {};

    if (isProcessing || !data || !label || lastProcessedRef.current === data) {
      return;
    }

    const saveScan = async () => {
      setIsProcessing(true);
      try {
        const saved = await handleSaveScannedData(label, data);
        if (saved) {
          lastProcessedRef.current = data;
          navigation.dispatch(
            CommonActions.setParams({
              data: undefined,
              label: undefined,
            }),
          );
        }
      } catch (error) {
        console.error('Error saving scan:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    saveScan();
  }, [route.params]);

  const renderItem = ({item}: {item: ScannedItem}) => (
    <List.Item
      title={item.data}
      description={`${item.type} • ${new Date(
        item.createdAt,
      ).toLocaleString()}`}
      left={props => (
        <List.Icon
          {...props}
          icon={item.type.includes('QR') ? 'qrcode' : 'barcode'}
        />
      )}
      right={props => (
        <Button
          mode="text"
          onPress={() => deleteItem(item._id)}
          icon="delete"
          textColor="#d32f2f">
          Delete
        </Button>
      )}
      style={styles.listItem}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <List.Section style={styles.container}>
      <List.Subheader>Scanned Items</List.Subheader>
      {scannedItems.length > 0 ? (
        <FlatList
          data={scannedItems}
          renderItem={renderItem}
          keyExtractor={item => item._id.toString()}
        />
      ) : (
        <Text style={styles.emptyText}>No scanned items yet</Text>
      )}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={styles.processingText}>Saving scan...</Text>
        </View>
      )}
    </List.Section>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listItem: {
    backgroundColor: '#fff',
    marginBottom: 4,
    elevation: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    marginTop: 10,
  },
});

export default ScannedData;
