import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Estilos from "../../Componentes/Estilos";
import { Ionicons } from "@expo/vector-icons";
import { registerUser } from "../../Componentes/Api/apis.js";

export default function CadastroUsuario(props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("CLIENTE");
  const [especialidade, setEspecialidade] = useState("");
  const [descricaoServico, setDescricaoServico] = useState("");

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
    if (tipoUsuario === "PRESTADOR" && (!especialidade || !descricaoServico)) {
      Alert.alert("Erro", "Por favor, preencha os campos de prestador!");
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
      tipoUsuario: tipoUsuario,
    };

    if (tipoUsuario === "PRESTADOR") {
      userData.especialidade = especialidade;
      userData.descricaoServico = descricaoServico;
    }

    try {
      const response = await registerUser(userData);
      Alert.alert("Sucesso!", response.data);
      props.navigation.navigate("Home");
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

      {}
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => Alert.alert("Abrir seletor de imagem")}
      >
        <Ionicons name="camera" size={40} color="#555" />
      </TouchableOpacity>

      {}
      <View style={styles.dropdownContainer}>
        <Text>Eu sou um:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={tipoUsuario}
            onValueChange={(itemValue) => setTipoUsuario(itemValue)}
            style={styles.pickerStyle}
          >
            <Picker.Item label="Cliente" value="CLIENTE" />
            <Picker.Item label="Prestador de Serviço" value="PRESTADOR" />
          </Picker>
        </View>
      </View>

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

      {tipoUsuario === "PRESTADOR" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Especialidade"
            value={especialidade}
            onChangeText={setEspecialidade}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição do Serviço"
            value={descricaoServico}
            onChangeText={setDescricaoServico}
          />
        </>
      )}

      <TouchableOpacity
        style={Estilos.buttonCadastro}
        onPress={FinalizarCadastro}
      >
        <Text style={Estilos.buttonTexto}>Finalizar Cadastro</Text>
      </TouchableOpacity>
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
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 15,
  },
  pickerWrapper: {
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 10,
    height: 50,
    width: "70%",
    justifyContent: "center",
    overflow: "hidden",
  },
  pickerStyle: {
    height: 50,
    width: "100%",
  },
  cameraButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
});
