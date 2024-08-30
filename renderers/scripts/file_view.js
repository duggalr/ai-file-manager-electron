let accessToken;
let directory_obj_id = localStorage.getItem("directory_object_id");
let user_preference;
let globalViewType;

/*
    Base Related JS
*/

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

    console.log('access-tokenn:', accessToken);

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


/*
    File View Related JS
*/

// Function to fetch user files using the retrieved ID
async function fetchDirectoryFiles(directory_object_id) {

    try {
        // Assuming you have an API endpoint to fetch files
        const response = await fetch('http://127.0.0.1:8000/api/view_directory_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ 
                directory_object_id: directory_object_id
            })
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user files");
        }

        const data = await response.json(); // Get the JSON response
        return data;

    } catch (error) {
        console.error("Error fetching files:", error);
        // document.getElementById("files-container").textContent = "Error loading files.";
    }
}


async function _initialFileViewPopulate(){

    // console.log('user-access-token-file-view:', accessToken);
    console.log('directory_object_id', directory_obj_id);
 
    let data = await fetchDirectoryFiles(directory_obj_id);
    console.log('data:', data);

    let entity_type_and_file_count = data['entity_type_and_file_count'];

    for (let i = 0; i < entity_type_and_file_count.length; i++) {
        let file_count_dict = entity_type_and_file_count[i];
        // console.log('file:', file_count_dict);

        // <i class="fa-regular fa-folder-open" style="font-size: 15px;"></i>

        let card_div_elem = document.createElement('div');
        card_div_elem.className = 'bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer category-card';

        globalViewType = data['user_profile_preference'];
        if (globalViewType == 'sub_category'){
            card_div_elem.setAttribute('data-category', 'subcategory' + '-' + file_count_dict['primary_text']);
        } else {
            card_div_elem.setAttribute('data-category', globalViewType + '-' + file_count_dict['primary_text']);
        }

        let h2_elem = document.createElement('h2');
        h2_elem.className = 'text-xl font-bold mb-2';
        h2_elem.textContent = file_count_dict['primary_text'];
        let p_elem = document.createElement('p');
        p_elem.className = 'text-gray-400';
        p_elem.textContent = file_count_dict['file_count'] + ' Files';

        let icon_elem = document.createElement('i');
        icon_elem.className = 'fa-regular fa-folder-open';
        icon_elem.style.fontSize = '15px';
        icon_elem.innerHTML = '&nbsp;';
        
        icon_elem.prepend(p_elem);
        card_div_elem.append(h2_elem);
        card_div_elem.append(p_elem);
        document.getElementById('category-list').append(card_div_elem);

    };

};


// _initialFileViewPopulate();


async function _updateModalCheckedSelection(){

    const radios = document.getElementsByName('view_preference');
    radios.forEach((radio) => {
        if (radio.value === globalViewType) {
            radio.checked = true;
        }
    });

};


async function _updateViewByDropdown(){    

}

const dropdownButton = document.getElementById('viewDropdown');
const dropdownMenu = document.getElementById('viewDropdownMenu');
const dropdownText = document.getElementById('viewDropdownText');

// Toggle dropdown on button click
dropdownButton.addEventListener('click', function() {
    dropdownMenu.classList.toggle('hidden');
});


// Menu items on click listener
dropdownMenu.querySelectorAll('li').forEach(function(item) {
    item.addEventListener('click', function() {
        const selectedValue = this.textContent.trim();
        console.log('Selected:', selectedValue);  // Print the selected value

        // Set the button text to the selected value
        dropdownText.textContent = 'View by: ' + selectedValue;

        // Close the dropdown menu
        dropdownMenu.classList.add('hidden');

        // console.log('selected-value:', selectedValue);
        let current_tmp_selected_value;
        if (selectedValue === 'Entities'){
            current_tmp_selected_value = 'entity';
        }
        else if (selectedValue === 'Sub-Categories') {
            current_tmp_selected_value = 'Sub-Categories';
        }
        else {
            current_tmp_selected_value = 'category';
        }

        // TODO: replace the jquery
        if (globalViewType != current_tmp_selected_value){

            // globalViewType = current_tmp_selected_value;

            // // Fetch everything from breadcrumb list 
            // var listItems = $('#breadcrumb-list').children('li');
            // console.log('list-elements:', listItems);

            // var breadcrumb_value_list = [];
            // listItems.each(function(index, element) {

            //     console.log('child-elem;', element)
            //     let a_href_element = $(element).children('a');

            //     let data_value = $($(element).children()[0]).children()[0].getAttribute('data-val');
            //     console.log('data-value-attribute:', data_value);
            //     breadcrumb_value_list.push(data_value);

            // });
            // console.log('breadcrumb:', breadcrumb_value_list);

            // // filter_value --> current breadcrumb value

            let tmp_bc_list = document.getElementById('breadcrumb-list');
            // let tmp_li_elements = $(tmp_bc_list).children('li');
            let tmp_li_elements = tmp_bc_list.getElementsByTagName('li');
            console.log('tmp_li_elements', tmp_li_elements);

            let breadcrumb_value_list = [];
            for (let i = 0; i < tmp_li_elements.length; i++) {
                let tp_li_bc_elements = $(tmp_li_elements[i]).children().children();
                let ahref_tag;
                if (tp_li_bc_elements.length == 1){
                    ahref_tag = tp_li_bc_elements[0];
                } else if (tp_li_bc_elements.length > 1) {
                    ahref_tag = tp_li_bc_elements[1];
                }
                breadcrumb_value_list.push(ahref_tag.getAttribute('data-val'));
            }

            console.log('breadcrumb-LIST:', breadcrumb_value_list);

            console.log('last-bc-value:', breadcrumb_value_list[breadcrumb_value_list.length - 1]);
            let last_bc_value = breadcrumb_value_list[breadcrumb_value_list.length - 1];

            var final_rv = {
                'current_filter_value': last_bc_value,
                'breadcrumb_value_list': breadcrumb_value_list,
                'switch_view_to':  current_tmp_selected_value
            };
            console.log('final-rv:', final_rv);

            // // filterCategoryData(final_rv);
            $.ajax({
                url: '{% url "switch_filtered_file_data" %}',
                type: 'POST',
                data: {
                    'filter_data': JSON.stringify(final_rv),
                    'csrfmiddlewaretoken': '{{ csrf_token }}'
                },
                success: function(response) {
                    console.log('data:', response);
                    if (response['success'] === true){
                        globalViewType = response['global_view_type'];
                        // append_category_data(
                        //     response
                        // );
                    }
                }
            });

        };
    });
});



async function _main(){
   
    await initializeAndLoadUserData();
    await _initialFileViewPopulate();
    await _updateModalCheckedSelection();



}

_main();


document.addEventListener('DOMContentLoaded', () => {
    // Open the modal
    const openModalButton = document.querySelector('[data-modal-toggle="select-view-modal"]');
    const modal = document.getElementById('select-view-modal');
    const closeModalButton = modal.querySelector('[data-modal-hide="select-view-modal"]');

    openModalButton.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    // Close the modal
    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    // Optionally, close the modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });


    // User Preference AJAX Post Submit
    const form = document.querySelector('form');
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        let selectedPreference = null;

        const checkboxes = document.querySelectorAll('input[type="radio"]');
        checkboxes.forEach(function (checkbox) {
            console.log('checkbox:', checkbox);
            if (checkbox.checked) {
                selectedPreference = checkbox.value;
            }
        });

        const response = await fetch('http://127.0.0.1:8000/api/update_view_preference', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ 
                preference: selectedPreference
            })
        });
        const data = await response.json();
        console.log('user-preference-api-response:', data);

        if (data['success'] === true) {
            window.location.reload();
        }

    });
    
});




