import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { cores, espacamento, raio, tipografia } from '../theme';

export default function RecuperarSenhaScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [erro, setErro]         = useState('');
  const [enviando, setEnviando] = useState(false);

  const validar = () => {
    if (!email.trim())               { setErro('Informe seu e-mail'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErro('E-mail inválido');   return false; }
    setErro('');
    return true;
  };

  const handleEnviar = async () => {
    if (!validar()) return;
    setEnviando(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        '✅ E-mail enviado!',
        'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
        [{ text: 'Voltar ao login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      const msg = err.code === 'auth/user-not-found'
        ? 'Nenhuma conta encontrada com este e-mail'
        : 'Erro ao enviar e-mail. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.conteudo}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.cabecalho}>
          <Text style={s.icone}>🔑</Text>
          <Text style={s.titulo}>Recuperar senha</Text>
          <Text style={s.subtitulo}>Informe seu e-mail e enviaremos um link para redefinir sua senha</Text>
        </View>

        <View style={s.campo}>
          <Text style={s.label}>E-mail</Text>
          <TextInput style={[s.input, erro && s.inputErro]}
            placeholder="Ex: arthur@email.com" placeholderTextColor={cores.textoSecundario}
            value={email} onChangeText={(v) => { setEmail(v); setErro(''); }}
            keyboardType="email-address" autoCapitalize="none" />
          {erro ? <Text style={s.textoErro}>{erro}</Text> : null}
        </View>

        <TouchableOpacity style={[s.botao, enviando && s.botaoDesabilitado]}
          onPress={handleEnviar} disabled={enviando} activeOpacity={0.8}>
          {enviando
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.botaoTexto}>Enviar link de recuperação</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.linkVoltar}
          onPress={() => navigation.navigate('Login')}>
          <Text style={s.linkVoltarTexto}>← Voltar ao login</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:            { flex: 1, backgroundColor: cores.fundo },
  scroll:            { flex: 1 },
  conteudo:          { padding: espacamento.md, paddingBottom: espacamento.xxl },
  cabecalho:         { marginBottom: espacamento.xl, marginTop: espacamento.xl, alignItems: 'center' },
  icone:             { fontSize: 48, marginBottom: espacamento.md },
  titulo:            { ...tipografia.titulo, color: cores.primaria, textAlign: 'center' },
  subtitulo:         { ...tipografia.legenda, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  campo:             { marginBottom: espacamento.md },
  label:             { ...tipografia.label, marginBottom: espacamento.xs },
  input:             { backgroundColor: cores.superficie, borderWidth: 1.5, borderColor: cores.borda, borderRadius: raio.md, padding: espacamento.md, fontSize: 15, color: cores.texto },
  inputErro:         { borderColor: cores.erro },
  textoErro:         { color: cores.erro, fontSize: 12, marginTop: 4 },
  botao:             { backgroundColor: cores.primaria, borderRadius: raio.lg, paddingVertical: espacamento.md, alignItems: 'center', marginTop: espacamento.sm, ...Platform.select({ ios: { shadowColor: cores.primaria, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 }, android: { elevation: 6 } }) },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto:        { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  linkVoltar:        { alignItems: 'center', marginTop: espacamento.md },
  linkVoltarTexto:   { color: cores.primaria, fontSize: 14, fontWeight: '600' },
});