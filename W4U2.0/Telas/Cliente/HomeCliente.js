import { Text, View ,TouchableOpacity, Image, StyleSheet} from "react-native";
import Estilos from '../../Componentes/Estilos';
export default function HomeCliente(props){
   
     const AbrirLogin = () => {
    props.navigation.navigate('LoginPF');
   }

    const AbrirCadastro = () => {
    props.navigation.navigate('CadastroPF');
   }

    return (

        <View style={Estilos.container}>
           <Image
                source= {require('../../assets/W4UP1.png')}
                style= {Estilos.image}
           />

           <TouchableOpacity style= {Estilos.buttonLogin} activeOpacity={0.7} onPress={AbrirLogin}>
                <Text style={Estilos.buttonTextoLogin}>Login</Text>
            </TouchableOpacity>
           
            <TouchableOpacity style= {Estilos.buttonCadastro} activeOpacity={0.7} onPress={AbrirCadastro}>
                <Text style={Estilos.buttonTexto}>Cadastro</Text>
            </TouchableOpacity>

        </View>
    )
}