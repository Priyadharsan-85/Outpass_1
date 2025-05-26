import React from "react";
import StudentForm from "./RoleForms/StudentForm";
import ClassAdvisorForm from "./RoleForms/ClassAdvisorForm";
import HODForm from "./RoleForms/HODForm";
import WardenForm from "./RoleForms/WardenForm";
import "./ValidateUser.css";

function ValidateUser({ role }) {
  if (!role) {
    return <p>Please select a role to continue.</p>;
  }

  switch (role) {
    case "Student":
      return <StudentForm />;
    case "Class Advisor":
      return <ClassAdvisorForm />;
    case "HOD":
      return <HODForm />;
    case "Warden":
      return <WardenForm />;
    default:
      return <p>Invalid role selected.</p>;
  }
}

export default ValidateUser;
