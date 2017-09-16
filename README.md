# Description
This is a restful API for our statistics. The main use case for our API is to calculate realtime statistic from the last 60 seconds.
There are two APIs, one of them is called every time a transaction is made. It is also the sole input of this rest API.
The other one returns the statistic based of the transactions of the last 60 seconds.

# Getting Started
Node 8.4.0 was used in development of this project. To download Node 8.4.0 use nvm
On MacOS
- Install NVM: on MacOS: `brew install nvm`
- Install Node 8.4.0: `nvm install 8.4.0`
- Install Dependencies: `npm install`
- Run Test: `npm test`
- Start application: `npm start`

## Running the app alternatives
If you have docker and do not want to install node, you may run the application through the docker container.
The docker image is available on the docker registry
- `docker run jordanyong/n26-challenge -p 8000:8000`
- `curl http://localhost:8000/ping`

# API
## Record Transaction
```
curl -X POST \
  http://localhost:8000/transactions \
  -H 'content-type: application/json' \
  -d '{ "amount": 100, "timestamp": 1505560926242 }'
```

## Get Transaction Status
```
curl http://localhost:8000/transactions
```

# Requirements Checklist
- [x] The API have to be threadsafe with concurrent requests
- [x] The API have to function properly, with proper result
- [x] The project should be buildable, and tests should also complete successfully
- [x] The API should be able to deal with time discrepancy, which means, at any point of time,
      we could receive a transaction which have a timestamp of the past
- [x] Make sure to send the case in memory solution without database (including in-memory
      database)
- [x] Endpoints have to execute in constant time and memory (O(1))
