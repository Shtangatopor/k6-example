import ws from 'k6/ws';
import {check} from 'k6';
import uuid from './uuid.js';

export let options = {
	stages: [
		{duration: '10s', target: 1},
		{duration: '20s', target: 2},
		{duration: '30s', target: 3},
		{duration: '40s', target: 5},
		{duration: '30s', target: 3},
		{duration: '20s', target: 2},
		{duration: '10s', target: 1},
	],
};

export default function () {
	const url = 'wss://example.com';
	let uuid4 = uuid.v4();
	let registerDevice = {
		"action": "registerDevice",
		"correlationId": uuid4,
		"data": {
			"appPackage": "com.example.example",
			"providerUid": "example",
			"deviceUid": uuid4
		}
	}

	const res = ws.connect(url, null, function (socket) {

		console.log('Message sent' + registerDevice);
		socket.send(JSON.stringify(registerDevice));

		socket.on('message', (data) => {
			let correlationId, deviceAddress;
			correlationId = JSON.parse(data);
			deviceAddress = JSON.parse(data);
			correlationId = correlationId.correlationId;
			deviceAddress = deviceAddress.data.deviceAddress;

			console.log('Message received correlationId: ', correlationId);
			console.log('Message received deviceAddress: ', deviceAddress);

			socket.setTimeout(function () {
				let uuid4 = uuid.v4();
				let sendMessage = {
					"action": "sendMessage",
					"correlationId": correlationId,
					"data": {
						"deviceAddress": deviceAddress,
						"content": {
							"clientId": uuid4,
							"client": {
								"name" : "Vasya Pypkin",
								"phone": "89832914001",
								"email": "test@gmail.com"
							},
							"text": "Добрый день, мистер оператор!",
							"uuid": uuid4
						},
						"important": true
					}
				}
				socket.send(JSON.stringify(sendMessage))
			}, 1000);
		});

		socket.on('close', () => console.log('disconnected'));
		socket.setTimeout(function () {
			console.log('2 second passed, closing the socket');
			socket.close();
		}, 2000);
	});

	check(res, {'status is 101': (r) => r && r.status === 101});
}

