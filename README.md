# Candidate Task Instructions

## 🎯 Overview

Welcome to the TypeScript Full-Stack Interview Exercise! You'll be implementing new features in a project management application. The foundation is already built, your job is to complete the missing functionality. Please refrain from adding additional dependencies, using LLM coding assistance is encouraged.

## 🚀 Getting Started

1. **Setup**:
   ```bash
   npm install
   npm run setup
   npm run dev
   ```

2. **Verify Setup**:
   - Frontend: http://localhost:3000 (should show projects list)
   - Backend: http://localhost:3001/api/health (should return "OK")

3. **Explore the Codebase**:
   - Review the existing code structure
   - Check out the pre-built UI components
   - Look for `TODO` comments marking your tasks

## 📋 Your Tasks

### Backend Implementation

Complete the following API endpoints in `backend/src/index.ts`:

#### 1. POST /api/projects - Create New Projects
- **Request**: `{ projects: Array<{ name: string }> }`
- **Notes**:
  - Use efficient batch creation for future proofing
- **Response**: Array of created project objects

#### 2. PUT /api/projects/:id - Update Project
- **Request**: `{ name?: string, completed?: boolean }`
- **Notes**:
  - Cannot mark project as completed if it has incomplete tasks
- **Response**: Updated project object

#### 3. POST /api/projects/:id/tasks - Create Tasks in Project
- **Request**: `{ tasks: Array<{ title: string }> }`
- **Notes**:
  - Cannot add tasks to completed projects
  - Use efficient batch creation for future proofing
- **Response**: Array of created task objects


### Frontend Implementation

1. Project creation
2. Let the user edit the project name and project status
3. Let the user create tasks for a project
