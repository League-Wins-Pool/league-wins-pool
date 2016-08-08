# Cache npm deps
echo "Pruning …"
meteor npm prune

# Disabled while we use the forked Spacejam in package.json (needed to instrument coverage)
# echo "Installing Spacejam …"
# if [ ! -e /home/ubuntu/nvm/versions/node/v5.2.0/lib/node_modules/spacejam/bin/spacejam ]; then npm install -g spacejam; fi

echo "Installing local packages …"
meteor npm install
