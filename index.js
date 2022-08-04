import connect from "./db.js"
import mongoose from "mongoose"
import chalk from "chalk"
import parse$ from "./parse.js"
import terminalLink from "terminal-link"
import ansiEscapes from "ansi-escapes"
import got from "got"
import notifier from "node-notifier"

const note = new notifier.NotificationCenter();

const EBAY_URL = 'https://www.ebay.de/b/Fahrradausrustung/7294/bn_1678221?rt=nc&LH_BIN=1&LH_SellerType=1&_dmd=1&_sop=10&LH_PrefLoc=1'
const REFRESH_SECONDS = 5

// logging
const success = msg => console.log(chalk.green(msg))

const ItemModel = mongoose.model('Item', {
  id: String,
  url: String,
  title: String,
  image: String,
  price: String,
  shipping: String,
  date: String,
})

const store = async (model, data) => {
  const found = await model.findOne({id: data.id})
  return found ? false : await new model(data).save() && true
}

const removeOld = async (model) => {
  await model.deleteMany({date: {$lte: (new Date().getTime() - (1000 * 60 * 60 * 24))}})
}

const notify = (item) => {
  note.notify(
    {
      title: item.title,
      message: item.price,
      icon: item.image,
      contentImage: item.image,
      sound: false,
      wait: true,
      sticky: true,
      open: item.url,
    },
    (err, response, metadata) => {
    }
  );
}

const log = async (item) => {
  // request image
  let image
  try {
     image = item.image && await got(item.image)
  } catch (e) {}

  notify(item)

  const link = terminalLink(item.title, item.url)
  process.stdout.write('\n')
  success(`${link}`)
  console.log(chalk.yellow(item.price));
  image && console.log(ansiEscapes.image(image.rawBody))
  process.stdout.write('\x07')
}

const start = async () => {
  let items = []
  try {
    items = await parse$(EBAY_URL)
  } catch(e) {
    process.stdout.write('\n')
    console.log(chalk.red(`Error getting data: ${e}`));
  }

  await removeOld(ItemModel)

  for (const key in items) {
    const item = items[key]
    const stored = await store(ItemModel, item)
    stored && await log(item)
  }
  process.stdout.write('.')
  setTimeout(start, REFRESH_SECONDS * 1000)
}

connect(() => {
  success(`parsing ${EBAY_URL}`)
  start()
})
