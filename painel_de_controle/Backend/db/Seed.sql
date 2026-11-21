-- =====================================================
-- seed.sql — dados de exemplo do Painel de Testes
--
-- O QUE É: um script que apaga os dados e insere sempre
-- a mesma "massa de teste", igual aos números dos layouts.
--
-- PRÉ-REQUISITO: o banco já ter as tabelas (schema.sql),
-- incluindo as colunas retries, flaky_count e api_key.
--
-- COMO RODAR: pgAdmin > test_dashboard > Query Tool > Ctrl+O (este arquivo) > F5
-- Pode rodar quantas vezes quiser: sempre volta ao mesmo estado.
-- =====================================================


-- =====================================================
-- 0. PREPARAR
-- =====================================================

-- Liga a extensão pgcrypto, que traz as funções crypt() e gen_salt()
-- usadas para gerar o hash bcrypt da senha do usuário de demonstração.
-- IF NOT EXISTS: se já estiver ligada, não faz nada (e não dá erro).
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =====================================================
-- 1. LIMPAR
-- =====================================================

-- TRUNCATE: apaga TODAS as linhas das tabelas listadas.
-- Ordem: netos -> filhos -> pais (test_results -> runs -> projects -> users).
-- RESTART IDENTITY: os ids voltam a começar do 1.
-- CASCADE: apaga também o que depender dessas tabelas pelas chaves estrangeiras.
TRUNCATE test_results, runs, projects, users RESTART IDENTITY CASCADE;


-- =====================================================
-- 2. PAIS (tabelas que não dependem de ninguém)
-- =====================================================

-- 2a. Usuário de demonstração: o topo da hierarquia.
-- Login para o Postman: demo@painel.test / Demo@1234
-- (senha de DEMONSTRAÇÃO: pode ir para o Git; nunca use uma senha real aqui)
INSERT INTO users (name, username, email, phone, password_hash) VALUES
  -- name        username   email               phone          password_hash
  ('Ju Demo', 'ju_demo', 'demo@painel.test', '11900000000',
   -- gen_salt('bf', 10): sorteia um "salt" para o bcrypt, custo 10 (igual ao register)
   -- crypt(senha, salt): gera o hash $2a$10$... que o bcrypt.compare do Node entende
   crypt('Demo@1234', gen_salt('bf', 10)));
-- id e created_at ficam fora da lista: o banco preenche sozinho.


-- 2b. Projetos do usuário de demonstração.
-- user_id: perguntamos ao banco "qual é o id do usuário com este email?".
-- api_key: chave FIXA de demonstração (para configurar uma vez no Postman).
--   Em produção, a chave será aleatória, gerada quando o projeto for criado.
INSERT INTO projects (user_id, name, api_key) VALUES
  ((SELECT id FROM users WHERE email = 'demo@painel.test'), 'checkout-web',   'demo-key-checkout-web'),
  ((SELECT id FROM users WHERE email = 'demo@painel.test'), 'api-pagamentos', 'demo-key-api-pagamentos'),
  ((SELECT id FROM users WHERE email = 'demo@painel.test'), 'portal-admin',   'demo-key-portal-admin'),
  ((SELECT id FROM users WHERE email = 'demo@painel.test'), 'kyc-onboarding', 'demo-key-kyc-onboarding'),
  ((SELECT id FROM users WHERE email = 'demo@painel.test'), 'app-mobile-e2e', 'demo-key-app-mobile-e2e'),
  ((SELECT id FROM users WHERE email = 'demo@painel.test'), 'healthfood',     'demo-key-healthfood');


-- =====================================================
-- 3. FILHOS
-- =====================================================

-- 3a. Execuções recentes do checkout-web (tela do dashboard).
-- status: o CHECK só aceita 'running', 'passed' ou 'failed'.
--   "Instável" NÃO é guardado: é CALCULADO (status 'passed' + flaky_count > 0).
-- started_at: NOW() - INTERVAL '12 minutes' = "12 minutos antes de agora".
-- finished_at: começo + duração. A duração é CALCULADA depois: fim - início.
-- counts: passed + failed + flaky precisa somar total_tests.
INSERT INTO runs (project_id, name, branch, environment, status, started_at, finished_at,
                  total_tests, passed_count, failed_count, flaky_count, skipped_count) VALUES

  -- #1842: falhou (2 falhas, 3 instáveis), há 12 min, duração 6m 51s
  ((SELECT id FROM projects WHERE name = 'checkout-web'), '#1842', 'main', 'staging', 'failed',
   NOW() - INTERVAL '12 minutes',
   NOW() - INTERVAL '12 minutes' + INTERVAL '6 minutes 51 seconds',
   238, 233, 2, 3, 0),

  -- #1841: passou limpa, há 1 h, duração 6m 38s
  ((SELECT id FROM projects WHERE name = 'checkout-web'), '#1841', 'main', 'staging', 'passed',
   NOW() - INTERVAL '1 hour',
   NOW() - INTERVAL '1 hour' + INTERVAL '6 minutes 38 seconds',
   238, 238, 0, 0, 0),

  -- #1840: passou, mas com 1 instável -> a tela mostra "Instável"
  ((SELECT id FROM projects WHERE name = 'checkout-web'), '#1840', 'feat/pix', 'staging', 'passed',
   NOW() - INTERVAL '3 hours',
   NOW() - INTERVAL '3 hours' + INTERVAL '6 minutes 44 seconds',
   238, 237, 0, 1, 0),

  -- #1839: passou limpa, "ontem"
  ((SELECT id FROM projects WHERE name = 'checkout-web'), '#1839', 'main', 'staging', 'passed',
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day' + INTERVAL '6 minutes 35 seconds',
   238, 238, 0, 0, 0),

  -- #1838: falhou (1 falha, 2 instáveis), "ontem"
  ((SELECT id FROM projects WHERE name = 'checkout-web'), '#1838', 'fix/cart-total', 'staging', 'failed',
   NOW() - INTERVAL '1 day 2 hours',
   NOW() - INTERVAL '1 day 2 hours' + INTERVAL '6 minutes 57 seconds',
   238, 235, 1, 2, 0),

  -- #1837: passou limpa, "ontem" (a mais antiga da lista)
  ((SELECT id FROM projects WHERE name = 'checkout-web'), '#1837', 'main', 'staging', 'passed',
   NOW() - INTERVAL '1 day 5 hours',
   NOW() - INTERVAL '1 day 5 hours' + INTERVAL '6 minutes 40 seconds',
   238, 238, 0, 0, 0);


-- 3b. Testes da execução #1842 (tela de detalhe da execução).
-- Só os 5 que aparecem na tela (2 falhas + 3 instáveis), não os 238.
-- retries: quantas vezes o teste foi REPETIDO = tentativas - 1.
--   falhou nas 3 tentativas -> 'failed', retries 2
--   passou na 2ª tentativa  -> 'passed', retries 1  -> instável (calculado)
--   passou na 3ª tentativa  -> 'passed', retries 2  -> instável (calculado)
-- duration_ms: em milissegundos (15,6 s = 15600).
-- error_message: NULL quando o teste passou.
INSERT INTO test_results (run_id, title, file_path, browser, status, retries, duration_ms, error_message) VALUES

  -- falha 1: falhou nas 3 tentativas
  ((SELECT id FROM runs WHERE name = '#1842'), 'checkout › aplica cupom expirado e mostra erro',
   'tests/checkout/coupon.spec.ts:46', 'chromium', 'failed', 2, 15600,
   'Esperado: "Cupom expirado" / Recebido: "Cupom inválido"'),

  -- falha 2: timeout nas 3 tentativas
  -- aspa SIMPLES dentro de texto: escreva duas seguidas ('') e o banco grava uma só
  ((SELECT id FROM runs WHERE name = '#1842'), 'pagamento › recusa cartão sem saldo',
   'tests/payment/card.spec.ts:28', 'chromium', 'failed', 2, 90000,
   'Timeout de 30000ms esperando por getByText(''Saldo insuficiente'')'),

  -- instável 1: passou na 2ª tentativa
  ((SELECT id FROM runs WHERE name = '#1842'), 'checkout › aplica cupom válido',
   'tests/checkout/coupon.spec.ts:31', 'chromium', 'passed', 1, 9400, NULL),

  -- instável 2: passou na 2ª tentativa
  ((SELECT id FROM runs WHERE name = '#1842'), 'pagamento › confirma pix após QR',
   'tests/payment/pix.spec.ts:57', 'chromium', 'passed', 1, 14100, NULL),

  -- instável 3: passou na 3ª tentativa
  ((SELECT id FROM runs WHERE name = '#1842'), 'carrinho › atualiza total ao remover item',
   'tests/cart/cart.spec.ts:73', 'chromium', 'passed', 2, 12800, NULL);


-- =====================================================
-- 4. CONFERIR (os "asserts" do seed)
-- No pgAdmin, selecione UMA consulta por vez e aperte F5.
-- =====================================================

SELECT COUNT(*) AS usuarios FROM users;            -- esperado: 1
SELECT COUNT(*) AS projetos FROM projects;         -- esperado: 6
SELECT COUNT(*) AS execucoes FROM runs;            -- esperado: 6

SELECT name, api_key FROM projects;                -- esperado: 6 projetos, cada um com sua chave

SELECT run_id, COUNT(*) AS qtd_testes              -- esperado: 1 linha, run_id 1, qtd 5
FROM test_results
GROUP BY run_id;

SELECT id, title FROM test_results WHERE run_id IS NULL;  -- esperado: nenhuma linha

SELECT name, status, flaky_count, finished_at - started_at AS duracao
FROM runs
ORDER BY started_at DESC;                          -- esperado: #1842 no topo, 00:06:51

SELECT title FROM test_results
WHERE status = 'passed' AND retries > 0;           -- esperado: 3 testes