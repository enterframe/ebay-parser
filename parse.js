import parser from "node-html-parser"
import got from "got"

const { parse } = parser;

const parseHtml = html => {
  const root = parse(html)
  return root.querySelectorAll('.s-item').map((item) => ({
    // id, url
    ...(node => ({
      id: node.attrs['href'].match(/(\d+)/)[1],
      url: node.attrs['href'].replace(/\?.*/, ''),
    }))(item.querySelector('.s-item__link')),
    // title, image
    ...(node => ({
      title: node.attrs['alt'],
      image: node.attrs['src'] || node.attrs['data-src'] || null,
    }))(item.querySelector('.s-item__image-img')),
    // prices, shipping, date
  	...{
      price: item.querySelector('.s-item__price').text,
      shipping: (node => node ? node.text : null)(item.querySelector('.s-item__shipping')),
      date: new Date().getTime()
    }
  }))
}

const parse$ = async url => {
  let response
  try {
    response = await got(url, {
      timeout: 5000,
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6,it;q=0.5,sv;q=0.4,ar;q=0.3,th;q=0.2,ru;q=0.1,tr;q=0.1,es;q=0.1,pl;q=0.1,mt;q=0.1',
      }
    })
  } catch(e) {
    throw new Error(e)
  }
  return parseHtml(response.body)
}

export default parse$
