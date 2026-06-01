import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AlertasScreen from '../screens/AlertasScreen';
import RelatorioScreen from '../screens/RelatorioScreen';
import { cores } from '../theme';

const Tab = createBottomTabNavigator();

function Icone({ emoji, focused }) {
  return <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      tabBarStyle: {
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#DCE8E0',
  paddingBottom: 6,
  paddingTop: 4,
  height: 58,
},
tabBarIconStyle: {
  marginBottom: 0,
},
tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Início"     component={HomeScreen}     options={{ tabBarIcon: ({ focused }) => <Icone emoji="🏠" focused={focused} /> }} />
      <Tab.Screen name="Alertas"    component={AlertasScreen}  options={{ tabBarIcon: ({ focused }) => <Icone emoji="🔔" focused={focused} /> }} />
      <Tab.Screen name="Relatórios" component={RelatorioScreen} options={{ tabBarIcon: ({ focused }) => <Icone emoji="📊" focused={focused} /> }} />
    </Tab.Navigator>
  );
}