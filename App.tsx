import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ChatScreen from './screens/ChatScreen';
import VaultScreen from './screens/VaultScreen';
import CanvasScreen from './screens/CanvasScreen';
import ConnectorsScreen from './screens/ConnectorsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { SettingsProvider } from './contexts/SettingsContext';
import { Provider as PaperProvider, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';

const Tab = createBottomTabNavigator();

export default function App() {
  // Integrate Paper's dark theme with React Navigation
  const { DarkTheme } = adaptNavigationTheme({ reactNavigationDark: DefaultTheme, materialDark: MD3DarkTheme });
  const navTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#101728',
    },
  };

  return (
    <SettingsProvider>
      <PaperProvider theme={MD3DarkTheme}>
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: '#0A84FF',
              tabBarInactiveTintColor: '#8e8e93',
              tabBarStyle: { backgroundColor: '#1c2230', borderTopColor: '#1c2230' },
              tabBarIcon: ({ color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'chatbubbles';
                if (route.name === 'Chat') {
                  iconName = 'chatbubbles';
                } else if (route.name === 'Vault') {
                  iconName = 'folder';
                } else if (route.name === 'Canvas') {
                  iconName = 'code-slash';
                } else if (route.name === 'Connectors') {
                  iconName = 'link';
                } else if (route.name === 'Settings') {
                  iconName = 'settings';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Vault" component={VaultScreen} />
            <Tab.Screen name="Canvas" component={CanvasScreen} />
            <Tab.Screen name="Connectors" component={ConnectorsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SettingsProvider>
  );
}