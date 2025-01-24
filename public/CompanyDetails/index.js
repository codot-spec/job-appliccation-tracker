function handleFormSubmit(event) {
  event.preventDefault();
  
  const applicationId = event.target.dataset.applicationId; // Get application ID if editing

  const image = document.getElementById('attachment').files[0];
  console.log("image", image)
  const formData = new FormData();
   // Append the image file and JSON data to FormData
   formData.append('image', image);
   formData.append('jobTitle',event.target.jobTitle.value);
   formData.append('company',event.target.company.value);
   formData.append('status',event.target.status.value);
   formData.append('note',event.target.note.value);
  
  const token = localStorage.getItem('token'); // Get the token from localStorage

  if (applicationId) {
    // If editing an existing application
    axios.put(`http://localhost:3000/company/${applicationId}`, 
      formData, { headers: { "Authorization": token } })
      .then(response => {
        reloadApplications();
      })
      .catch(error => console.log(error));
  } else {
    // If adding a new application
    axios.post("http://localhost:3000/company", formData, 
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
  axios.delete(`http://localhost:3000/company/${applicationId}`, { headers: { "Authorization": token } })
    .then(() => {
      reloadApplications();
    })
    .catch(error => console.log(error));
}



function fetchAndDisplayApplications(page = 1, rowsPerPage = 2) {
  const token = localStorage.getItem('token');

  axios.get(`http://localhost:3000/company?page=${page}&limit=${rowsPerPage}`, {
    headers: { "Authorization": token }
  })
  .then(response => {
    const { applications, pagination } = response.data;
    const applicationList = document.getElementById('applicationList');
    applicationList.innerHTML = '';  // Clear previous list

    applications.forEach(application => {
      const item = document.createElement("li");
      item.setAttribute("data-id", application.id); // Set the ID for the application

      // Create container for application details and image
      const container = document.createElement('div');
      container.classList.add('application-container');

      // Create the details section (left side)
      const detailsSection = document.createElement('div');
      detailsSection.classList.add('application-details');
      detailsSection.innerHTML = `
        <span class="application-jobTitle"><strong>Company Name:</strong> ${application.jobTitle}</span>
        <span class="application-company"><strong>Company Size:</strong> ${application.company}</span>
        <span class="application-status"><strong>Open Position:</strong> ${application.status}</span>
        <span class="application-note"><strong>Notes:</strong> ${application.note}</span>
        <div class="application-actions">
          <button onclick="deleteApplication(${application.id})">Delete</button>
          <button onclick="editApplication(${application.id}, '${application.jobTitle}', '${application.company}', '${application.status}', '${application.note}')">Edit</button>
        </div>
      `;

      // If there's an attachment, display it
      if (application.attachment) {
        const imageSection = document.createElement('div');
        imageSection.classList.add('application-image');
        
        const imageElement = document.createElement('img');
        imageElement.style.width = '100%'; // Or adjust size accordingly
        imageElement.style.objectFit = 'contain';
        imageElement.src = application.attachment;
        
        const link = document.createElement('a');
        link.href = application.attachment;
        link.target = '_blank';
        link.appendChild(imageElement);
        
        imageSection.appendChild(link);
        container.appendChild(imageSection);
      }

      container.appendChild(detailsSection);
      item.appendChild(container);
      
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
function editApplication(applicationId, jobTitle, company, status, note, dateApplied, attachment) {
  document.getElementById('jobTitle').value = jobTitle;
  document.getElementById('company').value = company;
  document.getElementById('status').value = status;
  document.getElementById('note').value = note;
  document.getElementById('form').dataset.applicationId = applicationId; // Store application ID for editing

  document.getElementById('attachment').files[0].value = attachment;
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

function profile(){
  window.location.href = "../profile/index.html";
}

function company(){
  window.location.href = "../CompanyDetails/index.html";
}

const filter = document.getElementById('filter');
filter.addEventListener('keyup', (event) => {
  const textEntered = event.target.value.toLowerCase(); // Get the entered search text
  const applicationItems = document.getElementById('applicationList').getElementsByTagName('li'); // Get all application list items
  
  // Loop through each application item
  for (let i = 0; i < applicationItems.length; i++) {
    const currentApplicationItem = applicationItems[i];

    // Get the relevant fields for filtering
    const jobTitle = currentApplicationItem.querySelector('.application-jobTitle').textContent.toLowerCase();
    const company = currentApplicationItem.querySelector('.application-company').textContent.toLowerCase();
    const status = currentApplicationItem.querySelector('.application-status').textContent.toLowerCase();
    const note = currentApplicationItem.querySelector('.application-note').textContent.toLowerCase();
    // Check if any of the fields match the entered text
    const isMatch = jobTitle.includes(textEntered) || company.includes(textEntered) ||
                    status.includes(textEntered) || note.includes(textEntered)

    // Show or hide the item based on the match
    currentApplicationItem.style.display = isMatch ? 'block' : 'none';
  }
});
