const express = require('express')
const app = express()
const port = 3002

app.use(express.static('static'))
app.use('/js', express.static('build'))

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
