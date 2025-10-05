# EPI_USE_EMS – Employee Management System

A cloud-hosted **Employee Management System (EMS)** designed for **HR teams at EPI-USE Africa** to easily manage employee data, reporting lines, and visualize the company’s hierarchy.

## Overview

EPI_USE_EMS was built to solve the challenge of **managing employee records** and **reporting structures** in a modern, scalable way.  
The app allows HR to:
- Create, update, delete, and search employee records.
- Assign reporting managers while preventing invalid structures (e.g., self-manager).
- Visualize the **organisation hierarchy** using an **interactive Org Chart**.
- Display **profile avatars** via [Gravatar](https://en.gravatar.com/).
- Filter, sort, and export employee data.
- Run on the cloud with a persistent **MongoDB Atlas** database.

> The focus is on **HR administration**, not employee logins.

## Design Approach & Architecture

The application follows a **client-server architecture**:

### Frontend
- **React + TypeScript + Vite** for a fast, modular, and maintainable SPA.
- **shadcn/ui** for modern, accessible UI components.
- **Tailwind CSS** for flexible theming and styling.
- **React Query (TanStack)** for efficient server-state management and caching.
- **D3/React-Flow** (or similar) for rendering the **Org Chart**.

### Backend
- **Node.js + Express.js** REST API for serving employee data.
- CRUD endpoints for `/employees` (create, read, update, delete).
- Input validation and business rules (e.g., employee cannot be their own manager).
- **Gravatar integration** to display avatars automatically using employee email.

### Database
- **MongoDB Atlas** (cloud-hosted) as the central data store.
- Employee schema includes:
  - `firstName`, `surname`, `email`
  - `birthDate`, `employeeNumber`, `salary`, `role`
  - `manager` (reference to another employee)
  - Timestamps for `createdAt` and `updatedAt`
- Unique indexes for `email` and `employeeNumber`.

### Deployment
- **Frontend:** Vercel (public URL for easy access)
- **Backend:** Render (free tier)
- **Database:** MongoDB Atlas

 ### Tech Stack Justification

| Layer       | Technology         | Reason for Choice                                           |
|-------------|--------------------|-------------------------------------------------------------|
| Frontend    | React + TS         | Component-based, strong typing for fewer bugs.             |
| Styling     | Tailwind + shadcn  | Quick, consistent, and modern UI with easy theming.        |
| State Mgmt  | React Query        | Reliable server-state sync and caching.                    |
| Backend     | Node + Express     | Lightweight, fast API service ideal for REST CRUD apps.    |
| Database    | MongoDB Atlas      | Flexible schema for hierarchical employee data.           |
| Charts      | React-Flow / D3    | Visualizes hierarchical Org Chart.                         |
| Hosting     | Vercel + Render    | Simple cloud deployment with free tiers.                   |


 ### Key Features

- **Employee CRUD:** Create, edit, delete, and search employee records.
- **Manager Assignment:** Assign reporting lines; CEO can have no manager.
- **Org Chart Visualization:** Displays live hierarchy from DB.
- **Gravatar Integration:** Fetches profile images automatically by email.
- **Role-based Filtering:** Filter employees by role, salary, manager status, etc.
- **Responsive Dashboard:** Key metrics such as Total Employees, Avg Salary, etc.
- **Export to CSV:** For HR reporting.


## Documentation Links

-  [User Guide – How to use the EMS](https://iron-sailfish-b3a.notion.site/EPI_USE_EMS-User-Guide-283d5532e71880679182f2c5406b3677)  
-  [Technical Document – Architecture & Design](https://iron-sailfish-b3a.notion.site/EPI_USE_EMS-Technical-Document-283d5532e718801a8fd5ddd396fc1a98)

## Future Improvements
- Advanced Org Chart controls (drag-and-drop re-assignments)
- Employee file uploads for custom avatars
- Role-based authentication for Managers to manage their teams separately
- Dark/Light theme toggle
- Advanced analytics and reporting features
- Employee performance tracking


## Author
Built by **Rohan Chhika** for **EPI-USE Africa Technical Assessment**.