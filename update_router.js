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





const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const WebSocket = require('ws');
const { error } = require('console');

const routerUrl = 'http://192.168.1.1/login.html?_t=8630461';
const routerUsername = 'admin'; // Replace with your router's username
const routerPassword = 'admin'; // Replace with your router's password
// const allowedMACsFile = './allowed_macs.json';
const userDataDir = path.join(__dirname, 'puppeteer_data'); // Dedicated user data directory

let isDeletingMacs = false;  // Flag to track deletion process

// const macToDelete = '0e:20:61:74:76:b1'; // Replace with the MAC address you want to delete
// 0e:20:61:74:76:b1
// 00:E9:3A:10:92:F9

const dbConfig = {
    host: 'localhost',
    user: 'root', // Replace with your database username
    password: '', // Replace with your database password
    database: 'publicwifi'
}


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

const getMACsFromDatabase = () => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(dbConfig);
        connection.connect((err) => {
            if(err)
            {
                reject(err);
            }
            console.log('Connected to MYSQL database (update_router)!');

            connection.query(
                "SELECT mac_address FROM peopleconn WHERE expired = 0 AND mac_address IS NOT NULL AND mac_address <> '' AND connected = 0",
                (error, results) => {
                    if(error)
                    {
                        reject(error);
                    }
                    else
                    {
                        const macAddresses = results.map(row => row.mac_address);
                        resolve(macAddresses);
                        console.log("mac address: ", macAddresses);
                    }
                    connection.end();
                }
            );
        });
    });
};

const getMACsToDeleteFromDatabase = () => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(dbConfig);
        connection.connect((err) => {
            if(err)
            {
                reject(err);
            }
            console.log('Connected to MYSQL database (MACs to delete (done column))!');

            connection.query(
                "SELECT mac_address FROM peopleconn WHERE expired = 1 AND mac_address IS NOT NULL AND mac_address <> '' AND connected = 1",
                (error, results) => {
                    if(error)
                    {
                        reject(error);
                    }
                    else
                    {
                        const macAddresses = results.map(row => row.mac_address);
                        resolve(macAddresses);
                        console.log("Delete mac address: ", macAddresses);
                    }
                    connection.end();
                }
            );
        });
    });
};

const updateMacConnectedStatus = (macAddresses, status) => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(dbConfig);
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Connected to MySQL database (update_router) for updating status!');



            const updateOperations = macAddresses.map(macAddress => {
                return new Promise((resolve, reject) => {
                    connection.query(
                        "UPDATE peopleconn SET connected = ? WHERE mac_address = ?",
                        [status, macAddress],
                        (error, result) => {
                            if(error)
                            {
                                reject(error);
                            }
                            else
                            {
                                resolve(result);
                            }
                        }
                    );
                });
            });

            Promise.all(updateOperations)
                .then(results => {
                    resolve(results);
                })
                .catch(error => {
                    reject(error);
                })
                .finally(() => {
                    connection.end(); // Close connection after all update
                });
        });
    });
};

const updateMacDoneStatus = (macAddresses, status) => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(dbConfig);
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Connected to MySQL database (update_router) for updating status!');

            // Ensure macAddresses is an array
            if (!Array.isArray(macAddresses)) {
                macAddresses = [macAddresses];
            }

            const updateOperations = macAddresses.map(macAddress => {
                return new Promise((resolve, reject) => {
                    connection.query(
                        "UPDATE peopleconn SET done = ? WHERE mac_address = ?",
                        [status, macAddress],
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                });
            });

            Promise.all(updateOperations)
                .then(results => {
                    resolve(results);
                })
                .catch(error => {
                    reject(error);
                })
                .finally(() => {
                    connection.end(); // Close connection after all updates
                });
        });
    });
};


const isValidMACAddress = (mac) => {
    const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    if (!macRegex.test(mac)) return false;

    const firstByte = parseInt(mac.split(':')[0], 16);
    if ((firstByte & 1) !== 0) return false;

    if (mac.toLowerCase() === 'ff:ff:ff:ff:ff:ff') return false;

    return true;
};

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const clickWithRetry = async (page, selector, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const element = await page.waitForSelector(selector, { visible: true, timeout: 5000 });
            await element.click();
            return;
        } catch (error) {
            if (attempt < retries - 1) {
                await delay(200); // Reduced delay before retrying
            } else {
                throw error;
            }
        }
    }
};

const typeWithRetry = async (page, selector, text, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const element = await page.waitForSelector(selector, { visible: true, timeout: 5000 });
            await element.type(text);
            return;
        } catch (error) {
            if (attempt < retries - 1) {
                await delay(200); // Reduced delay before retrying
            } else {
                throw error;
            }
        }
    }
};


const clickButtonWithRetry = async (page, selector, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            await page.waitForSelector(selector, { visible: true, timeout: 5000 });
            await page.click(selector);
            return true;
        } catch (error) {
            console.error(`Error clicking ${selector} (Attempt ${i + 1}/${retries}):`, error);
        }
    }
    return false;
};

const findAndDeleteMacAddress = async (page, macAddress) => {
    try {
        // Wait for the MAC Filtering page to load
        await page.waitForSelector('table.list tbody tr', { visible: true, timeout: 10000 });

        // Log the table content to verify its structure
        const tableContent = await page.evaluate(() => {
            const table = document.querySelector('table.list tbody');
            return table ? table.innerHTML : null;
        });
        console.log('Table content:', tableContent);

        // Find all rows in the table and extract the MAC Address column values
        const macAddresses = await page.$$eval('table.list tbody tr td:nth-child(4)', cells =>
            cells.map(cell => cell.textContent.trim())
        );
        console.log(`Found ${macAddresses.length} MAC addresses in the table:`, macAddresses);

        for (let i = 0; i < macAddresses.length; i++) {
            if (macAddresses[i].toUpperCase() === macAddress.toUpperCase()) {
                console.log(`Found MAC address at row ${i + 1}: ${macAddress}`);
                
                // Get the corresponding row to click the delete button
                const row = await page.$(`table.list tbody tr:nth-child(${i + 1})`);
                const columns = await row.$$('td');
                const deleteButton = await page.$(`${row} td:nth-child(6) button`);

                if (deleteButton) {
                    await deleteButton.click();
                    console.log(`Clicked delete for MAC address: ${macAddress}`);

                    // Wait for the confirm modal and click "confirm"
                    await page.waitForSelector('#confirm', { visible: true, timeout: 10000 });
                    const confirmButton = await page.$('#confirm');
                    if (confirmButton) {
                        await confirmButton.click();
                        console.log(`Confirmed deletion for MAC address: ${macAddress}`);

                        // Wait for the confirm modal to close
                        await page.waitForSelector('#confirm', { hidden: true, timeout: 10000 });
                        console.log('Confirmation modal closed');

                        // Click "setRules" button directly after confirmation
                        const setRulesClicked = await clickButtonWithRetry(page, 'button[name="setRules"]');
                        if (setRulesClicked) {
                            console.log('Set rules button clicked');

                            // Wait for the final confirm modal and click "confirm"
                            await page.waitForSelector('#confirm', { visible: true, timeout: 10000 });
                            const confirmButton2 = await page.$('#confirm');
                            if (confirmButton2) {
                                await confirmButton2.click();
                                console.log('The final CONFIRM button clicked');
                            } else {
                                console.log('Unable to click the last CONFIRM button');
                            }
                            return true;
                        } else {
                            console.error('Failed to click set rules button');
                            return false;
                        }
                    } else {
                        console.error('Confirm button not found');
                        return false;
                    }
                }
            }
        }

        console.log(`MAC address not found: ${macAddress}`);
        return false;
    } catch (error) {
        console.error('Error deleting MAC address:', error);
        return false;
    }
};

const deleteMacAddress = async (page, macAddress) => {
    try {
        // Click on the MAC Filtering link to navigate to the MAC Filtering page
        await clickWithRetry(page, '#html\\.firewall\\.macFilter\\.html');

        // Wait for the MAC Filtering page to load
        await page.waitForSelector('table.list tbody tr', { visible: true, timeout: 10000 });

        // Find all rows in the table
        const rows = await page.$$('table.list tbody tr');

        // Find all rows in the table and extract the MAC Address column values
        const macAddresses = await page.$$eval('table.list tbody tr td:nth-child(4)', cells =>
            cells.map(cell => cell.textContent.trim())
        );
        console.log(`Found ${macAddresses.length} MAC addresses in the table:`, macAddresses);

        // Variable to track if MAC address is found
        let macFound = false;

        // Iterate through each row to find and delete the MAC address
        for (const row of rows) {
            // Extract text content from each column
            const columns = await row.$$('td');
            if (columns.length === 0) continue; // Skip if there are no columns

            const macColumnText = await page.evaluate(cell => cell.textContent.trim(), columns[3]);

            if (macColumnText === macAddress.toUpperCase()) {
                // Click the delete button in the corresponding row
                const deleteButton = await columns[6].$('button'); // Assuming delete button is in 7th column (index 6)
                if (deleteButton) {
                    await deleteButton.click();
                    console.log(`Clicked delete for MAC address: ${macAddress}`);

                    // Wait for the confirm modal and click "confirm"
                    await page.waitForSelector('#confirm', { visible: true, timeout: 10000 });
                    const confirmButton = await page.$('#confirm');
                    if (confirmButton) {
                        await confirmButton.click();
                        console.log(`Confirmed deletion for MAC address: ${macAddress}`);
                        
                        // Wait for the confirm modal to close
                        await page.waitForSelector('#confirm', { hidden: true, timeout: 10000 });
                        console.log('Confirmation modal closed');

                        // Click "setRules" button directly after confirmation
                        await clickWithRetry(page, 'button[name="setRules"]');
                        console.log('Set rules button clicked');

                        // Wait for the final confirm modal and click "confirm"
                        await page.waitForSelector('#confirm', { visible: true, timeout: 10000 });
                        const finalConfirmButton = await page.$('#confirm');
                        if (finalConfirmButton) {
                            await finalConfirmButton.click();
                            console.log('The final CONFIRM button clicked');
                            // Update the connected column in database
                            console.log(macAddress, " yeahhh");
                            await updateMacDoneStatus(macAddress, 1);
                        } else {
                            console.log('Unable to click the last CONFIRM button');
                        }

                        macFound = true;
                        break; // Exit loop after successful deletion
                    } else {
                        console.error('Confirm button not found');
                        return false;
                    }
                }
            }
        }

        if (!macFound) {
            console.log(`MAC address not found: ${macAddress}`);
        }

        return macFound;
    } catch (error) {
        console.error('Error deleting MAC address:', error);
        return false;
    }
};






const updateRouterSettings = async (allowedMACs) => {
    let browser;
    let page;
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        userDataDir
    });

    page = await browser.newPage();

    // Add a listener for the 'dialog' event
    page.on('dialog', async (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept(); // Click the 'OK' button
    });

    try {
        await page.goto(routerUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        await clickWithRetry(page, '#loginBtn');

        await typeWithRetry(page, '#username', routerUsername);
        await typeWithRetry(page, '#passwd', routerPassword);
        await clickWithRetry(page, '#btnLogin');

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

        await clickWithRetry(page, '#child-FW_DMZ');
        await clickWithRetry(page, '#FW_RULE');
        await clickWithRetry(page, '#html\\.firewall\\.macFilter\\.html');

        // await deleteMacAddress(page, macToDelete);

        await page.waitForSelector('button[name="addRules"]', { visible: true, timeout: 5000 });

        // Iterate over each MAC address and add it to the router settings
        for (const mac of allowedMACs.filter(isValidMACAddress)) {
            console.log("Processing MAC address:", mac);

            try {
                await clickWithRetry(page, 'button[name="addRules"]');
                await page.waitForSelector('#ipAddress', { visible: true, timeout: 5000 });
                await typeWithRetry(page, '#ipAddress', mac);
                await clickWithRetry(page, '#btnSaveRule');
                await delay(100); // Adjust delay as needed
            } catch (error) {
                console.error("Error processing MAC address:", error.message);
                // Update the connected column in database
                const allowedMACs = await getMACsFromDatabase();
                await updateMacConnectedStatus(allowedMACs, 0);
            }
        }

        try {
            await page.waitForSelector('button[name="setRules"]', { visible: true, timeout: 10000 }); // Ensure 'setRules' button is visible
            await clickWithRetry(page, 'button[name="setRules"]');
            await delay(200);
            console.log('Clicked on "Set Rules" button successfully.');

            // Update the connected column in database
            const allowedMACs = await getMACsFromDatabase();
            await updateMacConnectedStatus(allowedMACs, 1);
        } catch (error) {
            console.error('Error clicking on "Set Rules" button:', error.message);
        }

        console.log('Router settings updated');
    } catch (error) {
        console.error('Error updating router settings:', error);
        // Update the connected column in database
        const allowedMACs = await getMACsFromDatabase();
        await updateMacConnectedStatus(allowedMACs, 0);
    } finally {
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }
};

const deleteMACsRouterSettings = async (allowedMACs) => {
    let browser;
    let page;
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        userDataDir
    });

    page = await browser.newPage();

    // Add a listener for the 'dialog' event
    page.on('dialog', async (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept(); // Click the 'OK' button
    });

    try {
        await page.goto(routerUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        await clickWithRetry(page, '#loginBtn');

        await typeWithRetry(page, '#username', routerUsername);
        await typeWithRetry(page, '#passwd', routerPassword);
        await clickWithRetry(page, '#btnLogin');

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

        await clickWithRetry(page, '#child-FW_DMZ');
        await clickWithRetry(page, '#FW_RULE');
        await clickWithRetry(page, '#html\\.firewall\\.macFilter\\.html');

        // await deleteMacAddress(page, macToDelete);

        // await page.waitForSelector('button[name="addRules"]', { visible: true, timeout: 5000 });

        // Iterate over each MAC address and delete it from the router settings
        for (const mac of allowedMACs.filter(isValidMACAddress)) {
            console.log("Processing MAC address:", mac);
            await deleteMacAddress(page, mac);
        }

        console.log('Router settings updated');
    } catch (error) {
        console.error('Error updating router settings:', error);
    } finally {
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    }
};

const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.on('open', () => {
        console.log('Connected to Websocket Server!');
    });

    ws.on('message', async (message) => {
        console.log('Recieved message from WebSocket server: ', message);

        if(message === 'new-macs')
        {
            try
            {
                const allowedMACs = await getMACsFromDatabase();
                await updateRouterSettings(allowedMACs);
            }
            catch (error)
            {
                console.error('Error: ', error);
            }
        }

        if(message === 'delete-macs')
        {
            if(!isDeletingMacs)
            {
                isDeletingMacs = true; // Set flag to indicate deletion process is running
                try
                {
                    const allowedMACs = await getMACsToDeleteFromDatabase();
                    const success = await deleteMACsRouterSettings(allowedMACs);
                    if (success) {
                      console.log('MAC address deletion process completed successfully');
                    } else {
                      console.log('MAC address deletion process encountered errors');
                    }
                }
                catch (error)
                {
                    console.error('Error: ', error);
                }
                finally {
                    isDeletingMacs = false; // Reset flag after deletion process is complete
                }
            }
            else
            {
                console.log('Deletion process already running, skipping new request');
            }
        }
    });

    ws.on('close', () => {
        console.log('Disconnected from WebSocket server, attempting to reconnect....');
        setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
    });

    ws.on('error', (error) => {
        console.log('Websocket error: ', error);
    });
};

connectWebSocket();

// const measureExecutionTime = async () => {
//     const startTime = process.hrtime();

//     try {
//         const allowedMACs = await getMACsFromDatabase();
//         await updateRouterSettings(allowedMACs);
//     } catch (error) {
//         console.error('Error:', error);
//     }

//     const endTime = process.hrtime(startTime);
//     const executionTimeMs = endTime[0] * 1000 + endTime[1] / 1000000;
//     console.log(`Script execution time: ${executionTimeMs.toFixed(2)} ms`);
// };

// measureExecutionTime();
// setInterval(measureExecutionTime, 5 * 60 * 1000); // 5 minutes in milliseconds