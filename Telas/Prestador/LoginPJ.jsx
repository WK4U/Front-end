import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import Estilos from '../../Componentes/Estilos';
import { loginUser, getCurrentUser, logout } from '../../Componentes/Api/apis';
export default function LoginPJ(props){
    const [bloqueado, setBloqueado] = useState(false);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tipoUsuarioGlobal = global.w4uTipoUsuario && String(global.w4uTipoUsuario).toUpperCase();
        if (tipoUsuarioGlobal && tipoUsuarioGlobal.includes("FIS")) {
            Alert.alert(
                "Atenção",
                "Seu perfil é de cliente. Por favor, acesse o login do cliente para entrar."
            );
            setBloqueado(true);
        }
    }, []);

    if (bloqueado) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <Text style={{ color: '#c0392b', fontSize: 18, textAlign: 'center', margin: 24 }}>
                    Seu perfil é de cliente. Por favor, acesse o login do cliente para entrar.
                </Text>
            </View>
        );
    }

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
            // Log detalhado para inspecionar dados do usuário
            console.log('[LoginPJ] Dados do usuário após login:', user);
            const tipo = String(user?.tipoUsuario || '').toUpperCase();
            if (tipo === 'FISICO' || user?.cpf) {
                Alert.alert(
                    'Acesso negado',
                    'Seu perfil é de cliente. Por favor, acesse o login do cliente para entrar.'
                );
                setBloqueado(true);
                return;
            }
            if (tipo === 'JURIDICO' || user?.cnpj) {
                props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'MeusServicos' }],
                });
            } else {
                props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'PaginaInicial' }],
                });
            }
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