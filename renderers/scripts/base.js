let accessToken;

// Asynchronous function to load initial files (top bar and sidebar)
async function _initialLoadFiles() {
    try {
        // Load Top Navbar
        await fetch('navbars/top_navbar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('top-navbar-container').innerHTML = data;
            })
            .catch(error => console.error('Error loading top navbar:', error));

        // Load Sidebar
        await fetch('navbars/sidebar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('sidebar-container').innerHTML = data;
            })
            .catch(error => console.error('Error loading sidebar:', error));

        // Resolve when both fetches are complete
        console.log('Initial files loaded successfully');
    } catch (error) {
        console.error('Error during initial load:', error);
    }
};

// Function to update UI with user data
function updateUIWithUserData(userData) {
    let user_object_details = userData['user_details'];
    console.log('User object data:', user_object_details);
    document.getElementById('user-email').textContent = user_object_details['email'];
    document.getElementById('user-email').classList.remove('hidden');

    // Remove hidden class on main parent div
    document.getElementById('main_parent_div').classList.remove('hidden');

    // document.getElementById('no_filepath_p_tag').classList.remove('hidden');
    // document.getElementById('loader_parent_div').style.display = 'none';
    // document.getElementById('loader_svg').style.display = 'none';
}

// Function to fetch user data from Django backend
async function fetchUserData() {

    const response = await fetch('http://127.0.0.1:8000/api/get_user_profile_information', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
    });
    const data = await response.json();
    return data;
 
};


function addListenersToElements(){

    // Onclick listener for 'View Files' link
    const view_files_element = document.getElementById('view_files_link');
    view_files_element.addEventListener('click', async (e) => {
        window.electronAPI.redirectToFileView();
    });
    
    // Onclick listener for 'Manage Filepath' link
    const manage_fp_element = document.getElementById('manage_fp_link');
    manage_fp_element.addEventListener('click', async (e) => {
        window.electronAPI.redirectToManageFilePath();
    });

    // Onclick listener for 'Logout' link
    const logout_element = document.getElementById('logout');
    logout_element.addEventListener('click', async (e) => {
        window.electronAPI.logOut();
    });

}

// Function to initialize loading files and then update with user data
async function initializeAndLoadUserData() {
    // Wait until access token is fetched
    accessToken = await window.electronAPI.getAccessToken();

    // Wait for initial load to complete
    await _initialLoadFiles();

    // Fetch user data
    const userData = await fetchUserData();
    if (userData['success'] === true) {
        updateUIWithUserData(userData);
        
        addListenersToElements();

        // Loading Screen
        const primary_loading_screen = document.getElementById('primary_loading_screen');
        primary_loading_screen.classList.add('hidden');

    }

}

// Start the process
initializeAndLoadUserData();