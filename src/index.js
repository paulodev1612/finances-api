const { v4: uuidv4 } = require('uuid')

const express = require('express')
const app = express()
const port = 3333

app.use(express.json())

// no momento esse é o meu banco de dados
const customers = []

// middleware
const verifyIfExistsAccountCPF = (request, response, next) => {
  const { cpf } = request.headers

  const verifyCustomer = customers.find((customer) => customer.cpf === cpf)

  if (!verifyCustomer) {
    return response.status(400).json({ error: 'Usuário não encontrado!' })
  } else {
    request.customer = verifyCustomer // request.nomeVariavel
    return next()
  }
}

app.post('/account', (request, response) => {
  const { name, cpf } = request.body

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  ) // VAI SAIR UM VALOR BOLLEANO, TRUE OU FALSE. ELE VAI PERCORRER TODO O ARRAY CUSTOMERS VERIFICANDO SE O CPF ENVIADO PELO CLIENTE JÁ EXISTE.

  if (customerAlreadyExists === true) {
    return response.status(400).json({ error: 'Cliente(CPF) já existente!' })
  } else {
    customers.push({
      name,
      cpf,
      id: uuidv4(),
      statement: [],
    })
  }

  return response.status(201).send('Usuário criado com sucesso!')
}) // FECHAMENTO DO MÉTODO POST

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request // const { nomeVariavel } = request => desestruturação do objeto(middleware) verifyIfExistsAccountCPF
  return response.json(customer.statement)
})

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body

  const { customer } = request

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})

app.listen(port, () => {
  console.log(`O servidor está rodando na porta ${port}`)
})
