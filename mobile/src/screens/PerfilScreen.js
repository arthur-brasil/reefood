import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, TextInput, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { cores, espacamento, raio, tipografia } from '../theme';
import api from '../services/api';

const DIAS = ['1', '2', '3', '5', '7'];

export default function PerfilScreen({ navigation }) {
  const usuario = auth.currentUser;
  const [dados, setDados]                   = useState(null);
  const [nome, setNome]                     = useState('');
  const [diasAntecedencia, setDias]         = useState('3');
  const [alertasAtivados, setAlertas]       = useState(true);
  const [notifAtivadas, setNotif]           = useState(true);
  const [salvando, setSalvando]             = useState(false);
  const [editandoNome, setEditandoNome]     = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get(`/usuarios/${usuario.uid}`);
        const d = res.data.dados;
        setDados(d);
        setNome(d.nome);
        setDias(String(d.dias_antecedencia));
        setAlertas(d.alertas_ativados);
        setNotif(d.notificacoes_ativadas);
      } catch (err) { console.error(err); }
    };
    carregar();
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      await api.patch(`/usuarios/${usuario.uid}`, {
        nome,
        dias_antecedencia: Number(diasAntecedencia),
        alertas_ativados: alertasAtivados,
        notificacoes_ativadas: notifAtivadas,
      });
      setEditandoNome(false);
      Alert.alert('✅ Salvo!', 'Preferências atualizadas com sucesso.');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleSair = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await signOut(auth);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }},
    ]);
  };

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.conteudo}>

        {/* Avatar */}
        <View style={s.avatarContainer}>
          <Text style={s.avatarEmoji}>👤</Text>
          {editandoNome
            ? <TextInput style={s.inputNome} value={nome} onChangeText={setNome} autoFocus />
            : <Text style={s.nomeTexto}>{nome}</Text>
          }
          <Text style={s.emailTexto}>{usuario?.email}</Text>
          <TouchableOpacity onPress={() => setEditandoNome(!editandoNome)}>
            <Text style={s.editarTexto}>{editandoNome ? 'Cancelar' : 'Editar nome'}</Text>
          </TouchableOpacity>
        </View>

        {/* Notificações */}
        <View style={s.card}>
          <Text style={s.cardTitulo}>🔔 Notificações</Text>

          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Alertas de Vencimento</Text>
              <Text style={s.toggleSub}>Avisa quando um item está perto de vencer</Text>
            </View>
            <Switch
              value={alertasAtivados}
              onValueChange={setAlertas}
              trackColor={{ false: cores.borda, true: cores.primariaClara }}
              thumbColor={alertasAtivados ? cores.primaria : '#f4f3f4'}
            />
          </View>

          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Notificações gerais</Text>
              <Text style={s.toggleSub}>Receber notificações do app</Text>
            </View>
            <Switch
              value={notifAtivadas}
              onValueChange={setNotif}
              trackColor={{ false: cores.borda, true: cores.primariaClara }}
              thumbColor={notifAtivadas ? cores.primaria : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Antecedência */}
        <View style={s.card}>
          <Text style={s.cardTitulo}>⏰ Antecedência padrão</Text>
          <Text style={s.cardSub}>Alertar com quantos dias antes do vencimento</Text>
          <View style={s.diasRow}>
            {DIAS.map((d) => (
              <TouchableOpacity key={d}
                style={[s.diaChip, diasAntecedencia === d && s.diaChipAtivo]}
                onPress={() => setDias(d)} activeOpacity={0.7}>
                <Text style={[s.diaTexto, diasAntecedencia === d && s.diaTextoAtivo]}>{d}d</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botão salvar */}
        <TouchableOpacity style={[s.botaoSalvar, salvando && { opacity: 0.6 }]}
          onPress={salvar} disabled={salvando} activeOpacity={0.8}>
          <Text style={s.botaoSalvarTexto}>{salvando ? 'Salvando...' : 'Salvar Preferências'}</Text>
        </TouchableOpacity>

        {/* Botão sair */}
        <TouchableOpacity style={s.botaoSair} onPress={handleSair} activeOpacity={0.8}>
          <Text style={s.botaoSairTexto}>SAIR DA CONTA</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:          { flex: 1, backgroundColor: cores.fundo },
  conteudo:        { padding: espacamento.md, paddingBottom: espacamento.xxl },
  avatarContainer: { alignItems: 'center', marginBottom: espacamento.lg },
  avatarEmoji:     { fontSize: 64 },
  inputNome:       { fontSize: 20, fontWeight: '700', color: cores.primaria, borderBottomWidth: 2, borderBottomColor: cores.primaria, minWidth: 150, textAlign: 'center', marginTop: espacamento.sm },
  nomeTexto:       { fontSize: 20, fontWeight: '700', color: cores.texto, marginTop: espacamento.sm },
  emailTexto:      { fontSize: 13, color: cores.textoSecundario, marginTop: 4 },
  editarTexto:     { color: cores.primaria, fontWeight: '600', marginTop: 6, fontSize: 13 },
  card:            { backgroundColor: '#fff', borderRadius: raio.lg, padding: espacamento.md, marginBottom: espacamento.md, borderWidth: 1, borderColor: cores.borda },
  cardTitulo:      { fontSize: 15, fontWeight: '700', color: cores.texto, marginBottom: espacamento.sm },
  cardSub:         { fontSize: 12, color: cores.textoSecundario, marginBottom: espacamento.sm },
  toggleRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: espacamento.sm },
  toggleInfo:      { flex: 1, marginRight: espacamento.sm },
  toggleLabel:     { fontSize: 14, fontWeight: '600', color: cores.texto },
  toggleSub:       { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  diasRow:         { flexDirection: 'row', gap: 8, marginTop: espacamento.xs },
  diaChip:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: raio.full, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: cores.fundo },
  diaChipAtivo:    { backgroundColor: cores.primaria, borderColor: cores.primaria },
  diaTexto:        { fontSize: 13, color: cores.textoSecundario, fontWeight: '600' },
  diaTextoAtivo:   { color: '#fff' },
  botaoSalvar:     { backgroundColor: cores.primaria, borderRadius: raio.lg, paddingVertical: espacamento.md, alignItems: 'center', marginBottom: espacamento.md, elevation: 3 },
  botaoSalvarTexto:{ color: '#fff', fontSize: 15, fontWeight: '700' },
  botaoSair:       { backgroundColor: '#FDECEA', borderRadius: raio.lg, paddingVertical: espacamento.md, alignItems: 'center', borderWidth: 1.5, borderColor: cores.acentoPerigo },
  botaoSairTexto:  { color: cores.acentoPerigo, fontSize: 15, fontWeight: '700', letterSpacing: 1 },
});