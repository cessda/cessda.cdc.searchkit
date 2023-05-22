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

FROM node:20 AS build

# Create app directory
WORKDIR /usr/src/app
COPY package*.json ./

# NodeJS Install
RUN npm ci

# Bundle app source and build webpack
FROM build AS final
COPY . .
RUN npm run build

# Configure application startup
USER node
EXPOSE 8088
CMD [ "node", "startprod.js" ]
