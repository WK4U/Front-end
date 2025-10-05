import { Text, View ,TouchableOpacity, Image, StyleSheet} from "react-native";
import Estilos from '../../Componentes/Estilos';
export default function PaginaInicial(props){
   
     const AbrirPesquisar = () => {
    props.navigation.navigate('PesquisarServico');
   }

    const AbrirAnunciar = () => {
    props.navigation.navigate('AnunciarServico');
   }

    return (

        <View style={Estilos.container}>
           <Image
                source= {require('../../assets/W4UP1.png')}
                style= {Estilos.image}
           />

           <TouchableOpacity style= {Estilos.buttonLogin} activeOpacity={0.7} onPress={AbrirPesquisar}>
                <Text style={Estilos.buttonTextoLogin}>Pesquisar Serviços</Text>
            </TouchableOpacity>
           
            <TouchableOpacity style= {Estilos.buttonLogin} activeOpacity={0.7} onPress={AbrirAnunciar}>
                <Text style={Estilos.buttonTextoLogin}>Anunciar Serviço</Text>
            </TouchableOpacity>

        </View>
    )
}