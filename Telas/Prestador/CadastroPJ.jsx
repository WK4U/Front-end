import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Alert,
  Modal, 
  Button,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import Estilos from "../../Componentes/Estilos/index.js";
import { Ionicons } from "@expo/vector-icons";
import { registerUser } from "../../Componentes/Api/apis.js";
import Foto from "../Foto/Foto.jsx";
import { MaskedTextInput } from "react-native-mask-text";
import { validarDataBR, validarTelefoneBR, somenteDigitos } from "../../Componentes/Utils/validacao";


export default function CadastroPJ(props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [photo, setPhoto] = useState(null);

  const handlePhotoCapture = (fotoData) => {
    setPhoto(fotoData);
    setModalVisible(false);
    console.log("Foto capturada! URI:", fotoData.uri);
  };

  const FinalizarCadastro = async () => {
    // Validação
    if (
      !nome ||
      !telefone ||
      !email ||
      !cnpj ||
      !senha ||
      !confirmarSenha
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos!");
      return;
    }
    if (!validarTelefoneBR(telefone)) {
      Alert.alert("Erro", "Telefone inválido. Use DDD e número no formato (99) 99999-9999.");
      return;
    }
    // CNPJ não será validado conforme solicitação
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    const telefoneRaw = somenteDigitos(telefone);
    const cnpjRaw = somenteDigitos(cnpj);

    const userData = {
      nome: nome,
      telefone: telefoneRaw,
      cnpj: cnpjRaw,
      email: email,
      senha: senha,
      tipoUsuario: 'JURIDICO',
      especialidade: '',
    };

    try {
      const result = await registerUser(userData, photo); // backend espera multipart 'dados' + 'file'
      Alert.alert(
        "Conta registrada com sucesso!",
        "Por favor, faça o login para acessar sua conta."
      );
      // Após cadastro de prestador, ir para tela de login do PJ
      props.navigation.reset({ index: 0, routes: [{ name: 'LoginPJ' }] });
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Erro no cadastro');
      Alert.alert("Erro no cadastro", String(errorMessage));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={Estilos.container}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Cadastro
      </Text>

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => setModalVisible(true)}
      >
        {photo?.uri ? (
          <Image source={{ uri: photo.uri }} style={styles.profileImage} />
        ) : (
          <Ionicons name="camera" size={40} color="#555" />
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholderTextColor="#888888"
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
      />
      <MaskedTextInput
        style={styles.input}
        placeholder="Telefone"
        placeholderTextColor="#888888"
        mask="(99) 99999-9999"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={(masked, raw) => setTelefone(masked)}
      />
      <MaskedTextInput
        style={styles.input}
        placeholder="CNPJ"
        placeholderTextColor="#888888"
        keyboardType="number-pad"
        mask="99.999.999/9999-99"
        value={cnpj}
        onChangeText={(masked, raw) => setCnpj(masked)}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888888"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        placeholderTextColor="#888888"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

       <TouchableOpacity
        style={Estilos.primaryButton}
        onPress={FinalizarCadastro}
        activeOpacity={0.8}
      >
        <Text style={Estilos.buttonTextPrimary}>Finalizar Cadastro</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false); 
        }}
      >
        <Foto 
          onDadosRecebidos={handlePhotoCapture} 
        />
        <Button 
            title="Cancelar e Voltar" 
            onPress={() => setModalVisible(false)} 
        />
      </Modal>
    </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "90%",
    height: 50,
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: "#fff",
    color: '#000',
  },
  cameraButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: 'hidden', 
  },
  profileImage: { 
    width: '100%',
    height: '100%',
    borderRadius: 50,
  }
});