// Wait until the entire HTML document structure (DOM) is fully loaded and parsed by the browser.
// This prevents errors trying to find elements that don't exist yet.
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation Toggle ---
    // Find the hamburger button and the navigation menu in the HTML using their class names.
    const navToggle = document.querySelector('.nav-toggle'); 
    const navMenu = document.querySelector('.nav-menu');
    // 'document.querySelector' finds the *first* element matching the CSS selector.

    // Check if both elements were actually found in the HTML to prevent errors.
    if (navToggle && navMenu) {
        // Add an 'event listener' to the hamburger button.
        // When the button is 'click'ed, execute the function provided.
        navToggle.addEventListener('click', () => {
            // 'classList.toggle('is-active')' adds the class 'is-active' if it's not present, 
            // or removes it if it IS present.
            navMenu.classList.toggle('is-active'); // Toggles the class on the menu (triggers CSS slide-in/out).
            navToggle.classList.toggle('is-active'); // Toggles the class on the button itself (triggers CSS for 'X' icon).
            
            // Optional: Prevent scrolling of the page background when the mobile menu is open.
            document.body.style.overflow = navMenu.classList.contains('is-active') ? 'hidden' : '';
            // 'classList.contains' checks if the menu currently has the 'is-active' class.
            // The '? :' is a ternary operator (a shorthand if/else):
            // If true (menu is active), set body overflow to 'hidden'.
            // If false (menu is closed), set body overflow back to default ('').
        });

        // Close menu when a navigation link *inside* the menu is clicked.
        // 'querySelectorAll' finds *all* elements matching the selector. It returns a NodeList (like an array).
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            // Loop through each navigation link found inside the menu.
            link.addEventListener('click', () => {
                // When a link is clicked, *remove* the 'is-active' class to close the menu.
                navMenu.classList.remove('is-active');
                navToggle.classList.remove('is-active');
                document.body.style.overflow = ''; // Ensure scrolling is re-enabled.
            });
        });
    } // End of mobile nav logic


    // --- Smooth Scrolling for Nav Links (Enhanced) ---
    // CSS `scroll-behavior: smooth;` handles the basic smoothness. 
    // This JS ensures the scroll destination accounts for the fixed header height.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Select all anchor tags whose 'href' attribute *starts with* '#' (internal page links).
        anchor.addEventListener('click', function (e) {
            // 'this' refers to the specific anchor tag that was clicked.
            const targetId = this.getAttribute('href'); // Get the href value (e.g., "#about").
            
            // Make sure it's a valid internal link and not just "#"
            if (targetId.length > 1 && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId); // Find the element with the ID from the href.
                
                // If the target element actually exists on the page...
                if (targetElement) {
                    e.preventDefault(); // IMPORTANT: Stop the browser's default instant jump behavior.
                    
                    // Calculate the correct scroll position.
                    const headerOffset = document.getElementById('header').offsetHeight || 70; 
                    // Get the actual computed height of the header. Use 70 as a fallback if needed.
                    const elementPosition = targetElement.getBoundingClientRect().top; 
                    // Get the target element's position relative to the *current* viewport top.
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    // Calculate the absolute position to scroll to:
                    // Current scroll position (window.pageYOffset) + element's position relative to viewport - header height.

                    // Perform the smooth scroll using the calculated position.
                    window.scrollTo({
                        top: offsetPosition, // Scroll to this vertical position.
                        behavior: "smooth"   // Use the browser's smooth scrolling.
                    });

                    // If the mobile menu is open when a link is clicked, close it.
                    if (navMenu && navMenu.classList.contains('is-active')) {
                        navMenu.classList.remove('is-active');
                        navToggle.classList.remove('is-active');
                        document.body.style.overflow = '';
                    }
                }
            }
        });
    }); // End of smooth scroll logic


    // --- Expandable Services Section ---
    const serviceItems = document.querySelectorAll('.service-item'); // Get all service item divs.

    serviceItems.forEach(item => { // Loop through each service item.
        // Find the button and details div *within the current item*.
        const button = item.querySelector('.expand-button');
        const details = item.querySelector('.service-details');

        // If both the button and details div exist...
        if (button && details) {
            button.addEventListener('click', () => { // Add click listener to the button.
                // Toggle the 'is-expanded' class on the parent 'service-item' div.
                const isExpanded = item.classList.toggle('is-expanded'); 
                // 'toggle' returns true if the class was added, false if removed.
                
                // Update the 'aria-expanded' attribute for accessibility (tells screen readers the state).
                button.setAttribute('aria-expanded', isExpanded); 
                
                // The CSS transition on 'max-height' handles the visual expansion/collapse
                // triggered by adding/removing the 'is-expanded' class.
            });
        }
    }); // End of service expansion logic


    // --- Contact Form Submission (using Formspree AJAX) ---
    const contactForm = document.getElementById('contact-form'); // Get the form by its ID.
    const formStatus = contactForm ? contactForm.querySelector('.form-status') : null; // Get the status paragraph within the form.

    // If the form and status paragraph exist...
    if (contactForm && formStatus) {
        // Add a listener for the 'submit' event on the form.
        contactForm.addEventListener('submit', async (e) => {
            // 'async' allows using 'await' inside for handling the asynchronous 'fetch'.
            e.preventDefault(); // Prevent the default browser form submission (which reloads the page).

            // Create a FormData object from the form. This collects all input values correctly.
            const formData = new FormData(contactForm);
            formStatus.textContent = 'Sending...'; // Display a sending message.
            formStatus.className = 'form-status'; // Reset classes (remove previous success/error).

            try { // Use a try...catch block to handle potential network errors during submission.
                
                // 'fetch' is the modern way to make web requests (like submitting the form data).
                // It returns a Promise, which 'await' pauses execution until it resolves.
                const response = await fetch(contactForm.action, { // Send data to the URL specified in the form's 'action' attribute.
                    method: 'POST',          // Use the POST method (specified in the form's 'method' attribute).
                    body: formData,          // The data to send (our form data).
                    headers: {
                        'Accept': 'application/json' // Tell Formspree we prefer a JSON response (for easier error handling).
                    }
                });

                // Check if the submission was successful (HTTP status code 2xx).
                if (response.ok) {
                    formStatus.textContent = 'Message sent successfully!'; // Show success message.
                    formStatus.classList.add('success'); // Add 'success' class for green text (CSS).
                    contactForm.reset(); // Clear the form fields.
                } else {
                    // If there was an error (e.g., validation error from Formspree).
                    const data = await response.json(); // Try to parse the error response from Formspree (assuming it's JSON).
                    if (data.errors) { // If Formspree provides specific field errors...
                        formStatus.textContent = data.errors.map(error => error.message).join(', '); // Display them.
                    } else { // Otherwise, show a generic error.
                        formStatus.textContent = 'Oops! There was a problem submitting your form.';
                    }
                     formStatus.classList.add('error'); // Add 'error' class for red text (CSS).
                }
            } catch (error) { // If there was a network error or other issue with the fetch itself...
                console.error('Form submission error:', error); // Log the error to the browser console for debugging.
                formStatus.textContent = 'Oops! An error occurred. Please try again later.';
                formStatus.classList.add('error');
            }
            
            // Optionally clear the status message after a few seconds (6000ms = 6 seconds).
            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }, 6000);
        });
    } // End of form submission logic


    // --- Update Copyright Year ---
    const currentYearSpan = document.getElementById('current-year'); // Get the span by ID.
    if (currentYearSpan) {
        // Create a new Date object, get the full year, and set it as the text content of the span.
        currentYearSpan.textContent = new Date().getFullYear(); 
    }

    // --- Back to Top Button Smooth Scroll ---
     const backToTopButton = document.querySelector('.back-to-top'); // Get the button.
     if(backToTopButton){
        backToTopButton.addEventListener('click', (e) => { // Add click listener.
             e.preventDefault(); // Prevent the default jump to '#header'.
             window.scrollTo({ top: 0, behavior: 'smooth' }); // Smoothly scroll to the very top (position 0).
        });
     }

}); // End of DOMContentLoaded listener
