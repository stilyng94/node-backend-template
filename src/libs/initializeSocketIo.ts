import { Server, Socket } from 'socket.io';
import { Server as httpServer } from 'http';

import demoHandler from '@/io_handler/demo-handler';
import jwtMiddleware from '@/middleware/jwt-middleware';
import authMiddleware from '@/middleware/auth-middleware';
import logger from '@/libs/logger';

const wrap = (middleware: any) => (socket: Socket, next: (err?: any) => void) =>
	middleware(socket.request, {}, next);

const initializeSocketIo = (server: httpServer) => {
	const io = new Server(server);

	io.use(wrap(jwtMiddleware.accessTokenMiddleware));
	io.use(wrap(authMiddleware));

	io.use((socket, next) => {
		logger.info({ request: socket.request.user.id }, 'after auth userID');
		return next();
	});

	const onConnection = (socket: Socket) => {
		socket.send('hello from server');

		demoHandler(io, socket);
	};

	io.on('connection', onConnection);
	return io;
};

export default initializeSocketIo;
