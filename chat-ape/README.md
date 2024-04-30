# Chat-Ape
Chat-Ape is a real-time chat app made with React, and Node js backend.

## Features
- **Sign-in With Google** or Native Account
- Enable / Disable **2 Factor Authentication** With Google Authenticator
- Sending Text And Images though Chats
- Create Group Chats With Group Image (Optional)
- **RBAC** for Group Admins (Member & Admins Management)
- Deleting the sent messages
- Upload and change Profile Pictures
- Real-Time Communication in Chats
- Sending a Friend Request
- Accepting or Declining te Friend Request
- Unfriend
- Edit Your Bio 

## Pre-requisites
**Nodejs** and **Redis** (optional) must be installed on you machine.

## Technologies Used

### Frontend

Following technologies are used to build the frontend
- React with TS
- Tanstack Query for api calls
- Zod for runtime schema validaiton
- React Router Dom for Routing
- Formik for complex form handling
- Socket.io client for web socket integration
- Tailwind CSS
- Vitest for testing
- MSW for mocking api calls in tests

### Backend
Following technologies are used for the backend

- Node js with TS
- Socket.io for Web Sockets
- Expressjs
- Winston for Logging
- Zod for runtime validation
- Ioredis for redis integration
- mongodb 
- mongodb-memory-server for testing
- Supertest and Jest for testing
- Multer for handling multipart forms
- JWT for authentication
- Express validator for validation of requests data

## Installation
For instial installation you need to clone the repo in you local machine.

```
git clone https://github.com/MrSaadMasood/advanced-fullstack-projects.git
```
then navigate to the directories for client and server as **/chat-ape/client** and **/chat-ape/server** and run 
```
npm ci
```
for clean installation of the dependencies

## Running the Application

## Backend
Before running the backend you **must** first start the Redis server either direcly on you machine or through a container and then provide the necessary **Environmental Variables** . Here is a list of all the env you need to provide for the server to start.

```
MONGO_URL
PORT
BASE_URL // server url with port like "https://localhost:3000"
ACCESS_SECRET // a random hex string
REFRESH_SECRET // a random hex string
CROSS_ORIGIN // client url like "http://localhost:5173"
GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_ID
F2A_SECRET // a random hex string
LOGGER_LEVEL // log level for winston
REDIS_PORT // redis cloud connection port --defaults to 6379
REDIS_HOST // redis cloud connection string --defaults to "localhost" 
REDIS_PASSWORD // redis cloud password --defaults to empty string
```
If you dont want to use the Redis Cloud you need to start redis server locally and expose the port 6379

The **LOGGER_LEVEL** here will have a default value of **info** . You can provide custom level for loggin and then add the logging statements in the code to get customized logs
After providing these env either through an .evn file or using the command line you can use.

```
npm run dev
```

to run the server in the delvelopment environment.


### Tests
To run the tests written for server you need to setup things for testing to start 

- comment out these lines in the **src/Controllers/userController.ts & src/Controllers/sessionControllers.ts** directory 
```
import { Db } from "mongodb";
import { connectData, getData } from "../../connection";


let database : Db;
connectData((err)=>{
    if(!err) {
        database = getData()
    }
})

```
- then you need to uncomment this line form the same files

```

    // const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")    

```
and also uncomment the import of the dataBseConnectionMaker function
- Now you all setup for running the tests.
- To run the tests use:
```
npm run test
```
- **important**
    - some tests will fail because of the connection issue with the mongo memory server as so many tests are running. Try running those failed tests/ suites seperately. If still failing you can open an issue about the tests.
    - the other reason for some tests that might fail is the use of ``` new Date(/some date string/) ``` in the sampleData.ts file. So there might be a mismatch. Try logging and using the correct logged date for those tests. **This is caused by the mongo-memory-server caching the data added to the database which might cause the days to mismatch at some point in time if not immediately**

### File Structure

- **Entrypoint:** The entry point is **app.ts**
- **/cert:** contains self signed SSL certifiace and private key
- **/src:** contains all the application code
- **/src/controllers/:** controllers for the application routes
- **/src/routes:** routes for the application

**important** there isnt a models directory since it uses native node js mongodb drivers and not mongoose. To look at the **schema** you can view **/validation.ts** in the root directory

## Frontend

You also need to provide the environmental variables before running the front end.

```
VITE_REACT_APP_SITE_URL // backend url like "https://localhost:3000"

VITE_REACT_GOOGLE_CLIENT_ID
```
After providing the envs you can run the client using the:

```
npm run dev
```
to run in the development environment.

### Testing
There is no setup needed to run the tests. You can simpl 
```
npm run test
```

to run the tests. All the tests should pass but if some are failing, first try to run them seperately before opening the issue

### File Structure

The file structur for the frontend is fairly simple.

- **/src/main.tsx** : Entrypoint for the application
- **/src/Components** : For all the components and custom hooks of the application
- **/src/mocks** : contains the MSW setup for testing.

## Contributions
Contributions are welcome! Feel free to open an issue or submit a pull request for any enhancements or bug fixes.