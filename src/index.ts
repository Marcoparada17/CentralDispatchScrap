import express from 'express';
import cors from 'cors';
import getDataRoute from './router/get-data';

const app = express();
const PORT = process.env.PORT || 3000;

// Use Express's built-in JSON parser
app.use(express.json());
app.use(cors());
// Mount our "Authentication" router at /auth
app.use('/scrapper', getDataRoute);

app.get("/", async (req, res) => {
    try {
        res.status(200).json({ message: "Page is up!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});