# Project Architecture & Technology Stack Report
**Transport Management System (Admin Panel)**

This document outlines the libraries, technologies, integration mechanisms, and testing tools utilized across the project.

---

## 1. Technologies & Libraries Used

### Frontend (Client-Side)
The frontend is a single-page application built using modern web technologies to ensure a fast, responsive, and highly interactive user experience.

*   **Core Framework**: **React (v19.2)**
*   **Build Tool**: **Vite** (Provides lightning-fast hot module replacement and optimized production builds.)
*   **Styling**: **Tailwind CSS (v4)** (Utility-first CSS framework used for designing visually stunning and consistent UI components.)
*   **Routing**: **React Router DOM** (Handles client-side routing, protected routes, and navigation without page reloads.)
*   **API Client**: **Axios** (Promise-based HTTP client used to seamlessly fetch data from the backend.)
*   **Data Visualization**: **Recharts** (Used for rendering dynamic charts and graphs on the dashboard.)
*   **Maps & Geolocation**: **Leaflet** & **React-Leaflet** (Integrated for tracking and map-based features.)
*   **Animations**: **Framer Motion**
*   **Icons**: **Material Symbols** & **Lucide React**

### Backend (Server-Side)
The backend acts as a robust API server, dealing with business logic, database management, and authentication.

*   **Core Language**: **Python**
*   **Framework**: **Django** (A high-level Python web framework that encourages rapid development.)
*   **API Architecture**: **Django REST Framework (DRF)** (Powerful toolkit for building Web APIs, handling serialization, routing, and viewsets.)
*   **Database**: **MySQL** (Relational database management system used to store all persistent data such as Trips, Vehicles, Users, and Transactions.)

---

## 2. Frontend to Backend Connection Mechanism

The frontend and backend are completely decoupled and communicate over the HTTP protocol in a standard Client-Server architecture.

*   **Data Format**: They exchange data exclusively using **JSON** (JavaScript Object Notation).
*   **Communication Flow**:
    1.  The React frontend uses the **Axios** library to make REST API calls (GET, POST, PUT, DELETE) to specific backend endpoints (e.g., `http://127.0.0.1:8000/api/login/`).
    2.  The backend accepts the request. Due to the decoupled nature, the backend is configured using **CORS** (Cross-Origin Resource Sharing) to authorize incoming requests from the frontend's specific port (e.g., `localhost:5173`).
    3.  Django processes the logic, queries the MySQL database via ORM, and uses DRF Serializers to turn complex Python objects into JSON.
    4.  The JSON response is sent back to the frontend, where Axios resolves the promise, and React re-renders the UI with the fresh data.
*   **Security/State**: Important frontend state like authentication is maintained using browser features like `localStorage`, checking permissions on every protected route.

---

## 3. API Testing Methodology

To guarantee that the backend endpoints operate correctly before connecting them to the frontend UI, dedicated API testing is performed.

*   **Tool Used**: **Postman**
*   **Implementation**: A dedicated Postman collection (`postman_collection.json`) is maintained within the backend directory.
*   **Workflow**:
    *   Developers use Postman to configure requests with appropriate HTTP methods, headers (such as `Content-Type: application/json`), and request bodies.
    *   This allows isolated testing of endpoints (e.g., validating that `/api/signup/` successfully creates a database record, or that `GET /api/vehicles/` returns the proper JSON structure) without needing any frontend intervention.
    *   Postman handles testing for various HTTP status codes like `200 OK`, `201 Created`, or `400 Bad Request`.
