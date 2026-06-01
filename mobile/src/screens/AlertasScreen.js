import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { cores, espacamento, raio, tipografia } from '../theme';
import { alimentosService } from '../services/api';

const EMOJI_CATEGORIA = {
  'Frutas': '🍎', 'Legumes': '🥦', 'Carnes': '🥩',
  'Laticínios': '🥛', 'Grãos': '🌾', 'Bebidas': '🧃',
  'Congelados': '🧊', 'Outros': '📦',
};

function statusValidade(dataValidade) {
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { tipo: 'vencido', label: 'Vencido',       cor: cores.acentoPerigo, bg: '#FDECEA' };
  if (diff <= 3) return { tipo: 'atencao', label: `Vence em ${diff}d`, cor: cores.acento,   bg: '#FEF3E8' };
  if (diff <= 7) return { tipo: 'semana',  label: `Vence em ${diff}d`, cor: '#D4AC0D',      bg: '#FEF9E7' };
  return          { tipo: 'ok',            label: `${diff}d`,          cor: cores.primariaClara, bg: cores.primariaFundo };
}

export default function AlertasScreen({ navigation }) {
  const [alimentos, setAlimentos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = async () => {
    try {
      const res = await alimentosService.listar();
      const ordenados = res.data.dados.sort((a, b) => new Date(a.data_validade) - new Date(b.data_validade));
      setAlimentos(ordenados);
    } catch (err) { console.error(err); }
  };

  const onRefresh = async () => { setRefreshing(true); await carregar(); setRefreshing(false); };
  useFocusEffect(useCallback(() => { carregar(); }, []));

  const vencidos = alimentos.filter(a => statusValidade(a.data_validade).tipo === 'vencido');
  const atencao  = alimentos.filter(a => statusValidade(a.data_validade).tipo === 'atencao');
  const semana   = alimentos.filter(a => statusValidade(a.data_validade).tipo === 'semana');

  const renderItem = ({ item }) => {
    const status = statusValidade(item.data_validade);
    return (
      <TouchableOpacity
        style={[s.card, { borderLeftColor: status.cor, borderLeftWidth: 4 }]}
        onPress={() => navigation.navigate('EditarAlimento', { alimento: item })}
        activeOpacity={0.8}
      >
        <View style={s.cardIcone}>
          <Text style={s.cardEmoji}>{EMOJI_CATEGORIA[item.categoria] || '📦'}</Text>
        </View>
        <View style={s.cardConteudo}>
          <Text style={s.cardNome}>{item.nome}</Text>
          <Text style={s.cardInfo}>{item.quantidade} {item.unidade} · {item.categoria}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: status.bg, borderColor: status.cor }]}>
          <Text style={[s.badgeTexto, { color: status.cor }]}>{status.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Secao = ({ titulo, dados, cor }) => dados.length === 0 ? null : (
    <View style={s.secao}>
      <Text style={[s.secaoTitulo, { color: cor }]}>{titulo} ({dados.length})</Text>
      {dados.map(item => renderItem({ item }))}
    </View>
  );

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <View style={s.cabecalho}>
        <Text style={s.titulo}>Alertas</Text>
        <Text style={s.subtitulo}>Fique de olho nos prazos</Text>
      </View>
      <FlatList
        data={[]}
        keyExtractor={() => 'empty'}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={cores.primaria} />}
        ListHeaderComponent={
          <>
            <Secao titulo="🔴 Vencidos"       dados={vencidos} cor={cores.acentoPerigo} />
            <Secao titulo="🟠 Vence em breve" dados={atencao}  cor={cores.acento} />
            <Secao titulo="🟡 Essa semana"    dados={semana}   cor="#D4AC0D" />
            {vencidos.length === 0 && atencao.length === 0 && semana.length === 0 && (
              <View style={s.vazio}>
                <Text style={s.vazioEmoji}>✅</Text>
                <Text style={s.vazioPrincipal}>Tudo em dia!</Text>
                <Text style={s.vazioSecundario}>Nenhum alimento próximo ao vencimento</Text>
              </View>
            )}
          </>
        }
        renderItem={null}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:          { flex: 1, backgroundColor: cores.fundo },
  cabecalho:       { padding: espacamento.md, paddingBottom: espacamento.sm },
  titulo:          { ...tipografia.titulo, color: cores.primaria },
  subtitulo:       { ...tipografia.legenda, marginTop: 2 },
  secao:           { paddingHorizontal: espacamento.md, marginBottom: espacamento.md },
  secaoTitulo:     { fontSize: 15, fontWeight: '700', marginBottom: espacamento.sm },
  card:            { backgroundColor: cores.superficie, borderRadius: raio.md, padding: espacamento.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: cores.borda, marginBottom: 8 },
  cardIcone:       { width: 44, height: 44, borderRadius: raio.md, backgroundColor: cores.primariaFundo, alignItems: 'center', justifyContent: 'center', marginRight: espacamento.sm },
  cardEmoji:       { fontSize: 22 },
  cardConteudo:    { flex: 1 },
  cardNome:        { fontSize: 15, fontWeight: '700', color: cores.texto },
  cardInfo:        { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  badge:           { paddingHorizontal: 10, paddingVertical: 5, borderRadius: raio.full, borderWidth: 1.5 },
  badgeTexto:      { fontSize: 11, fontWeight: '700' },
  vazio:           { alignItems: 'center', marginTop: 80 },
  vazioEmoji:      { fontSize: 52, marginBottom: espacamento.md },
  vazioPrincipal:  { ...tipografia.subtitulo, color: cores.textoSecundario },
  vazioSecundario: { ...tipografia.legenda, marginTop: 4 },
});