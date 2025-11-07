# Deployment Guide with LibreOffice

Your Word to PDF converter is ready! It uses LibreOffice for perfect formatting preservation.

## 🚀 Deployment Platforms that Support LibreOffice

### ✅ Recommended Platforms

#### 1. **Railway** (Easiest)
```bash
# Add this to your railway.json or use Railway's Nixpacks
```

**Setup:**
1. Connect your GitHub repo to Railway
2. Add build command: `npm run build`
3. Add start command: `npm start`
4. Railway automatically detects and installs LibreOffice!

**Railway.toml** (optional):
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

---

#### 2. **Render** (Good Alternative)
Create `render.yaml`:
```yaml
services:
  - type: web
    name: word-to-pdf-converter
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 20
    preDeployCommand: |
      apt-get update
      apt-get install -y libreoffice
```

---

#### 3. **DigitalOcean App Platform**
Create `.do/deploy.yaml`:
```yaml
name: word-to-pdf-converter
services:
  - name: web
    github:
      repo: your-username/word-to-pdf-converter
      branch: main
    build_command: npm install && npm run build
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xs
```

Then SSH into your droplet:
```bash
sudo apt-get update
sudo apt-get install -y libreoffice
```

---

#### 4. **AWS EC2** (Most Control)

**Setup Script:**
```bash
#!/bin/bash
# Update system
sudo yum update -y  # For Amazon Linux
# OR
sudo apt-get update  # For Ubuntu

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs  # Amazon Linux
# OR
sudo apt-get install -y nodejs  # Ubuntu

# Install LibreOffice
sudo yum install -y libreoffice  # Amazon Linux
# OR
sudo apt-get install -y libreoffice  # Ubuntu

# Clone your repo
git clone https://github.com/Kakrote/word-to-pdf-converter.git
cd word-to-pdf-converter

# Install dependencies and build
npm install
npm run build

# Start with PM2
sudo npm install -g pm2
pm2 start npm --name "word-converter" -- start
pm2 save
pm2 startup
```

---

#### 5. **Docker** (Platform Independent) ⭐ **BEST FOR ANY CLOUD**

Create `Dockerfile`:
```dockerfile
FROM node:20-bookworm

# Install LibreOffice
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
```

Create `.dockerignore`:
```
node_modules
.next
.git
.env.local
*.log
```

**Build and run:**
```bash
# Build image
docker build -t word-to-pdf-converter .

# Run locally
docker run -p 3000:3000 word-to-pdf-converter

# Push to Docker Hub (optional)
docker tag word-to-pdf-converter yourusername/word-to-pdf-converter
docker push yourusername/word-to-pdf-converter
```

**Deploy to any cloud with Docker support:**
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Railway (Docker mode)
- Render (Docker mode)

---

#### 6. **VPS (Any Provider)**

**For Ubuntu/Debian:**
```bash
# SSH into your VPS
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install LibreOffice
sudo apt-get update
sudo apt-get install -y libreoffice

# Install Git
sudo apt-get install -y git

# Clone repository
git clone https://github.com/Kakrote/word-to-pdf-converter.git
cd word-to-pdf-converter

# Install dependencies
npm install

# Build
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start npm --name "word-converter" -- start
pm2 save
pm2 startup

# Setup Nginx (optional, for custom domain)
sudo apt-get install -y nginx
```

**Nginx config** (`/etc/nginx/sites-available/word-converter`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/word-converter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🧪 Verify LibreOffice Installation

After deployment, check if LibreOffice is working:

```bash
# Check if LibreOffice is installed
which soffice
# or
soffice --version

# Should output something like:
# LibreOffice 7.x.x.x
```

---

## 🔧 Environment Variables

No special environment variables needed! The `libreoffice-convert` package automatically detects the LibreOffice installation.

---

## 📊 Resource Requirements

**Minimum Server Specs:**
- RAM: 1GB (2GB recommended for multiple conversions)
- CPU: 1 core (2 cores recommended)
- Storage: 2GB (LibreOffice + dependencies)
- Bandwidth: Depends on usage

---

## 🐛 Troubleshooting

### Error: "Could not find soffice binary"
```bash
# Verify installation
which soffice

# If not found, install:
sudo apt-get install libreoffice  # Ubuntu/Debian
sudo yum install libreoffice      # CentOS/RHEL
```

### Error: "Permission denied"
```bash
# Give Node.js permission to execute LibreOffice
sudo chmod +x /usr/bin/soffice
```

### Slow conversions
- Increase server RAM
- Use caching if possible
- Consider load balancing for high traffic

---

## 💰 Cost Estimates

| Platform | Monthly Cost | Notes |
|----------|-------------|-------|
| Railway | $5-10 | Easiest setup |
| Render | $7+ | Good balance |
| DigitalOcean | $6+ | More control |
| AWS EC2 | $10+ | Very flexible |
| VPS (Various) | $5-20 | Full control |

---

## ✅ Your Current Code Status

✅ Code is ready for deployment
✅ LibreOffice integration implemented  
✅ All dependencies installed
✅ Build successful

**Just deploy to any platform above and install LibreOffice!**

---

## 🚀 Quick Deploy with Docker (Recommended)

If your platform supports Docker:

1. Push your code to GitHub
2. Use the Dockerfile provided above
3. Deploy with one command on platforms like:
   - Railway: Connect repo → Deploy
   - Render: Connect repo → Deploy
   - Google Cloud Run: `gcloud run deploy`

**This is the easiest and most reliable method!**
