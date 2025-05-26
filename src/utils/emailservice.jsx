// This is a mock email service. In a real application, you would integrate with an email service provider
const sendEmail = async (to, subject, body) => {
  // In a real application, this would send an actual email
  console.log('Email would be sent:', { to, subject, body });
  
  // For demo purposes, we'll just store the notification in localStorage
  const notifications = JSON.parse(localStorage.getItem('email_notifications') || '[]');
  notifications.push({
    to,
    subject,
    body,
    timestamp: new Date().toISOString(),
    read: false
  });
  localStorage.setItem('email_notifications', JSON.stringify(notifications));
};

export const notifyRequestStatus = async (request, action, role) => {
  const studentEmail = `${request.studentName.toLowerCase().replace(' ', '.')}@college.edu`;
  const subject = `Outpass Request ${action === 'approve' ? 'Approved' : 'Rejected'} by ${role}`;
  
  let body = `Dear ${request.studentName},\n\n`;
  body += `Your outpass request (ID: ${request.requestId}) has been ${action === 'approve' ? 'approved' : 'rejected'} by ${role}.\n\n`;
  
  if (action === 'reject' && request.rejectionReason) {
    body += `Reason for rejection: ${request.rejectionReason}\n\n`;
  }
  
  body += `Request Details:\n`;
  body += `Out Date: ${request.outDate}\n`;
  body += `Return Date: ${request.returnDate}\n`;
  body += `Reason: ${request.Reason}\n\n`;
  
  if (action === 'approve') {
    body += `Next approval required from: ${getNextApprover(role)}\n\n`;
  }
  
  body += `Thank you,\nCollege Outpass System`;

  await sendEmail(studentEmail, subject, body);
};

const getNextApprover = (currentRole) => {
  const roles = {
    'Class Advisor': 'HOD',
    'HOD': 'Warden',
    'Warden': 'None - Request Fully Approved'
  };
  return roles[currentRole] || 'Unknown';
};

export default { sendEmail, notifyRequestStatus }; 