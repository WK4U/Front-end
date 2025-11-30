import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser, fetchMyProfile } from '../Api/apis.js';

// Header padrão: botão voltar | home | perfil
export default function HeaderPadrao({
  navigation,
  onBack,
  onHome,
  onProfile,
  hideProfileIcon,
  hideHomeIcon,
  hideBackIcon
}) {
  const [profileUser, setProfileUser] = useState(null);

  const resolveFoto = (user) => {
    if (!user) return null;

    const foto =
      user.foto ||
      user.imagemPerfil ||
      user.imageUrl ||
      user.urlFoto ||
      user.fotoUrl ||
      user.url_foto ||
      null;

    return typeof foto === 'string' ? foto : null;
  };

  const isPrestadorUser = (user) =>
    !!(
      user?.cnpj ||
      user?.tipo === 'PRESTADOR' ||
      user?.perfil === 'PRESTADOR' ||
      (typeof user?.tipoUsuario === 'string' &&
        user?.tipoUsuario.toUpperCase() === 'JURIDICO')
    );

  const getInitial = (user) => {
    const nome = user?.nome || user?.name || user?.fullName;

    if (typeof nome === 'string' && nome.trim().length > 0) {
      return nome.trim().charAt(0).toUpperCase();
    }

    return ''; // evita erro
  };

  const loadUser = useCallback(async () => {
    try {
      const local = await getCurrentUser();
      if (local) {
        setProfileUser(local);

        const hasName = typeof local?.nome === 'string';
        const hasFoto = resolveFoto(local);
        if (hasName && hasFoto) return;
      }

      const remote = await fetchMyProfile();
      if (remote) setProfileUser(remote);
    } catch {
      setProfileUser((prev) => prev || null);
    }
  }, []);

  useEffect(() => {
    loadUser();

    if (navigation && navigation.addListener) {
      const unsubscribe = navigation.addListener('focus', loadUser);
      return unsubscribe;
    }
  }, [navigation, loadUser]);

  const avatarUri = resolveFoto(profileUser);
  const initial = getInitial(profileUser);

  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation?.canGoBack?.()) return navigation.goBack();
    if (navigation?.navigate) return navigation.navigate('PaginaInicial');
  };

  const handleHome = async () => {
    if (onHome) return onHome();
    try {
      const user = profileUser || (await getCurrentUser());
      if (!profileUser && user) setProfileUser(user);

      if (isPrestadorUser(user)) return navigation.navigate('MeusServicos');
      return navigation.navigate('PaginaInicial');
    } catch {
      return navigation.navigate('PaginaInicial');
    }
  };

  const handleProfile = async () => {
    if (onProfile) return onProfile();
    try {
      const user = profileUser || (await getCurrentUser());
      if (!profileUser && user) setProfileUser(user);

      const nome = typeof user?.nome === 'string' ? user.nome : undefined;

      if (isPrestadorUser(user)) {
        return navigation.navigate('PerfilPrestador', { nome });
      }
      return navigation.navigate('PerfilCliente', { nome });
    } catch {
      return navigation.navigate('PerfilCliente');
    }
  };

  return (
    <View style={[styles.row, { marginTop: 32 }]}>
      {!hideBackIcon && (
        <TouchableOpacity onPress={handleBack} style={styles.left} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={28} color="#6D6FB3" />
        </TouchableOpacity>
      )}

      {!hideHomeIcon && (
        <TouchableOpacity onPress={handleHome} style={styles.center} accessibilityLabel="Home">
          <Ionicons name="home" size={36} color="#6D6FB3" />
        </TouchableOpacity>
      )}

      {!hideProfileIcon && (
        <TouchableOpacity onPress={handleProfile} style={styles.right} accessibilityLabel="Perfil">
          <View style={styles.profileCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.profileImage} />
            ) : initial ? (
              <Text style={styles.profileInitial}>{initial}</Text>
            ) : (
              <Ionicons name="person" size={22} color="#586069" />
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 64,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { width: 40, alignItems: 'flex-start' },
  center: { alignItems: 'center', flex: 1 },
  right: { width: 56, alignItems: 'flex-end' },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#6D6FB3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#586069',
  },
});
