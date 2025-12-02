import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator
} from "react-native";
import Estilos from "../../Componentes/Estilos";
import { verifyPin } from "../../Componentes/Api/apis";

export default function CodigoVerificacao({ navigation, route }) {
  const email = route?.params?.email;
  const DIGITS = 5;
  const [values, setValues] = useState(Array(DIGITS).fill(""));
  const [loading, setLoading] = useState(false); 
  const inputsRef = useRef([]);

  useEffect(() => {
    setTimeout(() => {
        inputsRef.current[0]?.focus();
    }, 500);
  }, []);

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
      const next = [...values];
      next[index - 1] = ""; 
      setValues(next);
    }
  };

  const confirmar = async () => {
    const pin = values.join("");

    if (pin.length !== DIGITS) {
      Alert.alert("Atenção", `Digite os ${DIGITS} números do código.`);
      return;
    }

    setLoading(true);
    try {
      await verifyPin(email, pin);
      
      Alert.alert("Sucesso", "Código validado!");
      

      navigation.navigate("NovaSenha", { email, code: pin });

    } catch (err) {
      const msg = typeof err === "string" 
        ? err 
        : err?.response?.data?.erro || "Código inválido ou expirado.";
      
      Alert.alert("Erro", String(msg));
      
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={Estilos.container}>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 28 }}>
          <Text style={{ fontSize: 56, fontWeight: "bold", color: "#444C55" }}>W</Text>
          <Text style={{ fontSize: 56, fontWeight: "bold", color: "#6D6FB3" }}>4</Text>
          <Text style={{ fontSize: 56, fontWeight: "bold", color: "#444C55" }}>U</Text>
        </View>

        <Text style={{ fontSize: 16, color: "#666", marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 }}>
            Enviamos um código para {email}
        </Text>

        <Text style={{ width: "85%", color: "#444C55", fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
          Código de Verificação
        </Text>

        <View style={styles.pinRow}>
          {values.map((v, i) => (
            <TextInput
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              style={[
                  styles.pinBox, 
                  (v ? styles.pinBoxFilled : {}) 
              ]}
              value={v}
              onChangeText={(t) => onChangeDigit(t, i)}
              onKeyPress={(e) => onKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus={true}
              returnKeyType={i === DIGITS - 1 ? "done" : "next"}
            />
          ))}
        </View>

        {/* Botão */}
        <TouchableOpacity
          style={[Estilos.primaryButton, { width: "85%", marginTop: 32 }]}
          activeOpacity={0.7}
          onPress={confirmar}
          disabled={loading} 
        >
          {loading ? (
             <ActivityIndicator color="#FFF" />
          ) : (
             <Text style={Estilos.buttonTextPrimary}>Validar Código</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  pinRow: {
    flexDirection: "row",
    justifyContent: "space-between", 
    width: "85%",
    marginTop: 8,
  },
  pinBox: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: "#e0e0e0", 
    borderRadius: 10,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#444C55",
    backgroundColor: "#f9f9f9",
  },
  pinBoxFilled: {
    borderColor: "#6D6FB3", // Fica roxo quando preenchido
    backgroundColor: "#fff",
  },
});