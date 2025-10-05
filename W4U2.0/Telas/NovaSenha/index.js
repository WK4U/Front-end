import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import Estilos from '../../Componentes/Estilos';

export default function NovaSenha(props) {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleConfirmar = () => {
    if (!senha.trim() || !confirmarSenha.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    props.navigation.navigate('Login');
  };

  return (
    <View style={Estilos.container}>
      <Image
        source={require('../../assets/W4UP1.png')}
        style={Estilos.image}    
      />

      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Nova Senha
      </Text>

      <TextInput
        style={{
          width: '90%',
          height: 50,
          borderColor: '#000',
          borderWidth: 2,
          borderRadius: 10,
          paddingHorizontal: 10,
          marginBottom: 15,
          fontSize: 18,
          backgroundColor: '#fff'
        }}
        placeholder="Nova senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TextInput
        style={{
          width: '90%',
          height: 50,
          borderColor: '#000',
          borderWidth: 2,
          borderRadius: 10,
          paddingHorizontal: 10,
          marginBottom: 15,
          fontSize: 18,
          backgroundColor: '#fff'
        }}
        placeholder="Confirmar nova senha"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <TouchableOpacity style={Estilos.buttonCadastro} activeOpacity={0.7} onPress={handleConfirmar}>
        <Text style={Estilos.buttonTexto}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}
