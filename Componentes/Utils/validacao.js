export const somenteDigitos = (v = "") => String(v).replace(/\D/g, "");

export function validarCPF(cpf) {
  const s = somenteDigitos(cpf);
  if (!s || s.length !== 11) return false;
  if (/^(\d)\1+$/.test(s)) return false; // evita 000... 111...
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(s.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(s.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(s.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(s.charAt(10));
}

export function validarCNPJ(cnpj) {
  const s = somenteDigitos(cnpj);
  if (!s || s.length !== 14) return false;
  if (/^(\d)\1+$/.test(s)) return false;
  // Algoritmo oficial: usa 12 dígitos para o 1º DV (pesos 5..2,9..2)
  // e 13 dígitos para o 2º DV (pesos 6..2,9..2)
  let tamanho = s.length - 2; // 12
  let numeros = s.substring(0, tamanho);
  const digitos = s.substring(tamanho); // últimos 2
  let soma = 0;
  let pos = tamanho - 7; // 12 - 7 = 5 (inicia no peso 5)
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

  tamanho = tamanho + 1; // agora 13
  numeros = s.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7; // 13 - 7 = 6 (inicia no peso 6)
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1), 10);
}

export function validarDataBR(data) {
  // espera dd/mm/aaaa
  if (typeof data !== "string") return false;
  const m = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const y = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d)
    return false;
  // opcional: não aceitar data futura
  const hoje = new Date();
  return dt <= hoje;
}

export function validarTelefoneBR(tel) {
  const s = somenteDigitos(tel);
  // Aceita 10 ou 11 dígitos
  if (!(s.length === 10 || s.length === 11)) return false;
  // DDD simples entre 11 e 99
  const ddd = parseInt(s.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  // Se 11 dígitos, recomenda-se 9 como primeiro dígito do número
  if (s.length === 11 && s.charAt(2) !== "9") return false;
  return true;
}
