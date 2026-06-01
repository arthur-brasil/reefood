import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { cores, espacamento, raio, tipografia } from '../theme';
import { alimentosService } from '../services/api';

const CATEGORIAS = [
  { label: 'Todas',      emoji: '🧺' },
  { label: 'Frutas',     emoji: '🍎' },
  { label: 'Legumes',    emoji: '🥦' },
  { label: 'Carnes',     emoji: '🥩' },
  { label: 'Laticínios', emoji: '🥛' },
  { label: 'Grãos',      emoji: '🌾' },
  { label: 'Bebidas',    emoji: '🧃' },
  { label: 'Congelados', emoji: '🧊' },
  { label: 'Outros',     emoji: '📦' },
];

const EMOJI_CATEGORIA = {
  'Frutas':     '🍎',
  'Legumes':    '🥦',
  'Carnes':     '🥩',
  'Laticínios': '🥛',
  'Grãos':      '🌾',
  'Bebidas':    '🧃',
  'Congelados': '🧊',
  'Outros':     '📦',
};

function statusValidade(dataValidade) {
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0)   return { label: 'Vencido',  cor: cores.acentoPerigo, bg: '#FDECEA' };
  if (diff <= 3)  return { label: `${diff}d`,  cor: cores.acento,       bg: '#FEF3E8' };
  if (diff <= 7)  return { label: `${diff}d`,  cor: '#D4AC0D',          bg: '#FEF9E7' };
  return           { label: `${diff}d`,        cor: cores.primariaClara, bg: cores.primariaFundo };
}

export default function EstoqueScreen({ navigation }) {
  const [alimentos, setAlimentos]   = useState([]);
  const [categoria, setCategoria]   = useState('Todas');
  const [carregando, setCarregando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = async (cat) => {
    setCarregando(true);
    try {
      const res = await alimentosService.listar(cat === 'Todas' ? null : cat);
      setAlimentos(res.data.dados);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregar(categoria);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => { carregar(categoria); }, [categoria])
  );

  const selecionarCategoria = (cat) => {
    setCategoria(cat);
    carregar(cat === 'Todas' ? null : cat);
  };

  const renderAlimento = ({ item }) => {
    const status = statusValidade(item.data_validade);
    const emoji  = EMOJI_CATEGORIA[item.categoria] || '📦';
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('EditarAlimento', { alimento: item })}
        activeOpacity={0.85}
      >
        <View style={s.cardIcone}>
          <Text style={s.cardEmoji}>{emoji}</Text>
        </View>
        <View style={s.cardConteudo}>
          <Text style={s.cardNome}>{item.nome}</Text>
          <Text style={s.cardInfo}>{item.categoria}  ·  {item.quantidade} {item.unidade}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: status.bg, borderColor: status.cor }]}>
          <Text style={[s.badgeTexto, { color: status.cor }]}>{status.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.segura} edges={['top']}>

      {/* Cabeçalho */}
      <View style={s.cabecalho}>
        <View>
          <Text style={s.titulo}>Meu Estoque</Text>
          <Text style={s.subtitulo}>{alimentos.length} {alimentos.length === 1 ? 'item' : 'itens'}</Text>
        </View>
        <TouchableOpacity
          style={s.botaoAdicionar}
          onPress={() => navigation.navigate('CadastrarAlimento')}
          activeOpacity={0.8}
        >
          <Text style={s.botaoAdicionarTexto}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros horizontais */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filtros}
      >
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            style={[s.filtroChip, categoria === cat.label && s.filtroChipAtivo]}
            onPress={() => selecionarCategoria(cat.label)}
            activeOpacity={0.7}
          >
            <Text style={s.filtroEmoji}>{cat.emoji}</Text>
            <Text style={[s.filtroTexto, categoria === cat.label && s.filtroTextoAtivo]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      {carregando && !refreshing
        ? <ActivityIndicator style={{ marginTop: 40 }} color={cores.primaria} size="large" />
        : (
          <FlatList
            data={alimentos}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={s.lista}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={cores.primaria} />
            }
            renderItem={renderAlimento}
            ListEmptyComponent={
              <View style={s.vazio}>
                <Text style={s.vazioEmoji}>🧺</Text>
                <Text style={s.vazioPrincipal}>Estoque vazio</Text>
                <Text style={s.vazioSecundario}>Adicione seu primeiro alimento!</Text>
              </View>
            }
          />
        )
      }
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:              { flex: 1, backgroundColor: cores.fundo },
  cabecalho:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: espacamento.md, paddingTop: espacamento.md, paddingBottom: espacamento.sm },
  titulo:              { ...tipografia.titulo, color: cores.primaria },
  subtitulo:           { ...tipografia.legenda, marginTop: 2 },
  botaoAdicionar:      { backgroundColor: cores.primaria, paddingHorizontal: 16, paddingVertical: 9, borderRadius: raio.full, elevation: 3 },
  botaoAdicionarTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filtros:             { paddingHorizontal: espacamento.md, paddingVertical: espacamento.sm, gap: 8 },
  filtroChip:          { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: raio.full, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: cores.superficie },
  filtroChipAtivo:     { backgroundColor: cores.primaria, borderColor: cores.primaria },
  filtroEmoji:         { fontSize: 14 },
  filtroTexto:         { fontSize: 13, color: cores.textoSecundario, fontWeight: '500' },
  filtroTextoAtivo:    { color: '#fff', fontWeight: '600' },
  lista:               { padding: espacamento.md, gap: 10, paddingBottom: espacamento.xxl },
  card:                { backgroundColor: cores.superficie, borderRadius: raio.lg, padding: espacamento.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: cores.borda, elevation: 1 },
  cardIcone:           { width: 48, height: 48, borderRadius: raio.md, backgroundColor: cores.primariaFundo, alignItems: 'center', justifyContent: 'center', marginRight: espacamento.sm },
  cardEmoji:           { fontSize: 24 },
  cardConteudo:        { flex: 1 },
  cardNome:            { fontSize: 16, fontWeight: '700', color: cores.texto },
  cardInfo:            { fontSize: 12, color: cores.textoSecundario, marginTop: 3 },
  badge:               { paddingHorizontal: 10, paddingVertical: 5, borderRadius: raio.full, borderWidth: 1.5, marginLeft: espacamento.sm },
  badgeTexto:          { fontSize: 12, fontWeight: '700' },
  vazio:               { alignItems: 'center', marginTop: 80 },
  vazioEmoji:          { fontSize: 52, marginBottom: espacamento.md },
  vazioPrincipal:      { ...tipografia.subtitulo, color: cores.textoSecundario },
  vazioSecundario:     { ...tipografia.legenda, marginTop: 4 },
});