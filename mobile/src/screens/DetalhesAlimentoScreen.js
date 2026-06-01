import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, espacamento, raio, tipografia } from '../theme';
import api from '../services/api';

const EMOJI_CATEGORIA = {
  'Frutas': '🍎', 'Legumes': '🥦', 'Vegetais': '🥦', 'Carnes': '🥩',
  'Laticínios': '🥛', 'Grãos': '🌾', 'Bebidas': '🧃',
  'Congelados': '🧊', 'Pães': '🍞', 'Outros': '📦',
};

const CATEGORIAS = [
  { label: 'Laticínios', emoji: '🥛' }, { label: 'Carnes',     emoji: '🥩' },
  { label: 'Vegetais',   emoji: '🥦' }, { label: 'Pães',       emoji: '🍞' },
  { label: 'Frutas',     emoji: '🍎' }, { label: 'Grãos',      emoji: '🌾' },
  { label: 'Bebidas',    emoji: '🧃' }, { label: 'Congelados', emoji: '🧊' },
  { label: 'Outros',     emoji: '📦' },
];

const UNIDADES = ['kg', 'g', 'L', 'ml', 'un', 'cx', 'pct'];

function statusValidade(dataValidade) {
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { label: 'Vencido',  cor: cores.acentoPerigo, bg: '#FDECEA' };
  if (diff <= 3) return { label: `${diff}d`,  cor: cores.acento,       bg: '#FEF3E8' };
  if (diff <= 7) return { label: `${diff}d`,  cor: '#D4AC0D',          bg: '#FEF9E7' };
  return          { label: `${diff}d`,        cor: cores.primariaClara, bg: cores.primariaFundo };
}

function formatarData(data) {
  if (!data) return '';
  const d = new Date(data);
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('pt-BR');
}

function dataParaISO(valor) {
  if (valor.includes('/')) {
    const [dd, mm, aaaa] = valor.split('/');
    return `${aaaa}-${mm}-${dd}`;
  }
  return valor;
}

export default function DetalhesAlimentoScreen({ route, navigation }) {
  const { alimento } = route.params;
  const [editando, setEditando]     = useState(false);
  const [salvando, setSalvando]     = useState(false);
  const [form, setForm]             = useState({
    nome:          alimento.nome,
    categoria:     alimento.categoria,
    quantidade:    String(alimento.quantidade),
    unidade:       alimento.unidade,
    data_validade: formatarData(alimento.data_validade),
  });

  const atualizar = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const status = statusValidade(alimento.data_validade);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await api.put(`/alimentos/${alimento.id}`, {
        ...form,
        quantidade: Number(form.quantidade),
        data_validade: dataParaISO(form.data_validade),
      });
      Alert.alert('✅ Salvo!', 'Alimento atualizado com sucesso.', [
        { text: 'OK', onPress: () => { setEditando(false); navigation.goBack(); } },
      ]);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
  const confirmado = window.confirm(`Tem certeza que deseja excluir "${alimento.nome}"?`);
  if (!confirmado) return;
  try {
    await api.delete(`/alimentos/${alimento.id}`);
    navigation.goBack();
  } catch (err) {
    window.alert('Erro: Não foi possível excluir.');
  }
};

  const handleAcao = async (acao) => {
  const confirmado = window.confirm(`Registrar "${alimento.nome}" como ${acao}?`);
  if (!confirmado) return;
  try {
    await api.delete(`/alimentos/${alimento.id}`);
    window.alert(`✅ Alimento marcado como ${acao}!`);
    navigation.goBack();
  } catch (err) {
    console.error('Erro:', err?.response?.data || err.message);
    window.alert('Erro: Não foi possível registrar.');
  }
};

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <ScrollView contentContainerStyle={s.conteudo} showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={s.cabecalho}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.voltarBtn}>
            <Text style={s.voltarTexto}>← Início</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExcluir}>
            <Text style={s.excluirIcone}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal */}
        <View style={s.cardPrincipal}>
          <View style={s.cardTopo}>
            <View style={s.emojiContainer}>
              <Text style={s.emoji}>{EMOJI_CATEGORIA[form.categoria] || '📦'}</Text>
            </View>
            <View style={s.cardTopoInfo}>
              {editando
                ? <TextInput style={s.inputNome} value={form.nome} onChangeText={(v) => atualizar('nome', v)} />
                : <Text style={s.cardNome}>{form.nome}</Text>
              }
              <Text style={s.cardCategoria}>{form.categoria}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: status.bg, borderColor: status.cor }]}>
              <Text style={[s.badgeTexto, { color: status.cor }]}>{status.label}</Text>
            </View>
          </View>
        </View>

        {/* Informações */}
        <View style={s.infoCard}>
          <Text style={s.infoTitulo}>INFORMAÇÕES</Text>

          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Data de Validade</Text>
            {editando
              ? <TextInput style={s.inputInfo} value={form.data_validade}
                  onChangeText={(v) => atualizar('data_validade', v)} placeholder="DD/MM/AAAA" keyboardType="numeric" maxLength={10} />
              : <Text style={s.infoValor}>{form.data_validade}</Text>
            }
          </View>

          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Quantidade</Text>
            {editando
              ? <TextInput style={s.inputInfo} value={form.quantidade}
                  onChangeText={(v) => atualizar('quantidade', v)} keyboardType="decimal-pad" />
              : <Text style={s.infoValor}>{form.quantidade} {form.unidade}</Text>
            }
          </View>

          {editando && (
            <>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Unidade</Text>
                <View style={s.chipGrupo}>
                  {UNIDADES.map((un) => (
                    <TouchableOpacity key={un}
                      style={[s.chip, form.unidade === un && s.chipAtivo]}
                      onPress={() => atualizar('unidade', un)}>
                      <Text style={[s.chipTexto, form.unidade === un && s.chipTextoAtivo]}>{un}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Categoria</Text>
                <View style={s.chipGrupo}>
                  {CATEGORIAS.map((cat) => (
                    <TouchableOpacity key={cat.label}
                      style={[s.chip, form.categoria === cat.label && s.chipAtivo]}
                      onPress={() => atualizar('categoria', cat.label)}>
                      <Text style={[s.chipTexto, form.categoria === cat.label && s.chipTextoAtivo]}>
                        {cat.emoji} {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Ações */}
        {!editando ? (
          <View style={s.acoesRow}>
            <TouchableOpacity style={[s.acaoBotao, { backgroundColor: '#FDECEA', borderColor: cores.acentoPerigo }]}
              onPress={() => handleAcao('descartado')} activeOpacity={0.8}>
              <Text style={s.acaoEmoji}>🗑️</Text>
              <Text style={[s.acaoTexto, { color: cores.acentoPerigo }]}>Descartar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.acaoBotao, { backgroundColor: '#FEF3E8', borderColor: cores.acento }]}
              onPress={() => setEditando(true)} activeOpacity={0.8}>
              <Text style={s.acaoEmoji}>✏️</Text>
              <Text style={[s.acaoTexto, { color: cores.acento }]}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.acaoBotao, { backgroundColor: cores.primariaFundo, borderColor: cores.primaria }]}
              onPress={() => handleAcao('consumido')} activeOpacity={0.8}>
              <Text style={s.acaoEmoji}>✅</Text>
              <Text style={[s.acaoTexto, { color: cores.primaria }]}>Consumido</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.editarAcoes}>
            <TouchableOpacity style={s.botaoCancelar} onPress={() => setEditando(false)}>
              <Text style={s.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.botaoSalvar, salvando && { opacity: 0.6 }]}
              onPress={handleSalvar} disabled={salvando}>
              <Text style={s.botaoSalvarTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Adicionar à lista de compras */}
        <TouchableOpacity style={s.botaoLista} activeOpacity={0.8}>
          <Text style={s.botaoListaTexto}>+ Adicionar à lista de compras</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:           { flex: 1, backgroundColor: cores.fundo },
  conteudo:         { padding: espacamento.md, paddingBottom: espacamento.xxl },
  cabecalho:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espacamento.md },
  voltarBtn:        { flexDirection: 'row', alignItems: 'center' },
  voltarTexto:      { color: cores.primaria, fontWeight: '600', fontSize: 15 },
  excluirIcone:     { fontSize: 22 },
  cardPrincipal:    { backgroundColor: '#fff', borderRadius: raio.lg, padding: espacamento.md, marginBottom: espacamento.md, borderWidth: 1, borderColor: cores.borda },
  cardTopo:         { flexDirection: 'row', alignItems: 'center' },
  emojiContainer:   { width: 52, height: 52, borderRadius: raio.md, backgroundColor: cores.primariaFundo, alignItems: 'center', justifyContent: 'center', marginRight: espacamento.sm },
  emoji:            { fontSize: 28 },
  cardTopoInfo:     { flex: 1 },
  cardNome:         { fontSize: 17, fontWeight: '700', color: cores.texto },
  inputNome:        { fontSize: 17, fontWeight: '700', color: cores.primaria, borderBottomWidth: 2, borderBottomColor: cores.primaria, paddingBottom: 2 },
  cardCategoria:    { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  badge:            { paddingHorizontal: 10, paddingVertical: 5, borderRadius: raio.full, borderWidth: 1.5 },
  badgeTexto:       { fontSize: 12, fontWeight: '700' },
  infoCard:         { backgroundColor: '#fff', borderRadius: raio.lg, padding: espacamento.md, marginBottom: espacamento.md, borderWidth: 1, borderColor: cores.borda },
  infoTitulo:       { ...tipografia.label, marginBottom: espacamento.sm },
  infoRow:          { marginBottom: espacamento.sm },
  infoLabel:        { fontSize: 12, color: cores.textoSecundario, marginBottom: 2 },
  infoValor:        { fontSize: 15, fontWeight: '600', color: cores.texto },
  inputInfo:        { fontSize: 15, fontWeight: '600', color: cores.primaria, borderBottomWidth: 1.5, borderBottomColor: cores.primaria, paddingBottom: 2 },
  chipGrupo:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip:             { paddingHorizontal: 10, paddingVertical: 5, borderRadius: raio.full, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: cores.fundo },
  chipAtivo:        { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto:        { fontSize: 12, color: cores.textoSecundario, fontWeight: '500' },
  chipTextoAtivo:   { color: '#fff', fontWeight: '600' },
  acoesRow:         { flexDirection: 'row', gap: 10, marginBottom: espacamento.md },
  acaoBotao:        { flex: 1, alignItems: 'center', paddingVertical: espacamento.md, borderRadius: raio.md, borderWidth: 1.5 },
  acaoEmoji:        { fontSize: 22, marginBottom: 4 },
  acaoTexto:        { fontSize: 12, fontWeight: '700' },
  editarAcoes:      { flexDirection: 'row', gap: 10, marginBottom: espacamento.md },
  botaoCancelar:    { flex: 1, alignItems: 'center', paddingVertical: espacamento.md, borderRadius: raio.md, borderWidth: 1.5, borderColor: cores.borda },
  botaoCancelarTexto: { fontSize: 15, fontWeight: '600', color: cores.textoSecundario },
  botaoSalvar:      { flex: 1, alignItems: 'center', paddingVertical: espacamento.md, borderRadius: raio.md, backgroundColor: cores.primaria },
  botaoSalvarTexto: { fontSize: 15, fontWeight: '700', color: '#fff' },
  botaoLista:       { backgroundColor: cores.primaria, borderRadius: raio.lg, paddingVertical: espacamento.md, alignItems: 'center', elevation: 3 },
  botaoListaTexto:  { color: '#fff', fontSize: 15, fontWeight: '700' },
});