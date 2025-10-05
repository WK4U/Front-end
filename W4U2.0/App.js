import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './Telas/Home';
import CadastroPF from './Telas/Cliente/CadastroPF';
import LoginPF from './Telas/Cliente/LoginPF';
import HomeCliente from './Telas/Cliente/HomeCliente';
import HomePrestador from './Telas/Prestador/HomePrestador';
import CadastroPJ from './Telas/Prestador/CadastroPJ';
import LoginPJ from './Telas/Prestador/LoginPJ';
import RecuperarSenha from './Telas/RecuperarSenha';
import NovaSenha from './Telas/NovaSenha';
import CodigoVerificacao from './Telas/CodigoVerificacao';
import AnunciarServico from './Telas/PaginaInicial/AnunciarServico';
import PaginaInicial from './Telas/PaginaInicial/PaginaInicial';
import PesquisarServico from './Telas/PaginaInicial/PesquisarServico';

export default function App() {

  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name='Home' component={Home} />
        <Stack.Screen name='HomeCliente' component={HomeCliente} />
        <Stack.Screen name='LoginPF' component={LoginPF} />
        <Stack.Screen name='CadastroPF' component={CadastroPF} />
        <Stack.Screen name='HomePrestador' component={HomePrestador} />
        <Stack.Screen name='LoginPJ' component={LoginPJ} />
        <Stack.Screen name='CadastroPJ' component={CadastroPJ} />
        <Stack.Screen name='RecuperarSenha' component={RecuperarSenha} />
        <Stack.Screen name='PaginaInicial' component={PaginaInicial} />
        <Stack.Screen name='AnunciarServico' component={AnunciarServico} />
        <Stack.Screen name='PesquisarServico' component={PesquisarServico} />
        <Stack.Screen name='NovaSenha' component={NovaSenha} />
        <Stack.Screen name='CodigoVerificacao' component={CodigoVerificacao} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}


