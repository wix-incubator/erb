# node-ops-app

## /api/hello
responds with hi

## /api/info
json with worker id

## /api/die
responds with 500 and dies

## /api/maybe?status=[status]&every=[every]

where
 - status - what status it should respond with;
 - every - every nth request to die.
 
 
# log

## 2016-08-24

### setup
 
api:
 - /api/maybe?status=500&every=100

setup:
 - upon error in worker app is placed in death row and new worker is spawned;
 - until new worker comes online (2 second startup delay to start accepting traffic) incoming requests are served by dying worker;
 - once new worker get's online, signal is sent to errored worker to shutdown with timer set to kill it after 4 seconds if it's still alive;

### stats

cmd: `ab -r -n 50000 -c 10 'http://localhost:3000/api/maybe?status=500&every=100'`

```
Document Path:          /api/maybe?status=500&every=100
Document Length:        2 bytes

Concurrency Level:      10
Time taken for tests:   119.736 seconds
Complete requests:      50000
Failed requests:        204
   (Connect: 0, Receive: 0, Length: 204, Exceptions: 0)
Non-2xx responses:      122
Total transferred:      7919882 bytes
HTML transferred:       99592 bytes
Requests per second:    417.59 [#/sec] (mean)
Time per request:       23.947 [ms] (mean)
Time per request:       2.395 [ms] (mean, across all concurrent requests)
Transfer rate:          64.59 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    9 330.1      0   13211
Processing:     8   15  18.3     13    1004
Waiting:        0   14  18.1     13    1004
Total:          9   24 330.9     14   13248

Percentage of the requests served within a certain time (ms)
  50%     14
  66%     14
  75%     15
  80%     15
  90%     16
  95%     18
  98%     21
  99%     30
 100%  13248 (longest request)
```

rpm: 25055
worker deaths: 33;


