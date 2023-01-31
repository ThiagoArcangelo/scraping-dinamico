const pup = require('puppeteer');

const url = 'https://www.mercadolivre.com.br/';
const searchFor = 'macbook';

let c = 1;
const list = [];

(async() => {
  // Abrir o navegador, obj headless: true trabalha sem aparecer.
  const browser = await pup.launch({headless: true});
  // browser.newPage abre uma página nova
  const page = await browser.newPage();
  console.log('Iniciei');

  // page.goto busca a url selecionada;
  await page.goto(url);
  console.log('Fui para a URL!');

  // Função que escreve a request page.type(identificador, conteudo de busca);
  await page.waitForSelector('#cb1-edit'); // espera ate encontrar o seletor
  await page.type('#cb1-edit', searchFor) ;

  // para clicks em uma nova navegação necessario a promise do puppeteer
  await Promise.all([
    page.waitForNavigation(),
    // metodo para cliclar no botão
    await page.click('.nav-search-btn')
  ]);

  // execulta o document.querySelectorAll() dentro da pagina. classe > tag 
  const links = await page.$$eval('.ui-search-result > a', element => element.map(link => link.href));

  // $$eval = document.querySelectorAll(); || $eval = document.querySelector()

  for(const link of links) {
    if(c === 10) continue;
    console.log('Página', c)
    await page.goto(link);
    await page.waitForSelector('.ui-pdp-title');

    const title = await page.$eval('.ui-pdp-title', element => element.innerText);
    const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);

    const seller = await page.evaluate(() => {
      const element = document.querySelector('ui-pdp-seller__link-trigger');
      if(!element) return null;
      return element.innerText; 
    });

    const obj = {};
    obj.title = title;
    obj.price = price;
    (seller ? obj.seller = seller : "")
    obj.link = link;

    list.push(obj);

    c++;
  } 

  console.log(list);

  await browser.close();
})();