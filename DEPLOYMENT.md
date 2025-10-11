# CyberOpoly Deployment Guide

This guide covers deploying CyberOpoly to your infrastructure, including both the frontend and the AI backend.

## 📋 Overview

CyberOpoly consists of two parts:
1. **Frontend**: Static HTML/CSS/JS files (can be served from any web server)
2. **Backend**: Node.js Express API for AI agents (requires Node.js runtime)

## 🎯 Deployment Options

### Option 1: Full Deployment (Recommended)
Deploy both frontend and backend together on your platform.

### Option 2: Hybrid (Current Setup)
- Frontend on GitHub Pages
- Backend on your platform
- Frontend auto-detects backend at runtime

## 🚀 Full Deployment Instructions

### Prerequisites
- Node.js 18+ runtime environment
- Ability to set environment variables
- Web server or static file hosting

### Step 1: Build/Prepare Files

No build step required! The project works as-is.

Files to deploy:
```
cyberopoly/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   ├── player.js
│   ├── board.js
│   ├── cards.js
│   ├── api-client.js
│   ├── ui.js
│   └── game.js
├── server/
│   ├── index.js
│   ├── ai-agent.js
│   └── package.json
└── assets/
    └── ...
```

### Step 2: Deploy Backend

1. **Install dependencies:**
```bash
cd server
npm install --production
```

2. **Set environment variables:**

Required:
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `PORT`: Port for the API (default: 3001)

Optional:
- `FRONTEND_URL`: Your frontend URL for CORS (e.g., https://yourdomain.com)
- `NODE_ENV`: Set to `production`

3. **Start the server:**
```bash
cd server
npm start
```

Or use a process manager like PM2:
```bash
pm2 start index.js --name cyberopoly-api
```

### Step 3: Deploy Frontend

**Static File Serving:**

The frontend can be served by any web server (nginx, Apache, etc.).

**Example nginx config:**
```nginx
server {
    listen 80;
    server_name cyberopoly.yourdomain.com;

    root /var/www/cyberopoly;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 4: Configure Frontend API URL

The frontend auto-detects the API location:
- **Localhost**: Uses `http://localhost:3001`
- **Production**: Uses same domain as frontend

If you need custom API URL, modify `js/api-client.js`:
```javascript
detectAPIURL() {
    // Custom configuration
    return 'https://api.yourdomain.com';
}
```

### Step 5: Test Deployment

1. **Test backend health:**
```bash
curl https://yourdomain.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "cyberopoly-ai"
}
```

2. **Test frontend:**
Open browser to `https://yourdomain.com`

3. **Test AI player:**
- Start a new game
- Check "🤖 AI Player" for at least one player
- Click "Start Game"
- AI should automatically take turns

## 🔐 Security Checklist

- [ ] API key stored in environment variables (not in code)
- [ ] CORS configured to restrict origins
- [ ] HTTPS enabled for production
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting configured (if public-facing)
- [ ] API endpoint not publicly exposed (if not needed)

## 📊 Health Monitoring

### Backend Health Check
```bash
GET /health
```

Returns:
- Server status
- Service version
- Timestamp

### Recommended Monitoring

Monitor these endpoints/metrics:
- `/health` endpoint (should return 200)
- API response times (typically 5-15 seconds per AI decision)
- Error rate on `/api/ai-decision`
- Anthropic API quota usage

## 🐛 Troubleshooting

### AI Players Not Working

**Symptom:** AI checkbox is available but AI doesn't take turns

**Check:**
1. Open browser console (F12)
2. Look for error: `✗ AI Backend is not available`

**Solutions:**
- Verify backend is running: `curl http://localhost:3001/health`
- Check API key is set in environment
- Check CORS settings if frontend/backend on different domains

### CORS Errors

**Symptom:** `Access-Control-Allow-Origin` errors in console

**Solution:**
Set `FRONTEND_URL` environment variable in backend:
```bash
FRONTEND_URL=https://yourdomain.com
```

### API Timeouts

**Symptom:** "AI is thinking..." hangs for >30 seconds

**Cause:** Claude API taking longer than expected

**Solutions:**
- This is normal for complex game states
- Check Anthropic API status
- Verify API key has sufficient quota

### Backend Not Starting

**Check:**
```bash
# Check Node version (need 18+)
node --version

# Check dependencies installed
cd server && npm install

# Check API key is set
echo $ANTHROPIC_API_KEY
```

## 📦 Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy application files
COPY . .

WORKDIR /app/server

EXPOSE 3001

CMD ["node", "index.js"]
```

Build and run:
```bash
docker build -t cyberopoly-api .
docker run -p 3001:3001 -e ANTHROPIC_API_KEY=your_key cyberopoly-api
```

## 🔄 Updates and Maintenance

### Updating the Backend

```bash
cd server
git pull
npm install
pm2 restart cyberopoly-api
```

### Updating the Frontend

```bash
git pull
# Copy files to web server directory
cp -r * /var/www/cyberopoly/
```

### Database/State Management

Currently, the game uses client-side localStorage for save games. No database required.

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review logs: `pm2 logs cyberopoly-api`
3. Test health endpoint
4. Check browser console for frontend errors

## 🎮 Testing Your Deployment

### Test Checklist

- [ ] Frontend loads correctly
- [ ] Can start a human-only game
- [ ] Can start a game with AI players
- [ ] AI players take turns automatically
- [ ] Dice rolls work
- [ ] Property purchases work
- [ ] AI makes strategic decisions
- [ ] Game log shows AI reasoning
- [ ] "AI is thinking" indicator appears
- [ ] Game completes successfully

### Load Testing

For high-traffic deployments, consider:
- Response caching for similar game states
- Rate limiting per IP
- Connection pooling
- Horizontal scaling of backend instances

---

## 🏢 Platform Team Integration

### Minimum Requirements

**Runtime:**
- Node.js 18 or higher
- Supports ES modules (`import`/`export`)

**Dependencies:**
- `express`
- `@anthropic-ai/sdk`
- `cors`
- `dotenv`

**Environment:**
- Single environment variable: `ANTHROPIC_API_KEY`
- Port can be configured via `PORT` env var

**Resources:**
- Memory: 512MB minimum
- CPU: 1 vCPU minimum
- Network: Outbound HTTPS to Anthropic API

**Endpoints:**
- `GET /health` - Health check
- `POST /api/ai-decision` - Main AI endpoint

### Example Platform Configs

**Kubernetes (deployment.yaml):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cyberopoly-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cyberopoly-api
  template:
    metadata:
      labels:
        app: cyberopoly-api
    spec:
      containers:
      - name: api
        image: your-registry/cyberopoly-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: cyberopoly-secrets
              key: anthropic-api-key
        - name: PORT
          value: "3001"
        - name: NODE_ENV
          value: "production"
```

**Heroku (Procfile):**
```
web: cd server && npm start
```

**AWS Elastic Beanstalk:**
```json
{
  "option_settings": [
    {
      "namespace": "aws:elasticbeanstalk:application:environment",
      "option_name": "ANTHROPIC_API_KEY",
      "value": "your-key"
    },
    {
      "namespace": "aws:elasticbeanstalk:application:environment",
      "option_name": "PORT",
      "value": "8080"
    }
  ]
}
```
