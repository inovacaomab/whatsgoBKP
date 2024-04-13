document.addEventListener('DOMContentLoaded', function () {
    var phoneNumberInput = document.querySelector('#phoneNumber');
    window.intlTelInput(phoneNumberInput, {
        initialCountry: "br",
        preferredCountries: ['br', 'us'],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
    });

    window.openWhatsApp = function() {
        var message = encodeURIComponent(document.querySelector('#messageText').value);
        var phoneNumber = phoneNumberInput.value.replace(/\D/g,'');
        if (phoneNumber) {
            var url = `https://wa.me/${phoneNumber}`;
            if (message) {
                url += `?text=${message}`;
            }
            window.open(url, '_blank');
        } else {
            alert('Please enter a phone number.');
        }
    }
});
