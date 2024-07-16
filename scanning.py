from scapy.all import ARP, Ether, srp

def check_device_connection(ip):
    # Create ARP request packet
    arp = ARP(pdst=ip)
    ether = Ether(dst="ff:ff:ff:ff:ff:ff")
    packet = ether/arp

    # Send the packet and capture response
    result = srp(packet, timeout=3, verbose=False)[0]

    # Process the response
    for sent, received in result:
        return received.src

    return None

# Example usage with IP address
device_ip = "192.168.1.114"
connected_device_mac = check_device_connection(device_ip)

if connected_device_mac == "3E:E3:C5:AD:46:F1":
    print("Device's hotspot is ON")
else:
    print("Device's hotspot is OFF")
