import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { cores } from '../theme';

export default function SplashScreen({ navigation }) {
  const opacidade = new Animated.Value(0);
  const escala    = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacidade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(escala,    { toValue: 1, friction: 4,   useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
     navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={{ opacity: opacidade, transform: [{ scale: escala }] }}>
        <Image
          source={require('../../assets/logo.png')}
          style={s.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 260,
    height: 260,
  },
});