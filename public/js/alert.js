
  document.addEventListener('DOMContentLoaded', function() {
      const successMessage = document.querySelector('.alert-success');
      const errorMessage = document.querySelector('.alert-danger');

      // Function to hide success message after 2 seconds
      const hideSuccessMessage = () => {
          if (successMessage) {
              setTimeout(() => {
                  successMessage.style.display = 'none';
              }, 3000); // 2 seconds delay
          }
      };

      // Function to hide error message after 2 seconds
      const hideErrorMessage = () => {
          if (errorMessage) {
              setTimeout(() => {
                  errorMessage.style.display = 'none';
              }, 3000); // 2 seconds delay
          }
      };

      // Call functions to hide messages
      hideSuccessMessage();
      hideErrorMessage();
  });
