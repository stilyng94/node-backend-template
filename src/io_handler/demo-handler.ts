/* eslint-disable no-console */
import { Server, Socket } from 'socket.io';

const demoHandler = (io: Server, socket: Socket) => {
	socket.on('demo', (data) => console.log('socket ', data));
};

export default demoHandler;
