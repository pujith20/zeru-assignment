import express from 'express';
import { restakersRouter } from './src/api/restakers.js';
import { rewardsRouter } from './src/api/rewards.js';
import { validatorsRouter } from './src/api/validators.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import helmet from 'helmet';
import cors from 'cors';
import { logParserMiddleware } from './src/middleware/logParserMiddleware.js';


const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use(logParserMiddleware);
app.use('/api/restakers', restakersRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/validators', validatorsRouter);


// Error handler
app.use(errorHandler);

export default app;
