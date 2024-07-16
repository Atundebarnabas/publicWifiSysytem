const express = require('express');
const router = express.Router();
const { sessionMiddleware, requireAuth, checkAlreadyLoggedIn } = require('./session');
const { exec } = require('child_process');
const path = require('path');
const connection = require('./database');
const bodyParser = require('body-parser');
const util = require('util');
const cors = require('cors');
const os = require('os');
const { generateRandomDigits, generateRandomString } = require('./randomy');

// Apply session middleware to all routes in this router
router.use(sessionMiddleware);

// Convert MySQL query to promise-based
const queryAsync = util.promisify(connection.query).bind(connection);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors());

// Serve static files (index.html and client-side JavaScript)
router.use(express.static(path.join(__dirname, 'public')));

function getServerMacAddress() {
  return new Promise((resolve, reject) => {
    const command = 'wmic nic where "NetConnectionID=\'Wi-Fi\'" get MACAddress';

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`, error);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Command error: ${stderr}`);
        reject(stderr);
        return;
      }

      // Parse the stdout to find the MAC address
      const lines = stdout.split('\n').map(line => line.trim());
      // Assuming the MAC address is the second line (index 1) after headers
      const macAddress = lines[1]; // Adjust index based on output format

      if (!macAddress) {
        reject(new Error('MAC address not found in command output'));
      } else {
        resolve(macAddress.replace(/[:-]/g, '-')); // Normalize MAC address format
      }
    });
  });
}

function getServerIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return '127.0.0.1';
}

// Endpoint to fetch server IP address
router.get('/api/server-info', (req, res) => {
  // Get the server's IPv4 address
  const interfaces = os.networkInterfaces();
  let serverIpAddress = '';
  
  Object.keys(interfaces).forEach((iface) => {
    interfaces[iface].forEach((details) => {
      if (details.family === 'IPv4' && !details.internal) {
        serverIpAddress = details.address;
      }
    });
  });

  const serverPort = process.env.PORT || 3000; // Default to port 3000 if PORT env variable is not set

  res.json({ serverIpAddress, serverPort });
});

router.get('/api/mac-addresses', async (req, res) => {
  try {
    console.log('Request received at /api/mac-addresses');

    // Fetch MAC addresses from ARP table
    const arpTable = await new Promise((resolve, reject) => {
      exec('arp -a', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          reject('Error retrieving MAC addresses');
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          reject('Error retrieving MAC addresses');
          return;
        }
        resolve(stdout);
      });
    });

    const macAddresses = arpTable.split('\n').map(line => {
      const ipMatch = line.match(/\d+\.\d+\.\d+\.\d+/);
      const macMatch = line.match(/([0-9A-Fa-f]{2}-){5}[0-9A-Fa-f]{2}/);
      return (ipMatch && macMatch) ? { ip: ipMatch[0], mac: macMatch[0] } : null;
    }).filter(Boolean);

    // Get server's own MAC address
    const serverMac = await getServerMacAddress();
    // Get server's own IP address dynamically
    const serverIp = getServerIpAddress();

    // Add server's address to the list
    macAddresses.push({ ip: serverIp, mac: serverMac });

    // Client IP (you may adjust based on your setup)
    const clientIp = req.headers['x-forwarded-for'] || (req.connection.remoteAddress && req.connection.remoteAddress.replace(/^.*:/, '')) || '';
    res.json({ macAddresses, clientIp });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});


// Route to serve index.html for /addrs
router.get('/api/addrs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

router.get('/cred', (req, res) => {
  console.log('GET /cred route hit');
  let loginId = generateRandomDigits(5);
  let passKey = generateRandomString(5);
  console.log(`Generated credentials: loginId=${loginId}, passKey=${passKey}`);
  res.setHeader('Content-Type', 'application/json');
  return res.json({ loginId, passKey });
});

router.get('/pw/auth', checkAlreadyLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Admin page
router.get('/adm/entry', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'entry.html'));
});

router.post('/login', async (req, res) => {
  const {loginId, passkey} = req.body;

  if(!loginId || !passkey)
  {
    return res.status(400).json({error: 'Login ID and Passkey are required'});
  }

  try 
  {
      // Check if loginId exists
      const queryLoginId = "SELECT * FROM Peopleconn WHERE loginId = ?";
      const loginResults = await queryAsync(queryLoginId, [loginId]);


        if(loginResults.length === 0)
        {
          // LoginId does not exist
          return res.status(401).json({error: 'You entered a wrong Login ID'});
        }

        // LoginId exists, now check the passkey
        const queryPassKey = "SELECT * FROM peopleconn WHERE loginId = ? AND passkey = ?";
        const passKeyResults = await queryAsync(queryPassKey, [loginId, passkey]);

        if(passKeyResults.length > 0)
        {
          // Successful Login
          req.session.loginId = loginId; // Set the session
          await new Promise((resolve, reject) => {
            req.session.save((err) => {
              if(err)
              {
                console.error('Session save error: ', err);  
                // return res.status(500).json({error: 'Error saving session'});
                reject(err);
              }
              else
              {
                resolve();
              }
            });
          });
          
          res.json({success: true});
        }
        else
        {
          // Incorrect passkey
          res.status(401).json({error: 'You entered a wrong Passkey'});
        }
  }
  catch (error)
  {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// Register logins
router.post('/registerPeople', (req, res) => {
  const {loginId, passKey, type, expiration } = req.body;

  // Insert data into the table
  const query = 'INSERT INTO peopleconn (loginId, passkey, type, expiration) VALUES (?, ?, ?, ?)';
  connection.query(query, [loginId, passKey, type, expiration], (err, result) => {
    if(err)
    {
      console.log('Error inserting data into the database: ', err);
      res.status(500).json({error: 'Error inserting data into the database'});
      return;
    }
    console.log('Data inserted into the database successfully: ', result);
    res.status(200).json({message: 'Data inserted successfully'});
  });
});


// Get account details for logged in account
router.get('/accountDetails', requireAuth, async (req, res) => {
  // Check if user is logged in
  if(!req.session.loginId)
  {
    return res.status(401).json({error: 'unauthorized'});
  }

  // Get the loginId of the currently logged in account
  const loginId = req.session.loginId;

  try
  {
    // Query the database for account details
    const queryAccountDetails = 'SELECT * FROM peopleconn WHERE loginId = ?';
    const accountDetails = await queryAsync(queryAccountDetails, [loginId]);

    if(accountDetails.length > 0)
    {
      // Send account details as JSON
      console.log(accountDetails);
      res.json(accountDetails[0]);
    }
    else
    {
      // Send 404 status and message
      // console.log('Account details not found, redirecting...');
      // res.status(404).json({ error: 'Account details not found' });
      res.redirect('/pw/logout');
    }
  }
  catch (error)
  {
    console.error('Account details fetch error: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }

});

// Update mac and ip address

router.post('/updateMacandIpAddress', async (req, res) => {
  const { loginId, clientMacAddress, clientIpAddress } = req.body;

  if (!loginId || (!clientMacAddress && !clientIpAddress)) {
    return res.status(400).json({ error: 'Login ID, Mac address, and IP address are required' });
  }

  try {
    // Check if loginId exists in the database
    const queryLoginId = 'SELECT * FROM peopleconn WHERE loginId = ?';
    const loginResults = await queryAsync(queryLoginId, [loginId]);

    if (loginResults.length === 0) {
      return res.status(404).json({ error: 'Login ID not found' });
    }

    // Construct the update query for mac_address and ip_address
    let updateQuery = 'UPDATE peopleconn SET mac_address = ?, ip_address = ? WHERE loginId = ?';
    const updateValues = [clientMacAddress, clientIpAddress, loginId];

    // Check if there's an existing active record with the same mac_address or ip_address
    const existingRecordQuery = 'SELECT * FROM peopleconn WHERE expired = 0 AND (mac_address = ? OR ip_address = ?)';
    const existingRecordValues = [clientMacAddress, clientIpAddress];
    const existingRecords = await queryAsync(existingRecordQuery, existingRecordValues);

    if (existingRecords.length > 0) {
      // Update upcoming for the existing active record
      const existingRecordId = existingRecords[0].loginId;
      await queryAsync('UPDATE peopleconn SET upcoming = ? WHERE loginId = ?', [loginId, existingRecordId]);

      console.log("Eidd: ", existingRecordId);
      // Set pending = 1 for the new loginId
      await queryAsync('UPDATE peopleconn SET pending = 1 WHERE loginId = ?', [loginId]);
    }

    // Execute the update query for mac_address and ip_address
    await queryAsync(updateQuery, updateValues);

    res.json({ success: true, message: 'MAC address and IP address updated successfully' });
  } catch (error) {
    console.error('Error updating MAC address and IP address:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// Serve the Dashboard page
router.get('/pw/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

router.get('/pw/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err)
    {
      console.error('Session destruction error: ', err);
      return res.status(500).json({error: 'Error logging out'});
    }
    res.redirect('/pw/auth');
  });
});

module.exports = router;