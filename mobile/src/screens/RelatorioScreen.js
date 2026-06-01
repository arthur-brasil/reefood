import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { cores, espacamento, raio, tipografia } from '../theme';
import { alimentosService } from '../services/api';

function statusValidade(dataValidade) {
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return 'vencido';
  if (diff <= 3) return 'atencao';
  if (diff <= 7) return 'semana';
  return 'ok';
}

export default function RelatorioScreen() {
  const [alimentos, setAlimentos] = useState([]);

  const carregar = async () => {
    try {
      const res = await alimentosService.listar();
      setAlimentos(res.data.dados);
    } catch (err) { console.error(err); }
  };

  useFocusEffect(useCallback(() => { carregar(); }, []));

  const vencidos = alimentos.filter(a => statusValidade(a.data_validade) === 'vencido');
  const ok       = alimentos.filter(a => statusValidade(a.data_validade) === 'ok');

  const porCategoria = alimentos.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + 1;
    return acc;
  }, {});

  const categoriaOrdenada = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  const total = alimentos.length || 1;

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.cabecalho}>
          <Text style={s.titulo}>Relatório</Text>
          <Text style={s.subtitulo}>Visão geral do seu estoque</Text>
        </View>

        {/* Cards resumo */}
        <View style={s.resumoRow}>
          <View style={[s.resumoCard, { backgroundColor: '#FDECEA' }]}>
            <Text style={[s.resumoNumero, { color: cores.acentoPerigo }]}>{vencidos.length}</Text>
            <Text style={[s.resumoLabel, { color: cores.acentoPerigo }]}>Vencidos</Text>
            <Text style={[s.resumoPct, { color: cores.acentoPerigo }]}>
              {Math.round((vencidos.length / total) * 100)}%
            </Text>
          </View>
          <View style={[s.resumoCard, { backgroundColor: cores.primariaFundo }]}>
            <Text style={[s.resumoNumero, { color: cores.primaria }]}>{ok.length}</Text>
            <Text style={[s.resumoLabel, { color: cores.primaria }]}>No prazo</Text>
            <Text style={[s.resumoPct, { color: cores.primaria }]}>
              {Math.round((ok.length / total) * 100)}%
            </Text>
          </View>
        </View>

        {/* Desperdício por categoria */}
        <View style={s.secao}>
          <Text style={s.secaoTitulo}>📊 Desperdício por Categoria</Text>
          {categoriaOrdenada.map(([cat, qtd]) => (
            <View key={cat} style={s.barraRow}>
              <Text style={s.barraLabel}>{cat}</Text>
              <View style={s.barraFundo}>
                <View style={[s.barraPreenchimento, { width: `${(qtd / total) * 100}%` }]} />
              </View>
              <Text style={s.barraQtd}>{qtd}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:             { flex: 1, backgroundColor: cores.fundo },
  cabecalho:          { padding: espacamento.md, paddingBottom: espacamento.sm },
  titulo:             { ...tipografia.titulo, color: cores.primaria },
  subtitulo:          { ...tipografia.legenda, marginTop: 2 },
  resumoRow:          { flexDirection: 'row', paddingHorizontal: espacamento.md, gap: 10, marginBottom: espacamento.md },
  resumoCard:         { flex: 1, borderRadius: raio.md, padding: espacamento.md, alignItems: 'center' },
  resumoNumero:       { fontSize: 32, fontWeight: '800' },
  resumoLabel:        { fontSize: 12, fontWeight: '600', marginTop: 2 },
  resumoPct:          { fontSize: 11, marginTop: 2, opacity: 0.7 },
  secao:              { paddingHorizontal: espacamento.md, marginBottom: espacamento.xl },
  secaoTitulo:        { fontSize: 16, fontWeight: '700', color: cores.texto, marginBottom: espacamento.md },
  barraRow:           { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  barraLabel:         { width: 90, fontSize: 12, color: cores.texto, fontWeight: '500' },
  barraFundo:         { flex: 1, height: 10, backgroundColor: cores.borda, borderRadius: 5, overflow: 'hidden' },
  barraPreenchimento: { height: 10, backgroundColor: cores.primaria, borderRadius: 5 },
  barraQtd:           { width: 24, fontSize: 12, color: cores.textoSecundario, textAlign: 'right' },
});