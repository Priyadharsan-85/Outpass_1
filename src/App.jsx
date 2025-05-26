import React, { useState } from "react";
import RoleSelector from "./Components/RoleSelector";
import ValidateUser from "./Components/ValidateUser";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentDashboard from "./Components/Dashboard/StudentDashboard";
import ClassAdvisorDashboard from "./Components/Dashboard/ClassAdvisorDashboard";
import WardenDashboard from "./Components/Dashboard/WardenDashboard";
import HODDashboard from "./Components/Dashboard/HODDashboard";
function App() {
  const [selectedRole, setSelectedRole] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="LoginPage">
              <h1 style={{ textAlign: "center" }}>OUTPASS GENERATION SYSTEM</h1>
              <h3>Login Page</h3>
              <RoleSelector selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
              <p>Selected Role: {selectedRole || "None"}</p>
              <ValidateUser role={selectedRole} />
            </div>
          }
        />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/class-advisor-dashboard" element={<ClassAdvisorDashboard />} />
        <Route path="/warden-dashboard" element={<WardenDashboard />} />
        <Route path="/hod-dashboard" element={<HODDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
