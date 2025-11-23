# W4U Front-end (Expo/React Native)

## Visão Geral
Aplicativo mobile Expo para clientes e prestadores de serviços. Inclui telas de autenticação, anúncio/edição de serviços e perfil.

## Execução
```powershell
npm install
npm start
```
Certifique-se de que o backend está acessível via IP configurado em `app.json` (`expo.extra.apiUrl`). Em emulador Android use normalmente `10.0.2.2`; em dispositivo físico use o IP da sua máquina.

## Segurança de Dependências
O comando `npm audit` aponta múltiplas vulnerabilidades de alta severidade relacionadas principalmente ao pacote **glob** e dependências transitivas do ecossistema Expo/React Native (ex: `@expo/cli`, `@expo/config`, `react-native`).

### Advisory principal (glob)
- Intervalo afetado: 10.3.7 até 11.0.3
- Tipo: Injeção de comando na CLI do glob via flags `-c` / `--cmd` quando usadas com `shell:true`.
- Risco prático aqui: baixo, pois o app não utiliza a CLI interativa do glob nem passa padrões controlados por usuário.

### Por que não usar `npm audit fix --force`
Executar `npm audit fix --force` forçaria downgrade de versões críticas (por exemplo `expo@51.x`) e pode quebrar o projeto, perdendo compatibilidade com APIs atuais.

### Mitigações aplicadas
- Revisado: nenhuma execução de glob CLI com `-c` / `--cmd` nos scripts do projeto.
- Mantido uso programático indireto via Expo sem exposição de entrada do usuário.
- Monitoramento recomendado: executar `npm audit` periodicamente e atualizar para futuras versões estáveis quando os mantenedores corrigirem o advisory.

### Ações futuras sugeridas
1. Aguardar publicação de versão de glob pós 11.0.3 marcada como segura.
2. Atualizar Expo e React Native seguindo notas de lançamento quando houver correção agregada.
3. Adicionar verificação em CI que falha se alguém introduzir script com `glob -c`.

## Testes Manuais do Fluxo de Postagem
1. Login como prestador (PJ/CNPJ).
2. Abrir tela `AnunciarServico`.
3. Preencher campos e anexar foto.
4. Enviar e verificar resposta HTTP 201 do endpoint `/postagem/register`.

Se receber 403 ou erro de multipart:
- Confirmar no console dev que o log `[anunciarServico] multipart partes:` mostra `dados` e `file`.
- Validar token Bearer vigente em `AsyncStorage`.

## Scripts Úteis
```powershell
# Auditoria de segurança
npm audit
# Mitigação leve (sem force)
npm audit fix
```

## Licença
Projeto interno. Ajuste esta seção conforme necessário.
