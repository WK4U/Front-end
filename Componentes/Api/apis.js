import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const excluirServico = async (idServico, idPostagem) => {
  return api.delete("/postagem/delete", {
    params: { idServico, idPostagem },
  });
};
import appJson from "../../app.json";
const EXTRA_API =
  // Usa somente app.json (mais confiável e não exige expo-constants)
  appJson?.expo?.extra?.apiUrl || null;

const DEFAULT_HOST = (() => {
  // Sempre usar o backend do Render
  return "https://backend-mtiz.onrender.com";
})();

const api = axios.create({
  baseURL: DEFAULT_HOST,
  // Remove o timeout para permitir chamadas longas ao backend do Render
  headers: {
    Accept: "application/json",
  },
});

// Log útil em dev para confirmar qual baseURL está em uso
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[API] baseURL:", DEFAULT_HOST);
}

// Normaliza a estrutura do usuário para termos campos previsíveis (ex.: foto, nome, tipoUsuario)
const normalizeUserShape = (raw) => {
  try {
    if (!raw || typeof raw !== "object") return raw;
    const u = { ...raw };
    // Unificar nome
    if (!u.nome) {
      u.nome =
        u.name ||
        u.fullName ||
        u.nomeCompleto ||
        u.nomeUsuario ||
        u.razaoSocial ||
        u.nomeFantasia ||
        u.cliente?.nome ||
        u.prestador?.nome ||
        u.usuario?.nome ||
        null;
    }
    // Unificar foto (string final)
    let fotoCandidate =
      u.urlFoto ||
      u.fotoUrl ||
      u.url_foto ||
      u.imageUrl ||
      u.imagemPerfil ||
      u.fotoPerfil ||
      u.profilePhoto ||
      u.profileImage ||
      u.avatarUrl ||
      u.avatar ||
      u.imagem ||
      u.foto ||
      null;

    const extractUrl = (value) => {
      if (!value) return null;
      if (typeof value === "string") return value;
      if (typeof value === "object") {
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
    };

    if (!fotoCandidate && u.foto && typeof u.foto === "object") {
      fotoCandidate = extractUrl(u.foto);
    } else {
      fotoCandidate = extractUrl(fotoCandidate) || extractUrl(u.foto);
    }

    if (!fotoCandidate) {
      fotoCandidate =
        extractUrl(
          u.cliente?.urlFoto || u.cliente?.foto || u.cliente?.imagemPerfil
        ) ||
        extractUrl(
          u.prestador?.urlFoto || u.prestador?.foto || u.prestador?.imagemPerfil
        ) ||
        extractUrl(u.usuario?.urlFoto || u.usuario?.foto);
    }

    if (fotoCandidate) u.foto = fotoCandidate;

    // Normalizar tipoUsuario
    if (!u.tipoUsuario) {
      const t =
        (u.tipo && String(u.tipo)) ||
        (u.perfil && String(u.perfil)) ||
        (u.role && String(u.role)) ||
        null;
      if (t) {
        if (/JURIDICO|PJ|PRESTADOR/i.test(t)) u.tipoUsuario = "JURIDICO";
        else if (/FISICO|PF|CLIENTE/i.test(t)) u.tipoUsuario = "FISICO";
      } else if (u.cnpj) u.tipoUsuario = "JURIDICO";
      else if (u.cpf) u.tipoUsuario = "FISICO";
    }
    return u;
  } catch {
    return raw;
  }
};

/**
 * Request interceptor: injeta Authorization quando houver token salvo.
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const url = String(config.url || "");
      const method = String(config.method || "get").toLowerCase();
      const skipAuth =
        config.headers &&
        (config.headers["x-skip-auth"] === true ||
          config.headers["x-skip-auth"] === "true");
      if (skipAuth) {
        if (config.headers && config.headers.Authorization) {
          delete config.headers.Authorization;
        }
        return config;
      }
      // Não enviar Authorization para endpoints públicos (evita 403 em alguns filtros)
      const isPublic =
        (method === "post" &&
          (url.includes("/auth/login") ||
            url.includes("/auth/register") ||
            url.includes("/auth/esqueceu-senha") ||
            url.includes("/auth/validar-pin"))) ||
        (method === "patch" && url.includes("/auth/redefinir-senha"));

      if (!isPublic) {
        const token = await AsyncStorage.getItem("@w4u:token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    } catch (e) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor simplificado:
 * - Não tenta refresh (backend não tem /auth/refresh atualmente)
 * - Ao receber 401: limpa tokens e você pode redirecionar para tela de login
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      await AsyncStorage.removeItem("@w4u:token");
      await AsyncStorage.removeItem("@w4u:refreshToken");
      // opcional: emitir evento global de logout ou fazer navigation para /login
      // exemplo simples: window.location.href = '/login'; (não funciona em RN)
    }
    return Promise.reject(error);
  }
);

/**
 * Helpers públicos para autenticação + chamadas relacionadas
 */
export const loginUser = async (email, senha) => {
  try {
    const res = await api.post(
      "/auth/login",
      { email, senha },
      { headers: { "x-skip-auth": true } }
    );
    if (res?.data?.token) {
      await AsyncStorage.setItem("@w4u:token", res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem("@w4u:refreshToken", res.data.refreshToken);
      }
      // Se o backend retornar dados do usuário junto ao login, persistimos para filtros locais
      const userInfo =
        res.data.usuario || res.data.user || res.data.perfil || null;
      if (userInfo) {
        try {
          const normalized = normalizeUserShape(userInfo);
          await AsyncStorage.setItem("@w4u:user", JSON.stringify(normalized));
        } catch {}
      } else {
        // Caso o login não retorne o usuário, tentamos buscar o perfil em seguida
        try {
          await fetchMyProfile();
        } catch {}
      }
    }
    return res.data;
  } catch (error) {
    const msg = error.response?.data || error.message || "Erro no login";
    console.error("Erro no login:", msg);
    throw msg;
  }
};

export const registerUser = async (userData, photo) => {
  const form = new FormData();
  form.append("dados", JSON.stringify(userData));
  try {
    // 1ª tentativa: timeout curto
    return (await tryPost(8000)).data;
  } catch (e1) {
    console.warn("[registerUser] retry 1 falhou:", e1.message);

    try {
      // 2ª tentativa: timeout intermediário
      return (await tryPost(15000)).data;
    } catch (e2) {
      console.warn("[registerUser] retry 2 falhou:", e2.message);

      // 3ª tentativa: timeout longo (2 minutos)
      return (await tryPost(120000)).data;
    }
  }

  try {
    // 1ª tentativa: timeout curto
    return (await tryPost(8000)).data;
  } catch (e1) {
    console.warn("[registerUser] retry 1 falhou:", e1.message);

    try {
      // 2ª tentativa: timeout intermediário
      return (await tryPost(15000)).data;
    } catch (e2) {
      console.warn("[registerUser] retry 2 falhou:", e2.message);

      // 3ª tentativa: timeout longo
      return (await tryPost(30000)).data;
    }
  }
};

export const editProfile = async (payload, photo) => {
  // Backend exige multipart (dados + file opcional)
  try {
    const form = new FormData();
    form.append("dados", JSON.stringify(payload || {}));

    if (photo && photo.uri) {
      const filename =
        photo.fileName ||
        photo.filename ||
        photo.uri.split("/").pop() ||
        "foto.jpg";
      const type = photo.type || "image/jpeg";
      form.append("file", { uri: photo.uri, name: filename, type });
    }

    const res = await api.patch("/auth/edit", form, {
      // Não setar Content-Type manualmente no RN
      timeout: 60000,
    });
    return res.data; // "Perfil atualizado com sucesso!"
  } catch (error) {
    const msg =
      error.response?.data || error.message || "Erro ao editar o perfil";
    console.error("Erro edit-profile:", msg);
    throw msg;
  }
};

/**
 * Busca o perfil do usuário autenticado e salva em @w4u:user
 */
export const fetchMyProfile = async () => {
  const candidates = [
    "/auth/me",
    "/auth/perfil",
    "/auth/profile",
    "/users/me",
    "/usuario/me",
    "/cliente/me",
    "/prestador/me",
  ];
  for (const path of candidates) {
    try {
      const res = await api.get(path);
      const data = res?.data;
      if (!data) continue;
      // Alguns backends envolvem em uma propriedade
      const userRaw =
        data.usuario || data.user || data.perfil || data.dados || data;
      if (userRaw && typeof userRaw === "object") {
        const user = normalizeUserShape(userRaw);
        try {
          await AsyncStorage.setItem("@w4u:user", JSON.stringify(user));
        } catch {}
        return user;
      }
    } catch (e) {
      // tenta próximo
    }
  }
  throw new Error("Não foi possível obter o perfil do usuário");
};

const extractCnpjFromUser = (user) => {
  if (!user || typeof user !== "object") return null;
  const candidates = [
    user.cnpj,
    user.documento,
    user?.prestador?.cnpj,
    user?.prestador?.documento,
    user?.prestador?.pessoaJuridica?.cnpj,
    user?.pessoaJuridica?.cnpj,
    user?.empresa?.cnpj,
    user?.dados?.cnpj,
    user?.usuario?.cnpj,
    user?.usuario?.documento,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0)
      return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
};

const resolvePrestadorDocumento = async () => {
  let cachedUser = null;
  try {
    const raw = await AsyncStorage.getItem("@w4u:user");
    cachedUser = raw ? JSON.parse(raw) : null;
  } catch {}

  let cnpj = extractCnpjFromUser(cachedUser);
  if (cnpj) return { cnpj, user: cachedUser };

  try {
    const fresh = await fetchMyProfile();
    cnpj = extractCnpjFromUser(fresh);
    if (cnpj) return { cnpj, user: fresh };
  } catch (err) {
    if (typeof __DEV__ !== "undefined" && __DEV__)
      console.warn(
        "[resolvePrestadorDocumento] Falha ao atualizar perfil",
        err
      );
  }
};

// ...existing code...

export const verifyPin = async (email, pin) => {
  try {
    console.log("[verifyPin] Payload:", { email, pin });
    const res = await api.post("/auth/validar-pin", { email, pin });
    console.log("[verifyPin] Resposta:", res.data);
    // backend retorna { tokenReset } ou similar
    return res.data;
  } catch (error) {
    if (error.response) {
      console.error("[verifyPin] Erro status:", error.response.status);
      console.error("[verifyPin] Erro headers:", error.response.headers);
      console.error("[verifyPin] Erro data:", error.response.data);
      console.error("[verifyPin] Payload enviado:", { email, pin });
    } else {
      console.error("[verifyPin] Erro:", error.message);
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    // se backend tiver endpoint de logout, chame antes de limpar local
    // await api.post('/auth/logout', null, { withCredentials: true });
  } finally {
    await AsyncStorage.removeItem("@w4u:token");
    await AsyncStorage.removeItem("@w4u:refreshToken");
    await AsyncStorage.removeItem("@w4u:user");
  }
};

export async function anunciarServico(tipoServico, descricaoPostagem, photo) {
  const form = new FormData();
  form.append(
    "dados",
    JSON.stringify({
      tipoServico,
      descricaoPostagem,
    })
  );

  if (photo && photo.uri) {
    const filename =
      photo.fileName ||
      photo.filename ||
      photo.uri.split("/").pop() ||
      "foto.jpg";
    const type = photo.type || "image/jpeg";
    form.append("file", { uri: photo.uri, name: filename, type });
  }

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    try {
      const parts = form?._parts || [];
      console.log(
        "[ANUNCIAR] multipart partes:",
        parts.map(([key, value]) => ({
          key,
          type: typeof value,
          hasUri: Boolean(value?.uri),
          hasName: Boolean(value?.name),
          sample:
            typeof value === "string"
              ? value.slice(0, 60)
              : value && typeof value === "object"
              ? { uri: value.uri, name: value.name, type: value.type }
              : null,
        }))
      );
    } catch (logErr) {
      console.warn("[ANUNCIAR] Falha ao inspecionar FormData", logErr);
    }
  }

  try {
    // Cria nova postagem usando o endpoint correto
    const res = await api.post("/postagem/register", form, {
      timeout: 60000,
    });
    return res.data;
  } catch (axiosErr) {
    const msg =
      axiosErr?.response?.data ||
      axiosErr?.message ||
      "Erro ao anunciar serviço";
    console.error("[ANUNCIAR] Erro:", msg);
    throw msg;
  }
}

// Lista serviços do prestador autenticado
export const listarMeusServicos = async () => {
  // Preferimos endpoints específicos do prestador logado; caímos para getAll + filtro local.
  const normalize = (p, idx) => {
    return {
      id: p?.id ?? idx,
      tipoServico: p?.tipoServico || p?.categoria || p?.tipo || "",
      descricao: p?.descricaoPostagem || p?.descricao || "",
      imageUrl:
        p?.foto ||
        p?.urlFoto ||
        p?.url_foto ||
        p?.fotoUrl ||
        p?.imagem ||
        p?.imagemUrl ||
        p?.image ||
        p?.imageUrl ||
        p?.photo ||
        p?.secure_url ||
        null,
    };
  };

  const tryEndpoint = async (path) => {
    const res = await api.get(path);
    return Array.isArray(res?.data) ? res.data : res?.data?.itens || [];
  };

  const belongsToUser = (post, user) => {
    if (!post || !user) return false;
    // Tenta casar por id, cnpj ou email em possíveis estruturas
    const p =
      post.prestador || post.provider || post.owner || post.usuario || {};
    const pid = post.prestadorId || post.idPrestador || p.id;
    const pCnpj = post.cnpjPrestador || post.cnpj || p.cnpj;
    const pEmail = post.emailPrestador || post.email || p.email;
    const uId = user.id || user.userId || user.codigo || null;
    const uCnpj = user.cnpj || user.documento || null;
    const uEmail = user.email || user.username || null;
    return (
      (uId && pid && String(pid) === String(uId)) ||
      (uCnpj && pCnpj && String(pCnpj) === String(uCnpj)) ||
      (uEmail &&
        pEmail &&
        String(pEmail).toLowerCase() === String(uEmail).toLowerCase())
    );
  };

  try {
    // 1) Tenta endpoints específicos (se existirem)
    const candidatePaths = [
      "/postagem/meus",
      "/postagem/minhas",
      "/postagem/prestador/me",
      "/postagem/getByPrestadorLogado",
      "/postagem/by-auth",
    ];

    for (const path of candidatePaths) {
      try {
        const data = await tryEndpoint(path);
        if (Array.isArray(data) && data.length >= 0) {
          return data.map(normalize);
        }
      } catch (e) {
        // ignora e tenta o próximo
      }
    }

    // 2) Fallback: getAll + filtro local, caso tenhamos dados do usuário
    const [allRes, userRaw] = await Promise.all([
      api.get("/postagem/getAll"),
      AsyncStorage.getItem("@w4u:user"),
    ]);
    const all = Array.isArray(allRes?.data) ? allRes.data : [];
    let me = null;
    try {
      me = userRaw ? JSON.parse(userRaw) : null;
    } catch {}

    const filtered = me ? all.filter((p) => belongsToUser(p, me)) : all;
    // Remove duplicados pelo campo id
    const unique = [];
    const seen = new Set();
    for (const post of filtered) {
      const postId = post?.id;
      if (!seen.has(postId)) {
        seen.add(postId);
        unique.push(post);
      }
    }
    return unique.map(normalize);
  } catch (error) {
    const msg =
      error?.response?.data || error?.message || "Erro ao listar serviços";
    console.error("Erro ao listar serviços:", msg);
    throw msg;
  }
};

// Lista todos os serviços (postagens) públicos para clientes PF
export const listarServicosPublicos = async () => {
  const normalize = (p, idx) => {
    // Identificação robusta de ID
    const realId =
      p?.id ||
      p?.idPostagem ||
      p?.id_postagem ||
      p?.postagemId ||
      p?.idServico ||
      p?.servicoId ||
      p?.id_servico ||
      p?.codigo ||
      p?.uuid ||
      p?.identificador ||
      p?.idRegistro ||
      null;
    const nomeServico =
      p?.nomeServico ||
      p?.nome ||
      p?.titulo ||
      p?.nomePostagem ||
      (typeof p?.descricaoServico === "string"
        ? p.descricaoServico.split("\n")[0].trim()
        : null) ||
      "Serviço";
    const tipoServico =
      p?.tipoServico ||
      p?.categoria ||
      p?.tipo ||
      (typeof nomeServico === "string" && nomeServico
        ? nomeServico
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .trim()
            .replace(/\s+/g, "_")
        : "");
    const descricao =
      p?.descricaoPostagem || p?.descricaoServico || p?.descricao || "";
    const imageUrl =
      p?.foto ||
      p?.urlFoto ||
      p?.url_foto ||
      p?.fotoUrl ||
      p?.imagem ||
      p?.imagemUrl ||
      p?.image ||
      p?.imageUrl ||
      p?.photo ||
      p?.secure_url ||
      (p?.servico &&
        (p.servico.foto || p.servico.urlFoto || p.servico.imageUrl)) ||
      null;
    // Dados do prestador (heurísticas para vários formatos possíveis)
    const prestadorRaw =
      p?.prestador || p?.provider || p?.owner || p?.usuario || p?.user || null;
    const servicoPrestadorNome =
      p?.servico?.prestador?.pessoaJuridica?.nome ||
      p?.servico?.prestador?.pessoa?.nome ||
      p?.servico?.prestador?.nome ||
      null;
    // Tenta aprofundar em estruturas aninhadas comuns
    const nestedNome =
      prestadorRaw?.usuario?.nome ||
      prestadorRaw?.usuario?.fullName ||
      prestadorRaw?.pessoa?.nome ||
      prestadorRaw?.pessoaJuridica?.nome || // nome em pessoaJuridica (ex: Pedro Sampaio)
      prestadorRaw?.dados?.nome ||
      prestadorRaw?.perfil?.nome ||
      prestadorRaw?.conta?.nome ||
      null;
    // Busca nomes diretos fora de prestadorRaw
    const directNome =
      p?.usuario?.nome ||
      p?.usuario?.fullName ||
      p?.usuario?.username ||
      p?.usuario?.apelido ||
      p?.usuario?.displayName ||
      p?.usuario?.pessoa?.nome ||
      p?.usuario?.dados?.nome ||
      null;
    // Varredura superficial por chave contendo 'nome'
    let scannedNome = null;
    try {
      for (const [k, v] of Object.entries(p || {})) {
        if (/nome/i.test(k) && typeof v === "string" && v.length > 1) {
          if (/nomeServico|nome_postagem|nomePostagem/i.test(k)) continue;
          scannedNome = v;
          break;
        }
        if (v && typeof v === "object") {
          for (const [k2, v2] of Object.entries(v)) {
            if (/nome/i.test(k2) && typeof v2 === "string" && v2.length > 1) {
              if (/nomeServico|nome_postagem|nomePostagem/i.test(k2)) continue;
              scannedNome = v2;
              break;
            }
          }
          if (scannedNome) break;
        }
      }
    } catch {}
    const providerName =
      prestadorRaw?.nome ||
      nestedNome ||
      servicoPrestadorNome ||
      directNome ||
      scannedNome ||
      prestadorRaw?.nomeFantasia ||
      prestadorRaw?.razaoSocial ||
      p?.nomePrestador ||
      p?.prestadorNome ||
      prestadorRaw?.fullName ||
      prestadorRaw?.username ||
      prestadorRaw?.apelido ||
      prestadorRaw?.displayName ||
      prestadorRaw?.shortName ||
      null;
    const finalProviderName =
      providerName ||
      prestadorRaw?.pessoaJuridica?.nome ||
      servicoPrestadorNome ||
      "Prestador";
    const providerPhoto =
      prestadorRaw?.foto ||
      prestadorRaw?.urlFoto ||
      prestadorRaw?.fotoUrl ||
      prestadorRaw?.imagemPerfil ||
      prestadorRaw?.imageUrl ||
      prestadorRaw?.avatarUrl ||
      null;
    const providerCargo =
      p?.cargo ||
      p?.funcao ||
      prestadorRaw?.cargo ||
      prestadorRaw?.funcao ||
      prestadorRaw?.especialidade || // especialidade do prestador
      tipoServico ||
      (descricao ? descricao.split("\n")[0].slice(0, 40) : "");
    // Preview exige: Nome da pessoa + categoria (tipoServico)
    const preview = `${finalProviderName} - ${
      tipoServico || providerCargo
    }`.trim();
    if (!providerName && typeof __DEV__ !== "undefined" && __DEV__) {
      try {
        console.warn(
          "[listarServicosPublicos] providerName ausente para id",
          p?.id,
          "chaves:",
          Object.keys(p || {})
        );
      } catch {}
    }
    return {
      id: realId ?? p?.id ?? idx,
      nomeServico,
      tipoServico,
      categoria: tipoServico || nomeServico,
      descricao,
      imageUrl,
      providerName: finalProviderName,
      providerPhoto: providerPhoto || imageUrl, // fallback para mesma foto
      providerCargo,
      preview,
      raw: p,
      _idDebug: {
        realId,
        originalId: p?.id,
        idPostagem: p?.idPostagem || p?.id_postagem,
        postagemId: p?.postagemId,
        idServico: p?.idServico || p?.id_servico,
        servicoId: p?.servicoId,
        codigo: p?.codigo,
        uuid: p?.uuid,
      },
    };
  };
  try {
    const res = await api.get("/postagem/getAll");
    const arr = Array.isArray(res?.data) ? res.data : [];
    const list = arr.map(normalize);
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      const sample = list
        .slice(0, 3)
        .map((l) => ({ id: l.id, idDebug: l._idDebug }));
      console.log("[listarServicosPublicos] sample IDs:", sample);
    }
    // Hidratação: tentar obter nome real do prestador para itens com fallback 'Prestador'
    const needsHydration = list.filter(
      (s) => s.providerName === "Prestador" && s.raw
    );
    if (needsHydration.length) {
      // ...existing code...
    }
    return list;
  } catch (error) {
    // ...existing error handling code...
    throw error;
  }
};

// Testa conectividade simples com backend; tenta endpoints comuns e retorna resumo
export const pingApi = async () => {
  const results = [];
  const endpoints = [
    "/postagem/getAll",
    "/auth/me",
    "/",
    "/actuator/health",
    "/health",
  ];
  for (const ep of endpoints) {
    try {
      const start = Date.now();
      const res = await api.get(ep, {
        headers: { "x-skip-auth": true },
        timeout: 15000,
      });
      results.push({
        endpoint: ep,
        ok: true,
        status: res.status,
        ms: Date.now() - start,
      });
    } catch (e) {
      results.push({
        endpoint: ep,
        ok: false,
        status: e?.response?.status || null,
        error: e?.message || String(e),
      });
    }
  }
  return { baseURL: api?.defaults?.baseURL, results };
};

export const getCurrentToken = async () => AsyncStorage.getItem("@w4u:token");
export const getCurrentUser = async () => {
  try {
    const raw = await AsyncStorage.getItem("@w4u:user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setToken = async (token) => {
  if (token) await AsyncStorage.setItem("@w4u:token", token);
  else await AsyncStorage.removeItem("@w4u:token");
};

export default api;
