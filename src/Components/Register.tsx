import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getRealm } from './Database';
import { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPhone || !trimmedPassword) {
      setError('Please fill all fields');
      return;
    }
    setError('');

    try {
      const realm = await getRealm();
      const existingUser = realm.objects('User').filtered('username == $0', trimmedUsername)[0];

      if (existingUser) {
        setError('Username already exists');
        return;
      }

      realm.write(() => {
        realm.create('User', {
          _id: new Realm.BSON.ObjectId(),
          username: trimmedUsername,
          email: trimmedEmail,
          phone: trimmedPhone,
          password: trimmedPassword,
          createdAt: new Date(),
        });
      });

      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Create Account
      </Text>

      <TextInput
        label="Username"
        mode="outlined"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        left={<TextInput.Icon icon="account" />}
      />

      <TextInput
        label="Email"
        mode="outlined"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        left={<TextInput.Icon icon="email" />}
      />

      <TextInput
        label="Phone Number"
        mode="outlined"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        left={<TextInput.Icon icon="phone" />}
      />

      <TextInput
        label="Password"
        mode="outlined"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={secureTextEntry}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon 
            icon={secureTextEntry ? "eye-off" : "eye"} 
            onPress={() => setSecureTextEntry(!secureTextEntry)} 
          />
        }
      />

      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      <Button 
        mode="contained" 
        onPress={handleRegister}
        style={styles.button}
        icon="account-plus"
      >
        Register
      </Button>

      <View style={styles.footer}>
        <Text variant="bodyMedium">Already have an account?</Text>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Login' as never)}
          textColor="#6200ee"
        >
          Login
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
    color: '#6200ee',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
});

export default Register;