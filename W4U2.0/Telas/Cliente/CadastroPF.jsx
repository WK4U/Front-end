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
  Button
} from "react-native";
import Estilos from "../../Componentes/Estilos/index.js";
import { Ionicons } from "@expo/vector-icons";
import { registerUser } from "../../Componentes/Api/apis.js";
import Foto from "../Foto/Foto.jsx";

export default function CadastroPF(props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [modalVisible, setModalVisible] = useState(false); 
  const [photoUri, setPhotoUri] = useState(null); 

  const handlePhotoCapture = (fotoData) => {
    setPhotoUri(fotoData.uri); 
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
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    const dataFormatada = dataNascimento.split("/").reverse().join("-");
    const userData = {
      nome: nome,
      telefone: telefone,
      dataNascimento: dataFormatada,
      cpf: cpf,
      email: email,
      senha: senha,
      foto: photoUri, 
    };

    try {
      const response = await registerUser(userData);
      Alert.alert("Sucesso!", response.data);
      props.navigation.navigate("HomeCliente");
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;
      Alert.alert("Erro no cadastro", errorMessage);
    }
  };

  return (
    <View style={Estilos.container}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Cadastro
      </Text>

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => setModalVisible(true)} 
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.profileImage} />
        ) : (
          <Ionicons name="camera" size={40} color="#555" />
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={setTelefone}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de nascimento (dd/mm/aaaa)"
        value={dataNascimento}
        onChangeText={setDataNascimento}
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <TouchableOpacity
        style={Estilos.buttonCadastro}
        onPress={FinalizarCadastro}
      >
        <Text style={Estilos.buttonTexto}>Finalizar Cadastro</Text>
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