import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassAdvisor.css';
import { FaCheck, FaTimes, FaClock, FaCheckCircle, FaTimesCircle, FaSignOutAlt } from "react-icons/fa";

const STORAGE_KEY = "student_outpass_requests";
const INITIAL_REQUESTS = { pending: [], approved: [], rejected: [] };

const ClassAdvisorDashboard = () => {
  const [tab, setTab] = useState('pending');
  const [viewDetails, setViewDetails] = useState(null);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const navigate = useNavigate();
  useEffect(() => {
    const loadRequests = () => {
      const storedRequests = localStorage.getItem(STORAGE_KEY);
      if (storedRequests) {
        try {
          const parsedRequests = JSON.parse(storedRequests);
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

  const handleRequest = async (requestId, action) => {
    const currentRequests = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_REQUESTS));
    const request = currentRequests.pending.find(req => req.requestId === requestId);
    if (!request) return;

    if (action === 'approve') {
      // Move to approved with correct approvalStatus
      const updatedRequest = {
        ...request,
        actionTimestamp: new Date().toLocaleString(),
        approvedBy: 'Class Advisor',
        approvalStatus: {
          classAdvisor: 'approved',
          hod: 'pending',
          warden: 'pending'
        }
      };
      const updatedRequests = {
        ...currentRequests,
        pending: currentRequests.pending.filter(req => req.requestId !== requestId),
        approved: [...currentRequests.approved, updatedRequest]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
    } else if (action === 'reject') {
      // Move to rejected with correct approvalStatus
      const updatedRequest = {
        ...request,
        actionTimestamp: new Date().toLocaleString(),
        rejectedBy: 'Class Advisor',
        approvalStatus: {
          classAdvisor: 'rejected',
          hod: 'pending',
          warden: 'pending'
        }
      };
      const updatedRequests = {
        ...currentRequests,
        pending: currentRequests.pending.filter(req => req.requestId !== requestId),
        rejected: [...currentRequests.rejected, updatedRequest]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="status-badge status-pending"><FaClock /> Pending</span>,
      approved: <span className="status-badge status-approved"><FaCheckCircle /> Approved</span>,
      rejected: <span className="status-badge status-rejected"><FaTimesCircle /> Rejected</span>
    };
    return badges[status];
  };

  const renderTable = (data, statusLabel) => (
    <div className="table-container">
      <table className="class-advisor-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Out Date & Time</th>
            <th>Return Date & Time</th>
            <th>Reason</th>
            <th>Status</th>
            {tab === "pending" && <th>Actions</th>}
            {(tab === "approved" || tab === "rejected") && <th>{statusLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={tab === "pending" ? 9 : 8} style={{ textAlign: 'center' }}>
                No {tab} requests found
              </td>
            </tr>
          ) : (
            data.map((req, idx) => (
              <tr key={idx}>
                <td>{req.requestId}</td>
                <td>{req.studentName}</td>
                <td>{req.studentClass}</td>
                <td>{req.outDate}</td>
                <td>{req.returnDate}</td>
                <td>{req.Reason}</td>
                <td>{getStatusBadge(tab)}</td>
                {tab === "pending" && (
                  <td>
                    <button 
                      className="approve-button"
                      onClick={() => handleRequest(req.requestId, 'approve')}
                    >
                      <FaCheck /> Approve
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleRequest(req.requestId, 'reject')}
                    >
                      <FaTimes /> Reject
                    </button>
                  </td>
                )}
                {(tab === "approved" || tab === "rejected") && (
                  <td>{req.actionTimestamp}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="class-advisor-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Class Advisor Dashboard</h2>
          <p>Review and manage class outpass requests</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="tab-buttons">
        {[
          { id: "pending", icon: <FaClock />, label: "Pending" },
          { id: "approved", icon: <FaCheckCircle />, label: "Approved" },
          { id: "rejected", icon: <FaTimesCircle />, label: "Rejected" }
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={tab === id ? "active" : ""}
          >
            {icon} {label} Requests
          </button>
        ))}
      </div>

      <div>
        {renderTable(
          requests[tab],
          `${tab.charAt(0).toUpperCase() + tab.slice(1)} On`
        )}
      </div>

      {viewDetails && (
        <>
          <div className="modal-overlay" onClick={() => setViewDetails(null)} />
          <div className="details-modal">
            <h2>Request Details</h2>
            <div className="status-stepper">
              {[
                { label: 'Submitted', key: 'submitted' },
                { label: 'Class Advisor', key: 'advisor' },
                { label: 'Dept. HOD', key: 'hod' },
                { label: 'Warden', key: 'warden' }
              ].map((step, idx, arr) => {
                // Determine step status
                let stepStatus = 'pending';
                if (idx === 0) stepStatus = 'completed';
                if (tab === 'pending' && idx === 1) stepStatus = 'current';
                if (tab === 'approved' && idx === 2) stepStatus = 'current';
                if (tab === 'rejected' && idx === 1) stepStatus = 'rejected';
                if (tab === 'approved' && idx < 2) stepStatus = 'completed';
                if (tab === 'rejected' && idx < 1) stepStatus = 'completed';
                return (
                  <React.Fragment key={step.key}>
                    <div className={`stepper-step ${stepStatus}`}>
                      {stepStatus === 'completed' ? (
                        <span className="stepper-icon completed">&#10003;</span>
                      ) : stepStatus === 'current' ? (
                        <span className="stepper-icon current">&#8987;</span>
                      ) : (
                        <span className="stepper-icon">&#8987;</span>
                      )}
                      <span className="stepper-label">{step.label}</span>
                    </div>
                    {idx < arr.length - 1 && <div className="stepper-line" />}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="info-group">
              <div className="info-label">Student Information</div>
              <div className="info-value">{viewDetails.studentName}</div>
              <div className="info-value">{viewDetails.studentClass}</div>
            </div>

            <div className="info-group">
              <div className="info-label">Reason for Outpass</div>
              <div className="info-value">{viewDetails.Reason}</div>
            </div>

            <div className="info-group">
              <div className="info-label">Duration</div>
              <div className="info-value">Out Date: {viewDetails.outDate}</div>
              <div className="info-value">Return Date: {viewDetails.returnDate}</div>
            </div>

            <div className="info-group">
              <div className="info-label">Request Information</div>
              <div className="info-value">Submitted On: {viewDetails.timestamp}</div>
              <div className="info-value">
                Status: 
                <span className={`status-badge status-${viewDetails.status}`}>
                  {viewDetails.status.charAt(0).toUpperCase() + viewDetails.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              {viewDetails.status === 'pending' && (
                <>
                  <button 
                    className="approve-btn"
                    onClick={() => {
                      handleRequest(viewDetails.requestId, 'approve');
                      setViewDetails(null);
                    }}
                    style={{ marginRight: '10px' }}
                  >
                    Approve Request
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => {
                      handleRequest(viewDetails.requestId, 'reject');
                      setViewDetails(null);
                    }}
                  >
                    Reject Request
                  </button>
                </>
              )}
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
  );
};

export default ClassAdvisorDashboard;
