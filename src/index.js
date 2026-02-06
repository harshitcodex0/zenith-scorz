import express from 'express';

const app = express();
const PORT = process.env.PORT || 4567;

app.use(express.json())
app.get('/', (req, res) => {
    res.send("Hello from express server");
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

