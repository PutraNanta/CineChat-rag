FROM nodered/node-red:3.1

USER root

COPY docker-entrypoint.sh /docker-entrypoint-custom.sh
RUN sed -i 's/\r$//' /docker-entrypoint-custom.sh \
    && chmod +x /docker-entrypoint-custom.sh

# Untuk deploy Railway (tanpa volume mount)
COPY data/package*.json /data/
RUN cd /data && npm ci --omit=dev
COPY data/flows.json data/settings.js data/settings.cjs /data/

USER node-red
WORKDIR /usr/src/node-red

EXPOSE 1880

ENTRYPOINT ["sh", "/docker-entrypoint-custom.sh"]
