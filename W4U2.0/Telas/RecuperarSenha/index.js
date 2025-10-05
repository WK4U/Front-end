import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import Estilos from '../../Componentes/Estilos';

export default function RecuperarSenha(props) {
  const [email, setEmail] = useState('');

 const handleEnviar = () => {
  if (!email.trim()) {
    Alert.alert('Erro', 'Por favor, insira seu e-mail.');
    return;
  }

  const codigo = Math.floor(10000 + Math.random() * 90000).toString();

  Alert.alert(
    'Sucesso',
    `Se existir uma conta vinculada a ${email}, enviaremos as instruções para redefinir sua senha.`
  );

  props.navigation.navigate('CodigoVerificacao', { email, codigo });
};
   
  return (
    <View style={Estilos.container}>
      <Image
        source={require('../../assets/W4UP1.png')}
        style={Estilos.image}    
      />

      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Recuperar Senha
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
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={Estilos.buttonCadastro} activeOpacity={0.7} onPress={handleEnviar}>
        <Text style={Estilos.buttonTexto}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}
