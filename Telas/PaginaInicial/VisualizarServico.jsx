import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Linking, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import HeaderPadrao from '../../Componentes/Header/HeaderPadrao';
import { getCurrentUser } from '../../Componentes/Api/apis';
import api from '../../Componentes/Api/apis';

export default function VisualizarServico({ navigation, route }) {
  const incoming = route?.params || {};
  const paramServico = incoming?.servico || incoming?.item || incoming?.postagem || incoming?.data || null;
  const [servico, setServico] = useState(paramServico);
  const [loading, setLoading] = useState(false);
  const [erroCarregar, setErroCarregar] = useState(null);

  // --- LÓGICA DE NOME ---
  let nomeBase = null;
  const tentativasNome = [
    servico?.providerName,
    servico?.nomePrestador,
    servico?.nome,
    servico?.usuario?.nome,
    servico?.prestador?.nome, // Agora o backend manda o perfil completo aqui também
    servico?.raw?.nome,
    'Prestador'
  ];

  for (const tentativa of tentativasNome) {
    if (tentativa && typeof tentativa === 'string' && tentativa.trim().length > 0 && 
        tentativa !== 'Prestador' && tentativa !== servico?.tipoServico) {
      nomeBase = tentativa.trim();
      break;
    }
  }

  const categoriaBase = servico?.providerCargo || servico?.tipoServico || servico?.categoria || 'Categoria do serviço';
  const descricaoBase = servico?.descricao || servico?.descricaoPostagem || servico?.descricaoServico || null;
  const imagemBase = servico?.imageUrl || servico?.providerPhoto || servico?.foto || null;

  // --- LÓGICA DE CONTATO (ATUALIZADA PARA O NOVO BACKEND) ---
  const contato = useMemo(() => {
    // 1. Tenta pegar DIRETAMENTE da raiz (Graças à sua correção no Java)
    let phone = servico?.telefone || servico?.rawDetalhe?.telefone || paramServico?.telefone;
    let email = servico?.email || servico?.rawDetalhe?.email || paramServico?.email;

    // 2. Se por acaso o backend falhar, usamos um fallback (plano B) simples
    if (!phone || !email) {
        const prest = servico?.prestador || servico?.rawDetalhe?.prestador || {};
        // Tenta achar dentro de pessoaJuridica ou fisica
        if (!phone) phone = prest?.pessoaJuridica?.telefone || prest?.pessoaFisica?.telefone || prest?.telefone;
        if (!email) email = prest?.email || prest?.usuario?.email;
    }

    // Sanitiza telefone (Garante +55)
    if (phone) {
      let digits = phone.replace(/[^0-9]/g, '');
      digits = digits.replace(/^0+/, ''); 
      if (digits.length >= 10 && digits.length <= 11) {
         digits = '55' + digits;
      }
      phone = '+' + digits;
    }

    return { phone, email };
  }, [servico, paramServico]);

  // --- EFEITOS ---
  useEffect(() => {
    const unsub = navigation.addListener('focus', async () => {
      const user = await getCurrentUser();
      const isPrestador = !!(user?.cnpj || user?.tipoUsuario === 'JURIDICO');
      // Lógica opcional de redirecionamento
    });
    return unsub;
  }, [navigation]);

  useEffect(() => {
    const fetchDetalhe = async () => {
      if (!paramServico) return;

      const raw = paramServico.raw || {};
      let canonicalId = paramServico.id || paramServico.idPostagem || raw.id || null;
      
      if (!canonicalId) {
         // Tenta achar ID em qualquer lugar
         Object.values(raw).forEach(v => {
             if (!canonicalId && (typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v)))) canonicalId = v;
         });
      }

      if (!canonicalId) return;

      setLoading(true);
      
      // Rotas para tentar buscar os dados frescos (com telefone e email)
      const candidates = [
        `/postagem/${canonicalId}`, // Geralmente a melhor rota
        `/postagem/detalhe/${canonicalId}`,
        `/postagem/get/${canonicalId}`,
      ];

      for (const path of candidates) {
        try {
          const resp = await api.get(path);
          if (resp?.data) {
            console.log(`[VISUALIZAR] Dados atualizados de ${path}`, resp.data);
            
            // Mescla os dados antigos com os novos que chegaram do backend
            setServico(prev => ({
                ...prev,
                ...resp.data, // Aqui vem o { telefone: "...", email: "..." } novo
                rawDetalhe: resp.data,
                // Garante que a foto não suma se o backend mandar null
                imageUrl: resp.data.foto || resp.data.urlFoto || prev?.imageUrl 
            }));
            
            setLoading(false);
            return;
          }
        } catch (e) { /* tenta prox */ }
      }
      setLoading(false);
    };

    fetchDetalhe();
  }, [paramServico]);

  const mensagemPadrao = 'Vi seu serviço no Work For You. Podemos conversar?';
  
  const abrirWhatsApp = () => {
    if (!contato.phone) {
      Alert.alert('Contato', 'Telefone não disponível.');
      return;
    }
    const numero = contato.phone.replace('+', '');
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagemPadrao)}`;
    Linking.openURL(url).catch(() => Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.'));
  };

  const enviarEmail = () => {
    if (!contato.email) {
      Alert.alert('Contato', 'E-mail não disponível.');
      return;
    }
    const url = `mailto:${contato.email}?subject=Contato&body=${encodeURIComponent(mensagemPadrao)}`;
    Linking.openURL(url).catch(() => Alert.alert('Erro', 'Não foi possível abrir o e-mail.'));
  };

  return (
    <View style={styles.page}>
      <HeaderPadrao
        navigation={navigation}
        onProfile={async () => {
             const user = await getCurrentUser();
             // Redireciona para o perfil correto
             const rota = user?.tipoUsuario === 'JURIDICO' || user?.cnpj ? 'PerfilPrestador' : 'PerfilCliente';
             navigation.navigate(rota, { nome: user?.nome });
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.serviceTitle}>{String(categoriaBase)}</Text>

        <Text style={styles.fieldLabel}>Descrição:</Text>
        <View style={styles.descriptionBox}>
          {loading ? (
            <ActivityIndicator size="small" color="#6D6FB3" />
          ) : (
            <Text style={styles.descriptionText}>
              {String(descricaoBase || 'Sem descrição.')}
            </Text>
          )}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Foto de exemplo:</Text>
        <TouchableOpacity style={styles.photoButtonLarge} activeOpacity={1}>
          {imagemBase ? (
            <Image source={{ uri: imagemBase }} style={styles.photoPreviewLarge} />
          ) : (
            <Feather name="camera" size={42} color="#4A5B7A" />
          )}
        </TouchableOpacity>

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Entrar em contato:</Text>
        
        {/* Mostra status dos botões (Visual apenas, não interfere no layout) */}
        <View style={styles.contactsRow}>
          <TouchableOpacity 
            style={[styles.contactBtn, !contato.phone && styles.disabledBtn]} 
            onPress={abrirWhatsApp}
            disabled={!contato.phone}
          >
            <Ionicons name="logo-whatsapp" size={28} color={contato.phone ? "#25D366" : "#ccc"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contactBtn, !contato.email && styles.disabledBtn]} 
            onPress={enviarEmail}
            disabled={!contato.email}
          >
            <Ionicons name="mail-outline" size={28} color={contato.email ? "#4A5B7A" : "#ccc"} />
          </TouchableOpacity>
        </View>
        
        {(!contato.phone && !contato.email && !loading) && (
            <Text style={{textAlign:'center', color:'#999', marginTop:10, fontSize:12}}>
                Nenhum contato informado pelo prestador.
            </Text>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  serviceTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15 },
  fieldLabel: { fontSize: 14, color: '#6b7c93', marginBottom: 8, fontWeight:'600' },
  descriptionBox: {
    borderWidth: 1, borderColor: '#eef2f6', borderRadius: 8, padding: 12, backgroundColor: '#f8f9fb', minHeight: 60
  },
  descriptionText: { fontSize: 15, color: '#394b63', lineHeight: 22 },
  photoButtonLarge: {
    height: 220, borderWidth: 0, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', overflow: 'hidden',
    marginBottom: 10
  },
  photoPreviewLarge: { width: '100%', height: '100%', resizeMode: 'cover' },
  contactsRow: { flexDirection: 'row', gap: 20, marginTop: 10 },
  contactBtn: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#eee',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', 
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  disabledBtn: { opacity: 0.4, backgroundColor: '#f9f9f9', elevation: 0 }
});