import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { docClient, PutCommand } from './dynamodb.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const PORT = 5500;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const dynamoDbClient = new DynamoDBClient({ region: 'eu-north-1' });

const cognitoClient = new CognitoIdentityProviderClient({ region: 'eu-north-1' });

app.post('/register', async (req, res) => {
    try {
        const userData = req.body;
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userId = crypto.randomUUID();
        const newUser = {
            id: userId,
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth,
            type: userData.type,
            location: userData.location,
            hometown: userData.hometown,
            workPlace: userData.workPlace,
            jobTitle: userData.jobTitle,
            datingPreference: userData.datingPreference || [],
            lookingFor: userData.lookingFor || [],
            imageURLs: userData.imageUrls || [],
            prompts: userData.prompts || [],
            likes: 2,
            roses: 1,
            likedProfiles: [],
            receivedLikes: [],
            matches: [],
            blockedUsers: [],
        }

        const params = {
            TableName: 'users',
            Item: newUser
        }

        await docClient.send(new PutCommand(params));

        const secretKey =
            '582e6b12ec6da3125121e9be07d00f63495ace485croc9079c30abeebd329986c5c35548b068ddb4b187391a5490c880137c1528c76ce2feacc5ad781a742e2de0'; // Use a better key management
        const token = jwt.sign({ userId: newUser.userId }, secretKey);
    }
    catch (error) {
        console.log("Error creating the user", error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

