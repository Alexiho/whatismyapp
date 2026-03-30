# WhatIsMyApp

This repository contains both the client-side and server-side components of the application. The project is divided into two main directories: a React frontend and a Java-based API server.

---
## Authors 

* GOURMAUD Erwan
* GUY Maxime
* HONG Alexis
* MURY Julien
* SCHILTZ Eric

---

## Project Structure

* **/client**: Frontend application built with React.
* **/server**: Backend API handling business logic and data.

---

## Installation and Setup

### 1. Prerequisites
Ensure you have the following installed:
* Node.js 
* Java JDK 

### 2. Backend Setup (Server)
Navigate to the server directory to compile and run the API.

```bash
cd server
./mvnw clean compile exec:java
```
The API will be available at: http://localhost:8080

### 3. Frontend Setup (Client)
Open a new terminal, install dependencies, and start the React application.

```bash
cd client
npm install
npm start
```
The application will be available at: http://localhost:3000

## Development Notes

* Port Configuration: The React client is configured to interact with the backend API running on port 8080.
* Environment: Ensure that both services are running simultaneously for full functionality during development.
