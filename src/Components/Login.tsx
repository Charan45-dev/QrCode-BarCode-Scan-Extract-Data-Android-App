import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getRealm } from './Database';
import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both username and password');
      return;
    }
    setError('');

    try {
      const realm = await getRealm();
      const user = realm.objects('User').filtered('username == $0', trimmedUsername)[0];

      if (!user) {
        setError('User not found');
        return;
      }

      if (user.password === trimmedPassword) {
        navigation.navigate('Home' as never);
      } else {
        setError('Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Login
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
        onPress={handleLogin}
        style={styles.button}
        icon="login"
      >
        Login
      </Button>

      <View style={styles.footer}>
        <Text variant="bodyMedium">Don't have an account?</Text>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Register' as never)}
          textColor="#6200ee"
        >
          Register
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

export default Login;