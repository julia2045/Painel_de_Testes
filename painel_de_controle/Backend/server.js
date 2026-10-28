//trago a biblioteca de express para criar o servidor e fazer conexões
const express = require("express")
//importo o cors para permiter que o front-en conecte com o backend
const cors = require("cors")

//faço a leitura do .env para pegar as variáveis de ambiente
require("dotenv").config();


//crio o servidor
const app = express()
//defino a porta que esse servidor irá rodar
const PORT = process.env.PORT || 3001

//Conecto o cor ao servidor
app.use(cors())
//Faço o servidor entender JSON, para receber e entender dados do front-end
app.use(express.json())

//Crio uma rota para o servidor, que irá receber as requisições do front-end
app.get("/", (req, res) => {
    res.send("Servidor rodando")
})

//Ligoo servidor e deixo ele esperando requisições na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
