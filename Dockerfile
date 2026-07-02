ARG PARENT_VERSION=3.1.1-node24.18.0
ARG PORT=3000
ARG PORT_DEBUG=9229

FROM defradigital/node-development:${PARENT_VERSION} AS development

ENV TZ="Europe/London"

ARG PORT
ARG PORT_DEBUG
ENV PORT=${PORT}
EXPOSE ${PORT} ${PORT_DEBUG}

COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .

CMD [ "npm", "run", "dev" ]

FROM defradigital/node:${PARENT_VERSION} AS production

ENV TZ="Europe/London"

# CDP PLATFORM HEALTHCHECK REQUIREMENT
USER root
RUN apk add --no-cache curl

COPY --from=development --chown=root:root /home/node/package*.json ./
COPY --from=development --chown=root:root /home/node/src ./src/

RUN npm ci --omit=dev

# Remove write permissions
RUN chmod -R a-w /home/node

USER node

ARG PORT
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD [ "node", "src" ]
