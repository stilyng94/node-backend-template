/* eslint-disable no-console */
import dbClient from '@/libs/db-client';
import { Server, Socket } from 'socket.io';

const documentHandler = (io: Server, socket: Socket) => {
	socket.on('join', (documentId) => {
		socket.join(documentId);
	});
	socket.on('typing', (data) => {
		socket.broadcast.to(data.room).emit('changes', data);
	});
	socket.on('save', async (data) => {
		await dbClient.document.update({
			where: { id: data.room },
			data: { content: data.content },
		});
	});
};

export default documentHandler;
