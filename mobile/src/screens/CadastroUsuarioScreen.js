import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { cores, espacamento, raio, tipografia } from '../theme';
import api from '../services/api';

const TIPOS_RESIDENCIA = ['Casa', 'Apartamento', 'República'];
const RESTRICOES = ['Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose'];
const DIAS = ['1', '2', '3', '5', '7'];

export default function CadastroUsuarioScreen({ navigation }) {
  const [form, setForm]         = useState({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '', quantidade_pessoas: '1', tipo_residencia: '', restricoes: [], dias_antecedencia: '3' });
  const [erros, setErros]       = useState({});
  const [salvando, setSalvando] = useState(false);

  const atualizar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: null }));
  };

  const toggleRestricao = (item) => {
    setForm((prev) => ({
      ...prev,
      restricoes: prev.restricoes.includes(item)
        ? prev.restricoes.filter((r) => r !== item)
        : [...prev.restricoes, item],
    }));
  };

  const validar = () => {
    const e = {};
    if (!form.nome.trim())            e.nome = 'Informe seu nome';
    if (!form.email.trim())           e.email = 'Informe seu e-mail';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.senha)                  e.senha = 'Informe uma senha';
    else if (form.senha.length < 6)   e.senha = 'Mínimo 6 caracteres';
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = 'As senhas não coincidem';
    if (!form.tipo_residencia)        e.tipo_residencia = 'Selecione o tipo de residência';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleCadastrar = async () => {
    if (!validar()) return;
    setSalvando(true);
    try {
      const credencial = await createUserWithEmailAndPassword(auth, form.email, form.senha);
      const uid = credencial.user.uid;
      await api.post('/usuarios', {
        id: uid, nome: form.nome, email: form.email,
        quantidade_pessoas: Number(form.quantidade_pessoas),
        tipo_residencia: form.tipo_residencia.toLowerCase(),
        restricoes: form.restricoes,
        dias_antecedencia: Number(form.dias_antecedencia),
      });
      Alert.alert('✅ Cadastro realizado!', `Bem-vindo, ${form.nome}!`, [
        { text: 'Fazer login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Este e-mail já está cadastrado'
        : err?.response?.data?.mensagem || 'Erro ao cadastrar.';
      Alert.alert('Erro', msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">

        <View style={s.avatarContainer}>
          <Text style={s.avatarEmoji}>👤</Text>
        </View>

        <Campo label="Nome" erro={erros.nome}>
          <TextInput style={[s.input, erros.nome && s.inputErro]} placeholder="Seu nome completo"
            placeholderTextColor={cores.textoSecundario} value={form.nome}
            onChangeText={(v) => atualizar('nome', v)} autoCapitalize="words" />
        </Campo>

        <Campo label="Email" erro={erros.email}>
          <TextInput style={[s.input, erros.email && s.inputErro]} placeholder="seu@email.com"
            placeholderTextColor={cores.textoSecundario} value={form.email}
            onChangeText={(v) => atualizar('email', v)} keyboardType="email-address" autoCapitalize="none" />
        </Campo>

        <Campo label="Telefone" erro={null}>
          <TextInput style={s.input} placeholder="(00) 00000-0000"
            placeholderTextColor={cores.textoSecundario} value={form.telefone}
            onChangeText={(v) => atualizar('telefone', v)} keyboardType="phone-pad" />
        </Campo>

        <Campo label="Senha" erro={erros.senha}>
          <TextInput style={[s.input, erros.senha && s.inputErro]} placeholder="Mínimo 6 caracteres"
            placeholderTextColor={cores.textoSecundario} value={form.senha}
            onChangeText={(v) => atualizar('senha', v)} secureTextEntry />
        </Campo>

        <Campo label="Confirme a senha" erro={erros.confirmarSenha}>
          <TextInput style={[s.input, erros.confirmarSenha && s.inputErro]} placeholder="Repita a senha"
            placeholderTextColor={cores.textoSecundario} value={form.confirmarSenha}
            onChangeText={(v) => atualizar('confirmarSenha', v)} secureTextEntry />
        </Campo>

        <Campo label="Pessoas na casa" erro={null}>
          <View style={s.chipGrupo}>
            {['1','2','3','4','5','6+'].map((n) => (
              <TouchableOpacity key={n} style={[s.chip, form.quantidade_pessoas === n && s.chipAtivo]}
                onPress={() => atualizar('quantidade_pessoas', n)} activeOpacity={0.7}>
                <Text style={[s.chipTexto, form.quantidade_pessoas === n && s.chipTextoAtivo]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Campo>

        <Campo label="Tipo de residência" erro={erros.tipo_residencia}>
          <View style={s.chipGrupo}>
            {TIPOS_RESIDENCIA.map((tipo) => (
              <TouchableOpacity key={tipo} style={[s.chip, form.tipo_residencia === tipo && s.chipAtivo]}
                onPress={() => atualizar('tipo_residencia', tipo)} activeOpacity={0.7}>
                <Text style={[s.chipTexto, form.tipo_residencia === tipo && s.chipTextoAtivo]}>{tipo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Campo>

        <Campo label="Restrições alimentares" erro={null}>
          <View style={s.chipGrupo}>
            {RESTRICOES.map((r) => (
              <TouchableOpacity key={r} style={[s.chip, form.restricoes.includes(r) && s.chipAtivo]}
                onPress={() => toggleRestricao(r)} activeOpacity={0.7}>
                <Text style={[s.chipTexto, form.restricoes.includes(r) && s.chipTextoAtivo]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Campo>

        <Campo label="Dias de antecedência para alertas" erro={null}>
          <View style={s.chipGrupo}>
            {DIAS.map((d) => (
              <TouchableOpacity key={d} style={[s.chip, form.dias_antecedencia === d && s.chipAtivo]}
                onPress={() => atualizar('dias_antecedencia', d)} activeOpacity={0.7}>
                <Text style={[s.chipTexto, form.dias_antecedencia === d && s.chipTextoAtivo]}>{d}d</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Campo>

        <TouchableOpacity style={[s.botao, salvando && s.botaoDesabilitado]}
          onPress={handleCadastrar} disabled={salvando} activeOpacity={0.8}>
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTexto}>CRIAR CONTA</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.linkLogin} onPress={() => navigation.navigate('Login')}>
          <Text style={s.linkTexto}>Já tem uma conta? <Text style={s.linkDestaque}>login</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Campo({ label, erro, children }) {
  return (
    <View style={s.campo}>
      <Text style={s.label}>{label}</Text>
      {children}
      {erro ? <Text style={s.textoErro}>{erro}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  segura:          { flex: 1, backgroundColor: '#E8F5E9' },
  conteudo:        { padding: espacamento.md, paddingBottom: espacamento.xxl },
  avatarContainer: { alignItems: 'center', marginBottom: espacamento.lg, marginTop: espacamento.sm },
  avatarEmoji:     { fontSize: 64 },
  campo:           { marginBottom: espacamento.md },
  label:           { ...tipografia.label, marginBottom: espacamento.xs },
  input:           { backgroundColor: '#fff', borderWidth: 1.5, borderColor: cores.borda, borderRadius: raio.md, padding: espacamento.md, fontSize: 15, color: cores.texto },
  inputErro:       { borderColor: cores.erro },
  textoErro:       { color: cores.erro, fontSize: 12, marginTop: 4 },
  chipGrupo:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: raio.full, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: '#fff' },
  chipAtivo:       { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto:       { fontSize: 13, color: cores.textoSecundario, fontWeight: '500' },
  chipTextoAtivo:  { color: '#fff', fontWeight: '600' },
  botao:           { backgroundColor: cores.primaria, borderRadius: raio.lg, paddingVertical: espacamento.md, alignItems: 'center', marginTop: espacamento.sm, elevation: 3 },
  botaoDesabilitado: { opacity: 0.6 },
  botaoTexto:      { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  linkLogin:       { alignItems: 'center', marginTop: espacamento.md },
  linkTexto:       { fontSize: 14, color: cores.textoSecundario },
  linkDestaque:    { color: cores.primaria, fontWeight: '600' },
});