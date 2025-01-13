function handleFormSubmit(event) {
  event.preventDefault();
  
  const applicationId = event.target.dataset.applicationId; // Get application ID if editing
  const applicationDetails = {
    jobTitle: event.target.jobTitle.value,
    company: event.target.company.value,
    status: event.target.status.value,
    note: event.target.note.value,
    dateApplied: event.target.dateApplied.value
    
  };

  const image = document.getElementById('attachment').files[0];
  console.log("image", image)
  const formData = new FormData();
   // Append the image file and JSON data to FormData
   formData.append('image', image);
   formData.append('jobTitle',event.target.jobTitle.value);
   formData.append('company',event.target.company.value);
   formData.append('status',event.target.status.value);
   formData.append('note',event.target.note.value);
   formData.append('dateApplied',event.target.dateApplied.value);
  
  const token = localStorage.getItem('token'); // Get the token from localStorage

  if (applicationId) {
    // If editing an existing application
    axios.put(`http://localhost:3000/applications/${applicationId}`, 
      formData, { headers: { "Authorization": token } })
      .then(response => {
        reloadApplications();
      })
      .catch(error => console.log(error));
  } else {
    // If adding a new application
    axios.post("http://localhost:3000/applications", formData, 
      { headers: { "Authorization": token } })
      .then(response => {
        reloadApplications();
      })
      .catch(error => console.log(error));
  }

  event.target.reset(); // Reset form after submission
  delete event.target.dataset.applicationId; // Clear applicationId
}


function reloadApplications() {

  let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'), 10) || 2; // Get rows per page from localStorage (default is 2)
  let currentPage = 1;  // Default to page 1 after submission
  
    fetchAndDisplayApplications(currentPage, rowsPerPage);
}


function deleteApplication(applicationId) {
  const token = localStorage.getItem('token'); // Get the token from localStorage
  axios.delete(`http://localhost:3000/applications/${applicationId}`, { headers: { "Authorization": token } })
    .then(() => {
      reloadApplications();
    })
    .catch(error => console.log(error));
}



function fetchAndDisplayApplications(page = 1, rowsPerPage = 2) {
  const token = localStorage.getItem('token');

  axios.get(`http://localhost:3000/applications?page=${page}&limit=${rowsPerPage}`, {
    headers: { "Authorization": token }
  })
  .then(response => {
    const { applications, pagination } = response.data;
    const applicationList = document.getElementById('applicationList');
    applicationList.innerHTML = '';  // Clear previous list

    applications.forEach(application => {
      const item = document.createElement("li");
      item.setAttribute("data-id", application.id); // Make sure the id is set correctly

      // Construct the HTML string with application details
      let innerHTML = `
        <p>${application.jobTitle} - ${application.company} - ${application.status} - ${application.note} - ${application.dateApplied}</p>
        <button onclick="deleteApplication(${application.id})">Delete</button>
        <button onclick="editApplication(${application.id}, '${application.jobTitle}', '${application.company}', '${application.status}', '${application.note}', '${application.dateApplied}')">Edit</button>
      `;

      // If there is an image, add the image to the list item
      if (application.image) {
        const imageElement = document.createElement('img');
        imageElement.style.width = '50%';
        imageElement.style.objectFit = 'contain';
        imageElement.src = application.image; // Set the image source
        item.appendChild(imageElement); // Append the image element to the list item
      }

      // Set the inner HTML of the list item
      item.innerHTML = innerHTML;

      // Append the item to the application list
      applicationList.appendChild(item);
    });

    // Display pagination buttons
    const paginationInfo = document.getElementById('paginationInfo');
    paginationInfo.innerHTML = `
      <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
      <button onclick="fetchAndDisplayApplications(${pagination.currentPage - 1}, ${rowsPerPage})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
      <button onclick="fetchAndDisplayApplications(${pagination.currentPage + 1}, ${rowsPerPage})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
    `;
  })
  .catch(error => console.log(error));
}

  


// Edit an application
function editApplication(applicationId, jobTitle, company, status, note, dateApplied) {
  document.getElementById('jobTitle').value = jobTitle;
  document.getElementById('company').value = company;
  document.getElementById('status').value = status;
  document.getElementById('note').value = note;
  document.getElementById('dateApplied').value = dateApplied;
  
  document.getElementById('form').dataset.applicationId = applicationId; // Store application ID for editing
}


// Event listener for rows per page selection
document.getElementById('rowsperpage').addEventListener('change', (event)=> {
  const rowsPerPage = event.target.value;
  localStorage.setItem('rowsPerPage', rowsPerPage);
  reloadApplications();
});

// Display applications when the page loads
window.addEventListener("DOMContentLoaded", () => { 
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'),10) || 2;  // Get rows per page from localStorage (default is 2)
  let currentPage = 1;  // Start at page 1
  fetchAndDisplayApplications(currentPage, rowsPerPage);  // Fetch and display applications with pagination
});

reloadApplications();

function logout() {
  localStorage.clear();
  window.location.href = "http://localhost:3000";
}
