const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    const ipAddress = req.ip;

    fs.readFile('./allowed_ips.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Server error');
            return;
        }

        const allowedIPs = JSON.parse(data).allowed_ips;
        if (allowedIPs.includes(ipAddress)) {
            res.send('Access granted');
        } else {
            res.status(403).send('Access denied');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


















// http://192.168.1.1/login.html?_t=8630461
// await page.waitForSelector('#btnSaveRule', { visible: true, timeout: 50000 });

////////////////////////////// OLD VERSION /////////////////////

// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');

// const routerUrl = 'http://192.168.1.1/login.html?_t=8630461';
// const routerUsername = 'admin'; // Replace with your router's username
// const routerPassword = 'admin'; // Replace with your router's password
// const allowedMACsFile = './allowed_macs.json';
// const userDataDir = path.join(__dirname, 'puppeteer_data'); // Dedicated user data directory

// const getAllowedMACs = () => {
//     return new Promise((resolve, reject) => {
//         fs.readFile(allowedMACsFile, 'utf8', (err, data) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 const allowedMACs = JSON.parse(data).allowed_macs;
//                 resolve(allowedMACs);
//             }
//         });
//     });
// };

// const delay = (time) => {
//     return new Promise((resolve) => {
//         setTimeout(resolve, time);
//     });
// };

// const clickWithRetry = async (page, selector, retries = 3) => {
//     for (let attempt = 0; attempt < retries; attempt++) {
//         try {
//             const element = await page.waitForSelector(selector, { visible: true, timeout: 5000 });
//             await element.click();
//             return;
//         } catch (error) {
//             if (attempt < retries - 1) {
//                 console.warn(`Retrying click on selector: ${selector} (attempt ${attempt + 1})`);
//                 await delay(1000); // Wait for a second before retrying
//             } else {
//                 throw error;
//             }
//         }
//     }
// };

// const typeWithRetry = async (page, selector, text, retries = 3) => {
//     for (let attempt = 0; attempt < retries; attempt++) {
//         try {
//             const element = await page.waitForSelector(selector, { visible: true, timeout: 5000 });
//             await element.type(text);
//             return;
//         } catch (error) {
//             if (attempt < retries - 1) {
//                 console.warn(`Retrying type on selector: ${selector} (attempt ${attempt + 1})`);
//                 await delay(1000); // Wait for a second before retrying
//             } else {
//                 throw error;
//             }
//         }
//     }
// };

// const updateRouterSettings = async (allowedMACs) => {
//     const browser = await puppeteer.launch({
//         headless: false,
//         userDataDir // Use a dedicated user data directory
//     });

//     const page = await browser.newPage();

//     try {
//         // Log in to the router
//         await page.goto(routerUrl);
//         await clickWithRetry(page, '#loginBtn');

//         await typeWithRetry(page, '#username', routerUsername);
//         await typeWithRetry(page, '#passwd', routerPassword);
//         await clickWithRetry(page, '#btnLogin');

//         // Wait for navigation to complete
//         await page.waitForNavigation({ timeout: 10000 });

//         // Navigate to "Filtering Rules"
//         await clickWithRetry(page, '#child-FW_DMZ');
//         await clickWithRetry(page, '#FW_RULE');

//         // Wait for the new page to load and navigate to "MAC Filtering"
//         await clickWithRetry(page, '#html\\.firewall\\.macFilter\\.html');

//         // Wait for the MAC Filtering page to load
//         await page.waitForSelector('button[name="addRules"]', { visible: true, timeout: 5000 });

//         // Add allowed MACs
//         for (const mac of allowedMACs) {
//             await clickWithRetry(page, 'button[name="addRules"]');

//             // Wait for the modal to appear
//             await page.waitForSelector('#ipAddress', { visible: true, timeout: 5000 });
//             console.log(`The Mac Address to be inputed is ${mac}`)
//             await typeWithRetry(page, '#ipAddress', mac);

//             await page.waitForSelector('#btnSaveRule', { visible: true, timeout: 5000 });
//             await clickWithRetry(page, '#btnSaveRule');

//             // Wait for the rule to be added
//             await delay(500);
//         }

//         await clickWithRetry(page, 'button[name="setRules"]');

//         console.log('Router settings updated');
//     } catch (error) {
//         console.error('Error updating router settings:', error);
//     } finally {
//         await browser.close();
//     }
// };

// (async () => {
//     try {
//         const allowedMACs = await getAllowedMACs();
//         await updateRouterSettings(allowedMACs);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// })();
