
document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            var terms = document.getElementById('input-text').value;
            sendData(terms);
        }
    });

    function sendData(terms) {
        var responseBox = document.querySelector('.response');
        responseBox.textContent = 'Sending data...';
    
        sendRequest();
    
        function sendRequest() {
            fetch('/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ terms: terms })
            })
                .then(response => response.json())
                .then(data => {
                    responseBox.innerHTML = data.summary;
                })
                .catch(error => {
                    console.error(error);
                    responseBox.textContent = 'An error occurred. Retrying...';
                    setTimeout(sendRequest, 2000);
                });
        }
    }
    

    //clear textarea on refresh

    const textarea = document.getElementById('input-text');

    window.onload = function () {
        textarea.value = '';
    };


    //dark-mode testing

    const lightModeIcon = document.querySelector('.material-icons.light_mode');
    const body = document.body;

    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        body.classList.add('dark-mode');
        lightModeIcon.innerHTML = 'dark_mode';
    }

    lightModeIcon.addEventListener('click', function () {

        console.log('Button Clicked!!');

        body.classList.toggle('dark-mode');

        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));

        if (body.classList.contains('dark-mode')) {
            lightModeIcon.innerHTML = 'dark_mode';
        } else {
            lightModeIcon.innerHTML = 'light_mode';
        }
    });
});

//upload div hiding

function hideFileUpload() {
    var fileUploadDiv = document.getElementById("fileUpload");
    fileUploadDiv.style.display = "none";
}

document.addEventListener("click", function (event) {
    var targetElement = event.target;
    var fileUploadDiv = document.getElementById("fileUpload");
    var textarea = document.getElementById("input-text");

    if (targetElement !== textarea && targetElement.parentNode !== textarea) {
        fileUploadDiv.style.display = "flex";
    }
});


//upload handling

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.stupid-form');
    const responseBox = document.querySelector('.response');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        responseBox.textContent = 'Uploading file...';

        sendData(formData);
    });

    function sendData(formData) {
        fetch('/upload-file', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {

                responseBox.innerHTML = data.summary;
            })
            .catch(error => {
                console.error(error);
                responseBox.textContent = 'An error occurred. Retrying...';
                setTimeout(() => sendData(formData), 2000);
            });
    }
});



//file validation

function validateFile() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (!file) {
        alert('No file selected');
        return false;
    }

    var fileSize = file.size;
    var maxSizeInBytes = 2 * 1024 * 1024; // 2 megabytes
    if (fileSize > maxSizeInBytes) {
        alert('File size exceeds the limit of 2 megabytes');
        return false;
    }

    var allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.indexOf(file.type) === -1) {
        alert('Invalid file type. Only PDF, JPG, and PNG files are allowed');
        return false;
    }

    return true;
}