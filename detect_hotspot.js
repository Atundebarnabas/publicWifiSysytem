const pcap = require('pcap');

const AUTHORIZED_MAC = '3E-E3-C5-AD-46-F1'; // Replace with the authorized device's MAC address
let hotspotActive = false; // Track the current state of the hotspot

// Create a session to capture packets
const pcapSession = pcap.createSession('Wi-Fi', `ether host ${AUTHORIZED_MAC}`);

pcapSession.on('packet', function(rawPacket) {
    const packet = pcap.decode.packet(rawPacket);

    // Check if the packet is from or to the authorized MAC address
    if (packet.payload && packet.payload.payload && packet.payload.payload.ethertype === 2048) { // IPv4 packet
        const ipPacket = packet.payload.payload;

        // Example: Check for specific traffic patterns or protocols indicative of hotspot activity
        if (ipPacket.saddr === '192.168.1.114') {
            // Example: Detect HTTP traffic to port 80 or 443 indicating hotspot is active
            if (ipPacket.payload && (ipPacket.payload.dport === 80 || ipPacket.payload.dport === 443)) {
                hotspotActive = true;
                console.log(`Hotspot from device ${AUTHORIZED_MAC} is ON.`);
            }
        }
    }
});

// Periodically check and log the hotspot status
function checkHotspotStatus() {
    if (!hotspotActive) {
        console.log(`Hotspot from device ${AUTHORIZED_MAC} is OFF.`);
    }
    hotspotActive = false; // Reset for the next check
}

// Run the status check every 30 seconds
setInterval(checkHotspotStatus, 30000);

console.log('Monitoring hotspot status through network traffic...');
