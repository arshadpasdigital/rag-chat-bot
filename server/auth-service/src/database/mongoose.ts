import { database } from '../lib/database';

// Backward-compatible function API; new code should use the Database singleton directly.
export const connectDatabase = (uri?: string) => database.openConnection(uri);
export const disconnectDatabase = () => database.closeConnection();
