import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Estilos from '../../Componentes/Estilos';

export default function PainelPrestador({ navigation }) {
  const abrirAnunciar = () => navigation.navigate('AnunciarServico');

  return (
    <View style={Estilos.container}>
      {/* Marca W4U maior — cores padrão */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 }}>
        <Text style={{ fontSize: 56, fontWeight: 'bold', color: '#444C55' }}>W</Text>
        <Text style={{ fontSize: 56, fontWeight: 'bold', color: '#6D6FB3' }}>4</Text>
        <Text style={{ fontSize: 56, fontWeight: 'bold', color: '#444C55' }}>U</Text>
      </View>

      {/* Apenas a opção Anunciar serviço disponível no painel do prestador */}
      <TouchableOpacity
        style={Estilos.primaryButton}
        activeOpacity={0.8}
        onPress={abrirAnunciar}
      >
        <Text style={Estilos.buttonTextPrimary}>Anunciar serviço</Text>
      </TouchableOpacity>
    </View>
  );
}
