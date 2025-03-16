import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dayjs from 'dayjs';
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import crypto from 'crypto';
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  
} from '@aws-sdk/client-cognito-identity-provider';
import {docClient, PutCommand} from './db.js';
import {
  BatchGetCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {profile} from 'console';
import http from 'http';
import {Server, Socket} from 'socket.io';

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const PORT = 9000;

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
            userId: userId,
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

app.post('/sendOtp', async(req, res) => {
    const {email, password} = req.body;
    
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({error: 'Invalid email'});
    }

    const signUpParams = {
        ClientId: '7ahftivg9h2i2pek766p45fu68',
        Username: email,
        Password: password,
        UserAttributes: [
            {
                Name: 'email',
                Value: email
            }
        ]
    }

    try{
        const command = new SignUpCommand(signUpParams);
        console.log("Command:", command);
        await cognitoClient.send(command);
        res.status(200).json({message: 'OTP sent successfully'});
    } catch(error){
        console.log("Sign up Params:", signUpParams);
        console.error("Error sending OTP:", error);
        res.status(400).json({ error: error.message || 'Failed to send OTP. Please try again', details: error.message });
    }

})

app.post('/resendOtp', async(req, res) => {
    const {email} = req.body;

    const resendOtpParams = {
        ClientId: '7ahftivg9h2i2pek766p45fu68',
        Username: email
    }

    try{
        const command = new ResendConfirmationCodeCommand(resendOtpParams);
        await cognitoClient.send(command)
        res.status(200).json({message: "OTP resent successfully"})
    } catch(error){
        res.status(400).json({error: 'Failed to resend OTP. Please try again'});
    }
})

app.post('/confirmSignUp', async(req, res) => {
    const {email, enteredotp} = req.body;

    // const cognitoUsername = await fetchCognitoUsernameByEmail(email); // Implement this function

    // if (!cognitoUsername) {
    //     return res.status(400).json({ error: 'User not found or username missing.' });
    // }

    const confirmParams = {
        ClientId: '7ahftivg9h2i2pek766p45fu68',
        Username: email,
        ConfirmationCode: enteredotp
    }

    try{
        console.log("Confirm Params:", confirmParams);
        const command = new ConfirmSignUpCommand(confirmParams);
        await cognitoClient.send(command);
        res.status(200).json({message: 'Email verified successfully'});
    }catch(error){
        res.status(400).json({error: 'Failed to confirm OTP. Please try again'});
    }
})

