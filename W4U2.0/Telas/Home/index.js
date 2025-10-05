import { Text, View ,TouchableOpacity, Image, StyleSheet} from "react-native";
import Estilos from '../../Componentes/Estilos';
export default function Home(props){
   
     const AbrirPrestador = () => {
    props.navigation.navigate('HomePrestador');
   }

    const AbrirCliente = () => {
    props.navigation.navigate('HomeCliente');
   }

    return (

        <View style={Estilos.container}>
           <Image
                source= {require('../../assets/W4UP1.png')}
                style= {Estilos.image}
           />

           <TouchableOpacity style= {Estilos.buttonLogin} activeOpacity={0.7} onPress={AbrirPrestador}>
                <Text style={Estilos.buttonTextoLogin}>Prestador</Text>
            </TouchableOpacity>
           
            <TouchableOpacity style= {Estilos.buttonCadastro} activeOpacity={0.7} onPress={AbrirCliente}>
                <Text style={Estilos.buttonTexto}>Cliente</Text>
            </TouchableOpacity>

        </View>
    )
}