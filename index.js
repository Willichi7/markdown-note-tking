const cors = require('cors')
const express = require('express')
const noteRoutes = require('./routes/noteRoutes')
const connectDB = require('./config/db')


const app = express()
app.use(express.json())

connectDB()

app.use(cors())


app.use('/api/notes', noteRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>[
   console.log('Server is running at port: ', PORT)
])
