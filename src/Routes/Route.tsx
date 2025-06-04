import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Login from '../Components/Login';
import Register from '../Components/Register';
import HomeTab from './HomeTab';
import { RootStackParamList } from '../Components/types';
import ScannedData from '../Components/ScannedData';
import Scanner from '../Components/Scanner';
import ThemeProvider from '../Components/ThemeProvider';



const Stack = createNativeStackNavigator<RootStackParamList>();

const Route = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
       <Stack.Navigator>
      <Stack.Screen name='Login' component={Login} options={{headerShown:false}} />
      <Stack.Screen name='Register' component={Register} options={{headerShown:false}} />
      <Stack.Screen name ='Home' component={HomeTab} options={{headerShown:false}}/>
      <Stack.Screen name ='Scanner' component={Scanner} options={{headerShown:false}}/>
      <Stack.Screen name ='ScannedData' component={ScannedData} options={{headerShown:false}}/>
    </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default Route