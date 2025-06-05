import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getRealm } from './Database';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

type FormData = {
  username: string;
  password: string;
};

const Login = () => {
  const navigation = useNavigation();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const { username, password } = data;
    setError('');

    try {
      const realm = await getRealm();
      const user = realm.objects('User').filtered('username == $0', username.trim())[0];

      if (!user) {
        setError('User not found');
        return;
      }

      if (user.password === password.trim()) {
        navigation.navigate('Home' as never);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Login
      </Text>

      <Controller
        control={control}
        rules={{ required: 'Username is required' }}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Username"
            mode="outlined"
            style={styles.input}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            left={<TextInput.Icon icon="account" />}
            error={!!errors.username}
          />
        )}
      />
      {errors.username && (
        <HelperText type="error" visible={true}>
          {errors.username.message}
        </HelperText>
      )}

      <Controller
        control={control}
        rules={{ required: 'Password is required' }}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Password"
            mode="outlined"
            style={styles.input}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry={secureTextEntry}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye-off' : 'eye'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
            error={!!errors.password}
          />
        )}
      />
      {errors.password && (
        <HelperText type="error" visible={true}>
          {errors.password.message}
        </HelperText>
      )}

      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
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
