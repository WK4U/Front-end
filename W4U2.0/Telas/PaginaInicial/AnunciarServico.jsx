import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    Modal,        
    Button,        
    Image,
    ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { Feather, Ionicons } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker'; 
import Foto from '../Foto/Foto.jsx'; 
import { anunciarServico } from "../../Componentes/Api/apis.js";

export default function AnunciarServico() {
    const [categoria, setCategoria] = useState('');
    const [descricao, setDescricao] = useState('');
    const [modalVisible, setModalVisible] = useState(false); 
    const [photoUri, setPhotoUri] = useState(null); 
    const [loading, setLoading] = useState(false); 

    const servicos = [
        { label: 'Selecione um trabalho...', value: '' },
        { label: 'Elétrica', value: 'eletrica' },
        { label: 'Hidráulica', value: 'hidraulica' },
        { label: 'Jardinagem', value: 'jardinagem' },
        { label: 'Pintura', value: 'pintura' },
        { label: 'Encanamento', value: 'encanamento' }, 
    ];

    const handlePhotoCapture = (fotoData) => {
        setPhotoUri(fotoData.uri); 
        setModalVisible(false); 
        console.log("Foto de serviço capturada! URI:", fotoData.uri);
    };

    const handleGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão Negada',
                'Precisamos de permissão para acessar a sua galeria de fotos.'
            );
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoUri(result.assets[0].uri);
            console.log("Foto de serviço da galeria selecionada! URI:", result.assets[0].uri);
        } else {
            console.log("Seleção de imagem cancelada ou falhou.");
        }
    };

    const handleTakePhoto = () => {
        setModalVisible(true);
    };

    const handleAnunciar = async () => { 
        // 1. Validações
        if (!categoria.trim() || !descricao.trim()) {
            Alert.alert("Erro", "Por favor, preencha a categoria e a descrição.");
            return;
        }
        if (categoria === '') {
             Alert.alert("Erro", "Por favor, selecione uma categoria válida.");
             return;
        }
        if (!photoUri) {
            Alert.alert("Erro", "Por favor, adicione uma foto de exemplo do serviço.");
            return;
        }
       

        setLoading(true); 

        try {
            const result = await anunciarServico(categoria, descricao, photoUri);
            
            Alert.alert("Sucesso", "Serviço anunciado com sucesso!");
            
            setCategoria('');
            setDescricao('');
            setPhotoUri(null);

        } catch (error) {
            let errorMessage = "Não foi possível completar a requisição. Tente novamente.";

            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message; 
            } else if (error.message.includes('Network Error')) {
                errorMessage = "Erro de conexão. Verifique se o servidor está ativo (192.168.1.2:8081).";
            }
                
            Alert.alert("Falha no Anúncio", errorMessage);
        } finally {
            setLoading(false); 
        }
    };
    
    return (
        <View style={styles.container}>
            
            <Text style={styles.title}>Anunciar serviço</Text>

            <Text style={styles.label}>Categoria do serviço:</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={categoria}
                    onValueChange={(itemValue) => setCategoria(itemValue)}
                    style={styles.pickerStyle}
                >
                    {servicos.map((item, index) => (
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
            
            <Text style={styles.label}>Descrição:</Text>
            <TextInput
                style={styles.descriptionInput}
                multiline={true}
                maxLength={150}
                placeholder=""
                value={descricao}
                onChangeText={setDescricao}
                textAlignVertical="top" 
            />
            <Text style={styles.charCount}>Caracteres máx: {150 - descricao.length}</Text>

            <Text style={[styles.label, styles.photoLabel]}>Foto de exemplo do serviço:</Text>
            
            <View style={styles.photoBox}>
                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.serviceImage} />
                ) : (
                    <Feather name="camera" size={40} color="#777" />
                )}
            </View>
            
            <View style={styles.photoActionContainer}>
                <TouchableOpacity 
                    style={styles.photoActionButton}
                    onPress={handleGallery} 
                    disabled={loading} 
                >
                    <Text style={styles.actionButtonText}>Enviar da galeria</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.photoActionButton}
                    onPress={handleTakePhoto}
                    disabled={loading} 
                >
                    <Text style={styles.actionButtonText}>Tirar foto</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={[styles.announceButton, loading && styles.announceButtonDisabled]}
                onPress={handleAnunciar}
                disabled={loading} 
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.announceButtonText}>Anunciar</Text>
                )}
            </TouchableOpacity>
            
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Foto 
                    onDadosRecebidos={handlePhotoCapture} 
                />
                <Button 
                    title="Cancelar e Voltar" 
                    onPress={() => setModalVisible(false)} 
                />
            </Modal>

        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 25,
        paddingTop: 50, 
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        marginTop: 10, 
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    pickerWrapper: {
        width: '100%',
        height: 48, 
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 5,
        justifyContent: 'center',
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative', 
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
    descriptionInput: {
        width: '100%',
        height: 120,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    charCount: {
        fontSize: 12,
        color: '#777',
        alignSelf: 'flex-end',
        marginTop: 5,
        marginBottom: 30,
    },
    photoLabel: {
        marginBottom: 15,
    },
    photoBox: {
        width: '100%',
        height: 150,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 10,
        borderStyle: 'solid', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
    },
    serviceImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    photoActionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    photoActionButton: {
        width: '48%',
        height: 40,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: '#555',
    },
    announceButton: {
        backgroundColor: '#7D95C9', 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    announceButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    announceButtonDisabled: {
        backgroundColor: '#a8b9dd', 
    },
});
