import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import "./Student.css";

const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `REQ-${timestamp}-${random}`;
};

const STORAGE_KEY = "student_outpass_requests";
const INITIAL_REQUESTS = { pending: [], approved: [], rejected: [] };

const StudentDashboard = () => {
  const [tab, setTab] = useState("pending");
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [formData, setFormData] = useState({
    Reason: "",
    outDate: "",
    returnDate: "",
  });
  const [studentName, setStudentName] = useState(() => localStorage.getItem('studentName') || "Student");
  const [studentDept, setStudentDept] = useState(() => localStorage.getItem('studentDept') || "Department");
  const [showForm, setShowForm] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadRequests = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsedRequests = JSON.parse(stored);
          setRequests(parsedRequests);
        } catch (error) {
          console.error('Error parsing stored requests:', error);
          setRequests(INITIAL_REQUESTS);
        }
      } else {
        setRequests(INITIAL_REQUESTS);
      }
    };

    loadRequests();
    window.addEventListener('storage', loadRequests);
    return () => window.removeEventListener('storage', loadRequests);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addRequest = () => {
    const newRequest = {
      ...formData,
      studentName,
      studentDept,
      requestId: generateUniqueId(),
      timestamp: new Date().toLocaleString(),
      approvalStatus: {
        classAdvisor: 'pending',
        hod: 'pending',
        warden: 'pending'
      }
    };
    const currentRequests = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_REQUESTS));
    const updatedRequests = {
      ...currentRequests,
      pending: [...currentRequests.pending, newRequest]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    
    setFormData({ Reason: "", outDate: "", returnDate: "" });
    setShowForm(false);
  };

  const deleteRequest = (requestId) => {
    const currentRequests = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_REQUESTS));
    
    const updatedRequests = {
      ...currentRequests,
      [tab]: currentRequests[tab].filter((req) => req.requestId !== requestId)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="status-badge status-pending">Pending</span>,
      approved: <span className="status-badge status-approved">Approved</span>,
      rejected: <span className="status-badge status-rejected">Rejected</span>
    };
    return badges[status];
  };

  const isFullyApproved = (request) => {
    return request.approvalStatus && 
           request.approvalStatus.classAdvisor === 'approved' && 
           request.approvalStatus.hod === 'approved' && 
           request.approvalStatus.warden === 'approved';
  };

  const generateQRData = (request) => {
    return JSON.stringify({
      requestId: request.requestId,
      studentName: request.studentName,
      studentDept: request.studentDept,
      outDate: request.outDate,
      returnDate: request.returnDate,
      approvedBy: request.approvedBy,
      timestamp: request.timestamp,
      approvalStatus: request.approvalStatus
    });
  };

  const renderTable = (data, statusLabel) => (
    <div className="table-container" style={{ opacity: viewDetails ? 0.2 : 1 }}>
      <table className="student-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Reason</th>
            <th>Out Date & Time</th>
            <th>Return Date & Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No {tab} requests found
              </td>
            </tr>
          ) : (
            data.map((req) => (
              <tr key={req.requestId}>
                <td>{req.requestId}</td>
                <td>{req.Reason}</td>
                <td>{req.outDate}</td>
                <td>{req.returnDate}</td>
                <td>{getStatusBadge(tab)}</td>
                <td>
                  <button
                    onClick={() => setViewDetails(req)}
                    className="view-btn"
                  >
                    View
                  </button>
                  {tab === "pending" && (
                    <button
                      onClick={() => deleteRequest(req.requestId)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="student-dashboard">
      <button className="logout-btn" onClick={handleLogout} title="Logout">
        Logout
      </button>
      <div className="header-box">
        <h1 className="dashboard-title">Outpass Generation System</h1>
        <h2 className="dashboard-subtitle">Student Dashboard</h2>
        <p className="dashboard-desc">Generate and manage your outpasses using the controls below.</p>
        <div style={{
          marginTop: "10px",
          padding: "15px",
          backgroundColor: "#e0f7fa",
          borderRadius: "10px",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#006064"
        }}>
          Name: {studentName} | Dept: {studentDept}
        </div>
      </div>

      <div className="top-bar">
        <div className="tab-buttons">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setTab(status)}
              className={`tab-button ${tab === status ? "active" : ""}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        {tab === "pending" && (
          <button className="add-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "➕ New Outpass"}
          </button>
        )}
      </div>

      <div className="main-content">
        {showForm && (
          <div className="form-section">
            <h3>Add New Outpass Request</h3>
            <input
              type="text"
              name="Reason"
              placeholder="Reason for Outpass"
              value={formData.Reason}
              onChange={handleInputChange}
            />
            <input
              type="datetime-local"
              name="outDate"
              value={formData.outDate}
              onChange={handleInputChange}
            />
            <input
              type="datetime-local"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleInputChange}
            />
            <button className="submit-button" onClick={addRequest}>
              Submit Request
            </button>
          </div>
        )}

        <div className="table-wrapper">
          {renderTable(requests[tab], `${tab.charAt(0).toUpperCase() + tab.slice(1)} On`)}
        </div>

        {viewDetails && (
          <>
            <div className="modal-overlay" onClick={() => setViewDetails(null)} />
            <div className="details-modal">
              <h2>Request Details</h2>
              <div className="info-group">
                <div className="info-label">Student Information</div>
                <div className="info-value">{viewDetails.studentName}</div>
                <div className="info-value">{viewDetails.studentDept}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Reason for Outpass</div>
                <div className="info-value">{viewDetails.Reason}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Duration</div>
                <div className="info-value">Out: {viewDetails.outDate}</div>
                <div className="info-value">Return: {viewDetails.returnDate}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Request Information</div>
                <div className="info-value">Submitted On: {viewDetails.timestamp}</div>
                <div className="info-value">
                  Status: {getStatusBadge(
                    viewDetails.approvalStatus && viewDetails.approvalStatus.warden === 'approved'
                      ? 'approved'
                      : viewDetails.approvalStatus && (viewDetails.approvalStatus.classAdvisor === 'rejected' || viewDetails.approvalStatus.hod === 'rejected' || viewDetails.approvalStatus.warden === 'rejected')
                      ? 'rejected'
                      : 'pending')}
                </div>
                {viewDetails.approvedBy && (
                  <div className="info-value">Approved By: {viewDetails.approvedBy}</div>
                )}
                {viewDetails.rejectedBy && (
                  <div className="info-value">Rejected By: {viewDetails.rejectedBy}</div>
                )}
                {viewDetails.rejectionReason && (
                  <div className="info-value">Rejection Reason: {viewDetails.rejectionReason}</div>
                )}
                {viewDetails.actionTimestamp && (
                  <div className="info-value">Action Taken On: {viewDetails.actionTimestamp}</div>
                )}
              </div>
              {isFullyApproved(viewDetails) && (
                <div className="info-group qr-section">
                  <div className="info-label">Outpass QR Code</div>
                  <div className="qr-container">
                    <QRCodeSVG 
                      value={generateQRData(viewDetails)}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="qr-code"
                    />
                    <p className="qr-note">Show this QR code at the gate for verification</p>
                    <button 
                      className="print-btn"
                      onClick={() => window.print()}
                    >
                      Print Outpass
                    </button>
                  </div>
                </div>
              )}
              <div className="modal-footer">
                <button
                  className="close-btn"
                  onClick={() => setViewDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;