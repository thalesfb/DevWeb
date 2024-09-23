# ERP NGINX Configuration

This repository contains the NGINX configuration for the CPEL ERP system. Below is a detailed description of each included file.

## Files

### Dockerfile

The `Dockerfile` is used to create the Docker image for NGINX with specific configurations for the ERP.

- **Base Image**: `nginx:1.27.0-alpine`
- **COPY**: Copies all files from the current directory to the `/nginx` directory in the image.
- **WORKDIR**: Sets the working directory to `/nginx`.
- **RUN**: Grants execution permissions for the `entrypoint.sh` and `healthcheck.sh` scripts.
- **RUN**: Installs `curl` for health checks.
- **EXPOSE**: Exposes ports 80 and 443.

### nginx.conf

The `nginx.conf` file contains the main NGINX configuration.

- **user**: Sets the user to `nginx`.
- **worker_processes**: Sets the number of worker processes to `auto`.
- **error_log**: Specifies the location of the error log file.
- **events**: Configures the number of worker connections.
- **http**: HTTP configurations, including MIME types, access logs, gzip compression, and inclusion of additional configuration files.

### `healthcheck.sh`

The `healthcheck.sh` script is used to check the health of the NGINX service.

- **verify_access**: Function that checks access to a specific URL using `curl`.
- **Verified URLs**:
  - `https://0.0.0.0/`

### erp_ssl.conf

The `erp_ssl.conf` file contains the NGINX configuration for the ERP with SSL support.

- **upstream**: Defines the upstream servers for `backend` and `genesis`.
- **server**: Server configurations for `cpel.ind.br` and `erp.cpel.ind.br`.
  - **Port 80**: Redirects to HTTPS.
  - **Port 443**: SSL configurations, including certificates and specific locations for `api`, `genesis`, and frontend.

### `entrypoint.sh`

The `entrypoint.sh` script is used as the entry point for the NGINX Docker container.

- **Variables**: Defines paths for configuration files and directories.
- **Functions**:
  - `verify_challenge_dir`: Checks and creates the ACME challenge directory if necessary.
  - `remove_old_conf`: Removes the default NGINX configuration and copies the new configuration.
  - `start_nginx_without_ssl`: Starts NGINX without SSL.
  - `check_certificates`: Checks for the existence of SSL certificates.
  - `start_nginx_with_ssl`: Starts NGINX with SSL.
- **Flow**:
  - Checks and creates the challenge directory.
  - Removes the old configuration.
  - Starts NGINX without SSL.
  - Waits for SSL certificates to be obtained.
  - Starts NGINX with SSL.
  - Keeps NGINX running and displays access logs.

## How to Use

1. **Build the Docker Image**:
   ```bash
   docker build -t erp-nginx .
   ```
