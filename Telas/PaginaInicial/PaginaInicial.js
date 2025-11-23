import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import Estilos from "../../Componentes/Estilos";
import {
  getCurrentUser,
  listarServicosPublicos,
} from "../../Componentes/Api/apis";
import HeaderPadrao from "../../Componentes/Header/HeaderPadrao";

export default function PaginaInicial(props) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    const unsub = props.navigation.addListener("focus", async () => {
      const user = await getCurrentUser();
      const isPrestador = !!(
        user?.cnpj ||
        user?.tipo === "PRESTADOR" ||
        user?.perfil === "PRESTADOR" ||
        (typeof user?.tipoUsuario === "string" &&
          user?.tipoUsuario.toUpperCase() === "JURIDICO")
      );
      if (isPrestador) {
        // prestador não deve ver listagem de prestadores
        props.navigation.replace("MeusServicos");
      }
    });
    return unsub;
  }, [props.navigation]);
  const AbrirPesquisar = () => {
    props.navigation.navigate("PesquisarServico");
  };

  // Removido para clientes: não pode anunciar serviço
  // const AbrirAnunciar = () => {
  //   props.navigation.navigate("AnunciarServico");
  // };

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 20,
    },
    header: {
      marginTop: 40,
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#333",
    },
    searchBox: {
      height: 44,
      borderWidth: 1,
      borderColor: "#c9d3e6",
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: "#fff",
      marginBottom: 16,
    },
    freelancerContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 10,
    },
    freelancerCard: {
      width: "48%",
      backgroundColor: "#fff",
      borderRadius: 15,
      padding: 15,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    profileImage: {
      width: "100%",
      height: 120,
      borderRadius: 10,
      marginBottom: 10,
    },
    freelancerName: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 5,
    },
    freelancerRole: {
      fontSize: 14,
      color: "#666",
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 20,
      backgroundColor: "#154360",
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    fabText: {
      fontSize: 24,
      color: "#fff",
    },
  });

  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = async () => {
    setLoading(true);
    setErro(null);
    try {
      const lista = await listarServicosPublicos();
      setServicos(lista);
      // Debug: loga primeiro item bruto se nome ainda for fallback
      try {
        const first = lista.find((l) => l.providerName === "Prestador");
        if (first && first.raw && __DEV__) {
          console.log("[DEBUG prestador faltando nome raw]:", first.raw);
          console.log("[DEBUG chaves raw]:", Object.keys(first.raw || {}));
        }
      } catch {}
    } catch (e) {
      setErro(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const q = (query || "").toLowerCase();
    if (!q) return servicos;
    return servicos.filter((s) => {
      const alvo = `${s.preview || ""} ${s.providerName || ""} ${
        s.providerCargo || ""
      } ${s.nomeServico || ""} ${s.tipoServico || ""} ${
        s.descricao || ""
      }`.toLowerCase();
      return alvo.includes(q);
    });
  }, [query, servicos]);

  return (
    <View style={styles.mainContainer}>
      <HeaderPadrao navigation={props.navigation} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Prestadores</Text>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Pesquisar por nome ou categoria"
          style={styles.searchBox}
          returnKeyType="search"
        />

        {erro && (
          <Text style={{ color: "red", marginHorizontal: 10 }}>
            Erro: {erro}
          </Text>
        )}
        <View style={styles.freelancerContainer}>
          {loading ? (
            <Text style={{ textAlign: "center", width: "100%" }}>
              Carregando...
            </Text>
          ) : filtrados.length === 0 ? (
            <Text style={{ textAlign: "center", width: "100%" }}>
              Nenhum serviço encontrado.
            </Text>
          ) : (
            filtrados.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.freelancerCard}
                onPress={() =>
                  props.navigation.navigate("VisualizarServico", {
                    servico: item, // envia objeto completo
                  })
                }
              >
                <Image
                  source={
                    item.providerPhoto
                      ? { uri: item.providerPhoto }
                      : require("../../assets/profile3.png")
                  }
                  style={styles.profileImage}
                />
                <Text style={styles.freelancerName}>{item.providerName}</Text>
                <Text style={styles.freelancerRole}>
                  {item.preview || item.providerCargo}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB removido para perfil de cliente (somente visualização) */}
    </View>
  );
}
