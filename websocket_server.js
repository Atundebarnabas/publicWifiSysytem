const WebSocket = require('ws');
const mysql = require('mysql');
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'publicwifi'
};

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

const notifyClients = () => {
  wss.clients.forEach(client => {
    if(client.readyState === WebSocket.OPEN)
    {
      client.send('new-macs');
    }
  });
}

const deletingMACs = () => {
  wss.clients.forEach(client => {
    if(client.readyState === WebSocket.OPEN)
    {
      client.send('delete-macs');
    }
  });
}

const checkForNewMacs = () => {
  const connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if(err) throw err;  
    console.log('Connected to MySQL database (Websocket Server)');
    connection.query(
      "SELECT mac_address FROM peopleconn WHERE expired = 0 AND mac_address IS NOT NULL AND mac_address <> '' AND connected = 0 AND done = 0 AND pending = 0",
      (error, results) => {
        if(error) throw error;
        if(results.length > 0)
        {
          notifyClients();
        }
        connection.end();
      }

    );
  });
}


const checkIfExpired = async () => {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database (WebSocket Server for updating expired column for expired logins)');
  });

  const padZero = (num) => (num < 10 ? '0' : '') + num;
  const now = new Date();
  const currentDateTime = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())} ${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;

  console.log(`Current DateTime: ${currentDateTime}`);

  try {
    const results = await new Promise((resolve, reject) => {
      connection.query("SELECT * FROM peopleconn WHERE expired = 0", (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });


    for (const record of results) {
      console.log(`Before update: Expiation: ${record.expiration}`);
      const expirationDate = new Date(record.expiration);
      const expirationDateTime = `${expirationDate.getFullYear()}-${padZero(expirationDate.getMonth() + 1)}-${padZero(expirationDate.getDate())} ${padZero(expirationDate.getHours())}:${padZero(expirationDate.getMinutes())}:${padZero(expirationDate.getSeconds())}`;
      console.log(`Record: ID = ${record.loginId}, Expiration = ${expirationDateTime}`);


      console.log(`Formatted Expiration DateTime: ${expirationDateTime}`);

      if (new Date(expirationDateTime) <= new Date(currentDateTime)) {
        console.log(`Updating expired status for ID: ${record.loginId}`);

        await new Promise((resolve, reject) => {
          connection.query(
            `UPDATE peopleconn SET expired = '1' WHERE loginId = ?`,
            [record.loginId],
            (updateError, updateResults) => {
              if (updateError) return reject(updateError);
              resolve(updateResults);
            }
          );
        });

        const upcomingId = record.upcoming;
        if (upcomingId && upcomingId !== '') {
          await new Promise((resolve, reject) => {
            connection.query(
              `UPDATE peopleconn SET pending = '0', expiration = '${expirationDateTime}' WHERE loginId = ?`,
              [upcomingId],
              (updateUpcomingError, updateUpcomingResults) => {
                if (updateUpcomingError) return reject(updateUpcomingError);
                console.log(`Upcoming 'pending' column updated for ${upcomingId}`);
                resolve(updateUpcomingResults);
              }
            );
          });
        }

        console.log(`Record updated to expired: ID = ${record.loginId}`);
      }
    }
  } catch (error) {
    console.error('Error updating expired status:', error);
  } finally {
    connection.end((err) => {
      if (err) throw err;
      console.log('Disconnected from MySQL database');
    });
  }
};

const deletingExpiredMACs = () => {
  const connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if(err) throw err;  
    console.log('Connected to MySQL database (Websocket Server /deleting/)');
    connection.query(
      "SELECT mac_address FROM peopleconn WHERE expired = '1' AND mac_address IS NOT NULL AND mac_address <> '' AND connected = '1' AND done = '0'",
      (error, results) => {
        if(error) throw error;
        if(results.length > 0)
        {
          deletingMACs();
        }
        connection.end();
      }

    );
  });
}


// Check for new MACs every minute / 2
setInterval(checkForNewMacs, 30000);
setInterval(checkIfExpired, 20000);
setInterval(deletingExpiredMACs, 20000);