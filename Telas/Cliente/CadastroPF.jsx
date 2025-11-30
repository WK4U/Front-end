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
import { validarCPF, validarDataBR, validarTelefoneBR, somenteDigitos } from "../../Componentes/Utils/validacao";

export default function CadastroPF(props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
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
      !dataNascimento ||
      !email ||
      !cpf ||
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
    if (!validarDataBR(dataNascimento)) {
      Alert.alert("Erro", "Data de nascimento inválida.");
      return;
    }
    if (!validarCPF(cpf)) {
      Alert.alert("Erro", "CPF inválido.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    const dataFormatada = dataNascimento.split("/").reverse().join("-");
    const telefoneRaw = somenteDigitos(telefone);
    const cpfRaw = somenteDigitos(cpf);
    const userData = {
      nome: nome,
      telefone: telefoneRaw,
      dataNascimento: dataFormatada, // yyyy-MM-dd
      cpf: cpfRaw,
      email: email,
      senha: senha,
      tipoUsuario: 'FISICO',
    };

    try {
      const result = await registerUser(userData, photo); // backend recebe multipart 'dados' + 'file'
      Alert.alert(
        "Conta registrada com sucesso!",
        "Por favor, faça o login para acessar sua conta."
      );
      // Após cadastro de cliente, ir para tela de login
      props.navigation.reset({ index: 0, routes: [{ name: 'LoginPF' }] });
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
        Cadastro Cliente
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
        placeholder="Nome completo"
        placeholderTextColor="#888888"
        value={nome}
        onChangeText={setNome}
      />
      <MaskedTextInput
        style={styles.input}
        placeholder="Telefone"
        placeholderTextColor="#888888"
        keyboardType="phone-pad"
        mask="(99) 99999-9999"
        value={telefone}
        onChangeText={(masked, raw) => setTelefone(masked)}
      />
      <MaskedTextInput
        style={styles.input}
        placeholder="Data de nascimento (dd/mm/aaaa)"
        placeholderTextColor="#888888"
        keyboardType="number-pad"
        mask="99/99/9999"
        value={dataNascimento}
        onChangeText={(masked, raw) => setDataNascimento(masked)}
      />
      <MaskedTextInput
        style={styles.input}
        placeholder="CPF"
        keyboardType="number-pad"
        placeholderTextColor="#888888"
        mask="999.999.999-99"
        value={cpf}
        onChangeText={(masked, raw) => setCpf(masked)}
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
        <Text style={Estilos.buttonTextPrimary}>Continuar Cadastro</Text>
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
  },
  cameraButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: 'hidden',
  },
  profileImage: { 
    width: '100%',
    height: '100%',
    borderRadius: 60,
  }
});