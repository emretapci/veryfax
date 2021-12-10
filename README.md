# veryfax

Fax application for freelancer user @Getinor

First, install node dependencies by `npm i`

To start database container, go to `./docker` and run

```
docker-compose up -d
```

wait for 10 seconds for mysql db to initialize, go one folder up using `cd ..`, then,

```
npx sequelize-cli db:create --env development-local veryfax
npx sequelize-cli db:migrate --env development-local
npx sequelize-cli db:seed:all --env development-local
```

Change `development-local` parameter to either to `development-heroku` or `production` if you want to deploy against different environments.

Start the backend by

```
npm start
```

By default, the database contains an administrator user with credentials "administrator@veryfax.com" and "adminpwd" (without quotes).

### Note:

API keys in `config/config.json` file are encryped using AES256 using my private key. You will need to ask me to decrypt them before running the program.
