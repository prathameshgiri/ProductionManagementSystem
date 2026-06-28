# 🏭 Production Management System

A comprehensive, full-stack **Production Management System** tailored for manufacturing companies to manage operations seamlessly. This system provides a clean, role-based dashboard for administrators, managers, and employees.

---

## 💻 Technologies Used

**Frontend:**
- **React.js + Vite** (Fast and optimized frontend framework)
- **Tailwind CSS** (For modern, responsive UI styling)
- **Chart.js** (For dynamic charts and analytics)
- **React Router DOM** (For seamless navigation)
- **Context API** (For State Management)
- **jsPDF** (For PDF Reports generation)

**Backend:**
- **Node.js + Express.js** (Robust backend framework)
- **Local JSON Database** (No external services, totally free to run locally)
- **JWT** (JSON Web Tokens for secure authentication)
- **bcryptjs** (For secure password hashing)

---

## 📖 Description

The Production Management System is an end-to-end, open-source application designed to digitize and manage factory operations. From tracking raw materials and inventory to generating detailed PDF and CSV reports for production orders, the app covers all essential workflows inside a manufacturing environment. 

It is completely **beginner-friendly**, requires **no paid cloud setups**, and does not rely on external databases or API keys, making it extremely easy to host and experiment with.

---

## ⚙️ How It Works

1. **Role-Based Access Control (RBAC):** Users are assigned different roles (`admin`, `production_manager`, `employee`, `quality_inspector`, `warehouse_manager`). The UI dynamically restricts and grants access to specific routes and pages based on the logged-in user.
2. **Local JSON Database:** All records (users, inventory, products, orders, machines) are securely stored and updated live in local JSON files within the `backend/database/` directory.
3. **Dashboards & Analytics:** Visual representation of factory health, revenue, and order statuses are provided live through an interactive Dashboard.
4. **Data Management:** Export your internal data directly to CSV, download formatted PDF reports, and generate Barcodes/QR codes for physical asset tracking.

---

## 🚀 How to Run (Locally)

The project uses `concurrently` at its root, so you only need **one command** to start both the Frontend and the Backend at the same time.

**Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) installed on your system.

**Step 1:** Clone the repository
```bash
git clone https://github.com/prathameshgiri/ProductionManagementSystem.git
cd ProductionManagementSystem
```

**Step 2:** Install Dependencies
Run the installation script in the root folder. (This will automatically install dependencies for both the frontend and backend folders).
```bash
npm run install:all
```
*(If the above fails, you can manually run `npm install` inside both the `frontend/` and `backend/` folders).*

**Step 3:** Start the Application
Run the following command from the root directory to start the development servers:
```bash
npm run dev
```

The application will now be running at:
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Credentials

To access different role-based dashboards, use the following credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@prathameshgiri.in` | `Prathamesh@123` |
| **Manager** | `manager@prathameshgiri.in` | `Prathamesh@123` |
| **Employee** | `employee@prathameshgiri.in` | `Prathamesh@123` |
| **Warehouse**| `warehouse@prathameshgiri.in` | `Prathamesh@123` |

---

## 📂 File Structure

```text
Production-Management-System/
│
├── frontend/                 # React.js application
│   ├── public/               # Static assets & 3D Logo
│   └── src/
│       ├── assets/           # Images & Icons
│       ├── components/       # Reusable UI components (Modals, Inputs, Cards)
│       ├── context/          # React Context (Auth, Theme)
│       ├── layouts/          # AuthLayout, MainLayout, Sidebar, Navbar
│       ├── pages/            # Dashboard, Inventory, Products, Settings, etc.
│       ├── routes/           # Protected routes and RBAC logic
│       └── services/         # API integration with backend
│
├── backend/                  # Node.js + Express backend
│   ├── controllers/          # Business logic for all modules
│   ├── database/             # Local JSON files acting as the database
│   ├── middleware/           # Auth, RBAC, and error handlers
│   ├── routes/               # API endpoints
│   └── utils/                # DB helper functions & responses
│
├── package.json              # Root configurations and concurrently scripts
└── README.md                 # Project Documentation
```

---

## 👨‍💻 Developed By

This is an **Open Source Project** developed by **Prathamesh Giri**.

🔗 **Website:** [prathameshgiri.in](https://prathameshgiri.in)  
🛠️ **Builds & Projects:** [build.prathameshgiri.in](https://build.prathameshgiri.in)
