# Copyright CESSDA ERIC 2017-2023
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License.
# You may obtain a copy of the License at
# http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:21 AS build

# Create app directory
WORKDIR /usr/src/app
COPY .npmrc* package*.json ./

# Install NPM dependencies
RUN npm ci

# Bundle app source and build webpack
FROM build AS webpack
COPY . .
RUN npm run build

# Remove development dependencies
FROM webpack AS pre-final
RUN npm prune --omit=dev

# Create a separate image with the build layers removed
FROM node:21 AS final
COPY --from=pre-final /usr/src/app/node_modules/ /usr/src/app/node_modules/
COPY --from=pre-final /usr/src/app/common/*.js /usr/src/app/common/
COPY --from=pre-final /usr/src/app/server/*.js /usr/src/app/server/
COPY --from=pre-final /usr/src/app/dist/ /usr/src/app/dist/
COPY --from=pre-final /usr/src/app/startprod.js /usr/src/app/

# Configure application startup
WORKDIR /usr/src/app
USER node
EXPOSE 8088
CMD [ "node", "startprod.js" ]
