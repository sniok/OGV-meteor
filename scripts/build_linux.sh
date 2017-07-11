#!/bin/sh

# OGV Build script
OUT="../OGV-build"; 
echo "# Building OGV"

# Create folder
rm -rf $OUT
mkdir $OUT
echo "# Created folder $OUT"

# Build 
echo "# Building... "
meteor build $OUT  --architecture=os.linux.x86_64
echo "# Finished building to $OUT/OGV-meteor.tar.gz"


# Create script
echo "MONGO_URL=mongodb://localhost/meteor ROOT_URL=http://localhost PORT=3000 node main.js" > $OUT/run.sh
chmod +x $OUT/run.sh
echo "# Created script at $OUT/run.sh"

# Final notes
echo "
# ---------------------------------------------------------
# 
# Built app is at $OUT/bundle
# To run OGV, go to $OUT/bundle and start ./run.sh
# Then open http://localhost:3000
# Make sure you have mongo running
#
# If you encountered any problems please open issue at
#     https://github.com/BRL-CAD/OGV-meteor/issues"




