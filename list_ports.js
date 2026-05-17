
const { SerialPort } = require('serialport');

async function listPorts() {
  try {
    const ports = await SerialPort.list();
    console.log('Available Serial Ports:');
    ports.forEach(port => {
      console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`);
    });
    if (ports.length === 0) {
      console.log('No serial ports found.');
    }
  } catch (err) {
    console.error('Error listing ports:', err);
  }
}

listPorts();
