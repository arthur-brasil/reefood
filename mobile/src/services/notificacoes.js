import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';
import { auth } from './firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

export async function registrarPushToken() {
  const { status: existente } = await Notifications.getPermissionsAsync();
  let status = existente;

  if (existente !== 'granted') {
    const { status: novo } = await Notifications.requestPermissionsAsync();
    status = novo;
  }

  if (status !== 'granted') return null;

  // Android: canal de notificação
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alertas-vencimento', {
      name: 'Alertas de Vencimento',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync();

  // Salva token no backend vinculado ao usuário logado
  const user = auth.currentUser;
  if (user && token) {
    await api.patch(`/usuarios/${user.uid}`, { expo_push_token: token });
  }

  return token;
}
