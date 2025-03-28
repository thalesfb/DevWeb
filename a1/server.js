const express = require('express')
const cats = [
    { id: 1, name: 'Garfield' },
    { id: 2, name: 'Tom' },
    { id: 3, name: 'Simba' }
]
const {somar, sub} = require('./teste.js')

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        mensagem: "OlÃ¡",
        gatos: cats,
        soma: somar(1,2)

    })
})

app.get('/cats', (req, res) => {
    if (req.query.name) {
        const filtrados = cats.filter(gato => {
            return gato.name.toLowerCase().includes(req.query.name.toLocaleLowerCase())
        })
        return res.json(filtrados)
    }
    return res.json(cats)
})

// rota
app.post('/cats', (req, res) => {
    const {name} = req.body
    if (!name) {
        res.status(422).json(
            {message: "Faltou parÃ¢metros para o Gato", status: 422}
        )
        res.end()
    } else {
        const novoGato = {
            id: cats.at(-1).id + 1,
            name: name
        }
        console.log(novoGato);
        cats.push(novoGato)
        res.json(cats)
    }

})

app.get('/cats/:id', (req, res) => {
    const {id} = req.params
    const gato = cats.find(g => g.id == id)
    res.json(gato)
})

app.listen(5000, () => {
    console.log("Ouvindo na porta 5000")
})