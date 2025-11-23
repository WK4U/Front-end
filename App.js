import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Home from "./Telas/Home";
import CadastroPF from "./Telas/Cliente/CadastroPF";
import LoginPF from "./Telas/Cliente/LoginPF";
import HomeCliente from "./Telas/Cliente/HomeCliente";
import HomePrestador from "./Telas/Prestador/HomePrestador";
import PainelPrestador from "./Telas/Prestador/PainelPrestador.jsx";
import CadastroPJ from "./Telas/Prestador/CadastroPJ";
import LoginPJ from "./Telas/Prestador/LoginPJ";
import RecuperarSenha from "./Telas/RecuperarSenha";
import NovaSenha from "./Telas/NovaSenha";
import CodigoVerificacao from "./Telas/CodigoVerificacao";
import AnunciarServico from "./Telas/PaginaInicial/AnunciarServico";
import PaginaInicial from "./Telas/PaginaInicial/PaginaInicial";
import PesquisarServico from "./Telas/PaginaInicial/PesquisarServico";
import VisualizarServico from "./Telas/PaginaInicial/VisualizarServico.jsx";
import PerfilPrestador from "./Telas/Prestador/PerfilPrestador.jsx";
import ContaPrestador from "./Telas/Prestador/ContaPrestador.jsx";
import PerfilCliente from "./Telas/Cliente/PerfilCliente.jsx";
import ContaCliente from "./Telas/Cliente/ContaCliente.jsx";
import MeusServicos from "./Telas/Prestador/MeusServicos.jsx";
import Planos from "./Telas/Prestador/Planos.jsx";

export default function App() {
  const Stack = createStackNavigator();
  const [booting, setBooting] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Home");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const raw = await AsyncStorage.getItem("@w4u:user");
        let user = null;
        if (raw) {
          try {
            user = JSON.parse(raw);
          } catch {}
        }
        if (user) {
          // Decide rota inicial com base no tipoUsuario
          const tipo = String(
            user.tipoUsuario || user.tipo || ""
          ).toUpperCase();
          if (tipo.includes("JURID") || user.cnpj) {
            // Prestador: ir direto para lista de seus serviços
            setInitialRoute("MeusServicos");
          } else if (tipo.includes("FIS") || user.cpf) {
            // Cliente: ver listagem de freelancers
            setInitialRoute("PaginaInicial");
          } else {
            setInitialRoute("Home");
          }
        }
      } finally {
        setBooting(false);
      }
    };
    bootstrap();
  }, []);

  if (booting) {
    return (
      <View style={styles.bootContainer}>
        <Image
          source={require("./assets/W4ULoadPrincipal.png")}
          style={styles.bootImage}
        />
        <ActivityIndicator
          size="large"
          color="#6D6FB3"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="HomeCliente" component={HomeCliente} />
        <Stack.Screen name="LoginPF" component={LoginPF} />
        <Stack.Screen name="CadastroPF" component={CadastroPF} />
        <Stack.Screen name="HomePrestador" component={HomePrestador} />
        <Stack.Screen name="LoginPJ" component={LoginPJ} />
        <Stack.Screen name="CadastroPJ" component={CadastroPJ} />
        <Stack.Screen name="PainelPrestador" component={PainelPrestador} />
        <Stack.Screen name="RecuperarSenha" component={RecuperarSenha} />
        <Stack.Screen name="PaginaInicial" component={PaginaInicial} options={{ headerShown: false }} />
        {/* Tela de anúncio permanece registrada para navegação interna apenas de prestadores (guard no componente) */}
        <Stack.Screen
          name="AnunciarServico"
          component={AnunciarServico}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="PesquisarServico" component={PesquisarServico} />
        <Stack.Screen name="VisualizarServico" component={VisualizarServico} />
        <Stack.Screen
          name="PerfilPrestador"
          component={PerfilPrestador}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContaPrestador"
          component={ContaPrestador}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PerfilCliente"
          component={PerfilCliente}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContaCliente"
          component={ContaCliente}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="MeusServicos" component={MeusServicos} />
        <Stack.Screen name="Planos" component={Planos} />
        <Stack.Screen name="NovaSenha" component={NovaSenha} />
        <Stack.Screen name="CodigoVerificacao" component={CodigoVerificacao} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bootContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  bootImage: {
    width: 220,
    height: 220,
    resizeMode: "contain",
  },
});
