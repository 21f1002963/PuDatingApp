import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const PORT = 5500;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});