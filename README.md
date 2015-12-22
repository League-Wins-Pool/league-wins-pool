# League Wins Pool

## Getting Started

1. [Install Node 4.2.2](https://nodejs.org/download/)
2. [Install Docker 1.6+](https://docs.docker.com/installation/)
3. If on Mac, install [VirtualBox](https://www.virtualbox.org) and [Dingy](https://github.com/codekitchen/dinghy)
4. [Install Docker Compose 1.3+](https://docs.docker.com/compose/install/)
5. Install package dependencies for development

    ```bash
    $ (cd scripts; ./install-packages)
    ```

6. Install Git hooks so that dependencies are automatically installed when switching or merging branches

    ```bash
    $ (cd scripts; ./install-git-hooks)
    ```

7. Create secrets file and add passwords
    
    ```bash
    $ cp src/db/secrets.example.env src/db/secrets.env
    $ vim src/db/secrets.env
    ```

8. If on Mac, create a VM with Dinghy

    ```bash
    $ dinghy create --provider virtualbox
    $ dinghy status
    ```


## Developing Locally

1. Launch the entire development environment:

    ```bash
    $ (cd src; docker-compose up)
    ```

    This links your local `src/webapp` folder to the container so that changes automatically reload the server.

2. Open a browser to view changes:

    ```bash
    $ curl http://$(dinghy ip)
    ```
    

## Running Tests
    
    $ (cd src; docker-compose run webapp npm test)

    
## Interactive Development Console

    $ (cd src; docker-compose run webapp node_modules/.bin/sails console)


## Running Database Migrations

Make sure the containers are running first.

    $ (cd src; docker-compose run webapp /webapp/server/node_modules/.bin/sequelize db:migrate)
    
Sequelize automatically syncs the database when the webapp starts. However, this only creates and drops tables -- it doesn't run pending migrations. That is currently done manually but we should figure out how to automate them as part of the deploy process. 
    

## Adding or Removing Node Packages

When changing either the client or server's `package.json`, update the version number and then run `npm shrinkwrap --dev` in `src/webapp/client` and `src/webapp/server`. This ensures everyone is using the exact same package versions.


## Rebuilding Docker Images

The `webapp-base` image (`src/webapp-base/Dockerfile`) is used to manage core dependencies such as node and its global packages. Although changes should be rare, when doing so, rebuild and publish the image by running:

    $ cd src/webapp-base
    $ docker build -t leaguewinspool/webapp-base .
    $ docker push leaguewinspool/webapp-base

When changing any of the other Dockerfiles, rebuild the images by running:

    $ (cd src; docker-compose build)

Now you are ready for development again.


## Running a Staging Environment

These are the same commands the integration tests on CircleCI run:

    $ (cd src; docker-compose -f docker-production.yml up)
    $ (cd src; docker-compose -f docker-production.yml run webapp npm test)
    $ curl http://$(dinghy ip)

The difference is `docker-production.yml` won't sync your local code with the container.


## Deploying to Production

When code is merged into `master`, CircleCI runs the integration tests. If they pass, CircleCI notifies DockerHub to rebuild the `webapp` container. Once the build finishes, DockerHub notifies Tutum to swap the old container with the new `webapp` image.

The other containers are not deployed automatically because they rarely change. If they need updating:

1. On CircleCI, [clear the cache](https://circleci.com/docs/how-cache-works) and rerun the tests
2. On DockerHub, manually start a build on the updated container
3. On Tutum, redeploy the container
