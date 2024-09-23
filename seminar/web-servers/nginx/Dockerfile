FROM nginx:1.27.0-alpine

# Copying the configuration file
COPY . /nginx

# Setting the working directory
WORKDIR /nginx

# Giving the permission to execute the script
RUN chmod +x /nginx/entrypoint.sh

# Giving the permission to execute the script
RUN chmod +x /nginx/healthcheck.sh

# Installing the curl
RUN apk add --no-cache curl

# Expose the port 443
EXPOSE 443

# Expose the port 80
EXPOSE 80
