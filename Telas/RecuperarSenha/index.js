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
import { forgotPassword } from "../../Componentes/Api/apis";

export default function RecuperarSenha(props) {
  const [email, setEmail] = useState("");

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert("Erro", "Por favor, insira seu e-mail.");
      return;
    }
    try {
      const msg = await forgotPassword(email.trim());
      Alert.alert("Sucesso", String(msg || "Código enviado por e-mail."));
      // Navega sem o código local; o PIN será validado no backend
      props.navigation.navigate("CodigoVerificacao", { email });
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.erro || err?.message || "Falha ao solicitar recuperação";
      Alert.alert("Erro", String(msg));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={Estilos.container}>
        {/* Título */}
        <Text style={{ fontSize: 20, color: "#6B6F74", marginBottom: 12 }}>
          Esqueceu a senha?
        </Text>

        {/* Marca W4U */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            marginBottom: 32,
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

        {/* Label */}
        <Text
          style={{
            width: "90%",
            color: "#444C55",
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Email para recuperação
        </Text>

        {/* Input */}
        <TextInput
          style={[Estilos.input, { width: "85%" }]}
          placeholder="w4u@gmail.com"
          placeholderTextColor="#9AA0A6"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Botão Enviar */}
        <TouchableOpacity
          style={[Estilos.primaryButton, { width: "85%" }]}
          activeOpacity={0.7}
          onPress={handleEnviar}
        >
          <Text style={Estilos.buttonTextPrimary}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
