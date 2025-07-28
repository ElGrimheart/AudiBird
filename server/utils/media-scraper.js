import puppeteer from 'puppeteer';

// Scrapes the Macaulay Library for an image URL and copyright information for a given species code
export async function scrapeImgUrl(speciesCode) {
    const url = `${process.env.MACAULAY_LIBRARY_URL}/catalog?taxonCode=${speciesCode}&mediaType=photo&sort=rating_rank_desc&age=adult&sex=male`;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('img.ResultsGallery-image', { timeout: 10000 });

        // Scrape image URL and copyright
        const result = await page.evaluate(() => {
            const img = document.querySelector('img.ResultsGallery-image');
            const imageUrl = img ? img.src : null;

            // Get next 'figcaption' class and extract last span
            let imageRights = null;
            if (img) {
                const figcaption = img.closest('figure')?.querySelector('figcaption');
                if (figcaption) {
                    const spans = figcaption.querySelectorAll('span');
                    if (spans.length > 0) {
                        imageRights = spans[spans.length - 1].innerText.trim();
                    }
                }
            }

            return { imageUrl, imageRights };
        });

        await browser.close();
        return result;
    } catch (err) {
        console.error(`Error scraping media for ${speciesCode}:`, err.message);
        await browser.close();
        return null;
    }
}

export async function scrapeAudioUrl(speciesCode) {
    const searchUrl = `${process.env.MACAULAY_LIBRARY_URL}/catalog?taxonCode=${speciesCode}&mediaType=audio&sort=rating_rank_desc&age=adult&sex=male`;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        // search for audio assets
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('a.ResultsGallery-link', { timeout: 10000 });
        const assetUrl = await page.$$eval('a.ResultsGallery-link', links =>
            links.length ? links[0].href : null
        );
        if (!assetUrl) {
            await browser.close();
            return null;
        }

        // access asset page
        const assetPage = await browser.newPage();
        await assetPage.goto(assetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await assetPage.waitForSelector('audio', { timeout: 10000 });

        // scrape audio URL and copyright
        const result = await assetPage.evaluate(() => {
            const audio = document.querySelector('audio');
            const audioUrl = audio ? audio.src : null;

            // extract copyright info
            let audioRights = null;
            const contributor = document.querySelector('span.main');
            if (contributor) {
                audioRights = contributor.innerText.trim();
            }

            return { audioUrl, audioRights };
        });

        await browser.close();
        return result;
    } catch (err) {
        console.error(`Error scraping audio for ${speciesCode}:`, err.message);
        await browser.close();
        return null;
    }
}