
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
        const accessToken = await window.electronAPI.getAccessToken();
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