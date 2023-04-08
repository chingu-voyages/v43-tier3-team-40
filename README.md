# v43-tier3-team-40
Add-project-description-here
| Voyage-43 | https://chingu.io/ | Twitter: https://twitter.com/ChinguCollabs
## How to Install and Run the Project
### Backend
#### Installation
1. Install Node.js
2. Install dependencies: `npm install`
#### Running the server
1. Start the server: `npm start`
2. Test the server by visiting http://localhost:3000 in your browser.

### Frontend

#### Installation
1. cd to the Frontend folder : cd Frontend
2. Install dependencies : `npm install`

#### Running the client
1. Start the client : `npm run dev`
2. Visit http://localhost:3000 in your browser.


### Database

#### Installation (dotenv & pg)
1. cd to the Backend folder : cd Backend
2. Install dependencies : `npm install`
3. Create the file `.env` in Backend folder (this file is already listed in the .gitignore)
4. In your `.env`, write `SECRET_KEY="mysecret"`, with "mysecret" being replaced by whatever string of characters you choose for yourself


#### DB Creation
1. In terminal, type `createdb bodybalance`
2. Then type `createdb bodybalance_test`
3. To seed, type `node` into the terminal to enter the NodeJS console
4. Type `const seed = require('./seed/seed');` to import seed
5. Type `seed()` to run the seed function. You should see in the log as all of the tables are created. This will seed the test table
6. To seed the production table, repeat this process, but type `process.env.MODE="production";` before importing seed.
