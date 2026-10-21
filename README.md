# Playwright Test Dashboard

Dashboard para centralizar, acompanhar e analisar resultados de testes automatizados com **Playwright**. O projeto tem como objetivo transformar os relatórios de execução em informações visuais que facilitem o monitoramento da qualidade das aplicações, a identificação de falhas recorrentes e o acompanhamento da estabilidade dos testes ao longo do tempo.

## 🎯 Objetivo

Desenvolver uma plataforma que receba automaticamente os resultados dos testes automatizados, armazene o histórico das execuções e disponibilize métricas relevantes em um dashboard intuitivo.

## ✨ Funcionalidades

- **Autenticação:** login com autenticação baseada em JWT.
- **Registro de execuções:** API para receber e processar relatórios JSON gerados pelo Playwright.
- **Dashboard de qualidade:** visualização da evolução dos testes aprovados e reprovados ao longo do tempo.
- **Histórico de execuções:** consulta dos resultados de execuções anteriores.
- **Análise de falhas:** identificação dos testes com maior recorrência de falhas e investigação de possíveis testes instáveis (*flaky tests*).
- **Integração automatizada:** reporter personalizado do Playwright para enviar os resultados à API ao final de cada execução.

## 🏗️ Arquitetura

O projeto é dividido em três componentes principais:

- **Back-end:** API responsável pela autenticação, pelo recebimento dos relatórios e pelo processamento dos resultados.
- **Banco de dados:** armazenamento estruturado de projetos, execuções e resultados individuais dos testes, utilizando as tabelas `projects`, `runs` e `test_results`.
- **Front-end:** dashboard para visualização das métricas, consulta do histórico e análise das falhas.

## 🛠️ Tecnologias

- **Playwright** — automação de testes e geração de relatórios.
- **Node.js** — ambiente de execução do back-end.
- **API REST** — comunicação entre os componentes.
- **JWT (JSON Web Token)** — autenticação e controle de acesso.
- **Banco de dados relacional** — persistência dos projetos, execuções e resultados.
- **Front-end web** — interface para visualização e análise dos dados.

## 🚀 Desenvolvimento

O desenvolvimento será realizado de forma incremental, começando por três funcionalidades essenciais:

1. Autenticação de usuários.
2. Recebimento e armazenamento dos resultados das execuções do Playwright.
3. Dashboard com métricas básicas e histórico de testes.

A partir dessa base, o projeto poderá evoluir para análises mais avançadas, como identificação de testes instáveis, tendências de falhas e indicadores de qualidade.

## 💡 Propósito

Este projeto une **Quality Assurance (QA), automação de testes e desenvolvimento de software**, explorando como os dados gerados pela automação podem contribuir para decisões mais rápidas, maior visibilidade sobre a qualidade do software e identificação de problemas recorrentes.
