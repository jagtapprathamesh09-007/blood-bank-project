const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const requestRoutes = require('./routes/requestRoutes');
const initCronJobs = require('./utils/cronScheduler');
const dispatchRoutes = require('./routes/dispatchRoutes');
const donorRoutes = require('./routes/donorRoutes');

// Config
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/donors', donorRoutes);

// Socket.io Setup (Real-Time Communication ke liye)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`⚡ Socket Connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(` Socket Disconnected: ${socket.id}`);
    });
});

// App level export for socket
app.set('io', io);

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: "Blood Bank Optimization & Cold-Chain API Running 🩸" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

// Start Cron Jobs (Automated Background Scheduler)
initCronJobs(io);

server.listen(PORT, () => {
    console.log(` Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`);
});