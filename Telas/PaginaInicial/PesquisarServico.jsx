import React, { useState, useMemo, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    FlatList,
    Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { Ionicons, FontAwesome } from '@expo/vector-icons'; 
import HeaderPadrao from '../../Componentes/Header/HeaderPadrao';
import { getCurrentUser, listarServicosPublicos } from '../../Componentes/Api/apis';

// Dados serão carregados dinamicamente

const EstrelasAvaliacao = ({ rating }) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
        estrelas.push(
            <FontAwesome
                key={i}
                name={i <= rating ? 'star' : 'star-o'}
                size={20}
                color="#FDD835" 
                style={{ marginHorizontal: 1 }}
            />
        );
    }
    return <View style={styles.avaliacaoContainer}>{estrelas}</View>;
};

const ItemServico = ({ item }) => (
    <TouchableOpacity style={styles.serviceBox} activeOpacity={0.7}>
        <View style={styles.serviceContent}>
            <View style={styles.iconContainer}>
                <FontAwesome name="wrench" size={30} color="#7D95C9" /> 
                <View style={styles.hammerHandle} />
            </View>
            
            <View style={styles.infoContainer}>
                <EstrelasAvaliacao rating={item.avaliacao} />
                <Text style={styles.descricaoText} numberOfLines={2}>
                    {item.descricao}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default function PesquisarServico(props) {
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
    const [servicos, setServicos] = useState([]);
    const [categorias, setCategorias] = useState([{ label: 'Selecione uma Categoria...', value: '' }]);
    const [erro, setErro] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const unsub = props.navigation.addListener('focus', async () => {
            const user = await getCurrentUser();
            const isPrestador = !!(
                user?.cnpj ||
                user?.tipo === 'PRESTADOR' ||
                user?.perfil === 'PRESTADOR' ||
                (typeof user?.tipoUsuario === 'string' && user?.tipoUsuario.toUpperCase() === 'JURIDICO')
            );
            if (isPrestador) {
                // Prestador não acessa pesquisa de prestadores
                props.navigation.replace('MeusServicos');
            }
        });
        return unsub;
    }, [props.navigation]);
    
    const carregar = async () => {
        setLoading(true); setErro(null);
        try {
            const lista = await listarServicosPublicos();
            setServicos(lista);
            const tipos = [...new Set(lista.map(l => l.tipoServico).filter(Boolean))];
            setCategorias([{ label: 'Selecione uma Categoria...', value: '' }, ...tipos.map(t => ({ label: t, value: t }))]);
        } catch (e) {
            setErro(String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregar(); }, []);

    const servicosFiltrados = useMemo(() => {
        if (!categoriaSelecionada) return servicos;
        return servicos.filter(s => s.tipoServico === categoriaSelecionada);
    }, [categoriaSelecionada, servicos]);


    return (
        <View style={styles.mainContainer}>
                <HeaderPadrao navigation={props.navigation} />

                <Text style={styles.pageTitle}>Pesquisar</Text>

            <View style={styles.dropdownWrapper}>
                <Picker
                    selectedValue={categoriaSelecionada}
                    onValueChange={(itemValue) => setCategoriaSelecionada(itemValue)}
                    style={styles.pickerStyle}
                >
                    {categorias.map((item, index) => (
                        <Picker.Item 
                            key={index} 
                            label={item.label} 
                            value={item.value} 
                            color={item.value === '' ? '#999' : '#000'}
                        />
                    ))}
                </Picker>
                <View style={styles.pickerIcon}>
                    <Ionicons name="chevron-down" size={20} color="#555" />
                </View>
            </View>

            {erro && <Text style={styles.emptyMessage}>Erro: {erro}</Text>}
            {loading ? (
                <Text style={styles.emptyMessage}>Carregando...</Text>
            ) : servicosFiltrados.length > 0 ? (
                <FlatList
                    data={servicosFiltrados}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity activeOpacity={0.7}
                                                onPress={() => props.navigation.navigate('VisualizarServico', { servico: item })}
                                            >
                                                <ItemServico item={{
                                                    id: item.id,
                                                    descricao: `${item.providerName ? item.providerName : 'Prestador'}${item.providerCargo ? ' - ' + item.providerCargo : ''}`,
                                                    avaliacao: 5,
                                                    categoria: item.tipoServico
                                                }} />
                                            </TouchableOpacity>
                                        )}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <Text style={styles.emptyMessage}>Nenhum prestador encontrado para esta categoria.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50, 
        paddingHorizontal: 25,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    dropdownWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 30,
        overflow: 'hidden',
        position: 'relative',
        height: 48,
    },
    pickerStyle: {
        height: 48,
        width: '100%',
    },
    pickerIcon: { 
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -10 }], 
        pointerEvents: 'none', 
    },
    emptyMessage: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#777',
    },
    listContainer: {
        paddingBottom: 20,
    },
    serviceBox: {
        backgroundColor: '#f0f0f0', 
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eee', 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        position: 'relative',
    },
    hammerHandle: {
        position: 'absolute',
        bottom: 5,
        width: 8,
        height: 20,
        backgroundColor: '#333',
        transform: [{ rotate: '45deg' }],
        borderRadius: 2,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    avaliacaoContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    descricaoText: {
        fontSize: 16,
        color: '#333',
    },
});