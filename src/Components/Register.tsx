import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getRealm } from './Database';
import Realm from 'realm';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

type FormData = {
  username: string;
  email: string;
  phone: string;
  password: string;
};

const Register = () => {
  const navigation = useNavigation();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const { username, email, phone, password } = data;
    setError('');

    try {
      const realm = await getRealm();
      const existingUser = realm.objects('User').filtered('username == $0', username.trim())[0];

      if (existingUser) {
        setError('Username already exists');
        return;
      }

      realm.write(() => {
        realm.create('User', {
          _id: new Realm.BSON.ObjectId(),
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim(),
          createdAt: new Date(),
        });
      });

      navigation.navigate('Login' as never);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Create Account
      </Text>

      {/* Username */}
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

      {/* Email */}
      <Controller
        control={control}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'Invalid email format',
          },
        }}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Email"
            mode="outlined"
            style={styles.input}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
            error={!!errors.email}
          />
        )}
      />
      {errors.email && (
        <HelperText type="error" visible={true}>
          {errors.email.message}
        </HelperText>
      )}

      {/* Phone */}
      <Controller
        control={control}
        rules={{
          required: 'Phone number is required',
          pattern: {
            value: /^[0-9]{10}$/,
            message: 'Phone must be 10 digits',
          },
        }}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Phone Number"
            mode="outlined"
            style={styles.input}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
            error={!!errors.phone}
          />
        )}
      />
      {errors.phone && (
        <HelperText type="error" visible={true}>
          {errors.phone.message}
        </HelperText>
      )}

      {/* Password */}
      <Controller
        control={control}
        rules={{
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        }}
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
