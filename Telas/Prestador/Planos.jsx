import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderPadrao from '../../Componentes/Header/HeaderPadrao';
import Estilos from '../../Componentes/Estilos';

export default function Planos({ navigation }) {
  // Estado simples para plano atual - assumimos 'Gratuito' por padrão
  const [planoAtual, setPlanoAtual] = useState('Gratuito');
  const [selecionando, setSelecionando] = useState(false);

  const mudarPlano = async (novo) => {
    if (novo === planoAtual) {
      Alert.alert('Plano', 'Você já está no plano ' + novo + '.');
      return;
    }
    try {
      setSelecionando(true);
      // Simulação de chamada à API
      await new Promise(r => setTimeout(r, 900));
      setPlanoAtual(novo);
      Alert.alert('Sucesso', 'Plano alterado para ' + novo + '.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível alterar o plano.');
    } finally {
      setSelecionando(false);
    }
  };

  return (
    <View style={[Estilos.container, { paddingTop: 12 }]}>      
      <HeaderPadrao navigation={navigation} />

      {/* Título Plano Atual */}
      <Text style={styles.sectionTitle}>Plano Atual</Text>
      <View style={Estilos.currentPlanBox}>
        <Text style={Estilos.currentPlanText}>{planoAtual}</Text>
      </View>

      {/* Título Planos */}
      <Text style={styles.sectionTitle}>Planos</Text>

      <TouchableOpacity
        style={Estilos.planButton}
        activeOpacity={0.75}
        disabled={selecionando}
        onPress={() => mudarPlano('Basic')}
      >
        <Text style={Estilos.buttonTextPlan}>{selecionando && planoAtual !== 'Basic' ? 'Alterando...' : 'Basic'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={Estilos.planButton}
        activeOpacity={0.75}
        disabled={selecionando}
        onPress={() => mudarPlano('Premium')}
      >
        <Text style={Estilos.buttonTextPlan}>{selecionando && planoAtual !== 'Premium' ? 'Alterando...' : 'Premium'}</Text>
      </TouchableOpacity>

      {/* Rodapé opcional */}
      <Text style={styles.note}>Toque em um plano para alterar. Valores e benefícios serão exibidos futuramente.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    padding: 6,
  },
  sectionTitle: {
    width: '85%',
    fontSize: 16,
    fontWeight: '700',
    color: '#444C55',
    marginBottom: 8,
  },
  note: {
    marginTop: 32,
    width: '85%',
    fontSize: 12,
    color: '#6B6F74',
    textAlign: 'center',
  },
});
