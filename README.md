


## Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+ with Row Level Security
- **Cache**: Redis 7+
- **Real-time**: Socket.io for WebSocket connections
- **Authentication**: JWT tokens with bcrypt
- **File Upload**: Multer with AWS S3
- **Validation**: Express-validator

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **WebSocket**: Socket.io Client
- **Notifications**: React Hot Toast

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (EKS)
- **IaC**: Terraform
- **CI/CD**: Jenkins
- **Cloud Provider**: AWS
  - EKS for Kubernetes
  - RDS for PostgreSQL
  - ElastiCache for Redis
  - S3 for media storage
  - CloudFront for CDN
  - ECR for container registry
- **Reverse Proxy**: Nginx with rate limiting
- **Monitoring**: CloudWatch, Prometheus (optional)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (React App with Tailwind CSS, deployed via CloudFront)     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                    Load Balancer (ALB)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   Kubernetes Cluster (EKS)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │   Backend    │  │  WebSocket   │      │
│  │    Pods      │  │    Pods      │  │   Service    │      │
│  │  (3 replicas)│  │  (3 replicas)│  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │         ┌────────┴────────┐         │
          │         │                 │         │
     ┌────┴────┐  ┌─┴─────────┐  ┌───┴────┐   │
     │   S3    │  │PostgreSQL │  │ Redis  │   │
     │(Media)  │  │   (RDS)   │  │(Cache) │   │
     └─────────┘  └───────────┘  └────────┘   │
                                                │
                  ┌─────────────────────────────┘
                  │
            ┌─────┴──────┐
            │ CloudFront │
            │    (CDN)   │
            └────────────┘
```



## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/reelschat.git
cd reelschat
```

### 2. Install Dependencies

```bash
make setup-all
```

### 3. Configure Environment Variables

Create `.env` files:

**Backend** (`backend/.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reelschat
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET=reelschat-media
PORT=3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_CDN_URL=https://cdn.reelschat.com
```

### 4. Start Development Environment

```bash
make dev-start
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3000
- Frontend on port 5173

### 5. Initialize Database

```bash
make db-migrate
make db-seed
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Health Check**: http://localhost:3000/health

### Default Test Accounts

```
Username: john_doe
Password: password123

Username: jane_smith
Password: password123
```

## Development

### Available Commands

```bash
# Development
make dev-start          # Start development environment
make dev-stop           # Stop development environment
make dev-logs           # View logs
make dev-restart        # Restart services

# Database
make db-migrate         # Run migrations
make db-seed            # Seed test data
make db-backup          # Backup database
make db-restore FILE=backup.sql  # Restore from backup
make db-shell           # Open database shell

# Testing
make test-all           # Run all tests
make test-backend       # Run backend tests
make test-frontend      # Run frontend tests

# Code Quality
make lint-backend       # Lint backend code
make lint-frontend      # Lint frontend code
make format-backend     # Format backend code
make format-frontend    # Format frontend code
```

### Project Structure

```
reelschat/
├── backend/                 # Backend Node.js application
│   ├── src/
│   │   ├── config/         # Database and configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API and WebSocket services
│   │   └── App.tsx        # Root component
│   ├── Dockerfile
│   └── package.json
├── database/              # Database schemas and migrations
│   ├── schema.sql
│   └── seed.sql
├── infrastructure/        # Infrastructure as Code
│   ├── docker/           # Docker configurations
│   ├── kubernetes/       # K8s manifests
│   ├── terraform/        # Terraform configs
│   └── jenkins/          # Jenkins CI/CD
├── Makefile              # Build automation
└── README.md
```

##  Deployment

### Production Deployment to AWS

#### 1. Initialize Terraform

```bash
make tf-init
```

#### 2. Configure Variables

Edit `infrastructure/terraform/terraform.tfvars`:

```hcl
aws_region = "us-east-1"
environment = "production"
db_username = "admin"
db_password = "your-secure-password"
```

#### 3. Plan Infrastructure

```bash
make tf-plan
```

#### 4. Apply Infrastructure

```bash
make tf-apply
```

This creates:
- VPC with public/private subnets across 3 AZs
- EKS cluster with auto-scaling node groups
- RDS PostgreSQL with Multi-AZ
- ElastiCache Redis cluster
- S3 bucket for media storage
- CloudFront CDN
- ECR repositories
- Security groups and IAM roles

#### 5. Deploy Application

```bash
make prod-deploy
```

This will:
- Build Docker images
- Push to ECR
- Deploy to Kubernetes
- Run health checks

#### 6. Setup CI/CD

```bash
make jenkins-start
```

Access Jenkins at http://localhost:8080 and configure the pipeline.

### Rollback

```bash
make prod-rollback
```

### Monitoring

```bash
make k8s-status     # Check cluster status
make logs-backend   # View backend logs
make logs-frontend  # View frontend logs
make metrics        # View resource usage
```

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

### Reels

#### Get Reels Feed
```http
GET /api/reels?page=1&limit=10
Authorization: Bearer {token}
```

#### Create Reel
```http
POST /api/reels
Authorization: Bearer {token}
Content-Type: application/json

{
  "video_url": "https://example.com/video.mp4",
  "thumbnail_url": "https://example.com/thumb.jpg",
  "caption": "Amazing moment!",
  "duration": 30
}
```

#### Like Reel
```http
POST /api/reels/{reelId}/like
Authorization: Bearer {token}
```

### Messages

#### Get Conversations
```http
GET /api/conversations
Authorization: Bearer {token}
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversation_id": "uuid",
  "content": "Hello!",
  "message_type": "text"
}
```




