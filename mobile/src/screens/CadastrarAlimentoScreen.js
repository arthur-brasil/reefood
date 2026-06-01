import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, espacamento, raio, tipografia } from '../theme';
import { alimentosService } from '../services/api';

const CATEGORIAS = [
  { label: 'Laticínios', emoji: '🥛' },
  { label: 'Carnes',     emoji: '🥩' },
  { label: 'Vegetais',   emoji: '🥦' },
  { label: 'Pães',       emoji: '🍞' },
  { label: 'Frutas',     emoji: '🍎' },
  { label: 'Grãos',      emoji: '🌾' },
  { label: 'Bebidas',    emoji: '🧃' },
  { label: 'Congelados', emoji: '🧊' },
  { label: 'Outros',     emoji: '📦' },
];

const UNIDADES = ['kg', 'g', 'L', 'ml', 'un', 'cx', 'pct'];
const estadoInicial = { nome: '', categoria: '', quantidade: '', unidade: 'un', data_validade: '', dias_antecedencia: 3 };

export default function CadastrarAlimentoScreen({ navigation }) {
  const [form, setForm]         = useState(estadoInicial);
  const [erros, setErros]       = useState({});
  const [salvando, setSalvando] = useState(false);

  const atualizar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: null }));
  };

  const validar = () => {
    const e = {};
    if (!form.nome.trim())          e.nome = 'Informe o nome do alimento';
    if (!form.categoria)            e.categoria = 'Selecione uma categoria';
    if (!form.quantidade.trim())    e.quantidade = 'Informe a quantidade';
    else if (isNaN(form.quantidade) || Number(form.quantidade) <= 0) e.quantidade = 'Deve ser maior que zero';
    if (!form.data_validade.trim()) e.data_validade = 'Informe a data de validade';
    else {
      const iso = form.data_validade.includes('/') ? form.data_validade.split('/').reverse().join('-') : form.data_validade;
      if (isNaN(Date.parse(iso))) e.data_validade = 'Data inválida (use DD/MM/AAAA)';
    }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const formatarData = (v) => v.includes('/') ? v.split('/').reverse().join('-') : v;

  const handleSalvar = async () => {
    if (!validar()) return;
    setSalvando(true);
    try {
      await alimentosService.cadastrar({
        ...form,
        quantidade: Number(form.quantidade),
        data_validade: formatarData(form.data_validade),
      });
      Alert.alert('✅ Cadastrado!', `${form.nome} foi adicionado ao estoque.`, [
        { text: 'Cadastrar outro', onPress: () => setForm(estadoInicial) },
        { text: 'Ver estoque',     onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.mensagem || 'Verifique sua conexão.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Text style={s.titulo}>Cadastro de Alimentos 🥗</Text>

        <View style={s.campo}>
          <Text style={s.label}>Nome do Alimento</Text>
          <TextInput style={[s.input, erros.nome && s.inputErro]}
            placeholder="Ex: Leite Integral frango..."
            placeholderTextColor={cores.textoSecundario}
            value={form.nome} onChangeText={(v) => atualizar('nome', v)} />
          {erros.nome ? <Text style={s.textoErro}>{erros.nome}</Text> : null}
        </View>

        <View style={s.campo}>
          <Text style={s.label}>Categoria</Text>
          <View style={s.categoriaGrade}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity key={cat.label}
                style={[s.categoriaChip, form.categoria === cat.label && s.categoriaChipAtivo]}
                onPress={() => atualizar('categoria', cat.label)} activeOpacity={0.7}>
                <Text style={s.categoriaEmoji}>{cat.emoji}</Text>
                <Text style={[s.categoriaTexto, form.categoria === cat.label && s.categoriaTextoAtivo]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {erros.categoria ? <Text style={s.textoErro}>{erros.categoria}</Text> : null}
        </View>

        <View style={s.linha}>
          <View style={{ flex: 1, marginRight: espacamento.sm }}>
            <Text style={s.label}>Quantidade</Text>
            <TextInput style={[s.input, erros.quantidade && s.inputErro]}
              placeholder="1" placeholderTextColor={cores.textoSecundario}
              value={form.quantidade} onChangeText={(v) => atualizar('quantidade', v)}
              keyboardType="decimal-pad" />
            {erros.quantidade ? <Text style={s.textoErro}>{erros.quantidade}</Text> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Unidade</Text>
            <View style={s.chipGrupo}>
              {UNIDADES.map((un) => (
                <TouchableOpacity key={un}
                  style={[s.chip, form.unidade === un && s.chipAtivo]}
                  onPress={() => atualizar('unidade', un)} activeOpacity={0.7}>
                  <Text style={[s.chipTexto, form.unidade === un && s.chipTextoAtivo]}>{un}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={s.campo}>
          <Text style={s.label}>Data de Validade</Text>
          <TextInput style={[s.input, erros.data_validade && s.inputErro]}
            placeholder="DD/MM/AAAA" placeholderTextColor={cores.textoSecundario}
            value={form.data_validade} onChangeText={(v) => atualizar('data_validade', v)}
            keyboardType="numeric" maxLength={10} />
          {erros.data_validade ? <Text style={s.textoErro}>{erros.data_validade}</Text> : null}
        </View>

        <View style={s.campo}>
          <Text style={s.label}>Alertar com antecedência: <Text style={{ color: cores.primaria }}>{form.dias_antecedencia} dia(s)</Text></Text>
          <View style={s.sliderRow}>
            {[1,2,3,4,5,6,7].map((d) => (
              <TouchableOpacity key={d}
                style={[s.sliderDot, form.dias_antecedencia >= d && s.sliderDotAtivo]}
                onPress={() => atualizar('dias_antecedencia', d)} />
            ))}
          </View>
          <View style={s.sliderLabels}>
            <Text style={s.sliderLabel}>1 dia</Text>
            <Text style={s.sliderLabel}>7 dias</Text>
          </View>
        </View>

        <TouchableOpacity style={[s.botao, salvando && s.botaoDesabilitado]}
          onPress={handleSalvar} disabled={salvando} activeOpacity={0.8}>
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTexto}>Adicionar ao Estoque</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:               { flex: 1, backgroundColor: cores.fundo },
  conteudo:             { padding: espacamento.md, paddingBottom: espacamento.xxl },
  titulo:               { ...tipografia.titulo, color: cores.primaria, marginBottom: espacamento.lg },
  campo:                { marginBottom: espacamento.md },
  label:                { ...tipografia.label, marginBottom: espacamento.xs },
  input:                { backgroundColor: '#fff', borderWidth: 1.5, borderColor: cores.borda, borderRadius: raio.md, padding: espacamento.md, fontSize: 15, color: cores.texto },
  inputErro:            { borderColor: cores.erro },
  textoErro:            { color: cores.erro, fontSize: 12, marginTop: 4 },
  categoriaGrade:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoriaChip:        { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: raio.md, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: '#fff', minWidth: 70 },
  categoriaChipAtivo:   { backgroundColor: cores.primariaFundo, borderColor: cores.primaria },
  categoriaEmoji:       { fontSize: 22, marginBottom: 2 },
  categoriaTexto:       { fontSize: 11, color: cores.textoSecundario, fontWeight: '500' },
  categoriaTextoAtivo:  { color: cores.primaria, fontWeight: '700' },
  linha:                { flexDirection: 'row', marginBottom: espacamento.md },
  chipGrupo:            { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:                 { paddingHorizontal: 10, paddingVertical: 6, borderRadius: raio.full, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: '#fff' },
  chipAtivo:            { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto:            { fontSize: 12, color: cores.textoSecundario, fontWeight: '500' },
  chipTextoAtivo:       { color: '#fff', fontWeight: '600' },
  sliderRow:            { flexDirection: 'row', justifyContent: 'space-between', marginTop: espacamento.sm },
  sliderDot:            { width: 32, height: 32, borderRadius: 16, backgroundColor: cores.borda, alignItems: 'center', justifyContent: 'center' },
  sliderDotAtivo:       { backgroundColor: cores.primaria },
  sliderLabels:         { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderLabel:          { fontSize: 11, color: cores.textoSecundario },
  botao:                { backgroundColor: cores.primaria, borderRadius: raio.lg, paddingVertical: espacamento.md, alignItems: 'center', marginTop: espacamento.sm, elevation: 3 },
  botaoDesabilitado:    { opacity: 0.6 },
  botaoTexto:           { color: '#fff', fontSize: 16, fontWeight: '700' },
});