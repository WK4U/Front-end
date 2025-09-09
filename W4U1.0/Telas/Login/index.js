import { useState } from "react";
import { Text, View ,TouchableOpacity, Image, StyleSheet,  TextInput, Alert} from "react-native";
import Estilos from '../../Componentes/Estilos';
export default function Login(props){
   
      const [email, setEmail] = useState('');
      const [senha, setSenha] = useState('');

      const Entrar = () => {
        if (email.trim() === '' || senha.trim() === '') {
           Alert.alert("Preencha e-mail e senha!");
            return;
        }
        props.navigation.navigate('Home');
    };

    const EsqueceuSenha = () => {
       Alert.alert("Redirecionar para tela de recuperação de senha.");
    };

    return (

        <View style={Estilos.container}>
           <Image
                source= {require('../../assets/W4UP1.png')}
                style= {Estilos.image}    
           />
             <Text style={{ 
                fontSize: 28, 
                fontWeight: 'Arial', 
                marginBottom: 20 
             }}>
                Login
            </Text>

             <TextInput
                style={{
                    width: '90%',
                    height: 50,
                    borderColor: '#000',
                    borderWidth: 2,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    marginBottom: 15,
                    fontSize: 18,
                    backgroundColor: '#fff'
                }}
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={{
                    width: '90%',
                    height: 50,
                    borderColor: '#000',
                    borderWidth: 2,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    marginBottom: 15,
                    fontSize: 18,
                    backgroundColor: '#fff'
                }}
                placeholder="Senha"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
            />
             <TouchableOpacity 
                style={Estilos.buttonCadastro} 
                activeOpacity={0.7} 
                onPress={Entrar}
            >
                <Text style={Estilos.buttonTexto}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => props.navigation.navigate('RecuperarSenha')}
                style={{ marginTop: 10 }}
            >
                <Text style={{ color: '#007BFF', fontSize: 16 }}>
                        Esqueceu a senha?
                </Text>
            </TouchableOpacity>

        </View>
    )
}