import { useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import DashboardScreen from './src/screens/DashboardScreen';
import SaleFormScreen from './src/screens/SaleFormScreen';
import ExpenseFormScreen from './src/screens/ExpenseFormScreen';
import InvoiceFormScreen from './src/screens/InvoiceFormScreen';
import LoginScreen from './src/screens/LoginScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0b1224',
    card: '#0f172a',
    text: '#e2e8f0',
    border: '#1f2937',
    primary: '#fbbf24',
  },
};

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <RNStatusBar barStyle=\"light-content\" />
        <LoginScreen onAuth={setUser} />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RNStatusBar barStyle=\"light-content\" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1f2937' },
          tabBarActiveTintColor: '#fbbf24',
          tabBarInactiveTintColor: '#94a3b8',
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Dashboard') return <Ionicons name=\"speedometer\" size={size} color={color} />;
            if (route.name === 'Ventes') return <Feather name=\"trending-up\" size={size} color={color} />;
            if (route.name === 'Dépenses') return <Feather name=\"trending-down\" size={size} color={color} />;
            return <Feather name=\"file-text\" size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name=\"Dashboard\" component={DashboardScreen} />
        <Tab.Screen name=\"Ventes\" component={SaleFormScreen} />
        <Tab.Screen name=\"Dépenses\" component={ExpenseFormScreen} />
        <Tab.Screen name=\"Factures\" component={InvoiceFormScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
