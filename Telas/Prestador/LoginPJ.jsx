import { useState } from "react";
import { Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import Estilos from '../../Componentes/Estilos';
import { loginUser, getCurrentUser, logout } from '../../Componentes/Api/apis';
export default function LoginPJ(props){
   
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const Entrar = async () => {
        if (loading) return;
        if (email.trim() === '' || senha.trim() === '') {
            Alert.alert("Atenção", "Preencha e-mail e senha!");
            return;
        }
        setLoading(true);
        try {
            await loginUser(email.trim(), senha.trim());
            const user = await getCurrentUser();
            const tipo = String(user?.tipoUsuario || '').toUpperCase();         
            props.navigation.reset({
                index: 0,
                routes: [{ name: 'MeusServicos' }],
            });
        } catch (err) {
            const msg = typeof err === 'string' ? err : (err?.message || 'Falha no login');
            Alert.alert('Erro no login', String(msg));
        } finally {
            setLoading(false);
        }
    };

    const EsqueceuSenha = () => {
       Alert.alert("Redirecionar para tela de recuperação de senha.");
    };

    return (

        <View style={Estilos.container}>
            <Text style={{ fontSize: 28, color: '#444C55', marginBottom: 12 }}>Login</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 }}>
                <Text style={{ fontSize: 56, fontWeight: 'bold', color: '#444C55' }}>W</Text>
                <Text style={{ fontSize: 56, fontWeight: 'bold', color: '#6D6FB3' }}>4</Text>
                <Text style={{ fontSize: 56, fontWeight: 'bold', color: '#444C55' }}>U</Text>
            </View>

            <TextInput
                style={Estilos.input}
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={Estilos.input}
                placeholder="Senha"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
            />

            <TouchableOpacity
                style={[Estilos.primaryButton, loading && { opacity: 0.6 }]}
                activeOpacity={0.7}
                onPress={Entrar}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={Estilos.buttonTextPrimary}>Entrar</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => props.navigation.navigate('RecuperarSenha')}
                style={{ marginTop: 16 }}
            >
                <Text style={{ color: '#444C55', fontSize: 16 }}>Esqueceu a senha?</Text>
            </TouchableOpacity>
        </View>
    )
}