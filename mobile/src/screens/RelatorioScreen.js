import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { cores, espacamento, raio, tipografia } from '../theme';
import { registrosService } from '../services/api';

const PERIODOS = [
  { label: '7 dias',  dias: 7  },
  { label: '30 dias', dias: 30 },
  { label: '90 dias', dias: 90 },
];

const EMOJI_CAT = {
  'Frutas': '🍎', 'Legumes': '🥦', 'Vegetais': '🥦', 'Carnes': '🥩',
  'Laticínios': '🥛', 'Grãos': '🌾', 'Bebidas': '🧃',
  'Congelados': '🧊', 'Pães': '🍞', 'Outros': '📦',
};

// Preço médio estimado por categoria (R$) — usado quando não informado
const PRECO_ESTIMADO = {
  'Carnes': 25, 'Laticínios': 8, 'Frutas': 5, 'Legumes': 4,
  'Vegetais': 4, 'Grãos': 6, 'Bebidas': 7, 'Pães': 6,
  'Congelados': 15, 'Outros': 10,
};

export default function RelatorioScreen() {
  const [periodoIdx, setPeriodo]     = useState(1); // 30 dias padrão
  const [resumo, setResumo]          = useState([]);
  const [carregando, setCarregando]  = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      const dias = PERIODOS[periodoIdx].dias;
      const res  = await registrosService.resumo(dias);
      setResumo(res.data.dados);
    } catch (err) { console.error(err); }
    finally { setCarregando(false); }
  };

  useFocusEffect(useCallback(() => { carregar(); }, [periodoIdx]));

  // Totais agregados
  const totalConsumidos  = resumo.filter(r => r.tipo === 'consumido').reduce((s, r) => s + Number(r.total), 0);
  const totalDescartados = resumo.filter(r => r.tipo === 'descartado').reduce((s, r) => s + Number(r.total), 0);
  const totalItens       = totalConsumidos + totalDescartados;

  // Economia estimada: consumidos × preço médio da categoria
  const economiaTotal = resumo
    .filter(r => r.tipo === 'consumido')
    .reduce((soma, r) => {
      const preco = Number(r.valor_total) > 0
        ? Number(r.valor_total)
        : Number(r.total) * (PRECO_ESTIMADO[r.alimento_categoria] || 10);
      return soma + preco;
    }, 0);

  // Desperdício por categoria (descartados)
  const descartoPorCat = resumo
    .filter(r => r.tipo === 'descartado')
    .sort((a, b) => Number(b.total) - Number(a.total));

  const maxDescartes = descartoPorCat.length > 0
    ? Math.max(...descartoPorCat.map(r => Number(r.total)))
    : 1;

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.cabecalho}>
          <Text style={s.titulo}>Relatório</Text>
          <Text style={s.subtitulo}>Histórico de consumo e descarte</Text>
        </View>

        {/* Filtro de período */}
        <View style={s.periodoRow}>
          {PERIODOS.map((p, idx) => (
            <TouchableOpacity key={p.dias}
              style={[s.periodoChip, periodoIdx === idx && s.periodoChipAtivo]}
              onPress={() => setPeriodo(idx)} activeOpacity={0.7}>
              <Text style={[s.periodoTexto, periodoIdx === idx && s.periodoTextoAtivo]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {carregando ? (
          <ActivityIndicator color={cores.primaria} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Cards resumo */}
            <View style={s.resumoRow}>
              <View style={[s.resumoCard, { backgroundColor: cores.primariaFundo }]}>
                <Text style={[s.resumoNumero, { color: cores.primaria }]}>{totalConsumidos}</Text>
                <Text style={[s.resumoLabel, { color: cores.primaria }]}>Consumidos</Text>
              </View>
              <View style={[s.resumoCard, { backgroundColor: '#FDECEA' }]}>
                <Text style={[s.resumoNumero, { color: cores.acentoPerigo }]}>{totalDescartados}</Text>
                <Text style={[s.resumoLabel, { color: cores.acentoPerigo }]}>Descartados</Text>
              </View>
            </View>

            {/* Card de economia — US-13 */}
            <View style={s.economiaCard}>
              <View style={s.economiaEsquerda}>
                <Text style={s.economiaEmoji}>💰</Text>
                <View>
                  <Text style={s.economiaLabel}>Economia estimada</Text>
                  <Text style={s.economiaSub}>Alimentos consumidos antes do vencimento</Text>
                </View>
              </View>
              <Text style={s.economiaValor}>R$ {economiaTotal.toFixed(2).replace('.', ',')}</Text>
            </View>

            {totalItens === 0 ? (
              <View style={s.vazio}>
                <Text style={s.vazioEmoji}>📊</Text>
                <Text style={s.vazioPrincipal}>Nenhum dado neste período</Text>
                <Text style={s.vazioSecundario}>Registre alimentos como consumidos ou descartados para ver o relatório</Text>
              </View>
            ) : (
              <>
                {/* Taxa de aproveitamento */}
                <View style={s.secao}>
                  <Text style={s.secaoTitulo}>📈 Taxa de aproveitamento</Text>
                  <View style={s.taxaContainer}>
                    <View style={s.taxaBarraFundo}>
                      <View style={[s.taxaBarraPreenc, {
                        width: totalItens > 0 ? `${(totalConsumidos / totalItens) * 100}%` : '0%'
                      }]} />
                    </View>
                    <Text style={s.taxaPct}>
                      {totalItens > 0 ? Math.round((totalConsumidos / totalItens) * 100) : 0}%
                    </Text>
                  </View>
                  <Text style={s.taxaDescricao}>
                    {totalConsumidos} de {totalItens} itens foram consumidos
                  </Text>
                </View>

                {/* Desperdício por categoria — US-12 */}
                {descartoPorCat.length > 0 && (
                  <View style={s.secao}>
                    <Text style={s.secaoTitulo}>🗑️ Mais desperdiçados</Text>
                    {descartoPorCat.map((r) => (
                      <View key={r.alimento_categoria} style={s.barraRow}>
                        <Text style={s.barraEmoji}>{EMOJI_CAT[r.alimento_categoria] || '📦'}</Text>
                        <Text style={s.barraLabel}>{r.alimento_categoria}</Text>
                        <View style={s.barraFundo}>
                          <View style={[s.barraPreenc, {
                            width: `${(Number(r.total) / maxDescartes) * 100}%`
                          }]} />
                        </View>
                        <Text style={s.barraQtd}>{r.total}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:          { flex: 1, backgroundColor: cores.fundo },
  cabecalho:       { padding: espacamento.md, paddingBottom: espacamento.sm },
  titulo:          { ...tipografia.titulo, color: cores.primaria },
  subtitulo:       { ...tipografia.legenda, marginTop: 2 },
  periodoRow:      { flexDirection: 'row', paddingHorizontal: espacamento.md, gap: 8, marginBottom: espacamento.md },
  periodoChip:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: raio.full, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: '#fff' },
  periodoChipAtivo:{ backgroundColor: cores.primaria, borderColor: cores.primaria },
  periodoTexto:    { fontSize: 13, color: cores.textoSecundario, fontWeight: '600' },
  periodoTextoAtivo: { color: '#fff' },
  resumoRow:       { flexDirection: 'row', paddingHorizontal: espacamento.md, gap: 10, marginBottom: espacamento.md },
  resumoCard:      { flex: 1, borderRadius: raio.md, padding: espacamento.md, alignItems: 'center' },
  resumoNumero:    { fontSize: 32, fontWeight: '800' },
  resumoLabel:     { fontSize: 12, fontWeight: '600', marginTop: 2 },
  economiaCard:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: espacamento.md, borderRadius: raio.lg, padding: espacamento.md, marginBottom: espacamento.md, borderWidth: 1, borderColor: '#C8E0CC' },
  economiaEsquerda:{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  economiaEmoji:   { fontSize: 32 },
  economiaLabel:   { fontSize: 14, fontWeight: '700', color: cores.texto },
  economiaSub:     { fontSize: 11, color: cores.textoSecundario, marginTop: 2 },
  economiaValor:   { fontSize: 22, fontWeight: '800', color: cores.primaria },
  secao:           { paddingHorizontal: espacamento.md, marginBottom: espacamento.lg },
  secaoTitulo:     { fontSize: 16, fontWeight: '700', color: cores.texto, marginBottom: espacamento.md },
  taxaContainer:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  taxaBarraFundo:  { flex: 1, height: 14, backgroundColor: '#FDECEA', borderRadius: 7, overflow: 'hidden' },
  taxaBarraPreenc: { height: 14, backgroundColor: cores.primaria, borderRadius: 7 },
  taxaPct:         { fontSize: 14, fontWeight: '800', color: cores.primaria, width: 40, textAlign: 'right' },
  taxaDescricao:   { fontSize: 12, color: cores.textoSecundario },
  barraRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  barraEmoji:      { fontSize: 16, width: 22 },
  barraLabel:      { width: 80, fontSize: 12, color: cores.texto, fontWeight: '500' },
  barraFundo:      { flex: 1, height: 10, backgroundColor: '#FDECEA', borderRadius: 5, overflow: 'hidden' },
  barraPreenc:     { height: 10, backgroundColor: cores.acentoPerigo, borderRadius: 5 },
  barraQtd:        { width: 24, fontSize: 12, color: cores.textoSecundario, textAlign: 'right' },
  vazio:           { alignItems: 'center', marginTop: 60, paddingHorizontal: espacamento.xl },
  vazioEmoji:      { fontSize: 52, marginBottom: espacamento.md },
  vazioPrincipal:  { ...tipografia.subtitulo, color: cores.textoSecundario, textAlign: 'center' },
  vazioSecundario: { ...tipografia.legenda, marginTop: 4, textAlign: 'center' },
});
