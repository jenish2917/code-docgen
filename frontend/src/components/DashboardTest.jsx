import React from 'react';
import Dashboard from '../pages/Dashboard';

// Test component to demonstrate dashboard behavior
const DashboardTest = () => {
  const sampleDocs = `
# 📄 UserAuthService.py - Enterprise Documentation

## 📋 Executive Summary

**Module**: UserAuthService.py  
**Language**: Python (PY)  
**Architecture**: Service Layer Pattern  
**Complexity**: Professional  
**Purpose**: Authentication service handling user login, registration, and session management.  

### Business Value
This Python module implements a comprehensive authentication service using service layer pattern principles. The implementation follows enterprise security standards with professional production-ready implementation suitable for business-critical applications.

### Key Characteristics
- **Security First**: Implements industry-standard security practices
- **Scalable Design**: Built for enterprise user management
- **Session Management**: Comprehensive token and session handling
- **Production Ready**: Suitable for high-traffic applications

---

## 🏗️ Technical Architecture

### Design Overview
The module implements a service layer pattern with the following characteristics:

**Component Structure:**
- **Functions**: 5 implemented methods
- **Classes**: 2 defined components  
- **Architecture Pattern**: Service Layer Pattern
- **Code Complexity**: Professional (156 lines)

### Security Features
- JWT token implementation
- Password hashing with bcrypt
- Session timeout management
- Role-based access control
`;

  return (
    <div>
      <h1>Dashboard Test - No Documentation</h1>
      <Dashboard generatedDocs="" generator="" />
      
      <hr style={{ margin: '40px 0' }} />
      
      <h1>Dashboard Test - With Generated Documentation</h1>
      <Dashboard generatedDocs={sampleDocs} generator="AI-Generated" />
    </div>
  );
};

export default DashboardTest;
