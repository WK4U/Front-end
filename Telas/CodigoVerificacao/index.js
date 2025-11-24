import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Estilos from "../../Componentes/Estilos";
import { verifyPin } from "../../Componentes/Api/apis";

export default function CodigoVerificacao({ navigation, route }) {
  const email = route?.params?.email;
  const DIGITS = 5; // Mantemos 5 dígitos como no fluxo original
  const [values, setValues] = useState(Array(DIGITS).fill(""));
  const inputsRef = useRef([]);

  const onChangeDigit = (text, index) => {
    const val = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...values];
    next[index] = val;
    setValues(next);
    if (val && index < DIGITS - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const confirmar = async () => {
    const pin = values.join("");

    if (pin.length !== DIGITS) {
      Alert.alert("Atenção", `Digite os ${DIGITS} dígitos do PIN.`);
      return;
    }

    try {
      const result = await verifyPin(email, pin);
      // Se o backend validar, use o PIN digitado como code
      if (!result || result === false) {
        Alert.alert("Erro", "PIN inválido ou expirado.");
        return;
      }
      Alert.alert("PIN validado", "Você pode redefinir sua senha.");
      navigation.navigate("NovaSenha", { email, code: pin });
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.erro || err?.message || "Falha ao validar PIN";
      Alert.alert("Erro", String(msg));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={Estilos.container}>
        {/* Marca W4U */}
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

        {/* Label */}
        <Text
          style={{
            width: "85%",
            color: "#444C55",
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 10,
          }}
        >
          PIN
        </Text>

        {/* PIN boxes */}
        <View style={styles.pinRow}>
          {values.map((v, i) => (
            <TextInput
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              style={styles.pinBox}
              value={v}
              onChangeText={(t) => onChangeDigit(t, i)}
              onKeyPress={(e) => onKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType="next"
            />
          ))}
        </View>

        {/* Botão */}
        <TouchableOpacity
          style={[Estilos.primaryButton, { width: "85%", marginTop: 32 }]}
          activeOpacity={0.7}
          onPress={confirmar}
        >
          <Text style={Estilos.buttonTextPrimary}>Confirmar Pin</Text>
        </TouchableOpacity>

        {/* Sem exibição de PIN em produção */}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  pinRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  pinBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#6D6FB3",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    color: "#444C55",
    backgroundColor: "#fff",
  },
});
