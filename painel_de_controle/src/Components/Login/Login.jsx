import React from 'react'
import Checkbox from '../../assets/CheckPainel.svg?react'
import Painel from '../../assets/Painel.png'
import InfoPainel from '../../assets/InfoPainel.png'
import Input from '../Forms/InputForms'
import Styles from './Login.module.css'

const Login = () => {
  return (
    <section className={Styles.login}>
      <div className={Styles.loginInfo}>
        <div className={Styles.logo}>
          <img src={Checkbox} alt="checkBox" /> 
          <p>Painel de Testes</p>
        </div>
        <div className={Styles.loginForm}>
          <h1>Entrar</h1>
          <p>Acesse seus projetos e acompanhe cada execução.</p>
          <form action="">
            <Input 
              label='Email'
              type='email' 
              placeholder='email@email.com' 
            />
            <Input 
              label='Senha'
              type='password' 
              placeholder='Sua senha' 
            />
            <button className='buttonBlue' type='submit'>Entrar</button>
          </form>
        </div>
        <div className={Styles.loginLinks}>
          <p>Não tem uma conta? <a href="#">criar conta</a></p>
          <a href="">Esqueci a senha</a>
        </div>
      </div>
      <div className={Styles.loginImage}>
        <div className={Styles.text}>
          <h2>
            Veja a saúde da sua suíte de testes ao longo do tempo.
          </h2>
          <p>
            Envie os resultados do Playwright e descubra quais testes falham, quais são instáveis e como a taxa de sucesso evolui a cada execução.
          </p>
        </div>
        <div className={Styles.image}>
          <img src={Painel} alt="" />
          <img src={InfoPainel} alt="" />
        </div>

      </div>
    </section>
  )
}

export default Login
