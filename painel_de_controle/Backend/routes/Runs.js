// routes/runs.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // igual ao seu middleware
const apiKeyAuth = require("../middleware/apiKey"); // o porteiro que você fez

// apiKeyAuth entre a rota e a função = "passe pelo porteiro antes de entrar"
router.post("/", apiKeyAuth, async (req, res) => {
  // 1. tirar os dados do pacote (body)
  //é um atalho. Em vez de escrever req.body.name,
  // req.body.branch linha por linha, você "desembrulha" tudo de uma vez. Cada nome vira uma variável.
  const {
    name,
    branch,
    environment,
    status,
    started_at,
    finished_at,
    total_tests,
    passed_count,
    failed_count,
    flaky_count,
    skipped_count,
    tests,
  } = req.body;

  // 2. validar o mínimo: sem esses, não dá para gravar
  if (!name || !status || !Array.isArray(tests)) {
    return res
      .status(400)
      .json({ error: "name, status e tests são obrigatórios" });
  }
  if (!['running', 'passed', 'failed'].includes(status)) {
    return res.status(400).json({ error: "status inválido" });
  }
  // status aceitos pela tabela test_results (igual ao CHECK do banco)
  const statusDeTeste = [
    "passed",
    "failed",
    "timedOut",
    "skipped",
    "interrupted",
  ];

  for (const test of tests) {
    if (!statusDeTeste.includes(test.status)) {
      return res
        .status(400)
        .json({ error: `status de teste inválido` });
    }
  }
  try {
    // 3. gravar a EXECUÇÃO (o pai) e pedir o "comprovante" com o id
    const runResult = await pool.query(
      `INSERT INTO runs (project_id, name, branch, environment, status, started_at, finished_at,
                         total_tests, passed_count, failed_count, flaky_count, skipped_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        req.projectId,
        name,
        branch,
        environment,
        status,
        started_at ?? new Date(),
        finished_at,
        total_tests ?? 0,
        passed_count ?? 0,
        failed_count ?? 0,
        flaky_count ?? 0,
        skipped_count ?? 0,
      ],
      //?? quer dizer "se isso vier vazio, use este outro".
      // total_tests ?? 0 significa: "se não mandaram o total, grave 0".
      // É necessário porque essas colunas são NOT NULL no banco,
      //  e um valor ausente viraria NULL, que o banco recusa.
    );
    const runId = runResult.rows[0].id;

    // 4. gravar cada TESTE (os filhos), apontando para a execução
    //"para cada teste da lista, faça o que está dentro das chaves".
    // Se a lista tem 3 testes, o INSERT roda 3 vezes.
    for (const test of tests) {
      await pool.query(
        `INSERT INTO test_results (run_id, title, file_path, browser, status, retries, duration_ms, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          runId,
          test.title,
          test.file_path,
          test.browser,
          test.status,
          test.retries ?? 0,
          test.duration_ms,
          test.error_message,
        ],
      );
    }

    // 5. responder: deu certo, algo foi CRIADO
    return res.status(201).json({ id: runId, tests_saved: tests.length });
  } catch (err) {
    console.error("Erro ao gravar execução:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
