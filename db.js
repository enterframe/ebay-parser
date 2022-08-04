import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

const connect = async (cb) => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  const db = mongoose.connection
  db.once('open', cb)
}

export default connect
