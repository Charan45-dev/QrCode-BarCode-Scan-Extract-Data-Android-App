import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Open Scanner
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            Scan QR codes or barcodes
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Scanner', {type: 'ALL'})}
            icon="qrcode-scan"
          >
            Scan Now
          </Button>
        </Card.Actions>
      </Card>

      <Button 
        mode="outlined" 
        onPress={() => navigation.navigate('Login' as never)}
        style={styles.logoutButton}
        icon="logout"
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 20,
    elevation: 4,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardText: {
    color: '#666',
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default Home;