import React, { useState, useMemo } from 'react';
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

const mockCategorias = [
    { label: 'Selecione uma Categoria...', value: '' },
    { label: 'Pedreiro', value: 'pedreiro' },
    { label: 'Manicure', value: 'manicure' },
    { label: 'Eletricista', value: 'eletricista' },
    { label: 'Encanador', value: 'encanador' },
    { label: 'Jardineiro', value: 'jardineiro' },
];

const mockServicos = [
    { id: 'a', descricao: 'João Silva - Excelente pedreiro com 10 anos de experiência.', avaliacao: 5, categoria: 'pedreiro' },
    { id: 'b', descricao: 'Maria Souza - Serviços de alvenaria e revestimento em geral.', avaliacao: 4, categoria: 'pedreiro' },
    { id: 'c', descricao: 'Luiza Ferreira - Manicure e pedicure de alta qualidade em domicílio.', avaliacao: 5, categoria: 'manicure' },
    { id: 'd', descricao: 'Ana Paula - Profissional certificado para instalações elétricas.', avaliacao: 5, categoria: 'eletricista' },
    { id: 'e', descricao: 'Pedro Rocha - Especialista em pequenos reparos e reformas rápidas.', avaliacao: 3, categoria: 'pedreiro' },
    { id: 'f', descricao: 'Carlos Gomes - Soluções rápidas para problemas hidráulicos.', avaliacao: 4, categoria: 'encanador' },
];

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
    
    const servicosFiltrados = useMemo(() => {
        if (!categoriaSelecionada) {
            return mockServicos; 
        }
        return mockServicos.filter(servico => servico.categoria === categoriaSelecionada);
    }, [categoriaSelecionada]);


    return (
        <View style={styles.mainContainer}>
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert("Navegação", "Navegar para Home")}>
                    <Ionicons name="home" size={28} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert("Navegação", "Navegar para Perfil")}>
                    <Ionicons name="person-circle" size={30} color="#555" />
                </TouchableOpacity>
            </View>

            <Text style={styles.pageTitle}>Pesquisar</Text>

            <View style={styles.dropdownWrapper}>
                <Picker
                    selectedValue={categoriaSelecionada}
                    onValueChange={(itemValue) => setCategoriaSelecionada(itemValue)}
                    style={styles.pickerStyle}
                >
                    {mockCategorias.map((item, index) => (
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

            {servicosFiltrados.length > 0 ? (
                <FlatList
                    data={servicosFiltrados}
                    renderItem={({ item }) => <ItemServico item={item} />}
                    keyExtractor={item => item.id}
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