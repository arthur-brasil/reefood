import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import SplashScreen           from './src/screens/SplashScreen';
import LoginScreen            from './src/screens/LoginScreen';
import CadastroUsuarioScreen  from './src/screens/CadastroUsuarioScreen';
import RecuperarSenhaScreen   from './src/screens/RecuperarSenhaScreen';
import CadastrarAlimentoScreen from './src/screens/CadastrarAlimentoScreen';
import PerfilScreen           from './src/screens/PerfilScreen';
import DetalhesAlimentoScreen from './src/screens/DetalhesAlimentoScreen';
import MainNavigator          from './src/navigation/MainNavigator';
import { cores } from './src/theme';
import { registrarPushToken } from './src/services/notificacoes';
import { auth } from './src/services/firebase';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Registra token de push quando usuário estiver logado
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) registrarPushToken().catch(console.error);
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerStyle:       { backgroundColor: cores.fundo },
            headerTintColor:   cores.primaria,
            headerTitleStyle:  { fontWeight: '700' },
            headerShadowVisible: false,
          }}>
          <Stack.Screen name="Splash"             component={SplashScreen}            options={{ headerShown: false }} />
          <Stack.Screen name="Login"              component={LoginScreen}             options={{ headerShown: false }} />
          <Stack.Screen name="CadastroUsuario"    component={CadastroUsuarioScreen}   options={{ title: 'Criar conta' }} />
          <Stack.Screen name="RecuperarSenha"     component={RecuperarSenhaScreen}    options={{ title: 'Recuperar senha' }} />
          <Stack.Screen name="Main"               component={MainNavigator}           options={{ headerShown: false }} />
          <Stack.Screen name="CadastrarAlimento"  component={CadastrarAlimentoScreen} options={{ title: 'Cadastrar Alimento' }} />
          <Stack.Screen name="Perfil"             component={PerfilScreen}            options={{ title: 'Meu Perfil' }} />
          <Stack.Screen name="DetalhesAlimento"   component={DetalhesAlimentoScreen}  options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
