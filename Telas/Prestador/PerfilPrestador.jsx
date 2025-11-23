import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderPadrao from '../../Componentes/Header/HeaderPadrao';
import { getCurrentUser, fetchMyProfile, logout } from '../../Componentes/Api/apis.js';

export default function PerfilPrestador({ navigation, route }) {
  const [user, setUser] = useState(null);
  const nome = user?.nome || route?.params?.nome || 'Prestador';
  const resolveFoto = useCallback((value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return (
        value.url ||
        value.href ||
        value.link ||
        value.downloadUrl ||
        value.secure_url ||
        null
      );
    }
    return null;
  }, []);
  const foto = resolveFoto(
    user?.foto ||
      user?.imagemPerfil ||
      user?.imageUrl ||
      user?.urlFoto ||
      user?.fotoUrl ||
      user?.url_foto
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      // tenta local primeiro
      const local = await getCurrentUser();
      if (local) setUser((current) => current || local);
      // atualiza do backend silenciosamente
      try {
        const fresh = await fetchMyProfile();
        if (fresh) setUser(fresh);
      } catch {}
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.page}>
      <HeaderPadrao
        navigation={navigation}
        onProfile={() => navigation.navigate('ContaPrestador', { nome })}
      />

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.avatarBox}>
          {foto ? (
            <Image source={{ uri: foto }} style={{ width: 96, height: 96, borderRadius: 48 }} />
          ) : (
            <Ionicons name="person-circle-outline" size={96} color="#9AA6BD" />
          )}
          <TouchableOpacity style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.name}>{nome}</Text>
        </View>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('MeusServicos')}>
          <Text style={styles.itemText}>Serviços anunciados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ContaPrestador', { nome })}>
          <Text style={styles.itemText}>Editar Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => {}}>
          <Text style={styles.itemText}>Privacidade</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Planos')}>
          <Text style={styles.itemText}>Planos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.item, styles.logout]} onPress={async () => {
          await logout();
          // Após logout, retornar à tela inicial principal
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }}>
          <Text style={[styles.itemText, styles.logoutText]}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  // header handled by HeaderPadrao
  avatarBox: { alignItems: 'center', marginBottom: 16 },
  cameraBadge: {
    position: 'absolute', bottom: 28, right: 135,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#7D95C9', alignItems: 'center', justifyContent: 'center'
  },
  name: { marginTop: 8, fontSize: 16, color: '#2c3e50' },
  item: {
    borderWidth: 1, borderColor: '#e2e8f4', borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12,
    backgroundColor: '#fff'
  },
  itemText: { fontSize: 15, color: '#2c3e50' },
  logout: { borderColor: '#ffdddd', backgroundColor: '#fff5f5' },
  logoutText: { color: '#c0392b', fontWeight: '600' }
});
