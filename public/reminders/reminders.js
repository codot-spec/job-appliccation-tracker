function handleAddReminder(event) {
  event.preventDefault();
  
  const reminderId = event.target.dataset.reminderId; // Get reminder ID if editing
  const reminderDetails = {
    reminderDate: event.target.reminderDate.value,
    reminderMessage: event.target.reminderMessage.value
  };
  
  const token = localStorage.getItem('token'); // Get the token from localStorage

  if (reminderId) {
    // If editing an existing reminder
    axios.put(`http://localhost:3000/reminders/${reminderId}`, 
      reminderDetails, { headers: { "Authorization": token } })
      .then(response => {
        reloadReminders();
      })
      .catch(error => console.log(error));
  } else {
    // If adding a new reminder
    axios.post("http://localhost:3000/reminders", reminderDetails, 
      { headers: { "Authorization": token } })
      .then(response => {
        reloadReminders();
      })
      .catch(error => console.log(error));
  }

  event.target.reset(); // Reset form after submission
  delete event.target.dataset.reminderId; // Clear reminderId
}


function reloadReminders() {

  let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'), 10) || 2; // Get rows per page from localStorage (default is 2)
  let currentPage = 1;  // Default to page 1 after submission
  
    fetchAndDisplayReminders(currentPage, rowsPerPage);
}


function deleteReminder(reminderId) {
  const token = localStorage.getItem('token'); // Get the token from localStorage
  axios.delete(`http://localhost:3000/reminders/${reminderId}`, { headers: { "Authorization": token } })
    .then(() => {
      reloadReminders();
    })
    .catch(error => console.log(error));
}



  function fetchAndDisplayReminders(page = 1, rowsPerPage = 2) {
    const token = localStorage.getItem('token');
  
    axios.get(`http://localhost:3000/reminders?page=${page}&limit=${rowsPerPage}`, {
      headers: { "Authorization": token }
    })
    .then(response => {
      const { reminders, pagination } = response.data;
      const reminderList = document.getElementById('reminderList');
      reminderList.innerHTML = '';  // Clear previous list
  
      reminders.forEach(reminder => {
        const item = document.createElement("li");
        item.setAttribute("data-id", reminder.id); // Make sure the id is set correctly here
        item.innerHTML = `${reminder.reminderDate} - ${reminder.reminderMessage}
          <button onclick="deleteReminder(${reminder.id})">Delete</button>
          <button onclick="editReminder(${reminder.id}, '${reminder.reminderDate}', '${reminder.reminderMessage}')">Edit</button>`;
        reminderList.appendChild(item);
      });
  
      // Display pagination buttons
      const paginationInfo = document.getElementById('paginationInfo');
      paginationInfo.innerHTML = `
        <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
        <button onclick="fetchAndDisplayReminders(${pagination.currentPage - 1}, ${rowsPerPage})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
        <button onclick="fetchAndDisplayReminders(${pagination.currentPage + 1}, ${rowsPerPage})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
      `;
    })
    .catch(error => console.log(error));
  }
  


// Edit a reminder
function editReminder(reminderId, reminderDate, reminderMessage) {
  document.getElementById('reminderDate').value = reminderDate;
  document.getElementById('reminderMessage').value = reminderMessage;

  document.getElementById('form').dataset.reminderId = reminderId; // Store reminder ID for editing
}


// Event listener for rows per page selection
document.getElementById('rowsperpage').addEventListener('change', (event)=> {
  const rowsPerPage = event.target.value;
  localStorage.setItem('rowsPerPage', rowsPerPage);
  reloadReminders();
});

// Display reminders when the page loads
window.addEventListener("DOMContentLoaded", () => { 
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'),10) || 2;  // Get rows per page from localStorage (default is 2)
  let currentPage = 1;  // Start at page 1
  fetchAndDisplayReminders(currentPage, rowsPerPage);  // Fetch and display reminders with pagination
});

reloadReminders();

function logout() {
  localStorage.clear();
  window.location.href = "http://localhost:3000";
}

function profile(){
  window.location.href = "../profile/index.html";
}