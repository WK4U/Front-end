import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Linking, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import HeaderPadrao from '../../Componentes/Header/HeaderPadrao';
import { getCurrentUser } from '../../Componentes/Api/apis';
import api from '../../Componentes/Api/apis';

export default function VisualizarServico({ navigation, route }) {
  // Aceita múltiplas chaves possíveis vindas de diferentes telas
  const incoming = route?.params || {};
  const paramServico = incoming?.servico || incoming?.item || incoming?.postagem || incoming?.data || null;
  const [servico, setServico] = useState(paramServico);
  const [loading, setLoading] = useState(false);
  const [erroCarregar, setErroCarregar] = useState(null);
  const nomeBase = servico?.providerName || servico?.nomeServico || servico?.nome || servico?.titulo || 'Profissional';
  const categoriaBase = servico?.providerCargo || servico?.tipoServico || servico?.categoria || 'Categoria do serviço';
  const descricaoBase = servico?.descricao || servico?.descricaoPostagem || servico?.descricaoServico || null;
  const imagemBase = servico?.imageUrl || servico?.providerPhoto || servico?.foto || null;

  // Extrai contato (telefone / email) do serviço ou prestador (heurísticas variadas)
  const contato = useMemo(() => {
    const s = servico || paramServico || {};
    const raw = s.raw || s.rawDetalhe || {};
    const prest = raw.prestador || raw.provider || raw.owner || raw.usuario || raw.user || s.prestador || {};
    const collect = (obj) => {
      if (!obj || typeof obj !== 'object') return {};
      const phoneKeys = ['telefone','phone','celular','whatsapp','whats','fone','contato','numero','mobile'];
      const emailKeys = ['email','mail','e_mail','contatoEmail','emailContato'];
      let foundPhone = null; let foundEmail = null;
      for (const [k,v] of Object.entries(obj)) {
        if (typeof v === 'string') {
          if (!foundPhone && phoneKeys.some(pk=>k.toLowerCase().includes(pk)) && /\d/.test(v)) foundPhone = v;
          if (!foundEmail && emailKeys.some(ek=>k.toLowerCase().includes(ek)) && /@/.test(v)) foundEmail = v;
        } else if (typeof v === 'object' && v) {
          const deeper = collect(v);
          if (!foundPhone && deeper.phone) foundPhone = deeper.phone;
          if (!foundEmail && deeper.email) foundEmail = deeper.email;
        }
        if (foundPhone && foundEmail) break;
      }
      return { phone: foundPhone, email: foundEmail };
    };
    const primary = collect(s);
    const secondary = collect(prest);
    let phone = primary.phone || secondary.phone || null;
    let email = primary.email || secondary.email || null;
    // Sanitiza telefone: remove não dígitos e garante +55
    if (phone) {
      let digits = phone.replace(/[^0-9]/g, '');
      // Remove zeros à esquerda
      digits = digits.replace(/^0+/, '');
      // Se não começa com 55, adiciona
      if (!digits.startsWith('55')) {
        digits = '55' + digits;
      }
      phone = '+' + digits;
    }
    return { phone, email };
  }, [servico, paramServico]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', async () => {
      const user = await getCurrentUser();
      const isPrestador = !!(
        user?.cnpj ||
        user?.tipo === 'PRESTADOR' ||
        user?.perfil === 'PRESTADOR' ||
        (typeof user?.tipoUsuario === 'string' && user?.tipoUsuario.toUpperCase() === 'JURIDICO')
      );
      // Cliente pode visualizar; prestador só visualiza seus próprios (permitimos se veio via navegação interna)
      if (isPrestador && servico && servico.cnpj && user?.cnpj && String(servico.cnpj) !== String(user.cnpj)) {
        navigation.replace('MeusServicos');
      }
    });
    return unsub;
  }, [navigation, servico]);

  useEffect(() => {
    const fetchDetalhe = async () => {
      if (!paramServico) {
        if (!erroCarregar) setErroCarregar('Serviço não recebido na navegação.');
        return;
      }
      if (__DEV__) {
        try {
          console.log('[VisualizarServico] paramServico inicial:', {
            keys: Object.keys(paramServico || {}),
            id: paramServico?.id,
            providerName: paramServico?.providerName,
            hasRaw: !!paramServico?.raw,
          });
          if (paramServico?.raw) {
            console.log('[VisualizarServico] raw keys:', Object.keys(paramServico.raw));
          }
        } catch {}
      }
      // Tenta normalizar possíveis nomes de id (inclui inspeção em raw)
      const raw = paramServico.raw || {};
      let canonicalId = paramServico.id || paramServico.idPostagem || paramServico.idServico || paramServico.id_postagem || paramServico.postagemId || paramServico.postagemID || raw.id || raw.idPostagem || raw.idServico || raw.postagemId || raw.servicoId || raw.codigo || raw.uuid || null;
      if (!canonicalId) {
        // Varredura genérica em chaves que contenham 'id'
        for (const [k, v] of Object.entries(raw)) {
          if (/id/i.test(k) && (typeof v === 'string' || typeof v === 'number')) {
            canonicalId = v;
            break;
          }
        }
      }
      if (__DEV__) {
        console.log('[VisualizarServico] canonicalId resolvido:', canonicalId, 'paramServico keys:', Object.keys(paramServico||{}));
      }
      if (!canonicalId) {
        // Sem id para buscar detalhe: mantemos dados fornecidos
        return;
      }
      setLoading(true);
      setErroCarregar(null);
      const candidates = [
        `/postagem/${canonicalId}`,
        `/postagem/get/${canonicalId}`,
        `/postagem/find/${canonicalId}`,
        `/postagem/detalhe/${canonicalId}`,
      ];
      const mergeDetalhe = (det) => {
        if (!det || typeof det !== 'object') return servico || paramServico;
        const original = servico || paramServico || {};
        const prestadorRaw = det.prestador || det.provider || det.owner || det.usuario || det.user || original.prestador || null;
        const nomeCandidato = (
          prestadorRaw?.pessoaJuridica?.nome ||
          prestadorRaw?.pessoa?.nome ||
          prestadorRaw?.usuario?.nome ||
          prestadorRaw?.nome ||
          original.providerName ||
          original.nomeServico ||
          null
        );
        const cargoCandidato = (
          prestadorRaw?.especialidade ||
          prestadorRaw?.cargo ||
          det.tipoServico ||
          det.categoria ||
          original.providerCargo ||
          original.tipoServico ||
          null
        );
        // Função para varrer qualquer chave que contenha 'desc' ou 'descricao'
        const scanDescricao = (obj) => {
          let best = null;
          const visit = (o, depth = 0) => {
            if (!o || typeof o !== 'object' || depth > 4) return;
            for (const [k, v] of Object.entries(o)) {
              if (typeof v === 'string') {
                if (/descri|desc/i.test(k) && v.trim().length > 0) {
                  if (!best || v.length > best.length) best = v;
                }
              } else if (typeof v === 'object') {
                visit(v, depth + 1);
              }
            }
          };
          visit(obj, 0);
          return best;
        };
        const descricaoCandidato = (
          det.descricaoPostagem && det.descricaoPostagem.trim().length > 0 ? det.descricaoPostagem : null
        ) || (
          det.descricaoServico && det.descricaoServico.trim().length > 0 ? det.descricaoServico : null
        ) || (
          det.descricao && det.descricao.trim().length > 0 ? det.descricao : null
        ) || scanDescricao(det) || null;
        let finalDescricao = descricaoCandidato;
        if (!finalDescricao || finalDescricao.trim().length === 0) {
          // Preserva qualquer descrição não vazia já existente
          const preserved =
            (typeof original.descricao === 'string' && original.descricao.trim().length > 0 && original.descricao) ||
            (typeof original.descricaoPostagem === 'string' && original.descricaoPostagem.trim().length > 0 && original.descricaoPostagem) ||
            (typeof original.descricaoServico === 'string' && original.descricaoServico.trim().length > 0 && original.descricaoServico) ||
            null;
          if (preserved) finalDescricao = preserved;
        }
        const fotoCandidataPrimaria = (
          det.foto || det.urlFoto || det.url_foto || det.fotoUrl || det.imagem || det.imagemUrl || det.image || det.imageUrl
        );
        const fotoPrestador = prestadorRaw && (prestadorRaw.foto || prestadorRaw.urlFoto || prestadorRaw.fotoUrl);
        let finalFoto = fotoCandidataPrimaria || fotoPrestador || original.imageUrl || original.providerPhoto || null;
        // Se detalhe devolve vazio mas já tínhamos foto, mantém
        if (!finalFoto && (original.imageUrl || original.providerPhoto)) {
          finalFoto = original.imageUrl || original.providerPhoto;
        }
        return {
          ...original,
          // Mantém det parcial para inspeção sem sobrescrever campos bons com vazio
          id: original.id || det.id,
          tipoServico: det.tipoServico || original.tipoServico,
          nomeServico: det.nomeServico || original.nomeServico,
          providerName: nomeCandidato || 'Prestador',
          providerCargo: cargoCandidato || original.providerCargo || 'Serviço',
          descricao: finalDescricao,
          imageUrl: finalFoto,
          providerPhoto: finalFoto,
          rawDetalhe: det,
        };
      };
      for (const path of candidates) {
        try {
          const resp = await api.get(path);
          if (resp?.data) {
            const merged = mergeDetalhe(resp.data);
            setServico(merged);
            if (__DEV__) {
              console.log('[DETALHE MERGED]', {
                id: merged.id,
                providerName: merged.providerName,
                providerCargo: merged.providerCargo,
                hasImage: !!merged.imageUrl,
                imageUrl: merged.imageUrl,
                descricaoLen: merged.descricao ? merged.descricao.length : 0,
                sampleDescricao: merged.descricao ? merged.descricao.slice(0,80) : null,
              });
            }
            setLoading(false);
            return;
          }
        } catch (e) {
          // tenta próximo
          if (__DEV__) console.log('[DETALHE] falha em', path, e?.message);
        }
      }
      setErroCarregar('Não foi possível obter detalhes completos do serviço.');
      setLoading(false);
    };
    fetchDetalhe();
  }, [paramServico]);

  const mensagemPadrao = 'Vi seu serviço no Work For You. Podemos conversar?';
  const abrirWhatsApp = () => {
    if (!contato.phone) {
      Alert.alert('Contato indisponível', 'Prestador não possui telefone/WhatsApp cadastrado.');
      return;
    }
    // Garante que o número está com +55
    let numeroSanitizado = contato.phone ? contato.phone.replace(/[^0-9]/g, '') : '';
    if (!numeroSanitizado.startsWith('55')) {
      numeroSanitizado = '55' + numeroSanitizado;
    }
    const url = `https://wa.me/${numeroSanitizado}?text=${encodeURIComponent(mensagemPadrao)}`;
    Linking.openURL(url).catch(() => Alert.alert('Não foi possível abrir o WhatsApp.'));
  };

  const enviarEmail = () => {
    if (!contato.email) {
      Alert.alert('Contato indisponível', 'Prestador não possui e-mail cadastrado.');
      return;
    }
    const subject = 'Contato via Work For You';
    const body = mensagemPadrao;
    const url = `mailto:${contato.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() => Alert.alert('Não foi possível abrir o e-mail.'));
  };

  return (
    <View style={styles.page}>
      <HeaderPadrao
        navigation={navigation}
        onProfile={async () => {
          try {
            const user = await getCurrentUser();
            const tipo = String(user?.tipoUsuario || '').toUpperCase();
            const nome = user?.nome || name;
            if (tipo === 'JURIDICO') {
              return navigation.navigate('PerfilPrestador', { nome });
            }
            return navigation.navigate('PerfilCliente', { nome });
          } catch {
            return navigation.navigate('PerfilCliente');
          }
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Categoria */}
        <Text style={styles.sectionLabel}>Cargo / Especialidade:</Text>
        <Text style={styles.categoryText}>{categoriaBase}</Text>

        {/* Título do serviço */}
        <Text style={styles.serviceTitle}>Prestador: {nomeBase}</Text>

        {/* Descrição */}
        <Text style={styles.fieldLabel}>Descrição do serviço:</Text>
        <View style={styles.descriptionBox}>
          {loading ? (
            <ActivityIndicator size="small" color="#6D6FB3" />
          ) : (
            <Text style={styles.descriptionText}>
              {descricaoBase || 'Sem descrição detalhada disponível.'}
            </Text>
          )}
        </View>
        {erroCarregar ? <Text style={styles.errorHint}>{erroCarregar}</Text> : null}

        {/* Foto de exemplo */}
        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Foto de exemplo do serviço:</Text>
        <TouchableOpacity style={styles.photoButtonLarge} activeOpacity={0.8}>
          {imagemBase ? (
            typeof imagemBase === 'string' ? (
              <Image source={{ uri: imagemBase }} style={styles.photoPreviewLarge} />
            ) : (
              <Image source={imagemBase} style={styles.photoPreviewLarge} />
            )
          ) : (
            <Feather name="camera" size={42} color="#4A5B7A" />
          )}
        </TouchableOpacity>

        {/* Contatos */}
        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Meios de contato:</Text>
        {(__DEV__ && (contato.phone || contato.email)) ? (
          <Text style={{fontSize:10,color:'#7b8aa5'}}>Contato extraído: {contato.phone || 'sem telefone'} / {contato.email || 'sem email'}</Text>
        ) : null}
        <View style={styles.contactsRow}>
          <TouchableOpacity style={styles.contactBtn} onPress={abrirWhatsApp}>
            <Ionicons name="logo-whatsapp" size={24} color="#4A5B7A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={enviarEmail}>
            <Ionicons name="mail-outline" size={24} color="#4A5B7A" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d8dfef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: { padding: 4 },
  content: { padding: 20 },
  sectionLabel: { fontSize: 14, color: '#7b8aa5' },
  categoryText: { fontSize: 12, color: '#9aa6bd', marginBottom: 12 },
  serviceTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  fieldLabel: { fontSize: 13, color: '#6b7c93', marginBottom: 6 },
  descriptionBox: {
    borderWidth: 1,
    borderColor: '#c9d3e6',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
  },
  descriptionText: { fontSize: 13, color: '#394b63' },
  photoButtonLarge: {
    height: 220,
    borderWidth: 1,
    borderColor: '#c9d3e6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fb',
    overflow: 'hidden',
    marginTop: 4,
  },
  photoPreviewLarge: { width: '100%', height: '100%', resizeMode: 'cover' },
  contactsRow: { flexDirection: 'row', gap: 24, paddingTop: 6 },
  errorHint: { marginTop: 8, fontSize: 12, color: '#a33' },
  contactBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#c9d3e6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
