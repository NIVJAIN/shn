#!/bin/bash

maxdelay=$((12*60))  # 14 hours from 9am to 11pm, converted to minutes
for ((i=1; i<=3; i++)); 
do
    delay=$(($RANDOM%maxdelay)) # pick an independent random delay for each of the 20 runs
    (sleep $((delay*60)); /home/ubuntu/kafkaCoronaMicroservices/js.sh) & # background a subshell to wait, then run the php script
done
