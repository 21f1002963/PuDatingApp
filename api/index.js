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
        const hashedPassword = await bcrypt.hash(userData?.password, 10);
        const userId = crypto.randomUUID();

        const newUser = {
            userId: userId,
            email: userData.Email,
            password: hashedPassword || '',
            firstName: userData.firstName,
            lastName: userData.lastName || '',
            gender: userData.gender || '',
            dateOfBirth: userData.dateOfBirth || '',
            type: userData.type,
            location: userData.location || '',
            hometown: userData.hometown,
            workPlace: userData.workPlace || '',
            jobTitle: userData.jobTitle || '',
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
            '582e6b12ec6da3125121e9be07d00f63495ace020ec9079c30abeebd329986c5c35548b068ddb4b187391a5490c880137c1528c76ce2feacc5ad781a742e2de0'; // Use a better key management
        const token = jwt.sign({ userId: newUser.userId }, secretKey);
        res.status(200).json({token});
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

app.get('/matches', async (req, res) => {
    const { userId } = req.query;

    try{
        if(!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const params = {
            TableName: 'users',
            Key: {
                userId
            }
        }

        const { userResult } = await dynamoDbClient.send(new GetCommand(params));

        if(!userResult.Item) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = {
            userId: userResult.Item.userId,
            gender: userResult.Item.gender,
            datingPreference: userResult.Item.datingPreference?.map(pref => pref) || [],
            matches: userResult.Item.matches?.map(match => match) || [],
            likedProfiles: userResult.Item.likedProfiles?.map(liked => likedUserId ) || [],
        }

        const genderFilters = user?.datingPreference?.map(g => {{S:g}});

        const excludeIds = [
            ...user?.matches,
            ...user.likedProfiles,
            user.userId
        ].map(id => ({S: id}));

        const scanParams={
            TableName: 'users',
            FilterExpression: 'userId <> :currentUserId AND (contains(:genderPref, gender)) AND NOT contains(:excludedIds, userId)',
            ExpressionAttributeValues: {
                ':currentUserId': {S: user.userId},
                ':genderPref': {L: genderFilter.length > 0 ? genderFilter : [{S: 'None'}]},
                ':excludedIds': {L: excludeIds}
            },
        }

        const scanResult = await dynamoDbClient.send(new ScanCommand(scanParams));

        const matches = scanResult.Items.map(item => ({
            userId: item.userId.S,
            email: item.email.S,
            firstName: item.firstName.S,
            gender: item.gender.S,
            location: item.location.S,
            lookingFor: item.lookingFor.S,
            dateOfBirth: item.dateOfBirth.S,
            hometown: item.hometown.S,
            type: item.type.S,
            jobTitle: item.jobTitle.S,
            workPlace: item.workPlace.S,
            imageUrls: item.imageUrls.L.map(image => image.S) || [],
            prompts: item.prompts.L.map(prompt => ({
                question: prompt.M.question.S,
                answer: prompt.M.answer.S
            })) || [],
        }));

        res.status(200).json({matches});

    }catch(error){
        console.log("Error fetching matches", error);
        res.status(500).json({error: 'Internal server error'});
    }
})

app.get('/user-info', async (req, res) => {
    const { userId } = req.query;

    if(!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try{
        const params = {
            TableName: 'users',
            Key: {
                userId
            }
        }

    const command = new GetCommand(params);
    const result = await dynamoDbClient.send(command);

    if(!result.Item) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({message: 'User found', user: result.Item});

    }catch(error){
        console.log("Error fetching user info", error);
        res.status(500).json({error: 'Internal server error'});
    }

})

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if(!authHeader) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    const token = authHeader.split(' ')[1];
    console.log("Recieved Token:", token);

    const secretKey =
            '582e6b12ec6da3125121e9be07d00f63495ace020ec9079c30abeebd329986c5c35548b068ddb4b187391a5490c880137c1528c76ce2feacc5ad781a742e2de0';
    jwt.verify(token, secretKey, (err, user) => {
        if(err) {
            return res.status(403).json({error: 'Invalid or Expired Token'});
        }

        req.user = user;
        next();
    })
}

app.post('/like-profile', authenticateToken, async (req, res) => {
    const {userId, likedUserId, image, comment = null, type, prompt} = req.body;

    if(req.user.userId !== userId) {
        return res.status(403).json({error: 'Unauthorized'});
    }

    if(!likedUserId || !userId || !type) {
        return res.status(400).json({error: 'Missing required fields'});
    }

    try{
        const userParams = {
            TableName: 'users',
            Key: {
                userId
            }
        }
    
    const userData = await dynamoDbClient.send(new GetCommand(userParams));

    if(!userData.Item) {
        return res.status(404).json({error: 'User not found'});
    }

    const user = userData.Item;
    const likesRemaining = user.likes.N;
    console.log("Likes Remaining:", likesRemaining);
    const likesLastUpdated = new Date(user?.likesLastUpdated?.S || '0');
    console.log("Likes Last Updated:", likesLastUpdated);
    const now = new Date();
    const maxlikes = 2;
    const oneDay = 24 * 60 * 60 * 1000;

    const timeSinceLastLike = now - likesLastUpdated;
    console.log("Time Since Last Like:", timeSinceLastLike);

    if(timeSinceLastLike >= oneDay) {
        const resetParams = {
            Tablename: 'users',
            Key: {
                userId
            },
            UpdateExpression: 'SET likes = :maxLikes, likesLastUpdated = :now',
            ExpressionAttributeValues: {
                ':maxLikes': {N: maxLikes.toString()},
                ':now': {S: now.toISOString()}
            }
        }
        await dynamoDbClient.send(new UpdateCommand(resetParams));
        user.likes ={N:maxLikes.toString()};
    }else if(likesRemaining <= 0) {
        return res.status(403).json({message: 'Daily like limit reached, please subscribe or try again tomorrow'});
    }
    const newLikes = likesRemaining - 1;

    const decrementLikesParams = {
        TableName: 'users',
        Key: {
            userId
        },
        UpdateExpression: 'SET likes = :newLikes',
        ExpressionAttributeValues: {
            ':newLikes': {N: newLikes.toString()}
        }
    }

    await DynamoDBClient.send(new UpdateCommand(decrementLikesParams));

    let newLike = {userId, type};

    if(type === 'image') {
        if(!image) {
            return res.status(400).json({error: 'Image URL is required'});
        }
        newLike.image = image;
    }
    else if(type === 'prompt') {
        if(!prompt || !prompt.question || !prompt.answer) {
            return res.status(400).json({error: 'Prompt is required'});
        }
        newLike.prompt = prompt;
    }

    if(comment)
        newLike.comment = comment;

    const updatedReceivedLikesParams ={
        TableName: 'users',
        Key: {
            userId: likedUserId
        },
        UpdateExpression: 'SET receivedLikes = list_append(if_not_exists(receivedLikes, :empty_list), :newLike)',
        ExpressionAttributeValues: {
            ':newLike': {L: [newLike]},
            ':empty_list': {L: []}
        }
    }

    await dynamoDbClient.send(new UpdateCommand(updatedReceivedLikesParams));

    const updatedLikedParams = {
        TableName: 'users',
        Key: {
            userId
        },
        UpdateExpression: 'SET likedProfiles = list_append(if_not_exists(likedProfiles, :empty_list), :likedUserId)',
        ExpressionAttributeValues: {
            ':likedUserId': {L: [likedUserId]},
            ':empty_list': {L: []}
        },
        ReturnValues: 'UPDATED_NEW'
    }

    await dynamoDbClient.send(new UpdateCommand(updatedLikedParams));

    res.status(200).json({message: 'Profile liked successfully'});
    }catch(error){
        console.log("Error liking profile", error);
        res.status(500).json({error: 'Internal server error'});
    }
})

app.get('/recieved-likes/:userId', authenticateToken, async (req, res) => {
    const {userId} = req.params;

    if(req.user.userId !== userId) {
        return res.status(403).json({error: 'Unauthorized'});
    }

    try{
        const userParams = {
            TableName: 'users',
            Key: {
                userId: userId
            },
            ProjectionExpression: 'receivedLikes'
        }

        const userData = await dynamoDbClient.send(new GetCommand(userParams));

        if(!userData.Item) {
            return res.status(404).json({error: 'User not found'});
        }

        const receivedLikes = userData?.Item?.receivedLikes || [];
        const enrichedLikes = await Promise.all(receivedLikes.map(async like => {
            const userParams = {
                TableName: 'users',
                Key: {
                    userId: like.userId
                },
                ProjectionExpression: 'userId, firstName, imageUrls, prompts',
            }

            const userData = await dynamoDbClient.send(new GetCommand(userParams));
            console.log("User Data:", userData);

            const user = userData?.Item ? {
                userId: userData.Item.userId.S,
                firstName: userData.Item.firstName.S,
                imageUrls: userData.Item.imageUrls.L.map(image => image.S) || [],
                prompts: userData.Item.prompts.L.map(prompt => ({
                    question: prompt.M.question.S,
                    answer: prompt.M.answer.S
                })) || []
            } : { userId: like.userId, firstName: null, imageUrls: null };

            return {...like, userId: user.userId};
        }))
        res.status(200).json({receivedLikes: enrichedLikes});
    }catch(error){
        console.log("Error fetching received likes", error);
        res.status(500).json({error: 'Internal server error'});
    }
})