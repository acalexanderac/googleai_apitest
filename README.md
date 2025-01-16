<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A Health Claims Analysis System powered by Google AI and built with NestJS</p>

## 🌟 Description

This project leverages Google's AI capabilities to analyze and verify health-related claims made by social media influencers. Built with [Nest](https://github.com/nestjs/nest) framework and MongoDB.

### Key Features
- 🤖 AI-Powered Health Claims Analysis
- 📊 Influencer Trust Score System
- 🔍 Medical Source Verification
- 📱 Social Media Platform Integration

## 🚀 Project Setup

```bash
# Install dependencies
$ npm install

# Set up environment variables
$ cp .env.example .env
# Add your Google AI API credentials
```

## 🛠️ Running the Project

```bash
# Start MongoDB
$ docker-compose up -d

# Development mode
$ npm run start

# Watch mode (recommended for development)
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## 📝 API Documentation

### Influencer Management
```bash
GET /influencers/leaderboard      # Get top trusted influencers
GET /influencers/search           # Search influencers by criteria
POST /influencers/{id}/analyze    # Run AI analysis on claims
GET /influencers/{id}/analysis    # Get detailed analysis results
```

### Configuration Endpoints
```bash
GET /config/sources      # Get valid medical sources
GET /config/platforms    # Get supported social platforms
GET /config/categories   # Get health categories
```

## 🧪 Testing

```bash
# Unit tests
$ npm run test

# End-to-end tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## 📚 Resources

- [Google AI Documentation](https://cloud.google.com/vertex-ai)
- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Team

- Developer - [Alexander AC](https://github.com/acalexanderac)
- Project Repository - [googleai_apitest](https://github.com/acalexanderac/googleai_apitest)

## 📄 License

This project is [MIT licensed](LICENSE).
