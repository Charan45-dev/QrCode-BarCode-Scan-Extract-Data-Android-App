import React, { PropsWithChildren } from 'react';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
  },
};

export default function ThemeProvider({ children }: PropsWithChildren<{}>) {
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}