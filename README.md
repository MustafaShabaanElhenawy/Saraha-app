# Saraha App Backend

A secure and scalable backend application for a **Saraha-style anonymous messaging platform**, built with **Node.js**, **Express.js**, and **MongoDB**. The project provides RESTful APIs for authentication, user management, profile management, and anonymous message handling while following clean and modular backend architecture.

##  Features

- User Authentication & Authorization using JWT
- User Registration & Login
- Secure Password Hashing
- Profile Management
- Anonymous Message System
- Protected Routes
- Input Validation
- Error Handling Middleware
- Modular Project Structure
- MongoDB Integration with Mongoose
- RESTful API Design

##  Tech Stack

- JavaScript (ES6+)
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- bcrypt
- dotenv
- Express Validator

##  Project Structure

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── app.js
```

##  Installation

```bash
git clone https://github.com/your-username/saraha-app.git

cd saraha-app

npm install

npm start
```

##  Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
PORT=3000
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

##  API Overview

- Authentication
- User Management
- Profile Management
- Anonymous Messages

##  Learning Objectives

This project was developed to practice building secure and scalable backend applications by implementing:

- RESTful API Development
- Authentication & Authorization
- MongoDB Data Modeling
- Backend Architecture
- Middleware Design
- Error Handling
- API Security

##  Author

**Mostafa Elhenawy**

Backend Software Engineer (Node.js) 
