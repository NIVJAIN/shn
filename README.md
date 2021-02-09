# Wiki
Please refer to the [Project Wiki](https://gitlab.com/shn-team/shn_documents_diagrams/-/wikis/home) for information related to the internal components, hosting setup, and data schema.
## SHN-APPLICATION
| No            | Description                      | Remarks       | 
| ------------- | -------------------------------- | :-----------: |
| 1             | SHN Application Architecture     | Na            |
| 2             | SHN App Sequence Diagram         | Na            |
| 3             | SHN CI/CD Diagram                | Na            |
| 4             | Sandbox Setup                    | Na            |
| 5             | Run App via Docker               | Na            |
| 6             | Run App w/o Docker               | Na            |
| 7             | Run App on AWS EC2               | Na            |
| 8             | Application logs                 | Na            |
| 9             | Run App on AWS Managed Services  | Na            |
| 10            | Loadtesting                      | Na            |
| 11            | SHN FRSM Sequence Diagram        | Na            |
| 12            | Adaptive Geofencing Sequence Diagram     | Na            |
| 13            | Developments Tools and Frameworks| Na            |

Developments Tools and Frameworks

## 1. SHN Application Architecture
![SHN APP](/git_diagrams/SHN-ApplicationArchitecture.png)

## 2. SHN App - Sequence Diagram
![SHN APP](/git_diagrams/SHN-SequenceDiagram.png)


## 3. SHN App - CI/CD Diagram
 In progress
<!-- ![SHN APP](/git_diagrams/SHN-CICD1.png) -->


## 4. Sandbox Setup
1. Install Node.JS [NodeJs](https://nodejs.org/en/download/)
2. Install nvm Node Version Manager, the above installation includes nvm.
3. Install MongoDB [MongoDB](https://docs.mongodb.com/manual/installation/)
4. Install Docker [Docker](https://docs.docker.com/get-docker/)

## 5. Run App via Docker
1. git clone https://gitlab.com/shn-team/shnqo-backend.git
2. cd shnqo-backend
3. In server.js change db variable for docker to  ***`const db = "mongodb://mongo/shndb"`***
3. docker-compose up -d 
4. App will be running on http://localhost:4200
5. to shutdown the app `docker-compose down`
6. Docker file has mount properties , even after shutdown data will be persistent in DB.

## 6.  Run app w/o Dokcer
1. git clone https://gitlab.com/shn-team/shnqo-backend.git
2. cd shnqo-backend
3. In server.js change db variable for non-docker to  ***`const db = "mongodb://localhost:27017/shndb"`***
3. node server.js
4. App will be running on http://localhost:4200

## 7. Run app on AWS EC2 Instance
1. Login to AWS console
2. Launch instance with **Ubuntu Server 18.04 LTS**
3. sudo apt-get update
4. sudo apt-get install nodejs
5. sudo apt-get install npm
6. nodejs -v
7. npm -v
8. Install mongoDB on ubuntu [MongoDb-Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
9. Install docker on EC2 [Docker](https://www.hostinger.com/tutorials/how-to-install-docker-on-ubuntu).
10. Install PM2 [PM2](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04)
10. git clone https://gitlab.com/shn-team/shnqo-backend.git
11. cd shnqo-backend
12. `pm2 start server.js --name 'NODE_APP'`
13. pm2 status
14. pm2 logs NODE_APP --lines 100

## 8. Application logs
1. npm library log4js in use for application logs. its round logs of 5 files limit to 5mb.
2. All application logs inside the root directory `logs` folder
3. full.log file (includes info,error,fatal,warn and debug)
4. panic.log file (includes only error logs)


## 9. Run app via AWS Managed Services
1. AWS ElasticBeanstalk [EB](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html)
2. DocumentDB (MongoDB 3.6) 
3. DocumentDB setup [DocumentDB](https://docs.aws.amazon.com/documentdb/latest/developerguide/getting-started.html)
3. Deploy application to Elasticbeanstalk
    1. delete node_modules folder
    2. zip the folder using this command `zip ../eb-signup-archive5.zip -r * .[^.]*`
    3. go to aws console and upload the zip folder and check for the status
4. Deploy to AWS EB via EB-cli
    1. configure aws-ebcli with private-key  [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)
    2. `eb init` and choose region
    3. `eb list`
    4. `eb create --single -i t3.`large`
    5. eb setenv db=somestringfordbconnection
    5. `eb deploy`
    6. `eb ssh`
4. Setup env variable for documentDB connection in Elasticbeanstalk.
## 10. Load testing
| No            | Description                      | Remarks                             | 
| ------------- | -------------------------------- | :----------------------------------:|
| 1             | bombardier                       | GO library using fasthttp           |
| 2             | Loadtest                         | NPM Libarary                        |
| 3             | JMeter                           | Tests are not included here         |

 Sampel Code for Load testing: 
 ```
 /*========================================
    LOAD TEST 
=========================================*/
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI"

var maxReq = 2000
var conCur= 120
function optionsObject() {
    return { 
        // url: 'http://localhost:4200/novel/update',
        url: 'https://www.locationreport.gov.sg/novel/update',
        maxRequests: `${maxReq}`,
        concurrency: `${conCur}`,
        method: 'POST',
        contentType: 'application/json',
        body: {
            "pin": "61RG61VH",
            "pf": "pass",
            "dist": 55.55,
            "temp": "36.99",
            "symptoms": `Loadtest with RequestsXConccurrency == ${maxReq}X ${conCur}`

        },
        headers: {
            Authorization: "Bearer " + token
        }
    }
}

console.log("started at this time =====>", moment().format("DD-MM-YYYY:HH:mm:ss:sss"), maxReq, conCur)
  loadtest.loadTest(optionsObject(), function (error, result) {
    if (error) {
        console.log('Got an error: %s', error);
    } else {
        console.log(Date.now(),moment().format("DD-MM-YYYY:HH:mm:ss:sss"), result);
    }
});
 ```
### 10k with 300 concurrent connections
```
SHN-MICROSERVICE
loadtest -n 10000 -c 300 -m POST -k https://www.locationreport.gov.sg/loadtest/endpoint
Requests: 0 (0%), requests per second: 0, mean latency: 0 ms
Requests: 3672 (37%), requests per second: 734, mean latency: 400 ms
Requests: 8457 (85%), requests per second: 958, mean latency: 310 ms
Target URL:          https://www.locationreport.gov.sg/loadtest/endpoint
Max requests:        10000
Concurrency level:   300
Agent:               keepalive

Completed requests:  10000
Total errors:        0
Total time:          11.987781299 s
Requests per second: 834
Total time:          11.987781299 s
Percentage of the requests served within a certain time
50%      333 ms
90%      405 ms
95%      434 ms
99%      745 ms
100%      949 ms (longest request)
```

### 20k with 12 concurrent connections
```
bombardier -c 12 -n 20000 https://www.locationreport.gov.sg/
Bombarding https://www.locationreport.gov.sg/:443/ with 20000 request(s) using 12 connection(s)
 20000 / 20000 [==============================================================================================================] 100.00% 445/s 44s
Done!
Statistics        Avg      Stdev        Max
  Reqs/sec       447.71     137.99    1165.83
  Latency       26.78ms   163.19ms     22.04s
  HTTP codes:
    1xx - 0, 2xx - 20000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:     9.06MB/s
```
![GitHub Logo](/git_diagrams/EB-Loadtest147.png)


```Tue Apr 21 13:43:06 +08 2020
bombardier -c 12 -n 50000 https://www.locationreport.gov.sg/
Bombarding https://www.locationreport.gov.sg/:443/ with 50000 request(s) using 12 connection(s)
 50000 / 50000 [============================================================================================================] 100.00% 463/s 1m47s
Done!
Statistics        Avg      Stdev        Max
  Reqs/sec       463.16     134.73     907.48
  Latency       25.89ms    66.08ms      7.05s
  HTTP codes:
    1xx - 0, 2xx - 50000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:     9.37MB/s
  ```
  ![GitHub Logo](/git_diagrams/EB-Loadtest549.png)


## 11. SHN FRSM Sequence Diagram
![SHN APP](/git_diagrams/SHN-FRSM-SequenceDiagram1.png)

## 12. Adaptive Geofencing Sequence Diagram
![SHN APP](/git_diagrams/GEO-SPATIAL3.png)

## 13. Developments Tools and Frameworks
![SHN APP](/git_diagrams/DEV-TOOLS1.png)

