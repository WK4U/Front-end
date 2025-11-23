import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser, fetchMyProfile, logout } from '../../Componentes/Api/apis.js';

export default function PerfilCliente({ navigation, route }) {
  const [user, setUser] = useState(null);
  const nome = user?.nome || route?.params?.nome || 'Cliente';
  const foto =
    user?.foto ||
    user?.imagemPerfil ||
    user?.imageUrl ||
    user?.urlFoto ||
    user?.fotoUrl ||
    user?.url_foto ||
    null;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const local = await getCurrentUser();
      if (local) setUser(local);
      try {
        const fresh = await fetchMyProfile();
        if (fresh) setUser(fresh);
      } catch {}
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#4A5B7A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.avatarBox}>
          {foto ? (
            <Image source={{ uri: foto }} style={{ width: 96, height: 96, borderRadius: 48 }} />
          ) : (
            <Ionicons name="person-circle-outline" size={96} color="#9AA6BD" />
          )}
          <Text style={styles.name}>{nome}</Text>
        </View>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ContaCliente', { nome })}>
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
  header: {
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d8dfef',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  avatarBox: { alignItems: 'center', marginBottom: 16 },
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
