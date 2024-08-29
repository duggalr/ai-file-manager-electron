let accessToken;

// Function to update UI with user data
function updateUIWithUserData(userData) {
    // console.log('user-data:', userData);
    let user_object_details = userData['user_object_details'];
    // console.log('user-details:', user_object_details);
    document.getElementById('user-email').textContent = user_object_details['email'];
    document.getElementById('user-email').classList.remove('hidden');

    // document.getElementById('loader').classList.add('hidden');
    // document.getElementById('loader').classList.add('hidden');
    document.getElementById('no_filepath_p_tag').classList.remove('hidden');
    
    document.getElementById('loader_parent_div').style.display = 'none';
    document.getElementById('loader_svg').style.display = 'none';
}

// Function to fetch user data from Django backend
async function fetchUserData() {

    try {
        accessToken = await window.electronAPI.getAccessToken();
        if (accessToken) {
            console.log('Token:', accessToken);

            const response = await fetch('http://127.0.0.1:8000/api/get_user_filepaths', {
                method: 'POST',
                credentials: 'include', // Include cookies for session-based authentication
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
    
            const data = await response.json();
            if (data['success'] === true) {
                updateUIWithUserData(data);
            }

        } else {
            // TODO: need to redirect to auth-page but this should not happen
            console.log('No access token found');
        }

    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

fetchUserData();


document.addEventListener('DOMContentLoaded', () => {

    // if (organizeButton) {
    //     organizeButton.addEventListener('click', () => {

    //         const directoryPathValue = directoryPathInput.value;
    //         console.log('Directory Path:', directoryPathValue);

    //         const response = await fetch('http://127.0.0.1:8000/api/get_user_filepaths', {
    //             method: 'POST',
    //             credentials: 'include', // Include cookies for session-based authentication
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${accessToken}`,
    //             }
    //         });


    //     });
    // }

    const organizeButton = document.getElementById('organize-submit-btn');
    const directoryPathInput = document.getElementById('directory_path_input');

    if (organizeButton && directoryPathInput) {
        
        organizeButton.addEventListener('click', async (e) => {

            e.preventDefault();
            
            // Disable the input and button and add classes to gray out the input and button
            directoryPathInput.disabled = true;
            organizeButton.disabled = true;
            directoryPathInput.classList.add('opacity-50', 'cursor-not-allowed');
            organizeButton.classList.add('opacity-50', 'cursor-not-allowed');
            
            let fp_loader = document.getElementById('file_path_processing_loader');
            fp_loader.classList.remove('hidden');

            // Retrieve the value from the input field
            const directoryPathValue = directoryPathInput.value;
            console.log('dpath:', directoryPathValue);

            let dp_list = document.getElementById('directory_path_list');
            
            let list_element = document.createElement('li');
            list_element.className = 'flex justify-between items-center bg-gray-700 p-3 rounded-md shadow-sm';
            
            let span_one_element = document.createElement('span');
            span_one_element.className = 'text-gray-300';
            span_one_element.innerText = directoryPathValue;

            let button_one_element = document.createElement('button');
            button_one_element.className = 'text-red-400 hover:text-red-600 focus:outline-none';
            
            let button_href_element = document.createElement('a');
            button_href_element.href = '#';
            
            let delete_icon_element = document.createElement('i');
            delete_icon_element.className = 'fa-solid fa-trash';

            button_href_element.appendChild(delete_icon_element);
            button_one_element.appendChild(button_href_element);
            
            list_element.appendChild(span_one_element);
            list_element.appendChild(button_one_element);

            document.getElementById('directory_path_list').prepend(list_element);

            // TODO: 
            // Call the API exposed by the preload script to redirect
            window.electronAPI.redirectToFileView();

            // ipcRenderer.send('redirect-to-file-view');

            // try {
            //     const response = await fetch('http://127.0.0.1:8000/api/handle_user_directory_filepath_submission', {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //             'Authorization': `Bearer ${accessToken}`,
            //         },
            //         body: JSON.stringify({ directory_path: directoryPathValue })
            //     });

            //     if (!response.ok) {
            //         throw new Error(`HTTP error! Status: ${response.status}`);
            //     }

            //     // Parse the JSON response
            //     const data = await response.json();
            //     console.log('Response Data:', data);

            //     // TODO:
            //         // Start polling the processing status endpoint every 1 second
            //     const intervalId = setInterval(async () => {
            //         try {
            //             const statusResponse = await fetch('http://127.0.0.1:8000/api/check_processing_status', {
            //                 method: 'POST',
            //                 headers: {
            //                     'Content-Type': 'application/json',
            //                     'Authorization': `Bearer ${accessToken}`,
            //                 },
            //             });

            //             if (!statusResponse.ok) {
            //                 throw new Error(`HTTP error! Status: ${statusResponse.status}`);
            //             }

            //             const statusData = await statusResponse.json();
            //             console.log('Processing Status:', statusData);

            //             // Check if processing is complete
            //             if (statusData.files_under_process === false) {
            //                 clearInterval(intervalId); // Stop the polling
            //                 console.log('Processing completed successfully!');
            //                 fp_loader.classList.add('hidden');
                            
            //                 // Send an IPC message to the main process to redirect
            //                 ipcRenderer.send('redirect-to-file-view');
            //             }
            //         } catch (error) {
            //             console.error('Error checking processing status:', error);
            //             clearInterval(intervalId); // Stop polling on error
            //             loader.classList.add('hidden'); // Hide the loader
            //         }
            //     }, 1000); // Poll every 1 second

            // } catch (error) {
            //     console.error('Error:', error);
            //     // Handle any errors that occur during fetch
            // }

        });
    }

});



// const view_files_element = document.getElementById('view_files_link');

// view_files_element.addEventListener('click', async (e) => {

//     window.electronAPI.redirectToFileView();

// });


// Function to include the sidebar HTML dynamically
function loadSidebar() {
    fetch('sidebar.html').then(response => response.text()).then(data => {
        document.getElementById('sidebar-container').innerHTML = data;
    }).catch(error => console.error('Error loading sidebar:', error));
}

// Load the sidebar when the page loads
window.addEventListener('DOMContentLoaded', loadSidebar);
