const puppeteer  = require('puppeteer');
const fileSystem = require('fs');
const downloads  = './pdfs/a_drip_of_javascript';

if (!fileSystem.existsSync(downloads)){
  fileSystem.mkdirSync(downloads);
}

// Select and filter links. Create a pseudo tuple object to use.
function extractLinks() {
  const extractedElements = document.querySelectorAll('a');
  const items = [];

  for (let element of extractedElements) {
    let name = element.innerText.toLowerCase().replace(/[^0-9a-z]/gi, '_').replace(/__/g, '_');
    let link = element.href;

    if (link.includes('blog')) {
      items.push([name, link]);
    }
  }

  return items;
}

// Remove Navbar and Ads
function removeElements() {
  document.getElementById("top-nav").remove()
  document.getElementsByClassName('message')[0].remove()
}

async function gotoLinkAndSavePdf(browser, page, links) {
  for(let link of links) {
    const filename = `${link[0]}.pdf`;

    // Navigate to url
    await page.goto(link[1], { waitUntil: 'networkidle2' });

    // Remove unwanted elements
    await page.evaluate(removeElements);

    // Print the PDF to match styling on screen
    await page.emulateMedia('screen');

    // Generate PDF with options
    await page.pdf({
      path: `./pdfs/${filename}`,
      format: 'letter',
      margin: { top: '0.5in', bottom: '0.25in' },
      printBackground: true
    });

    console.log(`[COMPLETED] Finished generating... ${filename}`)
  }
}

async function saveSinglePage() {
  const browser = await puppeteer.launch();
  const page    = await browser.newPage();

  await page.goto('https://dsdshcym.github.io/blog/2018/08/04/how-to-do-outside-in-tdd-with-phoenix/', { waitUntil: 'networkidle2' });

  // Scrape the links off of the page
  // const links = await page.evaluate(extractLinks);

  // Print the PDF to match styling on screen
  await page.emulateMedia('screen');

  // Generate PDF with options
  await page.pdf({
    path: `./bro.pdf`,
    format: 'letter',
    margin: { top: '0.5in', bottom: '0.25in' },
    printBackground: true
  });

  await browser.close();

  console.log('Done')
}

async function scrapeAndExport() {
  const browser = await puppeteer.launch();
  const page    = await browser.newPage();

  await page.goto('http://adripofjavascript.com/archive.html', { waitUntil: 'networkidle2' });

  // Scrape the links off of the page
  const links = await page.evaluate(extractLinks);

  // PDF the articles
  await gotoLinkAndSavePdf(browser, page, links)

  await browser.close();

  console.log('Done')
}

scrapeAndExport()
