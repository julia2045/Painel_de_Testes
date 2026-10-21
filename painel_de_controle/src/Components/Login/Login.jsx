import React from 'react'
import CheckPainel from "../../assets/checkPainel.svg?react"
import Style from "./Login.module.css"
import InputForms from '../Forms/InputForms'
import { Link } from 'react-router-dom'
import Painel from '../../assets/Painel.png'
import InfoPainel from '../../assets/InfoPainel.png'
import '../../App.css'

const Login = () => {
  return (
    <div className={Style.loginContainer}>
      <div className={`${Style.OptionsLogin} flexColumn`}>
        <div className={Style.checkPainel}>
          <img src={CheckPainel} alt="Check Painel" />
          <p>Painel de Testes</p>
        </div>
        <div className={Style.loginInfo}>
          <h1>Entrar</h1>
          <p>Acesse seus projetos e acompanhe cada execução.</p>
        </div>
        <div className={Style.loginForm}>
          <form>
            <InputForms 
            name="email"
            type="email"
            label="Email"
            placeholder="Exemplo@email.com"
            />
            <InputForms 
            name="password"
            type="password"
            label="Senha"
            placeholder="********"
            />
            <button type="submit">Entrar</button>
          </form>
        </div>
        <div className={Style.loginLinks}>
          <p> Não tem conta? <a href="#">Criar conta</a></p>
          <a href="#">Esqueci a senha</a>
        </div>
      </div>
      <div className={`${Style.loginImage} flexColumn`}>
        <h1>Veja a saúde da sua suíte de testes ao longo do tempo.</h1>
        <p>Envie os resultados do Playwright e descubra quais testes falham, quais são instáveis e como a taxa de sucesso evolui a cada execução.</p>
        <div className={`${Style.imageContainer} flexColumn`}>
          <img src={Painel} alt="Painel" />
          <img src={InfoPainel} alt="Info Painel" />
        </div>
      </div>
    </div>
  )
}

export default Login
