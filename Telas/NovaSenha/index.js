import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Estilos from "../../Componentes/Estilos";
import { resetPassword } from "../../Componentes/Api/apis";

export default function NovaSenha({ navigation, route }) {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const destinoLogin = route?.params?.destinoLogin || "Home";

  // 🔥 AGORA CORRETO — pega o code enviado pelo verifyPin
  const code = route?.params?.code;

  const handleConfirmar = async () => {
    if (!senha.trim() || !confirmarSenha.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    console.log(">>> CODE RECEBIDO NA TELA:", code);
    if (!code) {
      Alert.alert("Erro", "Código ausente. Volte e valide o PIN novamente.");
      return;
    }

    try {
      console.log(">>> Enviando RESET com code:", code);

      const msg = await resetPassword(code, senha);

      Alert.alert("Sucesso", String(msg || "Senha alterada com sucesso!"));
      navigation.navigate(destinoLogin);
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Falha ao redefinir senha";
      Alert.alert("Erro", String(msg));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={Estilos.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            marginBottom: 28,
          }}
        >
          <Text style={{ fontSize: 56, fontWeight: "bold", color: "#444C55" }}>
            W
          </Text>
          <Text style={{ fontSize: 56, fontWeight: "bold", color: "#6D6FB3" }}>
            4
          </Text>
          <Text style={{ fontSize: 56, fontWeight: "bold", color: "#444C55" }}>
            U
          </Text>
        </View>

        <Text
          style={{
            width: "85%",
            color: "#444C55",
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Senha
        </Text>
        <TextInput
          style={[Estilos.input, { width: "85%" }]}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Text
          style={{
            width: "85%",
            color: "#444C55",
            fontSize: 18,
            fontWeight: "700",
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          Confirmar senha
        </Text>
        <TextInput
          style={[Estilos.input, { width: "85%" }]}
          placeholder="Confirmar senha"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        <TouchableOpacity
          style={[Estilos.primaryButton, { width: "85%", marginTop: 24 }]}
          activeOpacity={0.7}
          onPress={handleConfirmar}
        >
          <Text style={Estilos.buttonTextPrimary}>Confirmar Alteração</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
