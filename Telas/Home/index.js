import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import Estilos from "../../Componentes/Estilos";

export default function Home(props) {
  const AbrirPrestador = () => {
    props.navigation.navigate("HomePrestador");
  };

  const AbrirCliente = () => {
    props.navigation.navigate("HomeCliente");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 20,
      justifyContent: "center",
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "baseline",
      alignSelf: "center",
      marginBottom: 24,
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 25,
      marginVertical: 10,
      width: "92%",
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    cardTitle: {
      fontSize: 26,
      color: "#444C55",
      marginBottom: 10,
      textAlign: "center",
    },
    cardText: {
      fontSize: 18,
      color: "#6B6F74",
      textAlign: "center",
    },
    profileIconContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 15,
    },
    profileIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginHorizontal: 5,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#ccc",
      marginHorizontal: 2,
    },
    dotContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 10,
    },
  });

  return (
    <View style={styles.container}>
      {/* Marca W4U no padrão do app */}
      <View style={styles.brandRow}>
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

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={AbrirCliente}
      >
        <View style={styles.profileIconContainer}>
          <Image
            source={require("../../assets/profile-icon1.png")}
            style={styles.profileIcon}
          />
          <View style={styles.dotContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
        <Text style={styles.cardText}>Eu quero contratar</Text>
        <Text style={styles.cardTitle}>Serviços</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={AbrirPrestador}
      >
        <Text style={styles.cardText}>Eu quero trabalhar como</Text>
        <Text style={styles.cardTitle}>Prestador</Text>
        <View style={styles.profileIconContainer}>
          <View style={styles.dotContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Image
            source={require("../../assets/profile-icon2.png")}
            style={styles.profileIcon}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
