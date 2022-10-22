import crypto from 'crypto';
import { promisify } from 'util';

const asyncScrypt = promisify(crypto.scrypt);
const asyncRandomBytes = promisify(crypto.randomBytes);

export default { asyncScrypt, asyncRandomBytes };
