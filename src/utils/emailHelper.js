// Universal Web Form Email Dispatcher
export const sendWebsiteFormEmail = async ({ type, applicantEmail, applicantName, data }) => {
  if (!applicantEmail && !data?.email) {
    console.warn('[Website Email Helper] Applicant email address is missing');
    return { success: false, error: 'Applicant email address is missing' };
  }

  const targetEmail = applicantEmail || data?.email;
  const targetName = applicantName || data?.name || data?.studentName || data?.fullName || 'Applicant';

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        applicantEmail: targetEmail,
        applicantName: targetName,
        data: data || {}
      })
    });

    if (response.ok) {
      const resData = await response.json();
      return resData;
    }
  } catch (err) {
    console.warn('[Website Email Helper] Backend fetch notice:', err);
  }

  return { success: false, error: 'Unable to connect to backend email service' };
};
