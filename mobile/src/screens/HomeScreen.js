import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { cores, espacamento, raio, tipografia } from '../theme';
import { alimentosService } from '../services/api';

const EMOJI_CATEGORIA = {
  'Frutas': '🍎', 'Legumes': '🥦', 'Vegetais': '🥦', 'Carnes': '🥩',
  'Laticínios': '🥛', 'Grãos': '🌾', 'Bebidas': '🧃',
  'Congelados': '🧊', 'Pães': '🍞', 'Outros': '📦',
};

function statusValidade(dataValidade) {
  const hoje = new Date();
  const validade = new Date(dataValidade);
  const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { tipo: 'vencido', label: 'Vencido',  cor: cores.acentoPerigo, bg: '#FDECEA' };
  if (diff <= 3) return { tipo: 'atencao', label: `${diff}d`, cor: cores.acento,       bg: '#FEF3E8' };
  if (diff <= 7) return { tipo: 'semana',  label: `${diff}d`, cor: '#D4AC0D',          bg: '#FEF9E7' };
  return          { tipo: 'ok',            label: `${diff}d`, cor: cores.primariaClara, bg: cores.primariaFundo };
}

export default function HomeScreen({ navigation }) {
  const [alimentos, setAlimentos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');

  const carregar = async () => {
    try {
      const res = await alimentosService.listar();
      setAlimentos(res.data.dados);
    } catch (err) { console.error(err); }
  };

  useFocusEffect(useCallback(() => { carregar(); }, []));

  const total    = alimentos.length;
  const atencao  = alimentos.filter(a => statusValidade(a.data_validade).tipo === 'atencao').length;
  const vencidos = alimentos.filter(a => statusValidade(a.data_validade).tipo === 'vencido').length;

  const categorias = ['Todas', ...new Set(alimentos.map(a => a.categoria))];
  const filtrados = categoriaAtiva === 'Todas' ? alimentos : alimentos.filter(a => a.categoria === categoriaAtiva);

  return (
    <SafeAreaView style={s.segura} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

      {/* Cabeçalho */}
<View style={s.cabecalho}>
  <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />
  <View style={s.cabecalhoAcoes}>
    <TouchableOpacity onPress={() => navigation.navigate('CadastrarAlimento')}>
      <Text style={s.botaoAdd}>＋</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Perfil')} style={{ marginLeft: 12 }}>
      <Text style={{ fontSize: 26 }}>👤</Text>
    </TouchableOpacity>
  </View>
</View>

        {/* Cards resumo */}
        <View style={s.resumoRow}>
          <View style={[s.resumoCard, { backgroundColor: cores.primariaFundo }]}>
            <Text style={[s.resumoNumero, { color: cores.primaria }]}>{total}</Text>
            <Text style={[s.resumoLabel, { color: cores.primaria }]}>Total</Text>
          </View>
          <View style={[s.resumoCard, { backgroundColor: '#FEF3E8' }]}>
            <Text style={[s.resumoNumero, { color: cores.acento }]}>{atencao}</Text>
            <Text style={[s.resumoLabel, { color: cores.acento }]}>Atenção</Text>
          </View>
          <View style={[s.resumoCard, { backgroundColor: '#FDECEA' }]}>
            <Text style={[s.resumoNumero, { color: cores.acentoPerigo }]}>{vencidos}</Text>
            <Text style={[s.resumoLabel, { color: cores.acentoPerigo }]}>Vencido</Text>
          </View>
        </View>

        {/* Filtros de categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtros}>
          {categorias.map((cat) => (
            <TouchableOpacity key={cat}
              style={[s.filtroChip, categoriaAtiva === cat && s.filtroChipAtivo]}
              onPress={() => setCategoriaAtiva(cat)} activeOpacity={0.7}>
              <Text style={[s.filtroTexto, categoriaAtiva === cat && s.filtroTextoAtivo]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de alimentos */}
        <View style={s.lista}>
          {filtrados.map((item) => {
            const status = statusValidade(item.data_validade);
            return (
              <TouchableOpacity key={item.id} style={s.card}
                onPress={() => navigation.navigate('DetalhesAlimento', { alimento: item })}
                activeOpacity={0.8}>
                <View style={s.cardIcone}>
                  <Text style={s.cardEmoji}>{EMOJI_CATEGORIA[item.categoria] || '📦'}</Text>
                </View>
                <View style={s.cardConteudo}>
                  <Text style={s.cardNome}>{item.nome}</Text>
                  <Text style={s.cardInfo}>{item.categoria} · {item.quantidade} {item.unidade}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: status.bg, borderColor: status.cor }]}>
                  <Text style={[s.badgeTexto, { color: status.cor }]}>{status.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  segura:      { flex: 1, backgroundColor: cores.fundo },
  cabecalho:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: espacamento.md, paddingTop: espacamento.sm },
  logo:        { width: 100, height: 50 },
  botaoAdd:    { fontSize: 28, color: cores.primaria, fontWeight: '300' },
  resumoRow:   { flexDirection: 'row', paddingHorizontal: espacamento.md, gap: 10, marginBottom: espacamento.sm },
  resumoCard:  { flex: 1, borderRadius: raio.md, padding: espacamento.md, alignItems: 'center' },
  resumoNumero:{ fontSize: 26, fontWeight: '800' },
  resumoLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  filtros:     { paddingHorizontal: espacamento.md, paddingVertical: espacamento.sm, gap: 8 },
  filtroChip:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: raio.full, borderWidth: 1.5, borderColor: cores.borda, backgroundColor: '#fff' },
  filtroChipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  filtroTexto: { fontSize: 13, color: cores.textoSecundario, fontWeight: '500' },
  filtroTextoAtivo: { color: '#fff', fontWeight: '600' },
  lista:       { padding: espacamento.md, gap: 8 },
  card:        { backgroundColor: '#fff', borderRadius: raio.md, padding: espacamento.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: cores.borda },
  cardIcone:   { width: 44, height: 44, borderRadius: raio.md, backgroundColor: cores.primariaFundo, alignItems: 'center', justifyContent: 'center', marginRight: espacamento.sm },
  cardEmoji:   { fontSize: 22 },
  cardConteudo:{ flex: 1 },
  cardNome:    { fontSize: 15, fontWeight: '700', color: cores.texto },
  cardInfo:    { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  badge:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: raio.full, borderWidth: 1.5 },
  badgeTexto:  { fontSize: 12, fontWeight: '700' },
  cabecalhoAcoes: { flexDirection: 'row', alignItems: 'center' },
});