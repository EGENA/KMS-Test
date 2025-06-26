import express from 'express';
import router from './routes';
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.route('/recipes', router);
app.route('/meal-plans', router);

const port = process.env || 5000;

app.listen(port, () => {
    console.log(`Running on port: ${port}`)
})