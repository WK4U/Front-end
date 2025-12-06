import React, { useEffect, useState, useCallback } from 'react';
import { Share, Alert } from 'react-native';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderPadrao from '../../Componentes/Header/HeaderPadrao';
import { listarMeusServicos, getCurrentUser, fetchMyProfile } from '../../Componentes/Api/apis.js';
import * as Linking from 'expo-linking';

export default function MeusServicos({ navigation }) {
    // Avatar do prestador (simples, pode ser aprimorado para buscar foto real)
    const [user, setUser] = useState(null);
    useEffect(() => {
      (async () => {
        let u = await getCurrentUser();
        if (!u) { try { u = await fetchMyProfile(); } catch {} }
        setUser(u);
      })();
    }, []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Garante que somente prestador veja lista; caso não seja, redireciona
      let user = await getCurrentUser();
      if (!user) {
        try { user = await fetchMyProfile(); } catch {}
      }
      const isPrestador = !!(user?.cnpj || /JURIDICO|PRESTADOR|PJ/i.test(String(user?.tipoUsuario || user?.perfil || user?.tipo || '')));
      if (!isPrestador) {
        setItems([]);
        navigation.replace('PaginaInicial');
        return;
      }
      const data = await listarMeusServicos();
      setItems(Array.isArray(data) ? data : (data?.itens || []));
    } catch (e) {
      setError('Não foi possível carregar seus serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Função para formatar categoria legível
  const categoriaLegivel = (cat) =>
    (cat || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          {/* Título: categoria do serviço (tipoServico) */}
          <Text style={styles.cardTitle}>{categoriaLegivel(item?.tipoServico)}</Text>
          {/* Descrição do que o prestador fez */}
          <Text style={styles.cardDesc} numberOfLines={2}>
            {String(item?.descricaoPostagem || item?.descricaoTrabalho || item?.descricao || 'Sem descrição do trabalho')}
          </Text>
          <View style={styles.cardInfoRow}>
            {/* Estrelas de avaliação */}
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, idx) => (
                <Ionicons
                  key={idx}
                  name={idx < (item?.avaliacao || 0) ? 'star' : 'star-outline'}
                  size={18}
                  color="#FFD700"
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
            {/* Status e preço */}
            {item?.preco || item?.valor ? (
              <Text style={styles.cardPreco}>R$ {item?.preco || item?.valor}</Text>
            ) : null}
            <Text style={styles.cardStatus}>
              {item?.ativo === false || item?.status === 'inativo' ? 'Inativo' : 'Ativo'}
            </Text>
          </View>
        </View>
        {/* Ícone/imagem à direita */}
        {item?.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="images-outline" size={32} color="#7D95C9" />
          </View>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.cardActionButton}
          onPress={() => navigation.navigate('AnunciarServico', { editing: true, servico: item })}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.cardActionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardActionButton, { backgroundColor: '#4CAF50', marginLeft: 8 }]}
          onPress={async () => {
            const deepLink = Linking.createURL(`servico/${item.id}`);

            try {
              await Share.share({
                message: `Confira meu serviço no W4U: ${deepLink}`,
                url: deepLink,
                title: 'Meu serviço no W4U',
              });
            } catch (error) {
              Alert.alert('Erro ao compartilhar', error.message);
            }
          }}
        >
          <Ionicons name="share-social-outline" size={18} color="#fff" />
          <Text style={styles.cardActionText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Filtra os serviços pelo texto de busca
  const filteredItems = items.filter((item) => {
    const txt = search.toLowerCase();
    const campo = (v) => (typeof v === "string" ? v.toLowerCase() : "").includes(txt);

    return (
      campo(item?.tipoServico) ||
      campo(item?.descricaoPostagem) ||
      campo(item?.descricaoTrabalho) ||
      campo(item?.descricao)
    );
  });

  return (
    <View style={styles.page}>
      {/* Topo: Título e avatar grande */}
      <View style={styles.headerTopBox}>
        <Text style={styles.headerTitle}>Meus Serviços</Text>
        <TouchableOpacity
          style={styles.avatarBoxTop}
          onPress={() => navigation.navigate('PerfilPrestador', { nome: user?.nome })}
          activeOpacity={0.8}
        >
          {user?.foto ? (
            <Image source={{ uri: user.foto }} style={styles.avatarTop} />
          ) : (
            <Ionicons name="person-circle-outline" size={72} color="#6D6FB3" />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(it, idx) => String(it?.id || idx)}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyBox}>
            <Ionicons name="briefcase-outline" size={28} color="#9AA6BD" />
            <Text style={styles.emptyText}>Você ainda não anunciou serviços.</Text>
          </View>
        ) : null}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={loading ? (
          <View style={{ paddingVertical: 12 }}>
            <Text style={{ textAlign: 'center', color: '#6D6FB3' }}>Carregando...</Text>
          </View>
        ) : null}
      />

      {error ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryButton, loading && { opacity: 0.7 }]}
          disabled={loading}
          onPress={() => navigation.navigate('AnunciarServico', { editing: false })}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size={20} style={{ marginRight: 8 }} />
          ) : <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
          <Text style={styles.primaryButtonText}>{loading ? 'Carregando...' : 'Anunciar serviço'}</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f4',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  cardCategoria: { fontSize: 15, color: '#444', marginBottom: 2 },
  cardDesc: { fontSize: 14, color: '#555', marginBottom: 4 },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  cardStatus: { fontSize: 14, color: '#222', marginLeft: 8 },
  cardPreco: { fontSize: 15, color: '#222', fontWeight: 'bold', marginLeft: 8 },
  thumb: { width: 56, height: 56, borderRadius: 8, marginLeft: 12 },
  thumbPlaceholder: { borderWidth: 1, borderColor: '#c9d3e6', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fb' },
  cardActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6D6FB3',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  cardActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  headerTopBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444C55',
  },
  avatarBoxTop: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTop: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#6D6FB3',
  },
  searchLabel: {
    fontSize: 15,
    color: '#444C55',
    fontWeight: '500',
  },
  searchInput: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6D6FB3',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 15,
    marginBottom: 8,
  },
  emptyBox: { alignItems: 'center', marginTop: 48 },
  emptyText: { marginTop: 8, color: '#6D6FB3' },
  errorBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, backgroundColor: '#ffe5e5' },
  errorText: { textAlign: 'center', color: '#a33' },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f4',
    backgroundColor: '#fff',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6D6FB3',
    borderRadius: 12,
    paddingVertical: 14,
    padding:14,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
