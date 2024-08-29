
// TODO: fetch filepaths

// Function to fetch user file paths
async function fetchUserFilePaths() {

    const response = await fetch('http://127.0.0.1:8000/api/get_user_filepaths', {
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


async function initialViewPopulate() {
    
    accessToken = await window.electronAPI.getAccessToken();
    let fp_response = await fetchUserFilePaths();
    if (fp_response['success'] === true){

        let user_directory_fp_list = fp_response['user_directory_list'];

        if (user_directory_fp_list.length > 0){

            // create list of user files paths
            for (i=0; i<=user_directory_fp_list.length-1; i++){

                let dp_element = user_directory_fp_list[i];
                let full_user_dir_path = dp_element[2];
                
                let list_element = document.createElement('li');
                list_element.className = 'flex justify-between items-center bg-gray-700 p-3 rounded-md shadow-sm';
                
                let span_one_element = document.createElement('span');
                span_one_element.className = 'text-gray-300';
                span_one_element.innerText = full_user_dir_path;
    
                let button_one_element = document.createElement('button');
                button_one_element.className = 'text-red-400 hover:text-red-600 focus:outline-none cursor-pointer';
                
                let button_href_element = document.createElement('a');
                // button_href_element.href = '#';
                
                let delete_icon_element = document.createElement('i');
                delete_icon_element.className = 'fa-solid fa-trash';
    
                button_href_element.appendChild(delete_icon_element);
                button_one_element.appendChild(button_href_element);
                
                list_element.appendChild(span_one_element);
                list_element.appendChild(button_one_element);
    
                document.getElementById('directory_path_list').prepend(list_element);

                document.getElementById('loader_parent_div').classList.add('hidden');
                document.getElementById('directory_path_list').classList.remove('hidden');

            };

        }
        else {

            // user_directory_list
            document.getElementById('loader_parent_div').classList.add('hidden');
            document.getElementById('no_filepath_p_tag').classList.remove('hidden');

        }
    }

    // // Wait for initial load to complete
    // await _initialLoadFiles();

    // // Fetch user data
    // const userData = await fetchUserData();
    // if (userData['success'] === true) {
    //     updateUIWithUserData(userData);
        
    //     addListenersToElements();

    //     // Loading Screen
    //     const primary_loading_screen = document.getElementById('primary_loading_screen');
    //     primary_loading_screen.classList.add('hidden');

    // }

};

initialViewPopulate();

// loader_parent_div
// directory_path_list
// no_filepath_p_tag



async function handleUserDirFPSubmission(directoryPathValue) {

    const response = await fetch('http://127.0.0.1:8000/api/handle_user_directory_filepath_submission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
            directory_path: directoryPathValue 
        })
    });
    const data = await response.json();
    console.log('Response Data:', data);
    return data;

};


async function checkUserProcessingStatus() {

    const response = await fetch('http://127.0.0.1:8000/api/check_processing_status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({})
    });
    const data = await response.json();
    console.log('Response Data:', data);
    return data;

};


document.addEventListener('DOMContentLoaded', () => {

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

            console.log('list-elem:', list_element)

            document.getElementById('directory_path_list').prepend(list_element);

            document.getElementById('no_filepath_p_tag').classList.add('hidden');
            document.getElementById('directory_path_list').classList.remove('hidden');
            
            // // // TODO: 
            // // // Call the API exposed by the preload script to redirect
            // // window.electronAPI.redirectToFileView();
    
            let dp_response = await handleUserDirFPSubmission(directoryPathValue);
            // console.log('dp-response:', dp_response);

            const intervalId = setInterval(async () => {

                console.log('user-access-token:', accessToken);

                let user_processing_status_response = await checkUserProcessingStatus();
                // console.log('user_processing_status_response:', user_processing_status_response);

                let fp_under_process = user_processing_status_response['files_under_process'];
                console.log('Files Under Process:', fp_under_process);

                if (fp_under_process === false) {

                    clearInterval(intervalId);
                    console.log('Processing completed successfully!');
                    // fp_loader.classList.add('hidden');
                    window.electronAPI.redirectToFileView();

                }

            }, 1000);


            // const intervalId = setInterval(async () => {
            //     try {
            //         const statusResponse = await fetch('http://127.0.0.1:8000/api/check_processing_status', {
            //             method: 'POST',
            //             headers: {
            //                 'Content-Type': 'application/json',
            //                 'Authorization': `Bearer ${accessToken}`,
            //             },
            //         });

            //         if (!statusResponse.ok) {
            //             throw new Error(`HTTP error! Status: ${statusResponse.status}`);
            //         }

            //         const statusData = await statusResponse.json();
            //         console.log('Processing Status:', statusData);

            //         // Check if processing is complete
            //         if (statusData.files_under_process === false) {
                        
            //             clearInterval(intervalId);
            //             console.log('Processing completed successfully!');
            //             fp_loader.classList.add('hidden');
            //             window.electronAPI.redirectToFileView();

            //         }
            //     } catch (error) {

            //         console.error('Error checking processing status:', error);
            //         clearInterval(intervalId); // Stop polling on error
            //         loader.classList.add('hidden'); // Hide the loader

            //     }
            // }, 1000); // Poll every 1 second



        });

    };

});
