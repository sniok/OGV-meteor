#!/bin/sh

# OGV Install script
PACKAGE_VERSION=$(grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')
echo "# Online Geometry Viewer"
echo "# Version $PACKAGE_VERSION"
echo " "

# Node
echo "# Installing node"
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "# Node version"
node --version
echo "# Npm Version"
npm --version

# Mongo
echo "# Installing mongo"
sudo apt-get install mongodb
mongo --version

# Meteor
echo "# Installing Meteor"
curl https://install.meteor.com | /bin/sh
export PATH="$HOME/.meteor:$PATH"

meteor --version

# Install devDeps
echo "# Installing devDeps"
meteor npm install

# Linting
meteor npm run lint 
echo "# Linted succesfuly"

echo "# OGV Deployed"
echo "# To launch OGV run: "
echo "    meteor"

