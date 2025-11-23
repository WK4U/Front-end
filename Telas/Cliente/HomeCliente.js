import { Text, View, TouchableOpacity, Image } from "react-native";
import Estilos from "../../Componentes/Estilos";

export default function HomeCliente(props) {
  const AbrirLogin = () => {
    props.navigation.navigate("LoginPF");
  };

  const AbrirCadastro = () => {
    props.navigation.navigate("CadastroPF");
  };

  return (
    <View style={Estilos.container}>
      {/* Marca W4U no padrão */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          marginBottom: 16,
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

      {/* Botões */}
      <TouchableOpacity
        style={[Estilos.secondaryButton, { marginTop: 8 }]}
        activeOpacity={0.7}
        onPress={AbrirLogin}
      >
        <Text style={Estilos.buttonTextSecondary}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[Estilos.primaryButton, { marginTop: 12 }]}
        activeOpacity={0.7}
        onPress={AbrirCadastro}
      >
        <Text style={Estilos.buttonTextPrimary}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}
