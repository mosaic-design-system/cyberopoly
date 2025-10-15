# Frontend Dockerfile - Static file server for CyberOpoly
FROM nginx:alpine

# Copy all frontend files to nginx html directory
COPY . /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8000 (can be remapped at runtime)
EXPOSE 8000

# Configure nginx to run on port 8000
RUN sed -i 's/listen\s*80;/listen 8000;/g' /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
