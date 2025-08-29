// App.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

import { initDB, getReminderSettings } from './db';

import CollectionsScreen from './screens/CollectionsScreen';
import CardsScreen from './screens/CardsScreen';
import StudyScreen from './screens/StudyScreen';
import ImportScreen from './screens/ImportScreen';
import SettingsScreen from './screens/SettingsScreen';
import CreateCardScreen from './screens/CreateCardScreen'; // <= importante

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

async function rescheduleDailyReminderFromPrefs() {
  const { enabled, hour, minute } = getReminderSettings();
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of existing) await Notifications.cancelScheduledNotificationAsync(n.identifier);
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-reminder',
    content: { title: 'Já estudaste hoje? 📚', body: 'Abre os teus flashcards e reforça o conhecimento!' },
    trigger: { hour, minute, repeats: true },
  });
}

export default function App() {
  const scheme = useColorScheme();

  useEffect(() => {
    initDB();
    Notifications.requestPermissionsAsync().then(rescheduleDailyReminderFromPrefs);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
        <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '700' } }}>
          <Stack.Screen name="Collections" component={CollectionsScreen} options={{ title: 'Coleções' }} />
          <Stack.Screen name="Cards" component={CardsScreen} options={{ title: 'Cartões' }} />
          <Stack.Screen name="Study" component={StudyScreen} options={{ title: 'Estudar' }} />
          <Stack.Screen name="CreateCard" component={CreateCardScreen} options={{ title: 'Novo/Editar Cartão' }} />
          <Stack.Screen name="Import" component={ImportScreen} options={{ title: 'Importar' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Definições & Estatísticas' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}