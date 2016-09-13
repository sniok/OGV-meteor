# Online Geometry Viewer
[![Build Status](https://travis-ci.org/sniok/OGV-meteor.svg?branch=eslint)](https://travis-ci.org/sniok/OGV-meteor)  
Online Geometry Viewer is an online web application, where users can upload, view
and share 3D CAD models. They can also host these models online, can like (love)
or comment on them. In a nutshell it can be looked at as a social blogging 
platform for 3D models. 

## Install

### Debian and Ubuntu based Linux distributions
#### Using install script
```sh
./scripts/ubuntu_install.sh
```
You will be asked for sudo access twice (for node and mongo)

#### Manually
* Install Nodejs :

  * sudo apt-get install python-software-properties python g++ make
  * sudo add-apt-repository ppa:chris-lea/node.js
  * sudo apt-get update
  * sudo apt-get install nodejs

* Install mongoDB

  * sudo apt-get install mongodb

* Install Meteor

  * sudo apt-get install curl
  * curl https://install.meteor.com/ | sh

* Clone the OGV Repository

  * sudo apt-get install git
  * git clone https://github.com/BRL-CAD/OGV-meteor

## Run
To run app while developing use: 
```
meteor
```
Then open Browser and type in URL
```
http://localhost:3000
```

## Lint
To run ESlint check run 
```
meteor npm run lint 
```

## Build and deploy
### Ubuntu and macOS
To build OGV run build script 
```
./scripts/build.sh
```
To start OGV run 
```
../OGV-build/bundle/start.sh
```
App will be running at http://localhost:3000

