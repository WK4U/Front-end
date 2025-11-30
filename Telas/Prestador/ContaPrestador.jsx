import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { editProfile, getCurrentUser, fetchMyProfile } from '../../Componentes/Api/apis.js';
import * as ImagePicker from 'expo-image-picker';
import Foto from '../Foto/Foto.jsx';
import { MaskedTextInput } from 'react-native-mask-text';
import { somenteDigitos } from '../../Componentes/Utils/validacao';
import HeaderPadrao from '../../Componentes/Header/HeaderPadrao';

export default function ContaPrestador({ navigation, route }) {
    // Debug: logar tipos dos campos críticos
    console.log('[ContaPrestador] Tipo nome:', typeof nome, nome);
    console.log('[ContaPrestador] Tipo telefone:', typeof telefone, telefone);
    console.log('[ContaPrestador] Tipo cnpj:', typeof cnpj, cnpj);
    console.log('[ContaPrestador] Tipo email:', typeof email, email);
    console.log('[ContaPrestador] Tipo previewFoto:', typeof previewFoto, previewFoto);
  const [nome, setNome] = useState(route?.params?.nome || '');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [previewFoto, setPreviewFoto] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      let rawUser = await getCurrentUser();
      if (!rawUser) {
        try { rawUser = await fetchMyProfile(); } catch {}
      }
      // LOG para inspecionar dados do usuário
      console.log('[ContaPrestador] Dados do usuário carregados:', rawUser);
      // Se não for prestador, não faz nada (não redireciona)
      const fillFromUser = (user) => {
        if (!user) return;
        setNome(user.nome || '');
        // Se vier do backend, já formatado, não formata novamente
        setTelefone(user.telefone ? formatTelefone(user.telefone) : '');
        setEmail(user.email || '');
        setCnpj(formatCnpj(user.cnpj));
        const foto = resolveFoto(user);
        setPreviewFoto(foto);
      };

      fillFromUser(rawUser);
      try {
        const fresh = await fetchMyProfile();
        if (fresh) fillFromUser(fresh);
      } catch {}
    };
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const resolveFoto = (user) => {
    if (!user) return null;
    return (
      user.foto ||
      user.imagemPerfil ||
      user.imageUrl ||
      user.urlFoto ||
      user.fotoUrl ||
      user.url_foto ||
      null
    );
  };

  const formatTelefone = (value) => {
    const digits = somenteDigitos(value);
    if (!digits) return '';
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCnpj = (value) => {
    const digits = somenteDigitos(value);
    if (!digits) return '';
    if (digits.length !== 14) return value || '';
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handlePhotoCapture = (data) => {
    if (data?.uri) {
      const filename = data.fileName || data.filename || data.uri.split('/').pop() || 'foto.jpg';
      const type = data.type || 'image/jpeg';
      setPhoto({ uri: data.uri, name: filename, type });
      setPreviewFoto(data.uri);
    }
    setCameraOpen(false);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para alterar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const filename = asset.fileName || asset.uri.split('/').pop() || 'foto.jpg';
      const type = asset.type || 'image/jpeg';
      setPhoto({ uri: asset.uri, name: filename, type });
      setPreviewFoto(asset.uri);
    }
  };

  const salvar = async () => {
    if (senha && senha !== confirmar) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    try {
        setLoading(true);
        const payload = { nome, email };
        // Envia o telefone como está no campo, sem formatação extra
        const telefoneLimpo = somenteDigitos(telefone);
        if (telefoneLimpo) payload.telefone = telefoneLimpo;
        const cnpjLimpo = somenteDigitos(cnpj);
        if (cnpjLimpo) payload.cnpj = cnpjLimpo;
        if (senha) payload.senha = senha;
        console.log('[SALVAR] Payload enviado:', payload);
        await editProfile(payload, photo || undefined);
        try { await fetchMyProfile(); } catch {}
        setPhoto(null);
        Alert.alert('Sucesso', 'Dados atualizados.');
        navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', e?.response?.data?.message || e.message || 'Falha ao atualizar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={{ paddingTop: 42 }}>
        <HeaderPadrao navigation={navigation} hideProfileIcon={true} hideHomeIcon={true} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.avatarBox}>
          {previewFoto ? (
            <Image source={{ uri: String(previewFoto) }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={96} color="#9AA6BD" />
          )}
          <Text style={{ fontSize: 20, color: '#444C55', fontWeight: '500', marginTop: 8, marginBottom: 16, textAlign: 'center' }}>{String(nome ?? '')}</Text>
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => setCameraOpen(true)}>
              <Ionicons name="camera" size={18} color="#2c3e50" />
              <Text style={styles.photoBtnText}>{String('Usar câmera')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
              <Ionicons name="image" size={18} color="#2c3e50" />
              <Text style={styles.photoBtnText}>{String('Galeria')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={String(nome ?? '')} onChangeText={setNome} />

        <Text style={styles.label}>Telefone</Text>
        <MaskedTextInput
          style={styles.input}
          value={String(telefone ?? '')}
          onChangeText={(masked) => setTelefone(masked)}
          keyboardType="phone-pad"
          mask="(99) 99999-9999"
        />

        <Text style={styles.label}>CNPJ</Text>
        <MaskedTextInput
          style={styles.input}
          value={String(cnpj ?? '')}
          mask="99.999.999/9999-99"
          editable={true}
          onChangeText={setCnpj}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={String(email ?? '')} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />

        <Text style={styles.label}>Confirmar senha</Text>
        <TextInput style={styles.input} value={confirmar} onChangeText={setConfirmar} secureTextEntry />

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} disabled={loading} onPress={salvar}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
          ) : null}
          <Text style={styles.btnText}>{loading ? 'Carregando...' : 'Confirmar alterações'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={cameraOpen} animationType="slide" onRequestClose={() => setCameraOpen(false)}>
        <Foto onDadosRecebidos={handlePhotoCapture} />
        <TouchableOpacity style={styles.modalClose} onPress={() => setCameraOpen(false)}>
          <Text style={styles.modalCloseText}>Cancelar</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d8dfef',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 28, // Espaço extra do topo
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  label: { fontSize: 13, color: '#6b7c93', marginBottom: 6 },
  input: {
    height: 44, borderWidth: 1, borderColor: '#c9d3e6', borderRadius: 10,
    paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#fff'
  },
  readOnly: {
    backgroundColor: '#f2f4fb',
    color: '#5c6880',
  },
  btn: {
    marginTop: 8, backgroundColor: '#6D6FB3', height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center'
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  avatarBox: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 28, // Espaço extra do topo do conteúdo
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c9d3e6',
    backgroundColor: '#f4f7ff',
    marginHorizontal: 6,
  },
  photoBtnText: {
    color: '#2c3e50',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalClose: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  modalCloseText: {
    color: '#7D95C9',
    fontSize: 16,
    fontWeight: '600',
  },
});
