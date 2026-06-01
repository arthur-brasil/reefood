import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { cores, espacamento, raio, tipografia } from '../theme';

export default function LoginScreen({ navigation }) {
  const [form, setForm]         = useState({ email: '', senha: '' });
  const [erros, setErros]       = useState({});
  const [salvando, setSalvando] = useState(false);

  const atualizar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: null }));
  };

  const validar = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Informe seu e-mail';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.senha) e.senha = 'Informe sua senha';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validar()) return;
    setSalvando(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'E-mail ou senha incorretos'
        : 'Erro ao fazer login. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={s.segura}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">

          <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />

          <View style={s.card}>
            <View style={s.avatarContainer}>
              <Text style={s.avatarEmoji}>👤</Text>
            </View>

            <View style={s.campo}>
              <Text style={s.label}>Usuário</Text>
              <TextInput style={[s.input, erros.email && s.inputErro]}
                placeholder="seu@email.com" placeholderTextColor={cores.textoSecundario}
                value={form.email} onChangeText={(v) => atualizar('email', v)}
                keyboardType="email-address" autoCapitalize="none" />
              {erros.email ? <Text style={s.textoErro}>{erros.email}</Text> : null}
            </View>

            <View style={s.campo}>
              <Text style={s.label}>Senha</Text>
              <TextInput style={[s.input, erros.senha && s.inputErro]}
                placeholder="••••••••" placeholderTextColor={cores.textoSecundario}
                value={form.senha} onChangeText={(v) => atualizar('senha', v)}
                secureTextEntry />
              {erros.senha ? <Text style={s.textoErro}>{erros.senha}</Text> : null}
            </View>

            <TouchableOpacity style={s.esqueceuSenha} onPress={() => navigation.navigate('RecuperarSenha')}>
              <Text style={s.esqueceuSenhaTexto}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.botao, salvando && s.botaoDesabilitado]}
              onPress={handleLogin} disabled={salvando} activeOpacity={0.8}>
              {salvando ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTexto}>ENTRAR</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.linkCadastro} onPress={() => navigation.navigate('CadastroUsuario')}>
              <Text style={s.linkTexto}>Já tem uma conta? <Text style={s.linkDestaque}>login</Text></Text>
            </TouchableOpacity>
          </View>

          <Image source={require('../../assets/logo.png')} style={s.logoRodape} resizeMode="contain" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:          { flex: 1, backgroundColor: '#E8F5E9' },
  conteudo:        { flexGrow: 1, alignItems: 'center', padding: espacamento.md },
  logo:            { width: 160, height: 160, marginTop: espacamento.md },
  card:            { width: '100%', backgroundColor: '#fff', borderRadius: raio.lg, padding: espacamento.lg, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  avatarContainer: { alignItems: 'center', marginBottom: espacamento.md },
  avatarEmoji:     { fontSize: 52 },
  campo:           { marginBottom: espacamento.md },
  label:           { ...tipografia.label, marginBottom: espacamento.xs },
  input:           { backgroundColor: '#F5FBF5', borderWidth: 1.5, borderColor: cores.borda, borderRadius: raio.md, padding: espacamento.md, fontSize: 15, color: cores.texto },
  inputErro:       { borderColor: cores.erro },
  textoErro:       { color: cores.erro, fontSize: 12, marginTop: 4 },
  esqueceuSenha:   { alignItems: 'flex-end', marginBottom: espacamento.md },
  esqueceuSenhaTexto: { color: cores.primaria, fontSize: 13, fontWeight: '600' },
  botao:           { backgroundColor: cores.primaria, borderRadius: raio.lg, paddingVertical: espacamento.md, alignItems: 'center', elevation: 3 },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto:      { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  linkCadastro:    { alignItems: 'center', marginTop: espacamento.md },
  linkTexto:       { fontSize: 14, color: cores.textoSecundario },
  linkDestaque:    { color: cores.primaria, fontWeight: '600' },
  logoRodape:      { width: 120, height: 60, marginTop: espacamento.lg, opacity: 0.5 },
});