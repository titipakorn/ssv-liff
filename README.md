# SSV-LIFF

a mini app in LINE to see the trip progress and history.

It's a react app which will live at https://nishi.10z.dev


## Image builder

    export DOCKER_IMAGE=dk-reg.10ninox.com/ssv/liff:latest
    docker build -t $DOCKER_IMAGE -f Dockerfile .
    docker push $DOCKER_IMAGE
