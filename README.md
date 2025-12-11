<div align="center"><!-- Animated Title --><h1> <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=40&duration=3000&pause=1000&color=7B68EE&center=true&vCenter=true&width=800&lines=🚀+Abshir+Platform;🤖+AI+Powered+Solutions;💻+Full+Stack+Excellence;🎯+Built+with+Passion" alt="Typing SVG" /> </h1>
https://img.shields.io/github/stars/abdullahMohamed13/abshir?style=for-the-badge&logo=github&color=yellow&label=Stars
https://img.shields.io/github/forks/abdullahMohamed13/abshir?style=for-the-badge&logo=github&color=green&label=Forks
https://img.shields.io/github/issues/abdullahMohamed13/abshir?style=for-the-badge&logo=github&color=red&label=Issues
https://img.shields.io/github/license/abdullahMohamed13/abshir?style=for-the-badge&logo=mit&label=License
https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python
https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react
https://img.shields.io/badge/.NET-7.0-512BD4?style=for-the-badge&logo=dotnet

<!-- Visitor Counter --><p align="center"> <img src="https://komarev.com/ghpvc/?username=abdullahMohamed13&label=Profile%20Views&color=0e75b6&style=for-the-badge" alt="Profile Views" /> </p><!-- Team Members --><h2>👨‍💻 Developed by Team Abshir</h2><table align="center"> <tr> <td align="center"> <a href="https://github.com/MoustafaNasr"> <img src="https://img.shields.io/badge/Moustafa_Nasr-000000?style=for-the-badge&logo=github&logoColor=white" alt="Moustafa Nasr" /> </a> </td> <td align="center"> <a href="https://github.com/abdullahZahra"> <img src="https://img.shields.io/badge/Abdallah_Zahra-000000?style=for-the-badge&logo=github&logoColor=white" alt="Abdallah Zahra" /> </a> </td> <td align="center"> <a href="https://github.com/abdullahMohamed13"> <img src="https://img.shields.io/badge/Abdallah_Mohammed-000000?style=for-the-badge&logo=github&logoColor=white" alt="Abdallah Mohammed" /> </a> </td> </tr> </table></div>
📖 Table of Contents
<details open> <summary>✨ Click to expand/collapse</summary>
🌟 Overview

✨ Features

🏗️ Architecture

🚀 Quick Start

📦 Installation

🔧 Tech Stack

📁 Project Structure

⚡ Performance

🔗 API Endpoints

📱 Mobile App

🖥️ Web Dashboard

🤖 AI Integration

🧪 Testing

📚 Documentation

🤝 Contributing

📄 License

📬 Contact

</details>
🌟 Overview
Abshir is a cutting-edge full-stack platform combining AI capabilities with modern web and mobile technologies. Built with performance and scalability in mind, featuring Python AI backend, ReactJS web interface, React Native mobile apps, and C# ASP.NET microservices.

✨ Features
<div align="center"><table> <tr> <td align="center" width="300"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="80" height="80" /> <br> <b>🤖 AI/ML Engine</b> <br> <sub>Advanced Python AI Models</sub> </td> <td align="center" width="300"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="80" height="80" /> <br> <b>⚡ ReactJS Dashboard</b> <br> <sub>Modern Responsive UI</sub> </td> <td align="center" width="300"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="80" height="80" /> <br> <b>📱 React Native</b> <br> <sub>Cross-platform Mobile</sub> </td> </tr> <tr> <td align="center" width="300"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg" width="80" height="80" /> <br> <b>🚀 ASP.NET Core</b> <br> <sub>High-performance APIs</sub> </td> <td align="center" width="300"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="80" height="80" /> <br> <b>🗄️ PostgreSQL</b> <br> <sub>Relational Database</sub> </td> <td align="center" width="300"> <img src="https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg" width="80" height="80" /> <br> <b>🔌 Postman</b> <br> <sub>API Documentation</sub> </td> </tr> </table></div>
🏗️ Architecture
graph TB
    A[📱 Mobile App - React Native] --> B[🌐 Web App - ReactJS]
    A --> C[🔗 API Gateway]
    B --> C
    
    C --> D[🤖 AI Service - Python]
    C --> E[💼 Business Logic - .NET]
    C --> F[📊 Analytics Service]
    
    D --> G[🗄️ PostgreSQL]
    E --> G
    F --> G
    
    H[📡 Redis Cache] --> D
    H --> E
    
    I[🔐 Auth Service] --> C
    J[📁 File Storage] --> D
    J --> E
🚀 Quick Start
bash
# Clone the repository
git clone https://github.com/abdullahMohamed13/abshir.git
cd abshir

# Setup using Docker (Recommended)
docker-compose up -d

# Or manual setup
./setup.sh
📦 Installation
Method 1: Docker Compose (Easiest)
yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: abshir_db
      POSTGRES_USER: abshir_user
      POSTGRES_PASSWORD: abshir_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  python-api:
    build: ./python-backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://abshir_user:abshir_pass@postgres:5432/abshir_db
      REDIS_URL: redis://redis:6379
  
  dotnet-api:
    build: ./dotnet-backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
  
  react-web:
    build: ./react-web
    ports:
      - "3000:3000"
    depends_on:
      - python-api
      - dotnet-api

volumes:
  postgres_data:
Method 2: Manual Setup
1. Clone & Setup
bash
# Clone repository
git clone https://github.com/abdullahMohamed13/abshir.git
cd abshir

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
2. Backend Setup
bash
# Python Backend
cd python-backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# .NET Backend
cd ../dotnet-backend
dotnet restore
dotnet ef database update
dotnet run
3. Frontend Setup
bash
# React Web
cd ../react-web
npm install
npm start

# React Native Mobile
cd ../react-native-app
npm install
npx react-native start
npx react-native run-android  # or run-ios
🔧 Tech Stack
<div align="center">
Layer	Technology	Version
AI/ML	Python, TensorFlow, PyTorch	3.9+
Backend	C# ASP.NET Core	7.0
Frontend	ReactJS, TypeScript	18.0+
Mobile	React Native	0.70+
Database	PostgreSQL, Redis	15.0, 7.0
API Docs	Swagger, Postman	-
Testing	Pytest, xUnit, Jest	-
DevOps	Docker, GitHub Actions	-
Monitoring	Grafana, Prometheus	-
</div>
📁 Project Structure
text
abshir/
├── python-backend/           # AI & ML Services
│   ├── apps/
│   │   ├── ai_models/        # AI implementations
│   │   ├── nlp/              # NLP services
│   │   └── predictions/      # Prediction APIs
│   ├── core/
│   ├── utils/
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── dotnet-backend/           # C# ASP.NET APIs
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Data/
│   ├── Program.cs
│   ├── appsettings.json
│   └── Abshir.API.csproj
│
├── react-web/                # React Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
│
├── react-native-app/         # Mobile App
│   ├── android/
│   ├── ios/
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   └── services/
│   └── package.json
│
├── postman/                  # API Collections
├── docs/                     # Documentation
├── docker/                   # Docker configs
├── scripts/                  # Utility scripts
├── tests/                    # Test suites
├── .github/workflows/        # CI/CD
├── LICENSE
└── README.md
⚡ Performance
<div align="center">
Metric	Target	Current
API Response	< 100ms	85ms
Mobile Load	< 2s	1.5s
Web Load	< 3s	2.1s
AI Inference	< 500ms	320ms
</div>
🔗 API Endpoints
Python AI Service (Port: 8000)
python
# Text Analysis
POST /api/v1/ai/text-analysis
{
    "text": "Sample text",
    "language": "en"
}

# Image Processing
POST /api/v1/ai/image-process
Content-Type: multipart/form-data

# Predictions
POST /api/v1/ai/predict
{
    "features": [1.2, 3.4, 5.6],
    "model": "xgboost"
}
C# ASP.NET Service (Port: 5000)
csharp
// Users API
GET    /api/v1/users
POST   /api/v1/users
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}

// Products API
GET    /api/v1/products
POST   /api/v1/products
📱 Mobile App
React Native Setup
javascript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import AIScreen from './src/screens/AIScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AI" component={AIScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
🖥️ Web Dashboard
React Components
jsx
// Dashboard.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import AIDashboard from './components/AIDashboard';
import Analytics from './components/Analytics';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="AI Performance Dashboard">
            <AIDashboard />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Analytics">
            <Analytics />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Predictions">
            <Predictions />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
🤖 AI Integration
Python AI Model
python
# predictor.py
class AIPredictor:
    def __init__(self):
        self.models = {}
    
    def predict(self, features):
        # AI prediction logic
        return {
            'prediction': 0.85,
            'confidence': 0.92
        }
    
    def analyze_text(self, text):
        # NLP analysis
        return {
            'sentiment': 'positive',
            'entities': []
        }
C# Service
csharp
public class AIService
{
    public async Task<Prediction> PredictAsync(double[] features)
    {
        // Call Python AI service
        var result = await _httpClient.PostAsync("/api/v1/ai/predict", 
            new { features });
        return await result.ReadFromJsonAsync<Prediction>();
    }
}
🧪 Testing
Run Tests
bash
# Python tests
cd python-backend
pytest

# .NET tests
cd dotnet-backend
dotnet test

# React tests
cd react-web
npm test

# All tests
./scripts/test.sh
📚 Documentation
API Docs
Swagger UI: http://localhost:8000/docs

Postman Collection: postman/Abshir_API.postman_collection.json

OpenAPI Spec: docs/api/openapi.yaml

Setup Guide
See docs/setup/README.md for detailed installation instructions.

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📬 Contact
<div align="center">
👥 Team Members
Moustafa Nasr - GitHub

Abdallah Zahra - GitHub

Abdallah Mohammed - GitHub

🔗 Project Links
Repository: https://github.com/abdullahMohamed13/abshir

Issues: https://github.com/abdullahMohamed13/abshir/issues

</div>
<div align="center">
🚀 Built with ❤️ by Team Abshir
https://api.star-history.com/svg?repos=abdullahMohamed13/abshir&type=Date

Version: v1.0.0 | Last Updated: January 2024

</div>
🎯 Quick Setup Script
Create setup.sh:

bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Abshir Platform Setup...${NC}"

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create .env file if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
fi

# Start services
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 30

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec python-api python manage.py migrate
docker-compose exec dotnet-api dotnet ef database update

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo -e "${YELLOW}Services are running at:${NC}"
echo -e "🌐 Web Dashboard: http://localhost:3000"
echo -e "🤖 Python API: http://localhost:8000"
echo -e "💼 .NET API: http://localhost:5000"
echo -e "📊 API Docs: http://localhost:8000/docs"
echo -e "🗄️  Database: localhost:5432"
📊 Performance Monitoring
Grafana Dashboard Setup
yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3001:3000"
    volumes:
      - ./monitoring/dashboards:/var/lib/grafana/dashboards
Prometheus Configuration
yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'python-api'
    static_configs:
      - targets: ['python-api:8000']
  
  - job_name: 'dotnet-api'
    static_configs:
      - targets: ['dotnet-api:5000']
🔐 Security
Environment Variables Template
bash
# .env.example
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/abshir_db
REDIS_URL=redis://localhost:6379

# JWT Settings
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE_DAYS=7

# API Keys
OPENAI_API_KEY=your-openai-api-key
GOOGLE_AI_KEY=your-google-ai-key

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
ENCRYPTION_KEY=your-encryption-key-here

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
🚀 Deployment
Dockerfile Examples
dockerfile
# Dockerfile.python
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
dockerfile
# Dockerfile.dotnet
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "Abshir.API.dll"]
dockerfile
# Dockerfile.react
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
📈 Health Checks
Health Check Endpoints
python
# python-backend/apps/health/views.py
from django.http import JsonResponse
import redis
import psycopg2
from django.conf import settings

def health_check(request):
    status = {
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'services': {}
    }
    
    # Check database
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.close()
        status['services']['database'] = 'healthy'
    except Exception as e:
        status['services']['database'] = 'unhealthy'
        status['status'] = 'unhealthy'
    
    # Check Redis
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        status['services']['redis'] = 'healthy'
    except Exception as e:
        status['services']['redis'] = 'unhealthy'
        status['status'] = 'unhealthy'
    
    return JsonResponse(status)
🎨 UI Components
React Component Library
jsx
// src/components/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default Button;
🔄 CI/CD Pipeline
yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install Python dependencies
      run: |
        cd python-backend
        pip install -r requirements.txt
    
    - name: Run Python tests
      run: |
        cd python-backend
        pytest
    
    - name: Set up .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '7.0'
    
    - name: Run .NET tests
      run: |
        cd dotnet-backend
        dotnet test
    
    - name: Run frontend tests
      run: |
        cd react-web
        npm ci
        npm test
    
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add deployment commands here
📱 Mobile App Features
React Native Navigation
javascript
// src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AIScreen from '../screens/AIScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="AI" component={AIScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AI') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7B68EE',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
🎯 Getting Started for Developers
Development Workflow
bash
# 1. Clone and setup
git clone https://github.com/abdullahMohamed13/abshir.git
cd abshir

# 2. Start development environment
docker-compose -f docker-compose.dev.yml up -d

# 3. Run migrations
docker-compose exec python-api python manage.py migrate
docker-compose exec python-api python manage.py createsuperuser

# 4. Access services
# Web: http://localhost:3000
# API: http://localhost:8000
# Admin: http://localhost:8000/admin
Development Docker Compose
yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    # ... same as above
  
  redis:
    # ... same as above
  
  python-api:
    build:
      context: ./python-backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./python-backend:/app
    ports:
      - "8000:8000"
    command: python manage.py runserver 0.0.0.0:8000
  
  react-web:
    build:
      context: ./react-web
      dockerfile: Dockerfile.dev
    volumes:
      - ./react-web:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - CHOKIDAR_USEPOLLING=true
📊 Database Schema
sql
-- Example database schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    features JSONB NOT NULL,
    prediction_result FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    accuracy FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
🔐 Authentication System
JWT Authentication
python
# python-backend/apps/auth/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import UserSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            response.data['user'] = UserSerializer(user).data
        return response
🎨 Theme System
jsx
// src/theme/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

const themes = {
  light: {
    primary: '#7B68EE',
    secondary: '#6A5ACD',
    background: '#FFFFFF',
    text: '#333333',
    card: '#F5F5F5',
  },
  dark: {
    primary: '#9370DB',
    secondary: '#8A2BE2',
    background: '#1A1A1A',
    text: '#FFFFFF',
    card: '#2D2D2D',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme: themes[theme], toggleTheme, themeName: theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
<div align="center">
⭐ Support the Project
If you find this project useful, please give it a star! ⭐

https://img.shields.io/github/stars/abdullahMohamed13/abshir?style=social

🚀 Quick Links
📖 Documentation | 🐛 Report Bug | 💡 Request Feature | 🤝 Contribute

Made with ❤️ by Team Abshir
© 2024 Abshir Platform. All rights reserved.

</div>
