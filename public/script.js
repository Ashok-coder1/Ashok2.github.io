
const form = document.getElementById('contactForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        fullName: form.fullName.value,
        mobile: form.mobile.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value
    };

    try {
        const res = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // ADD THIS LINE BELOW
        const data = await res.json(); 

        if (data.message === "Success") {
            window.location.href = "/thankyou.html";
        } else {
            alert("Something went wrong");
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});
