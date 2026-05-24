import serverless from 'serverless-http';
import { app } from '../src/app';

const handler = serverless(app);

export default async (req: any, res: any) => {
	if (req.url && !req.url.startsWith('/api')) {
		req.url = `/api${req.url}`;
	}
	return handler(req, res);
};
