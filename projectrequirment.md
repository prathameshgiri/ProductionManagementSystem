Build a Full Stack Production Management System for manufacturing companies.

Technology Stack
Frontend: React.js + Vite
Backend: Node.js + Express.js
Database: Local JSON Database (No MySQL, MongoDB, Firebase, or paid APIs)
Authentication: JWT
Password Hashing: bcryptjs
Styling: Tailwind CSS
Charts: Chart.js
Icons: React Icons
Tables: React Table
PDF Reports: jsPDF
State Management: Context API

The entire project must be:

✅ Completely free

✅ No paid services

✅ No cloud setup

✅ No API keys

✅ Beginner friendly

✅ Easy to run locally

Project Folder Structure
Production-Management-System
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── layouts
│   │   ├── hooks
│   │   ├── context
│   │   ├── services
│   │   ├── routes
│   │   ├── assets
│   │   └── utils
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── services
│   ├── utils
│   ├── database
│   │   ├── users.json
│   │   ├── products.json
│   │   ├── inventory.json
│   │   ├── production.json
│   │   ├── machines.json
│   │   ├── employees.json
│   │   ├── suppliers.json
│   │   ├── reports.json
│   │   └── notifications.json
│
└── README.md
User Roles
Admin

Full access.

Production Manager

Production and reports management.

Employee

Update assigned tasks and production status.

Quality Inspector

Manage quality inspections.

Warehouse Manager

Inventory and stock management.

Authentication Module

Features:

Register
Login
Logout
JWT Authentication
Forgot Password
Reset Password
Role Based Access Control
Session Management
Protected Routes
Dashboard

Dashboard cards:

Total Products
Production Orders
Today's Production
Machine Utilization
Inventory Status
Low Stock Materials
Pending Orders
Completed Orders
Revenue
Defective Products

Dashboard charts:

Monthly Production Chart
Inventory Chart
Employee Performance Chart
Machine Utilization Chart
Revenue Chart
Production Trend Chart
Product Management

Features:

Add Product
Edit Product
Delete Product
Search Product
Product Categories
Product Costing
Product Images
Product Status
Product Reports

Fields:

Product ID
Product Name
Category
Description
Price
Manufacturing Cost
Status
Created Date
Production Planning Module

Features:

Create Production Plan
Daily Plan
Weekly Plan
Monthly Plan
Production Targets
Production Calendar
Resource Planning
Production Scheduling

Fields:

Plan ID
Product
Quantity
Start Date
End Date
Priority
Status
Production Order Management

Features:

Create Work Orders
Assign Orders
Update Status
Order Tracking
Priority Management
Completed Orders
Pending Orders

Statuses:

Pending
In Progress
Completed
Cancelled
Raw Material Management

Features:

Add Material
Update Material
Delete Material
Material Stock
Material Usage
Material Requests
Material Reports

Fields:

Material ID
Name
Quantity
Unit
Cost
Supplier
Inventory Management

Features:

Stock In
Stock Out
Low Stock Alerts
Reorder Level
Warehouse Tracking
Barcode Generation
Inventory Reports
Machine Management

Features:

Add Machine
Machine Status
Machine Utilization
Maintenance Schedule
Downtime Tracking
Performance Reports

Fields:

Machine ID
Machine Name
Status
Capacity
Last Service Date
Employee Management

Features:

Add Employee
Update Employee
Delete Employee
Attendance
Shift Management
Overtime
Employee Performance

Fields:

Employee ID
Name
Email
Phone
Department
Role
Shift
Status
Shift Management

Features:

Morning Shift
Evening Shift
Night Shift
Shift Rotation
Shift Reports
Quality Control Management

Features:

Product Inspection
Defect Tracking
Rejected Products
Rework Management
Quality Reports

Fields:

Inspection ID
Product
Defect Type
Severity
Status
Inspector
Supplier Management

Features:

Add Supplier
Update Supplier
Delete Supplier
Purchase Orders
Supplier Performance

Fields:

Supplier ID
Name
Phone
Email
Address
Purchase Management

Features:

Purchase Requests
Purchase Orders
Approvals
Goods Received Notes
Purchase Reports
Warehouse Management

Features:

Multiple Warehouses
Material Movement
Stock Reports
Storage Locations
Notifications System

Features:

Low Stock Alert
Production Alert
Machine Alert
Maintenance Alert
Order Alert
Reports Module

Generate:

PDF Reports
Excel Reports
Production Reports
Inventory Reports
Employee Reports
Machine Reports
Financial Reports
Activity Logs

Track:

Login History
Production Changes
Inventory Changes
User Activities
Settings Module

Features:

Profile Settings
Theme Settings
System Settings
Backup & Restore
UI Requirements

Design should be:

Modern
Premium
Professional
Fully Responsive
Dark Mode
Light Mode
Smooth Animations
Sidebar Navigation
Top Navbar
Search Everywhere
Breadcrumb Navigation
Loading Skeletons
Toast Notifications
Confirmation Dialogs
Pages Required
Login
Register
Dashboard
Products
Production Planning
Production Orders
Inventory
Raw Materials
Machines
Employees
Quality Control
Suppliers
Purchase Orders
Warehouse
Reports
Notifications
Activity Logs
Settings
User Profile
Error Pages
Local Database Requirements

Store everything inside JSON files.

Example:

database/
users.json
products.json
inventory.json
machines.json
employees.json
production.json
suppliers.json
reports.json

Create reusable utility functions:

readData()
writeData()
updateData()
deleteData()

No external database should be used.

Backend API Requirements

Create REST APIs for every module.

Example:

GET
POST
PUT
DELETE

Follow proper MVC architecture.

Extra Advanced Features
QR Code Generation
Barcode Generation
CSV Export
PDF Export
Search Filters
Pagination
Dashboard Analytics
Audit Logs
Backup System
Data Import/Export
OEE Dashboard
KPI Dashboard
Final Goal

Build an industry-level Production Management System using only:

React.js
Node.js
Express.js
Local JSON Database

The code should be:

Clean
Modular
Reusable
Easy to understand
Beginner friendly
Production ready
Fully responsive
Well documented
Step-by-step implementation with comments and explanations for every file and feature.