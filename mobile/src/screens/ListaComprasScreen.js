import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, Share, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { cores, espacamento, raio, tipografia } from '../theme';
import { listaComprasService } from '../services/api';

const UNIDADES = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct'];

export default function ListaComprasScreen({ navigation }) {
  const [itens, setItens]           = useState([]);
  const [nome, setNome]             = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade]       = useState('un');
  const [adicionando, setAdicionando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await listaComprasService.listar();
      setItens(res.data.dados);
    } catch (err) { console.error(err); }
    finally { setCarregando(false); }
  };

  useFocusEffect(useCallback(() => { carregar(); }, []));

  const handleAdicionar = async () => {
    if (!nome.trim()) return;
    try {
      const res = await listaComprasService.adicionar({ nome, quantidade, unidade });
      setItens((prev) => [res.data.dados, ...prev]);
      setNome('');
      setQuantidade('');
      setUnidade('un');
      setAdicionando(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o item.');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await listaComprasService.toggle(id);
      setItens((prev) => prev.map(i => i.id === id ? res.data.dados : i));
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o item.');
    }
  };

  const handleExcluir = async (id) => {
    try {
      await listaComprasService.excluir(id);
      setItens((prev) => prev.filter(i => i.id !== id));
    } catch {
      Alert.alert('Erro', 'Não foi possível remover o item.');
    }
  };

  const handleLimparComprados = () => {
    Alert.alert(
      'Limpar comprados',
      'Remover todos os itens marcados como comprados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar', style: 'destructive',
          onPress: async () => {
            try {
              await listaComprasService.limparComprados();
              setItens((prev) => prev.filter(i => !i.comprado));
            } catch {
              Alert.alert('Erro', 'Não foi possível limpar os itens.');
            }
          },
        },
      ]
    );
  };

  // US-10: compartilhar lista via texto
  const handleCompartilhar = async () => {
    const pendentes   = itens.filter(i => !i.comprado);
    const comprados   = itens.filter(i => i.comprado);
    const linhas      = [
      '🛒 *Lista de Compras — ReFood*\n',
      ...pendentes.map(i => `☐ ${i.nome}${i.quantidade ? ` (${i.quantidade} ${i.unidade || ''})` : ''}`),
      comprados.length > 0 ? '\n✅ Já comprado:' : '',
      ...comprados.map(i => `☑ ${i.nome}`),
    ].filter(Boolean);

    await Share.share({ message: linhas.join('\n') });
  };

  const pendentes = itens.filter(i => !i.comprado);
  const comprados = itens.filter(i => i.comprado);

  const renderItem = ({ item }) => (
    <View style={[s.item, item.comprado && s.itemComprado]}>
      <TouchableOpacity style={s.checkbox} onPress={() => handleToggle(item.id)} activeOpacity={0.7}>
        <Text style={s.checkboxTexto}>{item.comprado ? '✅' : '⬜'}</Text>
      </TouchableOpacity>
      <View style={s.itemInfo}>
        <Text style={[s.itemNome, item.comprado && s.itemNomeComprado]}>{item.nome}</Text>
        {item.quantidade ? (
          <Text style={s.itemQtd}>{item.quantidade} {item.unidade}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={() => handleExcluir(item.id)} hitSlop={10}>
        <Text style={s.excluirTexto}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.segura} edges={['top']}>

      {/* Cabeçalho */}
      <View style={s.cabecalho}>
        <View>
          <Text style={s.titulo}>Lista de Compras</Text>
          <Text style={s.subtitulo}>{pendentes.length} item(s) pendente(s)</Text>
        </View>
        <View style={s.cabecalhoAcoes}>
          <TouchableOpacity onPress={handleCompartilhar} style={s.iconBtn}>
            <Text style={{ fontSize: 22 }}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAdicionando(!adicionando)} style={s.iconBtn}>
            <Text style={[s.botaoAddTexto, { color: adicionando ? cores.acentoPerigo : cores.primaria }]}>
              {adicionando ? '✕' : '＋'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Formulário de adição */}
      {adicionando && (
        <View style={s.formCard}>
          <TextInput
            style={s.input}
            placeholder="Nome do item (ex: Leite, Arroz...)"
            placeholderTextColor={cores.textoSecundario}
            value={nome}
            onChangeText={setNome}
            autoFocus
          />
          <View style={s.formLinha}>
            <TextInput
              style={[s.input, { flex: 1, marginRight: 8 }]}
              placeholder="Qtd"
              placeholderTextColor={cores.textoSecundario}
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="decimal-pad"
            />
            <View style={s.unidadeGrupo}>
              {UNIDADES.map((un) => (
                <TouchableOpacity key={un}
                  style={[s.unidadeChip, unidade === un && s.unidadeChipAtivo]}
                  onPress={() => setUnidade(un)}>
                  <Text style={[s.unidadeTexto, unidade === un && s.unidadeTextoAtivo]}>{un}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={s.botaoAdicionar} onPress={handleAdicionar} activeOpacity={0.8}>
            <Text style={s.botaoAdicionarTexto}>Adicionar à lista</Text>
          </TouchableOpacity>
        </View>
      )}

      {carregando ? (
        <ActivityIndicator color={cores.primaria} style={{ marginTop: 40 }} />
      ) : itens.length === 0 ? (
        <View style={s.vazio}>
          <Text style={s.vazioEmoji}>🛒</Text>
          <Text style={s.vazioPrincipal}>Lista vazia</Text>
          <Text style={s.vazioSecundario}>Toque em ＋ para adicionar itens</Text>
        </View>
      ) : (
        <FlatList
          data={[...pendentes, ...comprados]}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={s.lista}
          ListFooterComponent={
            comprados.length > 0 ? (
              <TouchableOpacity style={s.limparBtn} onPress={handleLimparComprados}>
                <Text style={s.limparBtnTexto}>Limpar itens comprados ({comprados.length})</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:              { flex: 1, backgroundColor: cores.fundo },
  cabecalho:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: espacamento.md, paddingBottom: espacamento.sm },
  titulo:              { ...tipografia.titulo, color: cores.primaria },
  subtitulo:           { ...tipografia.legenda, marginTop: 2 },
  cabecalhoAcoes:      { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn:             { padding: 4 },
  botaoAddTexto:       { fontSize: 28, fontWeight: '300' },
  formCard:            { backgroundColor: '#fff', margin: espacamento.md, marginTop: 0, borderRadius: raio.lg, padding: espacamento.md, borderWidth: 1, borderColor: cores.borda },
  input:               { backgroundColor: cores.fundo, borderWidth: 1.5, borderColor: cores.borda, borderRadius: raio.md, padding: espacamento.sm, fontSize: 15, color: cores.texto, marginBottom: 8 },
  formLinha:           { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  unidadeGrupo:        { flex: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  unidadeChip:         { paddingHorizontal: 8, paddingVertical: 5, borderRadius: raio.full, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: cores.fundo },
  unidadeChipAtivo:    { backgroundColor: cores.primaria, borderColor: cores.primaria },
  unidadeTexto:        { fontSize: 11, color: cores.textoSecundario, fontWeight: '500' },
  unidadeTextoAtivo:   { color: '#fff', fontWeight: '600' },
  botaoAdicionar:      { backgroundColor: cores.primaria, borderRadius: raio.md, paddingVertical: espacamento.sm, alignItems: 'center', marginTop: 4 },
  botaoAdicionarTexto: { color: '#fff', fontSize: 14, fontWeight: '700' },
  lista:               { padding: espacamento.md, paddingTop: 4 },
  item:                { backgroundColor: '#fff', borderRadius: raio.md, padding: espacamento.md, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: cores.borda },
  itemComprado:        { backgroundColor: '#F0F7F0', borderColor: '#C8E0CC' },
  checkbox:            { marginRight: espacamento.sm },
  checkboxTexto:       { fontSize: 22 },
  itemInfo:            { flex: 1 },
  itemNome:            { fontSize: 15, fontWeight: '600', color: cores.texto },
  itemNomeComprado:    { textDecorationLine: 'line-through', color: cores.textoSecundario },
  itemQtd:             { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  excluirTexto:        { fontSize: 16, color: cores.textoSecundario, fontWeight: '600' },
  limparBtn:           { alignItems: 'center', marginTop: espacamento.sm, paddingVertical: espacamento.sm },
  limparBtnTexto:      { color: cores.acentoPerigo, fontSize: 14, fontWeight: '600' },
  vazio:               { alignItems: 'center', marginTop: 80 },
  vazioEmoji:          { fontSize: 52, marginBottom: espacamento.md },
  vazioPrincipal:      { ...tipografia.subtitulo, color: cores.textoSecundario },
  vazioSecundario:     { ...tipografia.legenda, marginTop: 4 },
});
