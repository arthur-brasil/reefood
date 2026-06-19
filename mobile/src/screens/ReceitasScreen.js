import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Image, ScrollView, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { cores, espacamento, raio, tipografia } from '../theme';
import { alimentosService } from '../services/api';

const MEAL_API = 'https://www.themealdb.com/api/json/v1/1';

// Mapeamento de categorias do app → nomes em inglês para a API
const CAT_PARA_EN = {
  'Carnes':     ['Beef', 'Chicken', 'Lamb', 'Pork'],
  'Vegetais':   ['Vegetarian'],
  'Legumes':    ['Vegetarian'],
  'Frutos do mar': ['Seafood'],
  'Massas':     ['Pasta'],
};

async function buscarReceitas(ingrediente) {
  const res = await fetch(`${MEAL_API}/filter.php?i=${encodeURIComponent(ingrediente)}`);
  const json = await res.json();
  return json.meals || [];
}

async function buscarDetalhes(idMeal) {
  const res = await fetch(`${MEAL_API}/lookup.php?i=${idMeal}`);
  const json = await res.json();
  return json.meals?.[0] || null;
}

function extrairIngredientes(receita) {
  const lista = [];
  for (let i = 1; i <= 20; i++) {
    const ingr  = receita[`strIngredient${i}`];
    const medida = receita[`strMeasure${i}`];
    if (ingr?.trim()) lista.push(`${medida?.trim() || ''} ${ingr.trim()}`.trim());
  }
  return lista;
}

export default function ReceitasScreen({ navigation }) {
  const [busca, setBusca]           = useState('');
  const [receitas, setReceitas]     = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [sugestoes, setSugestoes]   = useState([]);
  const [detalhe, setDetalhe]       = useState(null);
  const [carregandoDet, setCarregandoDet] = useState(false);

  // Ao entrar na tela, carrega receitas com o primeiro alimento próximo ao vencimento
  useFocusEffect(useCallback(() => {
    carregarSugestoes();
  }, []));

  const carregarSugestoes = async () => {
    try {
      const res = await alimentosService.listar();
      const alimentos = res.data.dados;
      // Pega os 3 primeiros com validade mais próxima
      const proximos = alimentos
        .filter(a => {
          const diff = Math.ceil((new Date(a.data_validade) - new Date()) / 86400000);
          return diff >= 0 && diff <= 7;
        })
        .slice(0, 3);
      setSugestoes(proximos);

      // Busca receitas pelo primeiro alimento próximo ao vencimento
      if (proximos.length > 0) {
        buscarPorIngrediente(proximos[0].nome);
      }
    } catch (err) { console.error(err); }
  };

  const buscarPorIngrediente = async (ingrediente) => {
    setCarregando(true);
    setBusca(ingrediente);
    try {
      const resultado = await buscarReceitas(ingrediente);
      setReceitas(resultado.slice(0, 20));
    } catch {
      setReceitas([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleBuscar = () => {
    if (busca.trim()) buscarPorIngrediente(busca.trim());
  };

  const abrirDetalhe = async (idMeal) => {
    setCarregandoDet(true);
    setDetalhe({ loading: true });
    try {
      const dados = await buscarDetalhes(idMeal);
      setDetalhe(dados);
    } catch {
      setDetalhe(null);
    } finally {
      setCarregandoDet(false);
    }
  };

  const renderReceita = ({ item }) => (
    <TouchableOpacity style={s.card} onPress={() => abrirDetalhe(item.idMeal)} activeOpacity={0.85}>
      <Image source={{ uri: item.strMealThumb }} style={s.cardImagem} />
      <View style={s.cardInfo}>
        <Text style={s.cardNome} numberOfLines={2}>{item.strMeal}</Text>
        <Text style={s.cardVer}>Ver receita →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.segura} edges={['top']}>

      <View style={s.cabecalho}>
        <Text style={s.titulo}>Receitas</Text>
        <Text style={s.subtitulo}>Use o que você tem em casa</Text>
      </View>

      {/* Barra de busca */}
      <View style={s.buscaRow}>
        <TextInput
          style={s.buscaInput}
          placeholder="Buscar por ingrediente..."
          placeholderTextColor={cores.textoSecundario}
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
        />
        <TouchableOpacity style={s.buscaBtn} onPress={handleBuscar} activeOpacity={0.8}>
          <Text style={s.buscaBtnTexto}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Chips de sugestão rápida */}
      {sugestoes.length > 0 && (
        <View style={s.sugestoesRow}>
          <Text style={s.sugestoesTitulo}>No seu estoque:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sugestoesScroll}>
            {sugestoes.map((a) => (
              <TouchableOpacity key={a.id} style={s.sugestaoChip} onPress={() => buscarPorIngrediente(a.nome)}>
                <Text style={s.sugestaoChipTexto}>{a.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {carregando ? (
        <ActivityIndicator color={cores.primaria} style={{ marginTop: 40 }} />
      ) : receitas.length === 0 ? (
        <View style={s.vazio}>
          <Text style={s.vazioEmoji}>🍽️</Text>
          <Text style={s.vazioPrincipal}>Nenhuma receita encontrada</Text>
          <Text style={s.vazioSecundario}>Tente outro ingrediente</Text>
        </View>
      ) : (
        <FlatList
          data={receitas}
          keyExtractor={(item) => item.idMeal}
          renderItem={renderReceita}
          numColumns={2}
          contentContainerStyle={s.lista}
          columnWrapperStyle={{ gap: 10 }}
        />
      )}

      {/* Modal de detalhes da receita */}
      <Modal visible={!!detalhe} animationType="slide" onRequestClose={() => setDetalhe(null)}>
        <SafeAreaView style={s.segura} edges={['top']}>
          {carregandoDet || detalhe?.loading ? (
            <View style={s.modalCarregando}>
              <ActivityIndicator color={cores.primaria} size="large" />
            </View>
          ) : detalhe ? (
            <ScrollView contentContainerStyle={s.modalConteudo}>
              <TouchableOpacity style={s.modalFechar} onPress={() => setDetalhe(null)}>
                <Text style={s.modalFecharTexto}>← Voltar</Text>
              </TouchableOpacity>
              <Image source={{ uri: detalhe.strMealThumb }} style={s.modalImagem} />
              <Text style={s.modalTitulo}>{detalhe.strMeal}</Text>
              <Text style={s.modalCategoria}>{detalhe.strCategory} · {detalhe.strArea}</Text>

              <View style={s.modalSecao}>
                <Text style={s.modalSecaoTitulo}>🧾 Ingredientes</Text>
                {extrairIngredientes(detalhe).map((ing, i) => (
                  <Text key={i} style={s.modalIngrediente}>• {ing}</Text>
                ))}
              </View>

              <View style={s.modalSecao}>
                <Text style={s.modalSecaoTitulo}>👩‍🍳 Modo de preparo</Text>
                <Text style={s.modalInstrucoes}>{detalhe.strInstructions}</Text>
              </View>
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:           { flex: 1, backgroundColor: cores.fundo },
  cabecalho:        { padding: espacamento.md, paddingBottom: espacamento.sm },
  titulo:           { ...tipografia.titulo, color: cores.primaria },
  subtitulo:        { ...tipografia.legenda, marginTop: 2 },
  buscaRow:         { flexDirection: 'row', paddingHorizontal: espacamento.md, gap: 8, marginBottom: espacamento.sm },
  buscaInput:       { flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: cores.borda, borderRadius: raio.md, paddingHorizontal: espacamento.md, paddingVertical: 10, fontSize: 14, color: cores.texto },
  buscaBtn:         { backgroundColor: cores.primaria, borderRadius: raio.md, paddingHorizontal: espacamento.md, justifyContent: 'center' },
  buscaBtnTexto:    { color: '#fff', fontWeight: '700', fontSize: 14 },
  sugestoesRow:     { paddingHorizontal: espacamento.md, marginBottom: espacamento.sm },
  sugestoesTitulo:  { fontSize: 12, color: cores.textoSecundario, fontWeight: '600', marginBottom: 6 },
  sugestoesScroll:  { gap: 8 },
  sugestaoChip:     { backgroundColor: cores.primariaFundo, borderRadius: raio.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: cores.primaria },
  sugestaoChipTexto:{ fontSize: 13, color: cores.primaria, fontWeight: '600' },
  lista:            { padding: espacamento.md, paddingTop: 4 },
  card:             { flex: 1, backgroundColor: '#fff', borderRadius: raio.md, overflow: 'hidden', borderWidth: 1, borderColor: cores.borda, marginBottom: 10 },
  cardImagem:       { width: '100%', height: 110 },
  cardInfo:         { padding: 8 },
  cardNome:         { fontSize: 13, fontWeight: '700', color: cores.texto },
  cardVer:          { fontSize: 11, color: cores.primaria, fontWeight: '600', marginTop: 4 },
  vazio:            { alignItems: 'center', marginTop: 80 },
  vazioEmoji:       { fontSize: 52, marginBottom: espacamento.md },
  vazioPrincipal:   { ...tipografia.subtitulo, color: cores.textoSecundario },
  vazioSecundario:  { ...tipografia.legenda, marginTop: 4 },
  modalCarregando:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalConteudo:    { padding: espacamento.md, paddingBottom: espacamento.xxl },
  modalFechar:      { marginBottom: espacamento.md },
  modalFecharTexto: { color: cores.primaria, fontWeight: '600', fontSize: 15 },
  modalImagem:      { width: '100%', height: 220, borderRadius: raio.lg, marginBottom: espacamento.md },
  modalTitulo:      { ...tipografia.titulo, color: cores.texto, marginBottom: 4 },
  modalCategoria:   { fontSize: 13, color: cores.textoSecundario, marginBottom: espacamento.md },
  modalSecao:       { backgroundColor: '#fff', borderRadius: raio.md, padding: espacamento.md, marginBottom: espacamento.md, borderWidth: 1, borderColor: cores.borda },
  modalSecaoTitulo: { fontSize: 15, fontWeight: '700', color: cores.texto, marginBottom: espacamento.sm },
  modalIngrediente: { fontSize: 14, color: cores.texto, marginBottom: 4 },
  modalInstrucoes:  { fontSize: 14, color: cores.texto, lineHeight: 22 },
});
