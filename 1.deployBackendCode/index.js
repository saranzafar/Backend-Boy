const express = require('express')//common js
// import express from 'express'// module js
require('dotenv').config()

const app = express()
const port = 3000
const github = [
    {
        "userId": 1,
        "id": 1,
        "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
    },
    {
        "userId": 1,
        "id": 2,
        "title": "qui est esse",
        "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
    },
    {
        "userId": 1,
        "id": 3,
        "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut",
        "body": "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut"
    },
]

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.get('/api', (req, res) => {
    res.send('this is api')
})
app.get('/login', (req, res) => {
    res.send('<h1>Please login </h1>.')
})
app.get('/youtube', (req, res) => {
    res.send('<h1>Your Video is loading </h1>.')
})
app.get('/github', (req, res) => {
    res.json(github)
})

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${port}`)
})