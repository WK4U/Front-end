import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './Telas/Home';
import Login from './Telas/Login';
import CadastroUsuario from './Telas/CadastroUsuario';
import RecuperarSenha from './Telas/RecuperarSenha';
import NovaSenha from './Telas/NovaSenha';
import CodigoVerificacao from './Telas/CodigoVerificacao';

export default function App() {

  const Stack= createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name='Home'component={Home}/>
        <Stack.Screen name='Login'component={Login}/>
        <Stack.Screen name='CadastroUsuario'component={CadastroUsuario}/>
        <Stack.Screen name='RecuperarSenha' component={RecuperarSenha}/>
        <Stack.Screen name='NovaSenha' component={NovaSenha}/>
        <Stack.Screen name='CodigoVerificacao' component={CodigoVerificacao}/>
      </Stack.Navigator>
    </NavigationContainer>

  );
}


