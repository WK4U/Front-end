import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import Estilos from '../../Componentes/Estilos';


export default function CodigoVerificacao(props) {
  const [codigoGerado, setCodigoGerado] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');

  // Função para gerar código de 5 dígitos únicos
  const gerarCodigo = () => {
    let numeros = [];
    while (numeros.length < 5) {
      let digito = Math.floor(Math.random() * 10);
      if (!numeros.includes(digito)) {
        numeros.push(digito);
      }
    }
    return numeros.join('');
  };

  useEffect(() => {
    const novoCodigo = gerarCodigo();
    setCodigoGerado(novoCodigo);
  }, []);

  const verificarCodigo = () => {
    if (codigoDigitado === codigoGerado) {
      Alert.alert('Código correto!', 'Você pode redefinir sua senha agora.');
      props.navigation.navigate('NovaSenha'); // usando props
    } else {
      Alert.alert('Código incorreto', 'Verifique o código e tente novamente.');
    }
  };

  return (
    <View style={styles.container}>

      <Image
        source={require('../../assets/W4UP1.png')}
        style={Estilos.image}    
      />

      <Text style={styles.titulo}>Redefinição de Senha</Text>
      <Text style={styles.texto}>
        Um e-mail foi enviado para você contendo um código de 5 dígitos para redefinir sua senha.
      </Text>
      <Text style={styles.codigoFake}>📧 Código enviado: {codigoGerado}</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o código recebido"
        keyboardType="numeric"
        maxLength={5}
        value={codigoDigitado}
        onChangeText={setCodigoDigitado}
      />

      <TouchableOpacity style={styles.botao} onPress={verificarCodigo}>
        <Text style={styles.botaoTexto}>Confirmar Código</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  texto: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  codigoFake: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  botao: {
    width: '90%',
    height: 50,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
